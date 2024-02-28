import type {ModelParams, ModelChatHistoryItem, SafetySettings, PluginSendMessageOptions, GeminiXResponseChunk, PluginCountTokensOptions, GeminiXResponseCount, PluginChatHistoryItem, PluginCountChatTokensOptions, GeminiXImage} from './lib/GeminiXTypes';
import {SafetySettingLevel, SafetySettingHarmCategory} from './lib/GeminiXTypes';

export type {ModelParams, ModelChatHistoryItem, SafetySettings, PluginSendMessageOptions, PluginCountTokensOptions, PluginChatHistoryItem, PluginCountChatTokensOptions, GeminiXResponseChunk, GeminiXImage};
export {SafetySettingLevel, SafetySettingHarmCategory};

/**
 * Event emitted on the `window` object when a streaming response chunk is received from the model.
 */
export const GeminiXResponseChunkEvent = 'GeminiXResponseChunk';


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


