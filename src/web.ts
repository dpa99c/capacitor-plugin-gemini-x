import { WebPlugin } from '@capacitor/core';

import type { GeminiXPluginPlugin } from './definitions';

export class GeminiXPluginWeb extends WebPlugin implements GeminiXPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
