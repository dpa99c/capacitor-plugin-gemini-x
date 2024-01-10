import { registerPlugin } from '@capacitor/core';

import type { GeminiXPluginPlugin } from './definitions';

const GeminiXPlugin = registerPlugin<GeminiXPluginPlugin>('GeminiXPlugin', {
  web: () => import('./web').then(m => new m.GeminiXPluginWeb()),
});

export * from './definitions';
export { GeminiXPlugin };
