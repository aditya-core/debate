import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

/**
 * The public site: marketing nav, page, full footer.
 * Auth pages deliberately sit outside this group — see app/(auth)/layout.tsx.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
