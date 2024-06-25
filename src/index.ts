import { registerPlugin } from '@capacitor/core';

import type { GeminiXPlugin } from './definitions';

const GeminiX = registerPlugin<GeminiXPlugin>('GeminiX', {
  web: () => import('./web').then(m => new m.GeminiXWeb()),
});

export * from './definitions';
export { GeminiX };