import type { Metadata } from "next";
import { Nav } from "@/components/home/nav";
import { Footer } from "@/components/site/footer";
import { WritingList } from "@/components/site/writing-list";
import { getPosts } from "@/lib/writing";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays on design engineering, interfaces, and motion.",
};

export default async function WritingPage() {
  const posts = await getPosts();

  return (
    <>
      <Nav />
      <main className="mx-auto grid w-full max-w-7xl grid-cols-12 gap-x-6 px-6 pt-36 pb-32 md:px-10">
        <div className="col-span-12 mb-10 md:col-span-3">
          <span className="text-ink-3 text-sm">Writing</span>
        </div>
        <div className="col-span-12 md:col-span-9">
          <h1 className="mb-16 max-w-[16ch] text-5xl font-medium tracking-[-0.035em] md:text-6xl">
            Notes on building interfaces.
          </h1>
          <WritingList posts={posts} />
        </div>
      </main>
      <Footer />
    </>
  );
}
