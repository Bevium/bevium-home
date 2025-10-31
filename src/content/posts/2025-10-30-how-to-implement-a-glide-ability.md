---
title: "UE5 + GAS: How the Glide Ability Works"
description: "A practical walkthrough of our Glide ability in UE5 using the Gameplay Ability System. Activation, physics tuning, stamina, UI hooks, and clean teardown."
tags: ["Unreal Engine 5", "GAS", "ArcasChampions" , "Character Movement", "C++", "Gameplay Ability"]
ogImage: "/images/blog/2025-10-30-how-to-implement-a-glide-ability/Chicken.gif"
date: "10-30-2025"
---

# How the `Arcas Champions Glide Ability` works

<div style="display:flex;justify-content:center;align-items:center;gap:16px;flex-wrap:wrap;">
  <img src="images/blog/2025-10-30-how-to-implement-a-glide-ability/GlideMove_1.gif" alt="Glide start" style="max-width:45%;height:auto;">
  <img src="images/blog/2025-10-30-how-to-implement-a-glide-ability/LongJump.gif" alt="Stable glide" style="max-width:45%;height:auto;">
</div>

<br>

Glide lets players soften gravity, steer in the air, and land exactly where they intend. It spawns a **Glider actor**, tweaks movement for a stable descent, and restores defaults the moment the player releases input or loses flying state.

---

## Table of contents

