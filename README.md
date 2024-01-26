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
initModel(args: { options: { params: ModelParams; }; }) => Promise<void>
```

Initialize the model with the given parameters.

| Param      | Type                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| **`args`** | <code>{ options: { params: <a href="#modelparams">ModelParams</a>; }; }</code> |

--------------------


### sendMessage(...)

```typescript
sendMessage(args: { inputText: string; options?: PluginSendMessageOptions; }) => Promise<string>
```

Send a message to the model and return the response.

| Param      | Type                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| **`args`** | <code>{ inputText: string; options?: <a href="#pluginsendmessageoptions">PluginSendMessageOptions</a>; }</code> |

**Returns:** <code>Promise&lt;string&gt;</code>

--------------------


### countTokens(...)

```typescript
countTokens(args: { inputText: string; options?: PluginCountTokensOptions; }) => Promise<number>
```

Count the number of tokens in the given input text.

| Param      | Type                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| **`args`** | <code>{ inputText: string; options?: <a href="#plugincounttokensoptions">PluginCountTokensOptions</a>; }</code> |

**Returns:** <code>Promise&lt;number&gt;</code>

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
sendChatMessage(args: { inputText: string; options?: PluginSendMessageOptions; }) => Promise<string>
```

Send a message to the model for the current chat session and return the response.

| Param      | Type                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| **`args`** | <code>{ inputText: string; options?: <a href="#pluginsendmessageoptions">PluginSendMessageOptions</a>; }</code> |

**Returns:** <code>Promise&lt;string&gt;</code>

--------------------


### countChatTokens(...)

```typescript
countChatTokens(args: { options?: PluginCountChatTokensOptions; }) => Promise<number>
```

Count the number of tokens for the current chat session with optional input text and images.

| Param      | Type                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| **`args`** | <code>{ options?: <a href="#plugincountchattokensoptions">PluginCountChatTokensOptions</a>; }</code> |

**Returns:** <code>Promise&lt;number&gt;</code>

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


#### PluginSendMessageOptions

| Prop                  | Type                                                  | Description                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`imageUris`**       | <code>string[]</code>                                 | List of image URIs to be given to the model.                                                                                                                                                                                                                                                                                                                                        |
| **`onResponseChunk`** | <code>((responseTextChunk: string) =&gt; void)</code> | Callback function that will be called for each chunk of the response. If this is defined, the response will be streamed back to the client as it is generated, as well as the complete response being returned as a single string after the generation is complete. If this is not defined, the response will only be returned as a single string after the generation is complete. |


#### PluginCountTokensOptions

| Prop            | Type                  | Description                                  |
| --------------- | --------------------- | -------------------------------------------- |
| **`imageUris`** | <code>string[]</code> | List of image URIs to be given to the model. |


#### PluginChatHistoryItem

| Prop            | Type                  |
| --------------- | --------------------- |
| **`isUser`**    | <code>boolean</code>  |
| **`text`**      | <code>string</code>   |
| **`imageUris`** | <code>string[]</code> |


#### PluginCountChatTokensOptions

| Prop            | Type                  | Description                                  |
| --------------- | --------------------- | -------------------------------------------- |
| **`inputText`** | <code>string</code>   | User input text to be given to the model.    |
| **`imageUris`** | <code>string[]</code> | List of image URIs to be given to the model. |


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
