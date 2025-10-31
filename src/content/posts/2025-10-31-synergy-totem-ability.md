---
title: "UE5 + GAS: How the Arcas Champions Synergy Ability works"
description: "How a team-synergy totem ability forms combos, drives cues, and stays multiplayer-safe with Unreal Engine 5 and Gameplay Ability System."
tags: ["Unreal Engine 5", "GAS", "ArcasChampions", "Multiplayer", "Gameplay Ability", "C++"]
author: "Bevium"
ogImage: "/images/blog/2025-10-31-synergy-totem-ability/Synergy_1_1.gif"
date: "10-31-2025"
---

# How the `Arcas Champions Synergy Ability` works

<div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
  <img src="images/blog/2025-10-31-synergy-totem-ability/Synergy_1.gif" alt="Join" style="max-width:45%;height:auto;">
  <img src="images/blog/2025-10-31-synergy-totem-ability/Synergy_Coop_1.gif" alt="Activate" style="max-width:45%;height:auto;">
</div>

<br>

If your game features team gadgets that charge up when nearby allies contribute their abilities, this class is the backbone. `USynergyTotemGameplayAbilityBase` is a Gameplay Ability base for **synergy totems**. A player starts a short synergy window on a device, nearby same-team players can join with their own totem abilities, and if the live party matches a data-driven combo, the device upgrades to a new stage. Along the way the class manages cooldowns, overlap detection, gameplay cues, and failure cases with careful server authority and replication.

> TL;DR: Start a time-boxed synergy around a device, collect teammates into a combo, match against a DataTable, upgrade the device on success, and clean up cleanly on cancel.

#### Why this matters

- **Readable co-op**: Timers and join cues make the mechanic social and easy to parse.
- **Designer friendly**: Combos live in a DataTable that can be tweaked without code.
- **Network robust**: Authority gates and multicast notifies keep clients in sync.

---

## Table of contents

