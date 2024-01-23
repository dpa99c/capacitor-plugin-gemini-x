export interface GeminiXPluginPlugin {
  initModel(options: { params:ModelParams }): Promise<void>;
  sendMessage(userInputText:string, options?: { streamResponse?:boolean, imageUris?:string[] }): Promise<{ responseText:string, isFinal:boolean }>;
  countTokens(userInputText:string, options?: { imageUris?:string[] }): Promise<{ count:number }>;
  initChat(chatHistory?:ChatHistoryItem[]): Promise<void>;
  sendChatMessage(userInputText:string, options?: { streamResponse?:boolean, imageUris?:string[] }): Promise<{ responseText:string, isFinal:boolean }>;
  countChatTokens(options?: { text?:string, imageUris?:string[] }): Promise<{ count:number }>;
  getChatHistory(): Promise<{ chatHistory:ModelChatHistoryItem[] }>;
}

export interface ModelParams {
  modelName:string;
  apiKey:string;
  temperature?:number;
  topK?:number;
  topP?:number;
  maxOutputTokens?:number;
  stopSequences?:string[];
  safetySettings?:SafetySettings;
}

export interface SafetySettings {
  [SafetySettingHarmCategory.HARASSMENT]?:SafetySettingLevel;
  [SafetySettingHarmCategory.HATE_SPEECH]?:SafetySettingLevel;
  [SafetySettingHarmCategory.SEXUALLY_EXPLICIT]?:SafetySettingLevel;
  [SafetySettingHarmCategory.DANGEROUS_CONTENT]?:SafetySettingLevel;
  [SafetySettingHarmCategory.UNSPECIFIED]?:SafetySettingLevel;
}

export enum SafetySettingLevel{
  NONE = "NONE",
  ONLY_HIGH = "ONLY_HIGH",
  MEDIUM_AND_ABOVE = "MEDIUM_AND_ABOVE",
  LOW_AND_ABOVE = "LOW_AND_ABOVE",
  UNSPECIFIED = "UNSPECIFIED"
}

export enum SafetySettingHarmCategory{
  HARASSMENT = "HARASSMENT",
  HATE_SPEECH = "HATE_SPEECH",
  SEXUALLY_EXPLICIT = "SEXUALLY_EXPLICIT",
  DANGEROUS_CONTENT = "DANGEROUS_CONTENT",
  UNSPECIFIED = "UNSPECIFIED"
}

export interface ChatHistoryItem {
  isUser:boolean;
  text?:string;
  imageUris?:string[];
}

export interface ModelChatHistoryPart{
  type:string;
  content:string;
}

export interface ModelChatHistoryItem {
  isUser:boolean;
  parts:ModelChatHistoryPart[];
}
