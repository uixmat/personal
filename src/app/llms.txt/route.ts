import { llmsTxt } from "@/lib/agent";
import { getPosts } from "@/lib/writing";

export async function GET() {
  return new Response(llmsTxt(await getPosts()), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
