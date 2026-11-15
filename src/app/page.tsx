import { Bklit } from "@/components/home/bklit";
import { HomePage } from "@/components/home/home-page";
import { Nav } from "@/components/home/nav";
import { OutlineDefs } from "@/components/home/type";
import { Writing } from "@/components/home/writing";
import { Footer } from "@/components/site/footer";

export default function Home() {
  return (
    <>
      <OutlineDefs />
      <Nav />
      <HomePage bklit={<Bklit />} writing={<Writing />} />
      <Footer />
    </>
  );
}
