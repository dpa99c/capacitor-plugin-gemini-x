import type {ModelParams, ModelChatHistoryItem, SafetySettings} from './lib/GeminiX';
import {SafetySettingLevel, SafetySettingHarmCategory} from './lib/GeminiX';

export type {ModelParams, ModelChatHistoryItem, SafetySettings};
export {SafetySettingLevel, SafetySettingHarmCategory};

export interface PluginSendMessageOptions {
  /**
   * List of image URIs to be given to the model.
   */
  imageUris?:string[],
  /**
   * Callback function that will be called for each chunk of the response.
   * If this is defined, the response will be streamed back to the client as it is generated, as well as the complete response being returned as a single string after the generation is complete.
   * If this is not defined, the response will only be returned as a single string after the generation is complete.
   */
  onResponseChunk?: (responseTextChunk:string) => void
}

export interface PluginCountTokensOptions {
  /**
   * List of image URIs to be given to the model.
   */
  imageUris?:string[]
}

export interface PluginCountChatTokensOptions {
  /**
   * User input text to be given to the model.
   */
  inputText?:string,
  /**
   * List of image URIs to be given to the model.
   */
  imageUris?:string[]
}

export interface PluginChatHistoryItem {
  isUser:boolean;
  text?:string;
  imageUris?:string[]
}

export interface GeminiXPlugin {
  /**
   * Initialize the model with the given parameters.
   */
  initModel(args: {options: { params:ModelParams }}): Promise<void>;

  /**
   * Send a message to the model and return the response.
   */
  sendMessage(args: {inputText:string, options?: PluginSendMessageOptions}): Promise<string>;

  /**
   * Count the number of tokens in the given input text.
   */
  countTokens(args: {inputText:string, options?: PluginCountTokensOptions}): Promise<number>;

  /**
   * Initialize a chat session with optional chat history.
   * @param args
   */
  initChat(args: {chatHistory?:PluginChatHistoryItem[]}): Promise<void>;

  /**
   * Send a message to the model for the current chat session and return the response.
   */
  sendChatMessage(args: {inputText:string, options?: PluginSendMessageOptions}): Promise<string>;

  /**
   * Count the number of tokens for the current chat session with optional input text and images.
   */
  countChatTokens(args: {options?:PluginCountChatTokensOptions}): Promise<number>;

  /**
   * Get the chat history for the current chat session.
   */
  getChatHistory(): Promise<ModelChatHistoryItem[]>;
}


