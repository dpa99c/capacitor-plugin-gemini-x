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

Params passed to {@link GoogleGenerativeAI.getGenerativeModel}.

| Prop        | Type                |
| ----------- | ------------------- |
| **`model`** | <code>string</code> |


#### GeminiXResponseChunk

| Prop           | Type                 |
| -------------- | -------------------- |
| **`response`** | <code>string</code>  |
| **`isChat`**   | <code>boolean</code> |


#### PluginSendMessageOptions

| Prop                 | Type                        | Description                                                                                                                                                                                                                                                                                   |
| -------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`images`**         | <code>GeminiXImage[]</code> | List of image URIs to be given to the model.                                                                                                                                                                                                                                                  |
| **`streamResponse`** | <code>boolean</code>        | Whether to stream the response from the model. If `true`, then the `success` callback will be called multiple times with partial responses until the final response is received. The final response will be the full model response text and `isComplete` will be `true`. Default is `false`. |


#### GeminiXImage

An image to be given to the model specified by a URI.
The mimeType is optional and will attempt to be inferred from the URI if not specified.

| Prop           | Type                |
| -------------- | ------------------- |
| **`uri`**      | <code>string</code> |
| **`mimeType`** | <code>string</code> |


#### GeminiXResponseCount

| Prop         | Type                 |
| ------------ | -------------------- |
| **`count`**  | <code>number</code>  |
| **`isChat`** | <code>boolean</code> |


#### PluginCountTokensOptions

| Prop         | Type                        | Description                                  |
| ------------ | --------------------------- | -------------------------------------------- |
| **`images`** | <code>GeminiXImage[]</code> | List of image URIs to be given to the model. |


#### PluginChatHistoryItem

| Prop         | Type                        |
| ------------ | --------------------------- |
| **`isUser`** | <code>boolean</code>        |
| **`text`**   | <code>string</code>         |
| **`images`** | <code>GeminiXImage[]</code> |


#### PluginCountChatTokensOptions

| Prop            | Type                        | Description                                  |
| --------------- | --------------------------- | -------------------------------------------- |
| **`inputText`** | <code>string</code>         | User input text to be given to the model.    |
| **`images`**    | <code>GeminiXImage[]</code> | List of image URIs to be given to the model. |


#### ModelChatHistoryItem

| Prop         | Type                                |
| ------------ | ----------------------------------- |
| **`isUser`** | <code>boolean</code>                |
| **`parts`**  | <code>ModelChatHistoryPart[]</code> |


#### ModelChatHistoryPart

| Prop          | Type                |
| ------------- | ------------------- |
| **`type`**    | <code>string</code> |
| **`content`** | <code>string</code> |

</docgen-api>
