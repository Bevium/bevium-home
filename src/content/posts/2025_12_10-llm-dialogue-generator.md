---
title: "LLM Dialogue Generator"
description: "Documentation for the LLM Dialogue Generator Unreal Engine plugin: architecture, setup and usage examples."
tags: ["Unreal Engine 5", "C++", "LLM", "AI", "Dialogue Generator", "Fab", "Llama"]
date: "12/10/2025"
ogImage: "/images/blog/2025-12-10-llm-dialogue-generator/sceen01.PNG"
---

# LLM Dialogue Generator Documentation

<img src="images/blog/2025-12-10-llm-dialogue-generator/DialogueTest.gif" alt="Dialogue Generator preview" style="display:block;margin:15px auto; max-width:100%;">

The **LLM Dialogue Generator** is a modular, performance-focused system designed for Unreal Engine that enables the creation of dynamic, custom dialogues for NPCs, playable characters and any other game entity. By integrating local Large Language Model (LLM) technology directly into the engine, it offers a powerful solution to drastically reduce the time spent writing static dialogue, resulting in highly responsive and context-aware NPCs.


<img src="images/blog/2025-12-10-llm-dialogue-generator/Fab.png" width="25" /> [LLM Dialogue Generator](https://www.fab.com/listings/cba84eed-2216-457b-b42c-4978c94dcc9c)

<img src="images/blog/2025-12-10-llm-dialogue-generator/Youtube.png" width="25" /> [LLM Dialogue Generator Playlist](https://youtube.com/playlist?list=PL__Xk83hUQ00Ya6tPxxMkpOjCvgr2JFhx&si=zhL5fFDg5pyPpWme)


***
## Table of contents
- [1. Core Technology: Running Models Locally](#1-core-technology-running-models-locally)
  - [Why Local Inference?](#why-local-inference)
  - [1.1. Supported Models and Default Configuration](#11-supported-models-and-default-configuration)
     - [*Example of DUESettings*](#example-of-duesettings)
- [2. Architectural Components and Data Assets](#2-architectural-components-and-data-assets)
  - [2.1. Dialogue Component](#21-dialogue-component)
  - [2.2. Content Configuration Data Assets](#22-content-configuration-data-assets)
    - [Entity Data Asset](#entity-data-asset)
      - [*Example of EntityDataAsset Configuration*](#example-of-entitydataasset-configuration)
    - [Context Data Assets](#context-data-assets)
      - [*Examples of Context Data Assets*](#examples-of-context-data-assets)
    - [Configuring Generation Parameters and Samplers](#configuring-generation-parameters-and-samplers-uduegenerationparamsdataasset)
      - [Sampler Chain Configuration](#sampler-chain-configuration-uduesamplerconfigbasedataasset)
      - [*Example Sampler Chain Usage*](#example-sampler-chain-usage)
- [3. Key Features and Customization](#3-key-features-and-customization)
  - [3.1. Asynchronous Generation and Streaming](#31-asynchronous-generation-and-streaming)
  - [3.2. Thinking](#32-thinking)
  - [3.3. Rules to follow for Coherence](#33-rules-to-follow-rulestags-for-coherence)
  - [3.4. Pregeneration to Reduce Latency](#34-pregeneration-to-reduce-latency)
  - [3.5. Integrated Quality Control (QC)](#35-integrated-quality-control-qc)
  - [3.6. Automatic Summarization](#36-automatic-summarization)
- [4. Usage Snippets and Examples](#4-usage-snippets-and-examples)
  - [Blueprint Usage - How to generating dialogue](#blueprint-usage-how-to-generating-dialogue)
  - [How to get dialogue choices](#how-to-get-dialogue-choices)
  - [Editor - How to set Custom Entity Details](#editor-how-to-set-custom-entity-details)



***

## 1. Core Technology: Running Models Locally

One of the greatest advantages of the LLM Dialogue Generator is that it operates completely locally using **LLAMA.cpp technology**.

### Why Local Inference?

Running the model locally means:
1.  **Lower Latency:** Dialogue generation occurs within your game instance, minimizing network overhead.
2.  **No External Dependencies:** You do not rely on external cloud APIs or subscriptions.
3.  **Complete Control:** You configure and manage the model file directly within the project settings.

The system uses the `UDUEGenerationSubsystem` to manage the loaded model and handle asynchronous generation requests. Model initialization involves setting parameters like the path to the local model file (expected to be a **GGUF file**) and defining the number of layers to load onto the GPU (`NumGpuLayers`) for optimized performance, which is configured in the settings. The Subsystem utilizes a context pool (`ContextPool`) to manage parallel calls efficiently.

### 1.1. Supported Models and Default Configuration

The plugin is designed to work with models compatible with **LLAMA.cpp technology** that are provided in the **GGUF format**.

The LLM Dialogue Generator is currently released with the **Qwen3 1.7B** model. This model, licensed under the *apache license 2.0*, is an excellent choice for role-playing scenarios and natively supports the **Thinking** functionality (see section 3.2). The prompt formatter used to communicate with this model is the `DUEQwen3Formatter`.

*It's also possible to **use another GGUF model** by importing it, entering the ModelFilePath in the `DUESettings` and finally creating the appropriate *prompt formatter* for the chosen model.*

##### *Example of DUESettings*
<img src="images/blog/2025-12-10-llm-dialogue-generator/DUESettings.png" alt="DUESettings" style="display:block;margin:15px auto; max-width:100%;">

***

## 2. Architectural Components and Data Assets

The plugin is structured around a component, a subsystem and several specialized Data Assets to handle content definition and runtime generation.

### 2.1. Dialogue Component

The `UDUEDialogueComponent` is the primary interface for dialogue interaction. It is designed to be attached to any Actor or NPC to manage their runtime dialogues.

Key functions exposed to Blueprint include:
*   `InitializeDialogueInstance`: Initializes the internal dialogue instance using the assigned `EntityDataAsset`. This should be called before any generation.
*   `DialogueGeneration`: Generates a response based on a selected `ChoiceId`.
*   `Pregeneration`: Generates all available dialogue responses ahead of time to minimize runtime latency.
*   `GetDialogueInstance`: Retrieves the runtime instance managing the current dialogue state.

*The component allows developers to **override entity flags** defined in the **EntityDataAsset** for instance-specific adjustments, including `bOverrideUseStreaming`, `bOverrideUseThinking`, `bOverrideUseSummarization`, `bOverrideUsePregeneration` and `bOverrideUseQualityControl`.*

### 2.2. Content Configuration Data Assets

Dialogue content and character definition are managed entirely through Data Assets, making the system highly Blueprint friendly.

<img src="images/blog/2025-12-10-llm-dialogue-generator/DAinPlugin.PNG" alt="DUESettings" style="display:block;margin:15px auto; max-width:100%;">

Some default data assets are provided in the plugin content:
- **`DA_QualityControlParams`**: Generation parameters used for QC;
- **`DA_QualityControlContext`**: Useful for building the QC prompt;
- **`DA_DialogueRuleSet`**: Contains the mapping between tags and rule texts
- **`DA_DefaultSummaryParams`**: Generation parameters used for summaries;
- **`DA_DefaultParams`**: Generation parameters for simple responses.


#### Entity Data Asset

This asset defines the character or NPC that owns the dialogue component. It encapsulates all necessary information for the LLM to generate contextual dialogue:
*   **`EntityDetails`**: Core descriptive details (Name, Last Name, NickName, Gender).
*   **`EntityContext`**: Reference to the context asset providing traits and background.
*   **`DialogueChoices`**: An array of available `FDUEDialogueChoice` structs.
*   **`WayOfSpeaking`**: A string that influences the tone, phrasing, or personality of dialogue lines.
*   **`Generation Flags`**: Includes specific toggles for *streaming*, *thinking*, *pregeneration*, *summarization* and *quality control*.
*   **`Generation Overrides`**: Allows overriding default parameters (`Params`), summary parameters (`SummaryParams`) and quality control parameters (`QualityControlParams`).

The **`FDUEDialogueChoice`** structure defines a specific dialogue choice that an entity can have. It consisting of:
* **`Text`**: dialogue line string;
* **`DefaultResponse`**: useful if generation fails;
* **`bRepetable`**: to choose whether it can be reused or not.

##### *Example of EntityDataAsset Configuration*

<img src="images/blog/2025-12-10-llm-dialogue-generator/DialogueChoices_Generation01_v2.png" alt="Dialogue Choices" style="display:block;margin:auto auto; max-width:100%;">
<p style="text-align:center; font-style:italic">Dialogue Choices</p>

<img src="images/blog/2025-12-10-llm-dialogue-generator/Settings_Generation01_v2.PNG" alt="World Context" style="display:block;margin:auto auto;max-width:100%;">
<p style="text-align:center; font-style:italic">Generation Flags</p>

#### Context Data Assets

Context assets feed background information to the model:

| Asset Type | Purpose | Key Properties |
| :--- | :--- | :--- |
| `UDUEEntityContextDataAsset` | Provides context related to a specific entity or character. | **`Traits`** (e.g., "brave", "loyal") and **`Background`** (narrative description). Supports dynamic placeholders (e.g.: `{EntityName}`, `{sp}`, ect.) |
| `UDUEWorldContextDataAsset` | Provides broader world context, lore, or global environment information. | **`WorldName`** and **`Description`**, alongside a list of **`KeyLocations`**. |

*All context assets inherit from `UDUEContextBaseDataAsset`, which holds a block of text used as contextual information fed into the dialogue generation model.*

##### *Examples of Context Data Assets*

<img src="images/blog/2025-12-10-llm-dialogue-generator/EntityContext_Generation01.PNG" alt="Entity Context" style="display:block;margin:0 auto; max-width:530px;">
<p style="text-align:center; font-style:italic">Entity Context</p>

<img src="images/blog/2025-12-10-llm-dialogue-generator/WorldContext_Generation01.PNG" alt="World Context" style="display:block;margin:0 auto;max-width:530px;">
<p style="text-align:center; font-style:italic">World Context</p>

#### Configuring Generation Parameters and Samplers (`UDUEGenerationParamsDataAsset`)

The behavior of the LLM during token generation is controlled by the **`FDUEGenerationParams`** structure, which is encapsulated within the **`UDUEGenerationParamsDataAsset`**. This Data Asset allows precise control over crucial factors like output length and randomness.

The `FDUEGenerationParams` structure controls two primary aspects of generation:

1.  **Token Limit:** The generation can enforce a maximum token output limit (`MaxTokens`) when `bUseMaxTokens` is set to `true`.
2.  **Sampler Chain:** By setting `bUseCustomSamplerChainConfigs` to `true`, developers can define a specific sequence of **Sampler Config assets** to govern token selection.


##### Sampler Chain Configuration (`UDUESamplerConfigBaseDataAsset`)

Sampling determines how the next token is chosen from the model's output distribution. The plugin supports chaining multiple samplers to achieve complex or specific behavioral characteristics. All specific sampler types inherit from the abstract **`UDUESamplerConfigBaseDataAsset`**.

##### *Example Sampler Chain Usage*:

<img src="images/blog/2025-12-10-llm-dialogue-generator/samplers.png" alt="World Context" style="display:block;margin:15px auto;max-width:100%;">

As shown in the configuration image, a standard setup might involve chaining multiple samplers in a specific order for nuanced control:
1.  **`DUETemperatureSamplerConfig`**: Setting *Temperature* to **0.8** to sharpen the distribution slightly, making the output less erratic.
2.  **`DUETopPSamplerConfig`**: Setting *Top-P* to **0.7** to restrict the token choice to the top 70% cumulative probability mass, balancing variety and coherence.
3.  **`DUEDistSamplerConfig`**: Ensuring *Use Random Seed* is enabled for non-deterministic noise in the final step, contributing to varied output across generations.

***

## 3. Key Features and Customization

The plugin supports several advanced functionalities accessible by code or Blueprint.


### 3.1. Asynchronous Generation and Streaming

Dialogue is generated asynchronously via the `UDUEGenerationSubsystem`.

The `GenerateAsync` function includes delegates to manage the flow:
*   `OnCompleted`: Called when the final generation is complete.
*   `OnStarted`: Called when generation begins.
*   `OnChunkStreamed`: This delegate is called when a real-time chunk of generated text arrives.

```c++
// Copyright Bevium Srl 2025 All Rights Reserved

UFUNCTION(BlueprintCallable, Category="Generation")
virtual int32 GenerateAsync(UDUEDialogueInstance* Instance, int32 ChoiceId,
    FOnGenerationCompletedDynamicDelegate OnCompleted,
    FOnGenerationStartedDynamicDelegate OnStarted, 
    FOnChunkStreamedDynamicDelegate OnStreamChunk);
```

### 3.2. Thinking

The **Thinking** feature, controlled by the `bUseThinking` flag, is a powerful mechanism that allows the language model to perform an internal, structured thought process before generating the final response.

When thinking is enabled, the quality and relevance of the model's output improves significantly, especially in complex contextual or role-playing scenarios.

*The **`UDUEGenerationSubsystem`** checks both the global setting (`bAlwaysUseThinking`) and the instance flag (`bUseThinking`) to determine if thinking should be used for a generation request.*

*The **`FDUEPrompts`** structure includes a `bUseThinking` field to manage this behavior during prompt construction.*

### 3.3. Rules to follow (`RulesTags`) for Coherence

To ensure NPCs adhere to consistent personalities, behavioral constraints and contextual mandates, the plugin utilizes the **`RulesToFollow`**, managed via Gameplay Tags. These rules inject specific instructions (snippets of text) directly into the generation prompt, guiding the LLM's output and improving coherence.

**Key Components for Rules Definition:**

1.  **Rule Definition (`FDUEDialogueRule`):** Each rule contains a `RuleTag` (a Gameplay Tag) and a `PromptSnippet` (a string containing the rule's instruction). This snippet is the text that influences the model's response.
2.  **Rule Set (`UDUEDialogueRuleSetDataAsset`):** This data asset stores a collection of rules mapped by their corresponding tags (`TMap<FGameplayTag, FDUEDialogueRule> Rules`), acting as the repository for all predefined behaviors.

<img src="images/blog/2025-12-10-llm-dialogue-generator/RuleSetDA_Generation01.PNG" alt="Entity Context" style="display:block;margin:15px auto; max-width:80%;">

3.  **Rule Priority (`FDUETagRuleWithPriority`):** When applying rules, they can be prioritized using `EDUERulesPriority` (*e.g., Very Minor, Minor, Moderately Important, Important, Very Important*).
4.  **Entity Application:** The `UDUEEntityDataAsset` defines: 
    * Initial rules that apply to the NPC through `OwnerInitialRulesTags`
    * `RulesToFollow`, which are the rules to add to the prompt in case the entity or player has tags assigned.

<img src="images/blog/2025-12-10-llm-dialogue-generator/Rules_Generation01.PNG" alt="Entity Context" style="display:block; margin:15px auto; max-width:80%;">
<br>

*By utilizing these rule tags, developers can enforce constraints directly in the prompt, leading to more consistent and believable NPC dialogue.*

### 3.4. Pregeneration to Reduce Latency

To minimize waiting time during gameplay, the plugin supports **pregeneration**. If `bUsePregeneration` is enabled (either on the component or the instance), the system generates responses for all available choices ahead of time. These responses are stored in the component's internal `PregeneratedMap` and subsequent calls to `DialogueGeneration` instantly retrieve the cached response rather than running a new generation job.

```c++	
// Copyright Bevium Srl 2025 All Rights Reserved

// UDUEDialogueComponent.h
UFUNCTION(BlueprintCallable, Category="Dialogue")
virtual void Pregeneration(FOnMultiGenerationCompleted OnCompleted) const;

// UDUEDialogueComponent.cpp
void UDUEDialogueComponent::HandleOnPregenerationCompleted(const FDUEChoiceIdResponseMap& ChoiceIdResponses)
{
	// ...

	PregeneratedMap = ChoiceIdResponses;
}

void UDUEDialogueComponent::DialogueGeneration(const int32 ChoiceId,
	const FOnGenerationCompletedDynamicDelegate OnCompleted,
	const FOnGenerationStartedDynamicDelegate OnStarted,
	const FOnChunkStreamedDynamicDelegate OnChunkStreamed) const
{
	// ...
	
	if (DialogueInstance->bUsePregeneration && PregeneratedMap.ChoiceIdResponseMap.Num() > 0)
	{
		// ...

		const FString FinalResponse = PregeneratedMap.ChoiceIdResponseMap.FindRef(ChoiceId);

		// ...
	}

	// ...
}

```

### 3.5. Integrated Quality Control (QC)

Quality Control is an optional feature that provides a dedicated prompt builder and parameters to validate and sanitize the language model's raw output. It can be combined with streaming (*Case 4 of `UDUEDialogueSubsystem`*), or run separately (*Case 2 of `UDUEDialogueSubsystem`*).

The QC process is typically executed after the initial generation. It uses a specialized asset, `UDUEQualityControlContextDataAsset`, which defines a prompt instructing the model on how to clean up the raw response. 

<img src="images/blog/2025-12-10-llm-dialogue-generator/rawresponsewarning.PNG" alt="Entity Context" style="display:block; margin:15px auto; max-width:100%;">

*This prompt template **must** contain the `{RawResponse}` placeholder to feed the original output back into the QC model for refinement.*

### 3.6. Automatic Summarization

For long dialogue sessions, the plugin offers **automatic summarization**. If enabled (`bUseSummarization` is true), the system periodically condenses the dialogue history into `HistorySummary` string when `MaxEntriesBeforeSummary` is reached. This condensed history is then used in subsequent generation prompts to maintain coherence over extended interactions.

```c++
// Copyright Bevium Srl 2025 All Rights Reserved

protected:
	/** Cumulative summary text representing compacted historical knowledge. */
	UPROPERTY(BlueprintReadOnly, SaveGame, Category="DialogueInstance|Summary")
	FString HistorySummary;

	/** Recent prompt/response entries not yet folded into HistorySummary. */
	UPROPERTY(BlueprintReadOnly, SaveGame, Category="DialogueInstance")
	TArray<FDUEPromptResponse> RecentEntries;

	/** Complete, chronological prompt/response history for this instance. */
	UPROPERTY(BlueprintReadOnly, SaveGame, Category="DialogueInstance")
	TArray<FDUEPromptResponse> FullHistory;
	
private:
	/** Threshold after which to regenerate the summary */
	int32 MaxEntriesBeforeSummary;

```
***

## 4. Usage Snippets and Examples

The core workflow relies on defining **Entities** and using the `DialogueComponent`/`DialogueInstance` by code or Blueprint.

### Blueprint Usage - How to generate dialogue using Component

<img src="images/blog/2025-12-10-llm-dialogue-generator/BP_Generation01.PNG" alt="Entity Context" style="display:block;margin:15px auto; max-width:100%;">


```c++
// Copyright Bevium Srl 2025 All Rights Reserved

// UDUEDialogueComponent.h
UFUNCTION(BlueprintCallable, Category="Dialogue")
virtual void DialogueGeneration(const int32 ChoiceId,
	FOnGenerationCompletedDynamicDelegate OnCompleted,
	FOnGenerationStartedDynamicDelegate OnStarted,
	FOnChunkStreamedDynamicDelegate OnChunkStreamed) const;
```

*`ChoiceId` is the entity's **dialogue choice***

### How to get dialogue choices

Using the code you can get the dialogue choices like this:
```c++
// Copyright Bevium Srl 2025 All Rights Reserved

if (const UDUEDialogueInstance* Instance = DialogueComponent->GetDialogueInstance())
{
    // all dialogue choices
    TArray<FDUEDialogueChoice> DialogueChoices = Instance->GetDialogueChoices();
    // only the remaining dialogue choices
    TMap<int32, FDUEDialogueChoice> RemainingChoiceMap = Instance->GetRemainingDialogueChoices();
}
```

Or, using blueprint:

<img src="images/blog/2025-12-10-llm-dialogue-generator/dialoguechoices.png" alt="Entity Context" style="display:block;margin:15px auto; max-width:100%;">

*The **remaining choices** are those that, marked as `bRepetable=false`, have already been used for generation.*


### Editor - How to set Custom Entity Details

<img src="images/blog/2025-12-10-llm-dialogue-generator/Component_Generation01.PNG" alt="Entity Context" style="display:block;margin:15px auto; max-width:100%;">

*You can also create a generic `EntityDataAsset` and use it for multiple NPCs by modifying only the `CustomEntityDetails`. This way, you'll have NPCs with the same **background**, **description** and **dialogue choices**, but each NPC will still have their own personalized details. This is especially useful when you have similar NPCs with different names.*