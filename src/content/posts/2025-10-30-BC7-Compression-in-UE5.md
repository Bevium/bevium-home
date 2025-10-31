---
title: "BC7 Compression in UE5: Avoiding Silent RGBA8 Fallbacks"
description: "Learn why UE5 quietly falls back to B8G8R8A8 when sizes aren’t divisible by 4, how that balloons memory 4×, and add a UE5.6 editor validator to catch it."
tags: ["Unreal Engine 5", "Textures", "BC7", "Compression", "Performance", "Editor Scripting", "C++", "Asset Validation"]
ogImage: "/images/blog/bc7-ue5/bc7-cover.jpg"
date: "10-30-2025"
---

# Texture size is a hidden tower of Babel

<img src="/images/blog/bc7-ue5/nostorage.png" alt="Storage space dwindling" style="display:block;margin:0 auto;max-width:360px">
<br>

Textures are the quiet space hogs in Unreal. Give them free rein and they’ll outsize everything else, then come back to tax your frame budget and your team’s momentum as the project scales.

Here is the gotcha. You set a UI texture to `BC7` (RGBA) in Unreal. The Details panel still shows that compression setting, and everything looks fine, right?. 

Wrong: the Format line says `B8G8R8A8` and your resource size is suddenly huge. Nothing crashed. No warning popped up. UE5 silently fell back to raw RGBA8 because the texture’s width or height was not divisible by four.

And without anyone telling you, you probably would have never noticed, and then wondered why your build size skyrocketed!

This happens because BC7 is a block format. It stores pixels in fixed **4x4 tiles**. Every tile is **128 bits**, so the average works out to **1 byte per pixel**. 

That's a great compression ratio and all, but when a texture dimension does not line up on that 4×4 grid, the encoder cannot tile it, so UE resorts to using the uncompressed RGBA8 at **4 bytes per pixel** instead. 
Basically, a straight **4× memory** swing for the same picture, and UE does nothing to warn you of this.
The behavior is not to blame, as it matches the spec: all BC formats operate on fixed 4×4 blocks with a fixed number of bits per block.
If you do not respect the contraint, you do not get the compression gains.

## Testing

Let's do some testing to verify all this. Let's take, for example, this image of the Crab Nebula.
**Resolution**: 3862x3862 (not divisible by 4),
**Original Filesize**: 26,8 MB.

<img src="/images/blog/bc7-ue5/screen_nodiv-1.png" alt="Crab Nebula, Uncompressed" style="display:block;margin:0 auto;max-width:720px">
<br>

As you can see, we told UE5 to use **BC7**, but it instead resorted to using **B8G8R8A8**. That's because the image's resolution is not divisible by 4, and thus the compression fails. The resulting filesize is a whopping **56.26 MBs**. That's even larger than the original filesize on our file system, before importing the texture.

What happens when, instead, the image's resolution is actually divisible by 4? Let's bump up the resolution by just 2 pixels on both axes, bringing it to 3864x3864. This makes it possible to compress the image using BC7.

<img src="/images/blog/bc7-ue5/screen_withdiv-1.png" alt="Crab Nebula, Compressed" style="display:block;margin:0 auto;max-width:720px">
<br>

Well would you look at that, this time the image actually compressed. The resulting filesize is now 14.58 MBs, more or less a 45% decrease in filesize.

If you work on UI, this is easy to trip over because UI art is often not power-of-two. That part is fine. The rule here is smaller and stricter: keep both axes **divisible by 4**. That is all BC7 asks for. When you respect the grid, you get native GPU-friendly compression and the expected footprint; when you don’t, UE5 keeps the UI label but stores the texture as raw RGBA8 instead.

You do not need a new workflow to catch this, just a habit. Open the texture and read the **Format** line in the Details panel. If it says **BC7**, you are good. If it says **B8G8R8A8**, the size is off. A quick scan of the Content Browser will surface offenders too: any dimension where `width % 4 != 0` or `height % 4 != 0` deserves a fix.

## In-Engine fix

I complained a lot about UE not warning you when it can't compress a texture using BC7, so how about we fix this issue?
If you want a guardrail, add a tiny validator to your pipeline so artists get feedback at import. A few lines with the Editor Scripting API can load each Texture2D, read the source width and height, and flag assets that are set to BC7 but miss the 4× grid. 
Teams often choose to auto-pad up to the next multiple of four and log the change. The important part is stopping the silent fallback before it reaches a build.

One last note on why the win is big. BC7’s 128-bit per 4×4 block budget means eight bits per pixel. RGBA8 is thirty-two. That 4:1 ratio explains the jump from roughly 4 MB to 16 MB in the example above and is exactly what the BC family is designed to deliver. The math and the requirement both come straight from the Direct3D docs. 

If minimal filesize is what you desire, you can also opt to choose an even more compressed format, like BC1 or BC3, but keep in mind that the decrease in quality will be more noticeable. BC7 allows us to keep a large image's visual quality practically the same, while reducing the filesize dramatically.

