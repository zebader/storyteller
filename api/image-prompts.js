import { imagePrompts, webHandler } from '../server/storyApi.js';

export const POST = webHandler(imagePrompts);
