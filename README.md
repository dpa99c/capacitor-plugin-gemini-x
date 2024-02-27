# capacitor-plugin-gemini-x

Capacitor plugin to invoke Google's Gemini AI models on Android, iOS and Web.

## Install

```bash
npm install capacitor-plugin-gemini-x
npx cap sync
```

## API

<docgen-index>

* [`initModel(...)`](#initmodel)
* [`sendMessage(...)`](#sendmessage)
* [`countTokens(...)`](#counttokens)
* [`initChat(...)`](#initchat)
* [`sendChatMessage(...)`](#sendchatmessage)
* [`countChatTokens(...)`](#countchattokens)
* [`getChatHistory()`](#getchathistory)
* [Interfaces](#interfaces)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### initModel(...)

```typescript
initModel(args: { params: ModelParams; }) => Promise<void>
```

Initialize the model with the given parameters.

| Param      | Type                                                             |
| ---------- | ---------------------------------------------------------------- |
| **`args`** | <code>{ params: <a href="#modelparams">ModelParams</a>; }</code> |

--------------------


### sendMessage(...)

```typescript
sendMessage(args: { inputText: string; options?: PluginSendMessageOptions; }) => Promise<GeminiXResponseChunk>
```

Send a message to the model and return the response.

| Param      | Type                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| **`args`** | <code>{ inputText: string; options?: <a href="#pluginsendmessageoptions">PluginSendMessageOptions</a>; }</code> |

**Returns:** <code>Promise&lt;<a href="#geminixresponsechunk">GeminiXResponseChunk</a>&gt;</code>

--------------------


### countTokens(...)

```typescript
countTokens(args: { inputText: string; options?: PluginCountTokensOptions; }) => Promise<GeminiXResponseCount>
```

Count the number of tokens in the given input text.

| Param      | Type                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| **`args`** | <code>{ inputText: string; options?: <a href="#plugincounttokensoptions">PluginCountTokensOptions</a>; }</code> |

**Returns:** <code>Promise&lt;<a href="#geminixresponsecount">GeminiXResponseCount</a>&gt;</code>

--------------------


### initChat(...)

```typescript
initChat(args: { chatHistory?: PluginChatHistoryItem[]; }) => Promise<void>
```

Initialize a chat session with optional chat history.

| Param      | Type                                                    |
| ---------- | ------------------------------------------------------- |
| **`args`** | <code>{ chatHistory?: PluginChatHistoryItem[]; }</code> |

--------------------


### sendChatMessage(...)

```typescript
sendChatMessage(args: { inputText: string; options?: PluginSendMessageOptions; }) => Promise<GeminiXResponseChunk>
```

Send a message to the model for the current chat session and return the response.

| Param      | Type                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| **`args`** | <code>{ inputText: string; options?: <a href="#pluginsendmessageoptions">PluginSendMessageOptions</a>; }</code> |

**Returns:** <code>Promise&lt;<a href="#geminixresponsechunk">GeminiXResponseChunk</a>&gt;</code>

--------------------


### countChatTokens(...)

```typescript
countChatTokens(args: { options?: PluginCountChatTokensOptions; }) => Promise<GeminiXResponseCount>
```

Count the number of tokens for the current chat session with optional input text and images.

| Param      | Type                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| **`args`** | <code>{ options?: <a href="#plugincountchattokensoptions">PluginCountChatTokensOptions</a>; }</code> |

**Returns:** <code>Promise&lt;<a href="#geminixresponsecount">GeminiXResponseCount</a>&gt;</code>

--------------------


### getChatHistory()

```typescript
getChatHistory() => Promise<ModelChatHistoryItem[]>
```

Get the chat history for the current chat session.

**Returns:** <code>Promise&lt;ModelChatHistoryItem[]&gt;</code>

--------------------


### Interfaces


#### ModelParams

Model parameters to be passed to `initModel` function.

| Prop                  | Type                                                      | Description                                    |
| --------------------- | --------------------------------------------------------- | ---------------------------------------------- |
| **`modelName`**       | <code>string</code>                                       | The name of the model to be used.              |
| **`apiKey`**          | <code>string</code>                                       | The API key to be used.                        |
| **`temperature`**     | <code>number</code>                                       | The temperature to be used for generation.     |
| **`topK`**            | <code>number</code>                                       | The topK to be used for generation.            |
| **`topP`**            | <code>number</code>                                       | The topP to be used for generation.            |
| **`maxOutputTokens`** | <code>number</code>                                       | The maximum number of tokens to be generated.  |
| **`stopSequences`**   | <code>string[]</code>                                     | The stop sequences to be used for generation.  |
| **`safetySettings`**  | <code><a href="#safetysettings">SafetySettings</a></code> | The safety settings to be used for generation. |


#### SafetySettings

Safety settings to be passed to `initModel` function.

| Prop                                                | Type                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| **`[SafetySettingHarmCategory.HARASSMENT]`**        | <code><a href="#safetysettinglevel">SafetySettingLevel</a></code> |
| **`[SafetySettingHarmCategory.HATE_SPEECH]`**       | <code><a href="#safetysettinglevel">SafetySettingLevel</a></code> |
| **`[SafetySettingHarmCategory.SEXUALLY_EXPLICIT]`** | <code><a href="#safetysettinglevel">SafetySettingLevel</a></code> |
| **`[SafetySettingHarmCategory.DANGEROUS_CONTENT]`** | <code><a href="#safetysettinglevel">SafetySettingLevel</a></code> |
| **`[SafetySettingHarmCategory.UNSPECIFIED]`**       | <code><a href="#safetysettinglevel">SafetySettingLevel</a></code> |


#### GeminiXResponseChunk

Model response data passed to back to `sendMessage` and `sendChatMessage` functions.
Also passed to event handlers registered on the `window` object for the `GeminiXResponseChunkEvent`.

| Prop           | Type                 |
| -------------- | -------------------- |
| **`response`** | <code>string</code>  |
| **`isChat`**   | <code>boolean</code> |


#### PluginSendMessageOptions

| Prop                 | Type                        | Description                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`images`**         | <code>GeminiXImage[]</code> | List of image URIs to be given to the model.                                                                                                                                                                                                                                                                                                        |
| **`streamResponse`** | <code>boolean</code>        | Whether to stream the response from the model before the final response is received. If `true`, then event listeners registered on the `window` object for the `GeminiXResponseChunkEvent` will be called with partial responses until the final response is received. The final response will be the full model response text. Default is `false`. |


#### GeminiXImage

An image to be given to the model specified by a URI.
The mimeType is optional and will attempt to be inferred from the URI if not specified.

| Prop           | Type                |
| -------------- | ------------------- |
| **`uri`**      | <code>string</code> |
| **`mimeType`** | <code>string</code> |


#### GeminiXResponseCount

Model response data passed to back to `countTokens` and `countChatTokens` functions.

| Prop         | Type                 |
| ------------ | -------------------- |
| **`count`**  | <code>number</code>  |
| **`isChat`** | <code>boolean</code> |


#### PluginCountTokensOptions

| Prop         | Type                        | Description                                    |
| ------------ | --------------------------- | ---------------------------------------------- |
| **`images`** | <code>GeminiXImage[]</code> | List of image images to be given to the model. |


#### PluginChatHistoryItem

| Prop         | Type                        | Description                                        |
| ------------ | --------------------------- | -------------------------------------------------- |
| **`isUser`** | <code>boolean</code>        | Whether the message is from the user or the model. |
| **`text`**   | <code>string</code>         | The text of the message.                           |
| **`images`** | <code>GeminiXImage[]</code> | List of images to be given to the model.           |


#### PluginCountChatTokensOptions

| Prop            | Type                        | Description                               |
| --------------- | --------------------------- | ----------------------------------------- |
| **`inputText`** | <code>string</code>         | User input text to be given to the model. |
| **`images`**    | <code>GeminiXImage[]</code> | List of images to be given to the model.  |


#### ModelChatHistoryItem

A chat history item to be passed to `initChat` function.

| Prop         | Type                                | Description                                        |
| ------------ | ----------------------------------- | -------------------------------------------------- |
| **`isUser`** | <code>boolean</code>                | Whether the message is from the user or the model. |
| **`parts`**  | <code>ModelChatHistoryPart[]</code> | The parts of the message.                          |


#### ModelChatHistoryPart

A chat history content part to be passed to `initChat` function.

| Prop          | Type                | Description              |
| ------------- | ------------------- | ------------------------ |
| **`type`**    | <code>string</code> | The type of the part.    |
| **`content`** | <code>string</code> | The content of the part. |


### Enums


#### SafetySettingLevel

| Members                | Value                           |
| ---------------------- | ------------------------------- |
| **`NONE`**             | <code>"NONE"</code>             |
| **`ONLY_HIGH`**        | <code>"ONLY_HIGH"</code>        |
| **`MEDIUM_AND_ABOVE`** | <code>"MEDIUM_AND_ABOVE"</code> |
| **`LOW_AND_ABOVE`**    | <code>"LOW_AND_ABOVE"</code>    |
| **`UNSPECIFIED`**      | <code>"UNSPECIFIED"</code>      |

</docgen-api>
