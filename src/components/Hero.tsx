import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2, Cpu, Zap } from "lucide-react";
import heroImage from "@/assets/white.png";

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="min-h-screen flex items-center relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-hero" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 animate-float">
        <div className="w-16 h-16 bg-primary/20 rounded-full blur-xl animate-glow" />
      </div>
      <div className="absolute bottom-32 left-16 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-24 h-24 bg-accent/20 rounded-full blur-xl animate-glow" />
      </div>
      
      <div className="container-custom relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur border border-primary/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Your Technical Partner</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="hero-text text-5xl md:text-7xl mb-6 animate-fade-in">
            <span className="text-gradient">Bevium</span>
            <br />
            <span className="text-foreground">Elevate your games</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-delay">
            We specialize in creating cutting-edge games and seamlessly integrating third-party services into Unreal Engine projects. From plugins to complete solutions.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10 animate-fade-in-delay">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5+</div>
              <div className="text-sm text-muted-foreground">Games Developed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">10+</div>
              <div className="text-sm text-muted-foreground">Plugins Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gaming-purple">10+</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => scrollToSection('services')}
              className="group"
            >
              Explore Our Services
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="gaming" 
              size="lg"
              onClick={() => scrollToSection('portfolio')}
            >
              <Gamepad2 className="w-4 h-4" />
              View Portfolio
            </Button>
          </div>
          
          {/* Tech Icons */}
          <div className="flex justify-center items-center gap-8 mt-12 opacity-60 animate-fade-in-delay">
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
        </div>
      </div>
    </section>
  );
};

export default Hero;