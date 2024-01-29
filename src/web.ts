import { WebPlugin } from '@capacitor/core';
import type { GenerativeContentBlob } from '@google/generative-ai';

import type {GeminiXPlugin, PluginCountTokensOptions, PluginSendMessageOptions, PluginCountChatTokensOptions, PluginChatHistoryItem, GeminiXResponseChunk, GeminiXResponseCount, GeminiXImage} from './definitions';
import { GeminiXResponseChunkEvent } from './definitions';
import type { CountTokensOptions, ModelParams, SendMessageOptions, ModelChatHistoryItem, ChatHistoryItem } from './lib/GeminiX';
import { GeminiX } from './lib/GeminiX';



export class GeminiXWeb extends WebPlugin implements GeminiXPlugin {

  /**************************************************************************
   * Plugin Methods
   **************************************************************************/

  async initModel(args: { params:ModelParams }): Promise<void> {
    return await GeminiX.initModel(args.params);
  }

  async sendMessage(args: {inputText:string, options?: PluginSendMessageOptions}): Promise<GeminiXResponseChunk> {
    const pluginOptions:SendMessageOptions = {};
    if(args.options?.streamResponse){
      pluginOptions.onResponseChunk = (response:string) => {
        this.emitResponseChunk(response, false);
      }
    }

    if (args.options?.images) {
      pluginOptions.images = await Promise.all(args.options.images.map(image => this.imageToGenerativeBlob(image)));
    }
    const result = await GeminiX.sendMessage(args.inputText, pluginOptions);
    return {response: result, isChat: false};
  }

  async countTokens(args: {inputText:string, options?: PluginCountTokensOptions}): Promise<GeminiXResponseCount> {
    const pluginOptions:CountTokensOptions = {};
    if (args.options?.images) {
      pluginOptions.images = await Promise.all(args.options.images.map(image => this.imageToGenerativeBlob(image)));
    }
    const result = await GeminiX.countTokens(args.inputText, pluginOptions);
    return {count: result, isChat: false};
  }

  async initChat(args: {chatHistory?:PluginChatHistoryItem[]}): Promise<void>{
    const modelHistory:ChatHistoryItem[] = [];
    if(args.chatHistory){
      for(const item of args.chatHistory){
        const chatItem:ChatHistoryItem = {
          isUser: item.isUser,
          text: item.text,
        };
        if(item.images){
          chatItem.images = [];
          for(const image of item.images){
            const blob = await this.imageToGenerativeBlob(image);
            chatItem.images.push(blob);
          }
        }
        modelHistory.push(chatItem);
      }
    }
    return await GeminiX.initChat(modelHistory);
  }

  async sendChatMessage(args: {inputText:string, options?: PluginSendMessageOptions}): Promise<GeminiXResponseChunk> {
    const pluginOptions:SendMessageOptions = {};
    if(args.options?.streamResponse){
      pluginOptions.onResponseChunk = (response:string) => {
        this.emitResponseChunk(response, true);
      }
    }
    if (args.options?.images) {
      pluginOptions.images = await Promise.all(args.options.images.map(image => this.imageToGenerativeBlob(image)));
    }
    const result = await GeminiX.sendChatMessage(args.inputText, pluginOptions);
    return {response: result, isChat: true};
  }

  async countChatTokens(args: {options?:PluginCountChatTokensOptions}): Promise<GeminiXResponseCount> {
    const pluginOptions:CountTokensOptions = {};
    if (args.options?.images) {
      pluginOptions.images = await Promise.all(args.options.images.map(image => this.imageToGenerativeBlob(image)));
    }
    const result = await GeminiX.countChatTokens(pluginOptions);
    return {count: result, isChat: true};
  }

  async getChatHistory(): Promise<ModelChatHistoryItem[]> {
    return await GeminiX.getChatHistory();
  }


  /**************************************************************************
   * Internal Methods
   **************************************************************************/
  private emitResponseChunk(response:string, isChat:boolean):void {
    const eventData:GeminiXResponseChunk = {response, isChat};
    window.dispatchEvent(new CustomEvent(GeminiXResponseChunkEvent, {detail: eventData}));
  }

  private uriToFile(uri:string): Promise<File> {
    return fetch(uri).then(response => response.blob()).then(blob => new File([blob], 'image.png'));
  }

  private async imageToGenerativeBlob(image:GeminiXImage): Promise<GenerativeContentBlob> {
    const file = await this.uriToFile(image.uri),
      mimeType = image.mimeType || file.type;
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result !== 'string') {
          throw new Error('Expected string result from FileReader');
        }
        resolve(reader.result.split(',')[1]);
      }
      reader.readAsDataURL(file);
    });
    return {
      data: await base64EncodedDataPromise as string,
      mimeType
    };
  }
}