- [GAS and client prediction](#gas-and-client-prediction)
- [Activation](#activation)
- [Flight feel](#flight-feel)
- [Stamina visuals](#stamina-visuals)
- [Ending and cleanup](#ending-and-cleanup)
- [What to tune](#what-to-tune)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## GAS and client prediction

<img src="images/blog/2025-10-30-how-to-implement-a-glide-ability/gasplugin.png" 
alt="GAS overview" 
style="display:block;margin:0 auto;max-width:480px;">

Glide is a `UGameplayAbility`. We **commit on activation** to keep input snappy on clients, and we **commit cooldown on end** because Glide is duration-based rather than a one-shot burst.

```c++
// Commit early to prevent double-activation visual glitches on clients
if (!CommitAbility(Handle, ActorInfo, ActivationInfo)) {
    CancelAbility(Handle, ActorInfo, ActivationInfo, /*replicate=*/true);
    return;
}
```

---

## Activation

<img src="images/blog/2025-10-30-how-to-implement-a-glide-ability/Activation.gif" 
alt="Glide Activation" 
style="display:block;margin:0 auto;max-width:480px;">

On activate we validate state, play a short SFX stack, spawn the `AGlider`, attach it to the character mesh, and subscribe to movement-mode changes on the server.

```c++
// Sounds
for (USoundBase* S : ActivationSoundsToPlay) {
    UGameplayStatics::PlaySoundAtLocation(this, S, OwningCharacter->GetActorLocation());
}

// Spawn + attach the Glider
Glider = GetWorld()->SpawnActor<AGlider>(GliderClassToSpawn);
if (Glider && OwningCharacter) {
    Glider->AttachToComponent(
        OwningCharacter->GetMesh(),
        FAttachmentTransformRules::SnapToTargetIncludingScale,
        GliderAttachSocketName // e.g. "weapon_lSocket"
    );
}

// Optional: alert AI
OwningCharacter->MakeNoise(CharacterNoiseLoudness, OwningCharacter, OwningCharacter->GetActorLocation());
```

<img src="images/blog/2025-10-30-how-to-implement-a-glide-ability/Socket.png" alt="Attach socket" style="display:block;margin:0 auto;max-width:480px;">

---

## Flight feel

<img src="images/blog/2025-10-30-how-to-implement-a-glide-ability/HighJump_1.gif" 
alt="Attach socket" 
style="display:block;margin:0 auto;max-width:480px;">

We cache air control, raise it for responsive steering, zero vertical speed to avoid a dip, apply a **GameplayEffect** to reduce gravity, and give the character a slight upward nudge to enter a stable glide.

```c++
// Cache + bump air control
InitialAirControl = MoveComp->AirControl;
MoveComp->AirControl = CharacterAirControlWhileGliding;

// Flatten falling speed before we modify gravity
MoveComp->Velocity.Z = 0.f;

// Apply gravity modifier via GameplayEffect
const FGameplayEffectSpecHandle Spec =
    MakeOutgoingGameplayEffectSpec(CharacterGlideGravityGameplayEffectClass);
CharacterGlideGravityGameplayEffectHandle =
    ApplyGameplayEffectSpecToOwner(Handle, ActorInfo, ActivationInfo, Spec);

// Small launch to settle into glide
OwningCharacter->LaunchCharacter(FVector(0.f, 0.f, CharacterLaunchZVelocity), false, false);
```

---

## Stamina visuals

<img src="images/blog/2025-10-30-how-to-implement-a-glide-ability/Stamina.gif" 
alt="Glide Activation" 
style="display:block;margin:0 auto;max-width:480px;">

Glide inherits stamina from a base ability. While depleting, the Glider updates a material parameter to visualize remaining stamina. When depleting stops or the character dies, updates are halted.

```c++
void UGlideGameplayAbility::StartDepletingStamina() {
    Super::StartDepletingStamina();
    if (Glider) {
        Glider->StartUpdatingStaminaDepleteMaterial(GetStaminaDepletingAlpha(), StaminaDuration);
    }
}

void UGlideGameplayAbility::StopDepletingStamina() {
    Super::StopDepletingStamina();
    if (Glider) {
        Glider->StopUpdatingStaminaDepleteMaterial();
    }
}
```

---


## Ending and cleanup

Glide ends on input release, on death, or when the server detects we are no longer `MOVE_Flying`. On end we commit cooldown, destroy the Glider, restore air control, remove the gravity effect, and play a deactivation sound.

```c++
// Input release: end on owning client
void UGlideGameplayAbility::InputReleased(const FGameplayAbilitySpecHandle Handle,
    const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo)
{
    EndAbility(Handle, ActorInfo, ActivationInfo, /*replicate=*/true, /*cancelled=*/false);
}

// Server validation: stop if movement mode changed
void UGlideGameplayAbility::OnMovementModeChanged(ACharacter* Character, EMovementMode PrevMode, uint8 PrevCustom)
{
    if (Character->GetCharacterMovement()->MovementMode != MOVE_Flying) {
        K2_EndAbility();
    }
}
```

```c++
// Cooldown suits duration-based abilities
CommitAbilityCooldown(Handle, ActorInfo, ActivationInfo, /*force=*/true);

// Restore movement + play SFX
if (InitialAirControl >= 0.f) {
    MoveComp->AirControl = InitialAirControl;
}
UGameplayStatics::PlaySoundAtLocation(this, DeactivationSoundToPlay, OwningCharacter->GetActorLocation());

// Remove gravity GE
if (CharacterGlideGravityGameplayEffectHandle.IsValid()) {
    ActorInfo->AbilitySystemComponent->RemoveActiveGameplayEffect(CharacterGlideGravityGameplayEffectHandle);
}
```

---

## What to tune

Most knobs live on the ability asset or header:

- **Audio:** `ActivationSoundsToPlay` and `DeactivationSoundToPlay`.
- **Glider actor:** `GliderClassToSpawn` and `GliderAttachSocketName`.
- **Feel:** `CharacterAirControlWhileGliding`, `CharacterLaunchZVelocity` and `CharacterGlideGravityGameplayEffectClass`.
- **Misc:** `CharacterNoiseLoudness` and `GlideActivatedGameplayMessageChannel`.


**Recommended ranges**

- `CharacterAirControlWhileGliding`: **0.6–1.5**  
- `CharacterLaunchZVelocity`: **200–400**  
- `Gravity GameplayEffect Magnitude`: **0.3–0.5**

---

## Troubleshooting

- **Glide drops immediately**  
  Ensure the gravity GameplayEffect is applied to the owner and not blocked by immunity tags. Confirm server authority when movement mode changes.

- **Player snaps down on start**  
  Make sure you zero `Velocity.Z` before launching and before applying the gravity modifier.

- **Air control sticks after end**  
  Restore `MoveComp->AirControl` from `InitialAirControl` even on cancelled paths.

---

## FAQ

**Why a GameplayEffect for gravity instead of writing directly to `CharacterMovement`?**  
Because GAS plays nicely when movement-related scalars are centralized in effects. It keeps stacking rules and prediction clean.

**Why commit cooldown on end?**  
Glide is duration-driven. Cooldown should reflect time spent gliding rather than a button tap.

