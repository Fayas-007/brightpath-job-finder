import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";

const LandingPage = () => {
  return (
    <div className="page-with-footer bg-white text-slate-950">
      <Header />
      <main className="page-footer-main">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
