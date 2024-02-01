import type {ModelParams, ModelChatHistoryItem, SafetySettings} from './lib/GeminiX';
import {SafetySettingLevel, SafetySettingHarmCategory} from './lib/GeminiX';

export type {ModelParams, ModelChatHistoryItem, SafetySettings};
export {SafetySettingLevel, SafetySettingHarmCategory};

/**
 * Event emitted on the `window` object when a streaming response chunk is received from the model.
 */
export const GeminiXResponseChunkEvent = 'GeminiXResponseChunk';

/**
 * Model response data passed to back to `sendMessage` and `sendChatMessage` functions.
 * Also passed to event handlers registered on the `window` object for the `GeminiXResponseChunkEvent`.
 */
export interface GeminiXResponseChunk {
  response:string,
  isChat:boolean
}

/**
 * Model response data passed to back to `countTokens` and `countChatTokens` functions.
 */
export interface GeminiXResponseCount {
  count:number,
  isChat:boolean
}

/**
 * An image to be given to the model specified by a URI.
 * The mimeType is optional and will attempt to be inferred from the URI if not specified.
 */
export interface GeminiXImage {
  uri:string,
  mimeType?:string,
}

export interface PluginSendMessageOptions {
  /**
   * List of image URIs to be given to the model.
   */
  images?:GeminiXImage[],
  /**
   * Whether to stream the response from the model before the final response is received.
   * If `true`, then event listeners registered on the `window` object for the `GeminiXResponseChunkEvent` will be called with partial responses until the final response is received.
   * The final response will be the full model response text.
   * Default is `false`.
   */
  streamResponse?: boolean
}


export interface PluginCountTokensOptions {
  /**
   * List of image images to be given to the model.
   */
  images?:GeminiXImage[]
}

export interface PluginCountChatTokensOptions {
  /**
   * User input text to be given to the model.
   */
  inputText?:string,
  /**
   * List of images to be given to the model.
   */
  images?:GeminiXImage[]
}

export interface PluginChatHistoryItem {
  /**
   * Whether the message is from the user or the model.
   */
  isUser:boolean;
  /**
   * The text of the message.
   */
  text?:string;
  /**
   * List of images to be given to the model.
   */
  images?:GeminiXImage[]
}

export interface GeminiXPlugin {
  /**
   * Initialize the model with the given parameters.
   */
  initModel(args: { params:ModelParams }): Promise<void>;

  /**
   * Send a message to the model and return the response.
   */
  sendMessage(args: {inputText:string, options?: PluginSendMessageOptions}): Promise<GeminiXResponseChunk>;

  /**
   * Count the number of tokens in the given input text.
   */
  countTokens(args: {inputText:string, options?: PluginCountTokensOptions}): Promise<GeminiXResponseCount>;

  /**
   * Initialize a chat session with optional chat history.
   */
  initChat(args: {chatHistory?:PluginChatHistoryItem[]}): Promise<void>;

  /**
   * Send a message to the model for the current chat session and return the response.
   */
  sendChatMessage(args: {inputText:string, options?: PluginSendMessageOptions}): Promise<GeminiXResponseChunk>;

  /**
   * Count the number of tokens for the current chat session with optional input text and images.
   */
  countChatTokens(args: {options?:PluginCountChatTokensOptions}): Promise<GeminiXResponseCount>;

  /**
   * Get the chat history for the current chat session.
   */
  getChatHistory(): Promise<ModelChatHistoryItem[]>;
}


