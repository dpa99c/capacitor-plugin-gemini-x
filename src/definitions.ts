export interface GeminiXPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
