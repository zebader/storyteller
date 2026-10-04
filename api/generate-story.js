import { generateStory, webHandler } from '../server/storyApi.js';

export const POST = webHandler(generateStory);
