import { WebPlugin } from '@capacitor/core';
import type { GenerativeModel, SafetySetting} from '@google/generative-ai';
import {GoogleGenerativeAI, HarmCategory, HarmBlockThreshold} from '@google/generative-ai'

import type { GeminiXPlugin  , ModelParams } from './definitions';
import {SafetySettingLevel, SafetySettingHarmCategory  } from './definitions';


export class GeminiXWeb extends WebPlugin implements GeminiXPlugin {
  private generativeAI: GoogleGenerativeAI | undefined;
  private model:GenerativeModel | undefined;

  /**************************************************************************
   * Plugin Methods
   **************************************************************************/

  async initModel(options: { params:ModelParams }): Promise<void> {
    this.generativeAI = new GoogleGenerativeAI(options.params.apiKey);

    const safetySettings:SafetySetting[] = [];
    if(options.params.safetySettings){
      for(const harmCategory in options.params.safetySettings){
        const modelHarmCategory = this.mapHarmCategory(harmCategory as any),
              harmBlockThreshold = (options.params.safetySettings as any)[harmCategory] as SafetySettingLevel,
              modelSafetySettingLevel = this.mapSafetySettingLevel(harmBlockThreshold);
        safetySettings.push({
          category: modelHarmCategory,
          threshold: modelSafetySettingLevel
        })
      }
    }

    this.model = this.generativeAI.getGenerativeModel({
      model: options.params.modelName,
      safetySettings: safetySettings,
      generationConfig: {
        temperature: options.params.temperature,
        topK: options.params.topK,
        topP: options.params.topP,
        maxOutputTokens: options.params.maxOutputTokens,
        stopSequences: options.params.stopSequences,
      }
    });
  }

  async sendMessage(userInputText:string, options?: { streamResponse?:boolean, imageUris?:string[] }): Promise<{ responseText:string, isFinal:boolean }> {
    if(!this.model){
      throw new Error("Model not initialized");
    }

    let streamResponse = false;
    let imageUris:string[] = [];
    if(options){
      streamResponse = options.streamResponse || false;
      imageUris = options.imageUris || [];
    }

    const result = await this.model.generateContent(userInputText);
    const response = await result.response;
    const responseText = response.text();

    return {
      responseText: responseText,
      isFinal: response.isFinal
    };
  }

  /**************************************************************************
   * Internal Methods
   **************************************************************************/
  private mapHarmCategory(harmCategory:SafetySettingHarmCategory): HarmCategory{
    switch (harmCategory) {
      case SafetySettingHarmCategory.HARASSMENT:
        return HarmCategory.HARM_CATEGORY_HARASSMENT;
      case SafetySettingHarmCategory.HATE_SPEECH:
        return HarmCategory.HARM_CATEGORY_HATE_SPEECH;
      case SafetySettingHarmCategory.SEXUALLY_EXPLICIT:
        return HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT;
      case SafetySettingHarmCategory.DANGEROUS_CONTENT:
        return HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT;
      case SafetySettingHarmCategory.UNSPECIFIED:
        return HarmCategory.HARM_CATEGORY_UNSPECIFIED;
      default:
        return HarmCategory.HARM_CATEGORY_UNSPECIFIED;
    }
  }

  private mapSafetySettingLevel(safetySettingLevel:SafetySettingLevel): HarmBlockThreshold{
    switch (safetySettingLevel) {
      case SafetySettingLevel.NONE:
        return HarmBlockThreshold.BLOCK_NONE;
      case SafetySettingLevel.ONLY_HIGH:
        return HarmBlockThreshold.BLOCK_ONLY_HIGH;
      case SafetySettingLevel.MEDIUM_AND_ABOVE:
        return HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE;
      case SafetySettingLevel.LOW_AND_ABOVE:
        return HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE;
      case SafetySettingLevel.UNSPECIFIED:
        return HarmBlockThreshold.HARM_BLOCK_THRESHOLD_UNSPECIFIED;
      default:
        return HarmBlockThreshold.HARM_BLOCK_THRESHOLD_UNSPECIFIED;
    }
  }

  private async function fileToGenerativePart(file:File) {
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
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }
}
