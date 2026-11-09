import Nav from "@/components/Nav";
import Hero from "@/components/hero/Hero";
import WorldsTeaser from "@/components/WorldsTeaser";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <WorldsTeaser />
      </main>
    </>
  );
}
