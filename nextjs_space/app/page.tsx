
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import MainApp from "@/components/main-app";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen vintage-background">
        <HeroSection />
        <MainApp />
      </main>
    </>
  );
}
