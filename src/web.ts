import { WebPlugin } from '@capacitor/core';
import type { GenerativeContentBlob } from '@google/generative-ai';

import type { GeminiXPlugin , PluginCountTokensOptions, PluginSendMessageOptions , PluginCountChatTokensOptions, PluginChatHistoryItem } from './definitions';
import type { CountTokensOptions, ModelParams, SendMessageOptions, ModelChatHistoryItem, ChatHistoryItem } from './lib/GeminiX';
import { GeminiX } from './lib/GeminiX';
import {  } from './definitions';



export class GeminiXWeb extends WebPlugin implements GeminiXPlugin {

  /**************************************************************************
   * Plugin Methods
   **************************************************************************/

  async initModel(args: {options: { params:ModelParams }}): Promise<void> {
    return await GeminiX.initModel(args.options.params);
  }

  async sendMessage(args: {inputText:string, options?: PluginSendMessageOptions}): Promise<string> {
    const pluginOptions:SendMessageOptions = {
      onResponseChunk: args.options?.onResponseChunk,
    };
    if (args.options?.imageUris) {
      pluginOptions.images = await Promise.all(args.options.imageUris.map(file => this.uriToGenerativeBlob(file)));
    }
    return await GeminiX.sendMessage(args.inputText, pluginOptions);
  }

  async countTokens(args: {inputText:string, options?: PluginCountTokensOptions}): Promise<number> {
    const pluginOptions:CountTokensOptions = {};
    if (args.options?.imageUris) {
      pluginOptions.images = await Promise.all(args.options.imageUris.map(file => this.uriToGenerativeBlob(file)));
    }
    return await GeminiX.countTokens(args.inputText, pluginOptions);
  }
  
  async initChat(args: {chatHistory?:PluginChatHistoryItem[]}): Promise<void>{
    const modelHistory:ChatHistoryItem[] = [];
    if(args.chatHistory){
      for(const item of args.chatHistory){
        const chatItem:ChatHistoryItem = {
          isUser: item.isUser,
          text: item.text,
        };
        if(item.imageUris){
          chatItem.images = [];
          for(const uri of item.imageUris){
            const blob = await this.uriToGenerativeBlob(uri);
            chatItem.images.push(blob);
          }
        }
        modelHistory.push(chatItem);
      }
    }
    return await GeminiX.initChat(modelHistory);
  }

  async sendChatMessage(args: {inputText:string, options?: PluginSendMessageOptions}): Promise<string> {
    const pluginOptions:SendMessageOptions = {
      onResponseChunk: args.options?.onResponseChunk,
    };
    if (args.options?.imageUris) {
      pluginOptions.images = await Promise.all(args.options.imageUris.map(file => this.uriToGenerativeBlob(file)));
    }
    return await GeminiX.sendChatMessage(args.inputText, pluginOptions);
  }
  
  async countChatTokens(args: {options?:PluginCountChatTokensOptions}): Promise<number> {
    const pluginOptions:CountTokensOptions = {};
    if (args.options?.imageUris) {
      pluginOptions.images = await Promise.all(args.options.imageUris.map(file => this.uriToGenerativeBlob(file)));
    }
    return await GeminiX.countChatTokens(pluginOptions);
  }

  async getChatHistory(): Promise<ModelChatHistoryItem[]> {
    return await GeminiX.getChatHistory();
  }
  

  /**************************************************************************
   * Internal Methods
   **************************************************************************/
  private uriToFile(uri:string): Promise<File> {
    return fetch(uri).then(response => response.blob()).then(blob => new File([blob], 'image.png'));
  }

  private async uriToGenerativeBlob(uri:string): Promise<GenerativeContentBlob> {
    const file = await this.uriToFile(uri),
      mimeType = file.type;
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
