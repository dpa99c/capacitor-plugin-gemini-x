import { WebPlugin } from '@capacitor/core';
import {GoogleGenerativeAI, GenerativeModel, SafetySetting, HarmCategory, HarmBlockThreshold} from '@google/generative-ai'

import type { GeminiXPlugin  } from './definitions';
import {SafetySettingLevel, SafetySettingHarmCategory } from './definitions';
import { ModelParams } from './definitions';


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
        safetySettings.push({
          harmCategory: harmCategory as any,
          level: options.params.safetySettings[harmCategory as any] as any
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

  /**************************************************************************
   * Internal Methods
   **************************************************************************/
  private async mapHarmCategory(harmCategory:SafetySettingHarmCategory): HarmCategory{
    switch (harmCategory) {
      case SafetySettingHarmCategory.HARASSMENT:
        return HarmCategory.HARASSMENT;
      case SafetySettingHarmCategory.HATE_SPEECH:
        return HarmCategory.HATE_SPEECH;
      case SafetySettingHarmCategory.SEXUALLY_EXPLICIT:
        return HarmCategory.SEXUALLY_EXPLICIT;
      case SafetySettingHarmCategory.DANGEROUS_CONTENT:
        return HarmCategory.DANGEROUS_CONTENT;
      case SafetySettingHarmCategory.UNSPECIFIED:
        return HarmCategory.UNSPECIFIED;
      default:
        return HarmCategory.UNSPECIFIED;
    }
  }

}