- [Quick concept map](#quick-concept-map)
- [Prediction and GAS](#prediction-and-gas)
- [The activation split](#the-activation-split)
- [Starting a synergy on a device](#starting-a-synergy-on-a-device)
- [The combo ledger](#the-combo-ledger)
- [Data-driven completion with a DataTable](#data-driven-completion-with-a-datatable)
- [Cooldowns and warmup reset](#cooldowns-and-warmup-reset)
- [Cues at every step](#cues-at-every-step)
- [Multiplayer guardrails](#multiplayer-guardrails)
- [Tiny Blueprint and UI hooks](#tiny-blueprint-and-ui-hooks)
- [Checklist to ship](#checklist-to-ship)
- [Final thoughts](#final-thoughts)


---

## Quick concept map

- **Start synergy** on a device you target.
- **Attach** a moving overlap sphere to the device so join radius follows it.
- **Collect** teammates who overlap and have compatible abilities.
- **Match** the live combo against a DataTable of allowed recipes.
- **Apply stage** on success, or **cancel gracefully** on failure or time out.
- **Play cues** at each milestone so VFX and SFX stay data driven.

---

## Prediction and GAS

<img src="images/blog/2025-10-31-synergy-totem-ability/gasplugin.png"
     alt="GAS overview"
     style="display:block;margin:0 auto;max-width:480px;">

Client prediction remains in the hands of GAS. Costs and cooldowns commit through the standard `CommitAbility` path, while authority-only operations like editing the combo or setting the synergy stage run on the server. This keeps input responsive yet safe.

---

## The activation split

<div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
  <img src="images/blog/2025-10-31-synergy-totem-ability/Synergy_Coop_2.gif" alt="Join" style="max-width:45%;height:auto;">
  <img src="images/blog/2025-10-31-synergy-totem-ability/Synergy_Fail.gif" alt="Activate" style="max-width:45%;height:auto;">
</div>

<br>

When the player presses the input, the class first checks whether you are close to a teammate device that already requested a synergy. If yes, it commits the cost, **adds you to their combo**, and ends your own activation immediately. If not, it runs your normal activation path.

```cpp
// Final override: routes to a virtual implementation
void USynergyTotemGameplayAbilityBase::ActivateAbility(
    const FGameplayAbilitySpecHandle Handle,
    const FGameplayAbilityActorInfo* ActorInfo,
    const FGameplayAbilityActivationInfo ActivationInfo,
    const FGameplayEventData* TriggerEventData)
{
    if (CanJoinActiveSynergy(*ActorInfo))
    {
        if (CommitAbility(Handle, ActorInfo, ActivationInfo))
        {
            Server_AddSelfToSomeoneElsesSynergy(ActorInfo);
            // End early to avoid duplicate deployment flows
            EndAbility(Handle, ActorInfo, ActivationInfo, /*bReplicateEnd*/true, /*bWasCancelled*/false);
        }
        return;
    }

    ActivateAbility_Implementation(Handle, ActorInfo, ActivationInfo, TriggerEventData);
}
```

Use `ActivateAbility_Implementation` in subclasses for your device-specific flow. The base class guards the co-op path for consistency across abilities.

---

## Starting a synergy on a device

Expose a helper like this to Blueprints so designers can request a synergy on a target device and let the base class manage the rest.

```cpp
UFUNCTION(BlueprintCallable)
void RequestSynergyAndEndAbilityOnFinished(TScriptInterface<ISynergyDevice> TargetDevice);
```

On the **server** the base class will:

1. Mark the synergy as requested and add the owner as the first participant.  
2. Attach a `USphereComponent` to the device and set it to overlap playing characters only.  
3. Arm a timer for the combo window (for example `SynergyComboTime`).  
4. Multicast join/leave events with remaining time so UI can animate progress.  

This design keeps the join radius correct even if the device moves, because the trigger stays attached.

---

## The combo ledger

Participants are tracked as a list of `{AbilityClass, Count}` plus the set of live characters. Helpers increment or remove entries, and a death callback auto-ejects fallen teammates. All changes are authority-gated and mirrored to clients through notifies.

```cpp
struct FComboEntry
{
    TSubclassOf<UGameplayAbility> AbilityClass;
    int32 Count = 0;
};

TArray<FComboEntry> LiveCombo;

void AddToSynergyCombo(ACharacter* JoiningChar, TSubclassOf<UGameplayAbility> AbilityClass)
{
    if (!HasAuthority()) return;

    // Insert or increment
    if (FComboEntry* Found = LiveCombo.FindByPredicate([&](const FComboEntry& E){ return E.AbilityClass == AbilityClass; }))
    {
        Found->Count++;
    }
    else
    {
        LiveCombo.Add({AbilityClass, 1});
    }

    RegisterOnDeath(JoiningChar);     // auto-remove on death
    Cue_OnAddedToCombo(JoiningChar);  // device + character cues
}
```

---

## Data-driven completion with a DataTable

<div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
  <img src="images/blog/2025-10-31-synergy-totem-ability/TableRow_Synergy_1.png" alt="Join" style="max-width:45%;height:auto;">
  <img src="images/blog/2025-10-31-synergy-totem-ability/TableRow_Synergy_2.png" alt="Activate" style="max-width:45%;height:auto;">
</div>

<br> 

When the combo timer ends, the class tries to match `LiveCombo` against a `UDataTable` of allowed recipes. A match calls `ISynergyDevice::SetSynergyStage(Stage, Participants)`. If the device accepts the stage, the ability broadcasts success, plays the **activation** cue on all participants and the device, then ends. If there is no match or the device refuses, the class plays a **canceled** cue and ends cleanly.

```cpp
bool TryFinishSynergy()
{
    const FName MatchedRow = FindMatchingComboRow(LiveCombo, RecipesTable);
    if (MatchedRow.IsNone())
    {
        Cue_OnSynergyCanceled(Device);
        return false;
    }

    const bool bApplied = Device->SetSynergyStage(MatchedRow, Participants);
    if (bApplied)
    {
        Cue_OnSynergyActivated(Device, Participants);
    }
    else
    {
        Cue_OnSynergyCanceled(Device);
    }
    return bApplied;
}
```

---

## Cooldowns and warmup reset

The base class applies an initial cooldown when the ability is granted or when the avatar is set, and it listens to match warmup so timers get re-applied correctly after transitions. When the cooldown finishes, a small gameplay cue fires so UI can ping the player.

```cpp
void OnAvatarSet(const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilitySpec& Spec)
{
    Super::OnAvatarSet(ActorInfo, Spec);
    ApplyInitialCooldown(Spec);
}

void OnCooldownExpired()
{
    K2_ExecuteGameplayCue(CooldownFinishedCueTag, FGameplayCueParameters());
}
```

---

## Cues at every step

Centralize VFX and SFX using GameplayCue tags. Suggested set:

- `Cue.Synergy.AddedToCombo` on the device and on the joining character.  
- `Cue.Synergy.RemovedFromCombo` on the device when someone leaves or dies.  
- `Cue.Synergy.Activated` on all participants and the device.  
- `Cue.Synergy.Canceled` on the device if it fizzles.  
- `Cue.Synergy.CooldownFinished` on the owner to drive UI.

This keeps content flexible and avoids code churn when art evolves.

---

## Multiplayer guardrails

- **Authority gates**: Only the server requests synergy, edits the combo, and applies the stage. Clients can try, the server decides.  
- **Team checks**: Only same-team players can join the synergy around a device.  
- **Edge cases**: If the device is destroyed or the owner dies, the synergy cancels with the right cues and delegates.  
- **Gameplay restrictions**: Activation is blocked if the player is holding a plantable bomb or incompatible item.

---

## Tiny Blueprint and UI hooks

- **Blueprint**: Call `RequestSynergyAndEndAbilityOnFinished(Device)` from your ability’s `ActivateAbility_Implementation`.  
- **HUD**: Subscribe to the multicast `OnSynergyJoinChanged(Participants, TimeRemaining)` to update a radial timer and a compact party strip.  
- **Audio**: Drive a soft one-shot when `CooldownFinished` fires to nudge the player.

---

## Checklist to ship

- Provide a **DataTable** of recipes and keep class references stable.  
- Bind **GameplayCue** tags for added, removed, activated, canceled, and cooldown finished.  
- Make sure the **device** implements `ISynergyDevice::SetSynergyStage`.  
- Test **moving devices** to confirm the overlap sphere stays aligned.  
- Verify **warmup reset** and **cooldown** timing across round transitions.

---

## Final thoughts

`USynergyTotemGameplayAbilityBase` wraps the hard parts of cooperative abilities so teams can focus on the device-specific fun. It gives a clear join window, predictable cues, and data-driven completion. That combination reads well in combat and scales nicely as you add new recipes or devices.

*Got questions or want a code deep dive? Reach out and we can extend this base into your project’s exact needs.*
