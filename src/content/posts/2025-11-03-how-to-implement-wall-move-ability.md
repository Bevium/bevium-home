---
title: "UE5 + GAS: How the Arcas Champions Wall Move Ability Works"
description: "A practical walkthrough of our WallMove ability in UE5 using the Gameplay Ability System. Activation, physics tuning, effects and montage."
tags: ["Unreal Engine 5", "GAS", "ArcasChampions" , "Wall Jump", "C++", "Gameplay Ability"]
date: "11/03/2025"
ogImage: "/images/blog/2025-11-03-how-to-implement-wall-move-ability/cover.gif"
---

# How the `Arcas Champions Wall Move Ability` works


<div style="display:flex;justify-content:center;align-items:center;gap:16px;flex-wrap:wrap;">
  <img src="images/blog/2025-11-03-how-to-implement-wall-move-ability/MultiWallMove_2.gif" alt="Wall Kick" style="max-width:45%;height:auto;">
  <img src="images/blog/2025-11-03-how-to-implement-wall-move-ability/MultiKick_1.gif" alt="Wall Skip" style="max-width:45%;height:auto;">
</div>

<br>

This ability selects between **Wall Kick** and **Wall Skip** at runtime based on detected surfaces, then computes a launch vector, triggers **VFX/SFX**, plays a dedicated **Montage** and commits only after all validations succeed.

---

## Table of contents

