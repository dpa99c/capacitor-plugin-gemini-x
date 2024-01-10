export interface GeminiXPluginPlugin {
  initModel(options: { params: ModelParams }): Promise<void>;

  sendMessage(options: { text: string }): Promise<{ result: string }>;
  countTokens(options: { text: string }): Promise<{ result: number }>;
}

export interface ModelParams {
  modelName: string;
  apiKey: string;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  safetySettings?: SafetySettings;
}

export interface SafetySettings {
  [SafetySettingHarmCategory.DEROGATORY]?: SafetySettingLevel;
  [SafetySettingHarmCategory.TOXICITY]?: SafetySettingLevel;
  [SafetySettingHarmCategory.VIOLENCE]?: SafetySettingLevel;
  [SafetySettingHarmCategory.SEXUAL]?: SafetySettingLevel;
  [SafetySettingHarmCategory.MEDICAL]?: SafetySettingLevel;
  [SafetySettingHarmCategory.DANGEROUS]?: SafetySettingLevel;
  [SafetySettingHarmCategory.HARASSMENT]?: SafetySettingLevel;
  [SafetySettingHarmCategory.HATE_SPEECH]?: SafetySettingLevel;
  [SafetySettingHarmCategory.SEXUALLY_EXPLICIT]?: SafetySettingLevel;
  [SafetySettingHarmCategory.DANGEROUS_CONTENT]?: SafetySettingLevel;
  [SafetySettingHarmCategory.UNSPECIFIED]?: SafetySettingLevel;
}

export enum SafetySettingLevel{
  NONE = "NONE",
  ONLY_HIGH = "ONLY_HIGH",
  MEDIUM_AND_ABOVE = "MEDIUM_AND_ABOVE",
  LOW_AND_ABOVE = "LOW_AND_ABOVE",
  UNSPECIFIED = "UNSPECIFIED"
}

export enum SafetySettingHarmCategory{
  DEROGATORY = "DEROGATORY",
  TOXICITY = "TOXICITY",
  VIOLENCE = "VIOLENCE",
  SEXUAL = "SEXUAL",
  MEDICAL = "MEDICAL",
  DANGEROUS = "DANGEROUS",
  HARASSMENT = "HARASSMENT",
  HATE_SPEECH = "HATE_SPEECH",
  SEXUALLY_EXPLICIT = "SEXUALLY_EXPLICIT",
  DANGEROUS_CONTENT = "DANGEROUS_CONTENT",
  UNSPECIFIED = "UNSPECIFIED"
}