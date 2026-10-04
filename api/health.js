import { health } from '../server/storyApi.js';

export function GET() {
  const result = health();
  return Response.json(result.body, { status: result.status });
}