## Example code for a simple asset validator.

Here is a quick example for a simple asset validator that you can test yourself, in editor. Just make sure to include the '*UnrealEd*', '*Datavalidation*' and '*AssetRegistry*' modules in your Build.cs file.

#### Header file

```cpp

#pragma once

#include "CoreMinimal.h"
#include "EditorValidatorBase.h"
#include "BC7TextureValidator.generated.h"

UCLASS()
class UBC7TextureValidator : public UEditorValidatorBase
{
    GENERATED_BODY()

public:
    UBC7TextureValidator();

    // New signatures: both FAssetData and UObject*
    virtual bool CanValidateAsset_Implementation(const FAssetData& InAssetData,
                                                        UObject* InObject,
                                                        FDataValidationContext& InContext) const override;

    virtual EDataValidationResult ValidateLoadedAsset_Implementation(const FAssetData& InAssetData,
                                                                            UObject* InAsset,
                                                                            FDataValidationContext& Context) override;
};

```

#### Source file

```cpp
#include "BC7TextureValidator.h"
#include "Engine/Texture2D.h"
#include "AssetRegistry/AssetData.h"
#include "Misc/DataValidation.h"

UBC7TextureValidator::UBC7TextureValidator()
{
    bIsEnabled = true;
}

bool UBC7TextureValidator::CanValidateAsset_Implementation(const FAssetData& InAssetData,
                                                           UObject* InObject,
                                                           FDataValidationContext& InContext) const
{
    // Decide up front: we validate Texture2D assets only.
    // If the UObject is loaded, check that too. Either check is fine.
    const bool IsTextureByClass = (InAssetData.AssetClassPath == UTexture2D::StaticClass()->GetClassPathName());
    const bool IsTextureByObject = (InObject && InObject->IsA(UTexture2D::StaticClass()));
    return IsTextureByClass || IsTextureByObject;
}

EDataValidationResult UBC7TextureValidator::ValidateLoadedAsset_Implementation(const FAssetData& InAssetData,
                                                                               UObject* InAsset,
                                                                               FDataValidationContext& Context)
{
    const UTexture2D* Tex = Cast<UTexture2D>(InAsset);
    if (!Tex)
    {
        // Should not happen because CanValidateAsset filters, but return Valid to satisfy the contract.
        Context.AddWarning(NSLOCTEXT("BC7Validator", "UnexpectedType",
                                     "BC7 validator expected a Texture2D but received a different type."));
        return EDataValidationResult::Valid;
    }

    const int32 Width = Tex->Source.GetSizeX();
    const int32 Height = Tex->Source.GetSizeY();

    // If not set to BC7, we mark as Valid. The validator ran and gave a result.
    if (Tex->CompressionSettings != TC_BC7)
    {
        return EDataValidationResult::Valid;
    }

    const bool BadDims = ((Width % 4) != 0) || ((Height % 4) != 0);

    if (BadDims)
    {
        Context.AddError(FText::Format(
            NSLOCTEXT("BC7Validator", "BadDims",
                      "BC7 requires dimensions divisible by 4. Asset {0} is {1}x{2} and will fall back to B8G8R8A8."),
            FText::FromString(Tex->GetPathName()), FText::AsNumber(Width), FText::AsNumber(Height)));
        return EDataValidationResult::Invalid;
    }

    return EDataValidationResult::Valid;
}

```

This code, updated for the new EditorValidatorBase API in Unreal Engine 5.6, will check the resolution of all textures that are marked to be compressed using BC7, and if the resolution is invalid, then it will nag you like so:

<img src="/images/blog/bc7-ue5/ImageValidator.png" alt="Image validator" style="display:block;margin:0 auto;max-width:720px">
<br>

The validator will straight up tell you that the image is not disivible by 4, and provide a link to the asset at fault. From here, you can also create similar validator for other types of images.

## Conclusions

Texture size creep is rarely loud, yet it can decide your build size and your frame timing. 
In UE5 the difference between a crisp BC7 texture and a silent fallback to raw RGBA8 is often nothing more than two pixels on an axis. 
Respect the 4×4 block grid and you keep the 4:1 footprint advantage. Miss it and you pay up to four times the memory for the same picture.

The fix is simple. Treat “divisible by 4 on both axes” as a non-negotiable rule for any asset you intend to ship as BC7. 
Make the Format line your truth source in the Details panel. If it does not say BC7, the texture is not compressed, regardless of the label you set. When UI art or concept mockups arrive off-grid, pad or resize up to the next multiple of four, then reimport.

Do not rely on vigilance alone. Add a tiny validator to your pipeline so the editor points out offenders at import time. The sample here uses the new EditorValidatorBase signatures in UE 5.6, flags BC7 textures with bad dimensions, and short-circuits surprises before they balloon your builds.

Follow these habits and your texture library stays lean, your streaming budget holds, and your project ships with the size and performance you planned. BC7 rewards discipline. Give it the grid it needs.