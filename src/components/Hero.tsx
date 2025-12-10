import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2, Cpu, Zap } from "lucide-react";

const Hero = () => {
  const base = import.meta.env.BASE_URL;
  const logoSrc = `${base}images/logo.svg`;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="min-h-screen flex items-center relative overflow-hidden">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-hero" />

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 animate-float z-20">
        <div className="w-16 h-16 bg-primary/20 rounded-full blur-xl animate-glow" />
      </div>
      <div className="absolute bottom-32 left-16 animate-float z-20" style={{ animationDelay: "2s" }}>
        <div className="w-24 h-24 bg-accent/20 rounded-full blur-xl animate-glow" />
      </div>

      {/* Main Content */}
      <div className="container-custom relative z-20">
        <div className="max-w-4xl mx-auto text-center">


          {/* Heading with Logo + Tagline */}
          <div className="animate-fade-in">
            {/* Logo */}
            <img
              src={logoSrc}
              alt="Bevium Studios"
              className="mx-auto mb-3 h-14 w-auto md:h-16 select-none"
              draggable={false}
            />
            {/* Tagline */}
            <h1 className="hero-text text-4xl md:text-6xl">
              <span className="text-foreground">Your technical partner</span>
            </h1>
          </div>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-delay mt-6">
            We specialize in creating cutting-edge games and seamlessly integrating third-party services into Unreal Engine projects. From plugins to complete solutions.
          </p>

          {/* Tech Icons */}
          <div className="flex justify-center items-center gap-8 opacity-60 animate-fade-in-delay">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              <span className="text-sm">Unreal Engine</span>
            </div>
            <div className="w-1 h-1 bg-muted rounded-full" />
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-accent" />
              <span className="text-sm">Game Development</span>
            </div>
            <div className="w-1 h-1 bg-muted rounded-full" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-gaming-purple" />
              <span className="text-sm">Plugin Integration</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay mt-6">
            <Button variant="hero" size="lg" onClick={() => scrollToSection("services")} className="group">
              Explore Our Services
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="gaming" size="lg" onClick={() => scrollToSection("portfolio")}>
              <Gamepad2 className="w-4 h-4" />
              View Portfolio
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