- [GAS and client prediction](#gas-and-client-prediction)
- [Activation and Early Cancellation](#activation-and-early-cancellation)
- [Detecting Candidate Walls](#detecting-candidate-walls)
- [Choosing Between Kick and Skip](#choosing-between-kick-and-skip)
- [Computing the Launch](#computing-the-launch)
- [Effects, Montage and Commit](#effects-montage-and-commit)
- [Ending and TryActivateAbilitiesByTag](#ending-and-tryactivateabilitiesbytag)
- [Tunable Parameters (From the Header)](#tunable-parameters-from-the-header)

---


## GAS and client prediction

<img src="images/blog/2025-11-03-how-to-implement-wall-move-ability/gasplugin.png"
     alt="GAS overview"
     style="display:block;margin:0 auto;max-width:75%;">

The ability is implemented with Unreal’s Gameplay Ability System (GAS). Input is predicted on the client so the move feels instant, while the server holds authority. GAS lets us start the predicted activation locally and defer the commit until validations pass on the server; if authority later disagrees, the prediction is canceled/rolled back cleanly. The following sections (especially activation and commit order) rely on this model.

---


## Activation and Early Cancellation
On activation the logic runs a commit check but defers the actual commit. If checks fail, or if the character is not in a falling state, the ability is cancelled immediately. This keeps client-predicted input responsive while preserving authority consistency in networked play.

---


## Detecting Candidate Walls
A helper routine line-traces from the character in a chosen direction to gather the impact point, the wall’s “forward” (taken from the hit normal) and a perpendicular right vector via cross product; it returns the distance to the hit or -1 if no wall is found. If a front wall is not detected, the system probes left and right and picks whichever is closer.

```c++
const bool bHit = GetWorld()->LineTraceSingleByChannel(HitResult, CharacterLocation, HitEnd, TraceChannel, Params);
if(!bHit) return -1;
OutWallImpactPoint = HitResult.ImpactPoint;
OutWallForwardVector = HitResult.ImpactNormal;
OutWallRightVector = -FVector::CrossProduct(OutWallForwardVector, FVector::UpVector);
```

---


## Choosing Between Kick and Skip
When a front wall exists, the code computes the angle between the character’s forward and the opposite of the wall forward. If the angle lies within the configurable threshold `MaxAngleForWallKick`, **Wall Kick** is executed; otherwise, **Wall Skip** is selected. If no front wall exists, **Wall Skip** targets the nearer side wall.

```c++
const float angDeg = FMath::RadiansToDegrees(FMath::Acos(FVector::DotProduct(CharacterFwd, -WallFwd)));
const bool bKick = angDeg >= -MaxAngleForWallKick && angDeg <= MaxAngleForWallKick;
```

---


## Computing the Launch

<br>

<img src="images/blog/2025-11-03-how-to-implement-wall-move-ability/WallKick.gif"
     alt="Wall Kick – example"
     style="display:block;margin:0 auto;max-width:50%;">
**Wall Kick:** The launch direction can either oppose the character’s forward (when a boolean flag is enabled) or align with the wall’s forward; XY and Z impulses are applied separately for tuning.

```c++
FVector2D dir = bUseOppositeDirectionForWallKick
  ? FVector2D(-CharFwd.X, -CharFwd.Y)
  : FVector2D(WallFwd);
const FVector vel(dir.X*WallKickLaunchXYPower, dir.Y*WallKickLaunchXYPower, WallKickLaunchZPower);
```
<br>


<img src="images/blog/2025-11-03-how-to-implement-wall-move-ability/WallSkip.gif"
     alt="Wall Skip – example"
     style="display:block;margin:0 auto;max-width:50%;">

**Wall Skip:** For side walls, a side vector is rotated by a configurable angle to form a “hypotenuse” toward the wall and then reflected across the wall normal to obtain the outbound direction. For a front wall, the character’s forward is reflected directly. Resulting XY/Z powers are applied to form the final launch.

```c++
const FVector hyp = SideVec.RotateAngleAxis(LaunchAngle, FVector::UpVector);
const FVector dir = FMath::GetReflectionVector(hyp, WallFwd);
const FVector vel(dir.X*WallSkipLaunchXYPower, dir.Y*WallSkipLaunchXYPower, WallSkipLaunchZPower);
```

---

## Effects, Montage and Commit

<img src="images/blog/2025-11-03-how-to-implement-wall-move-ability/MultiWallMove_1.gif"
     alt="Wall Kick – example"
     style="display:block;margin:0 auto;max-width:50%;">

A utility spawns a Niagara system and plays a sound at the impact location using the wall normal for rotation, then calls the engine’s character launch. 

```c++
const FRotator WallImpactPointRotation = WallForwardVector.Rotation();

if (ensureAlways(ImpactNiagaraSystem))
{
    UNiagaraFunctionLibrary::SpawnSystemAtLocation(this, ImpactNiagaraSystem.Get(),
        WallImpactPoint, WallImpactPointRotation);
}

if (ensureAlways(ImpactSound))
{
    UGameplayStatics::PlaySoundAtLocation(this, ImpactSound, WallImpactPoint,
        WallImpactPointRotation);
}

ValidCharacter->LaunchCharacter(LaunchVelocity, true, true);
```


The appropriate Montage (Kick/Skip) is played via the Ability System and only then is the ability committed and ended.

```c++
ValidCharacter->GetAbilitySystemComponent()->PlayMontage(this, ActivationInfo, Montage, MontagePlayRate);

CommitAbility(Handle, ActorInfo, ActivationInfo);

EndAbility(Handle, ActorInfo, ActivationInfo, true, false);
```

---


## Ending and TryActivateAbilitiesByTag
On EndAbility: if the ability was cancelled, the Ability System attempts to activate other abilities that match a configured tag set, providing a graceful fallback path. 

```c++
UAbilitySystemComponent* OwningAbilitySystemComponent = ActorInfo->AbilitySystemComponent.Get();

if (ensureAlways(IsValid(OwningAbilitySystemComponent)))
{
    OwningAbilitySystemComponent->TryActivateAbilitiesByTag(AbilitiesTagsToActivateOnCancel);
}
```

---


## Tunable Parameters (From the Header)
- **Detection:** `MaxDistanceToWall` and `TraceChannel`.
- **Kick gate:** `MaxAngleForWallKick`.
- **Wall Kick:** `bUseOppositeDirectionForWallKick`, `WallKickLaunchXYPower`, `WallKickLaunchZPower`, `WallKickMontage` and `WallKickMontagePlayRate`.
- **Wall Skip:** `WallSkipLaunchAngle`, `WallSkipLaunchXYPower`, `WallSkipLaunchZPower`, `WallSkipMontage` and `WallSkipMontagePlayRate`.
- **Feedback & integration:** `ImpactNiagaraSystem`, `ImpactSound` and `AbilitiesTagsToActivateOnCancel`.
