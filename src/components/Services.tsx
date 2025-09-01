import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  Puzzle, 
  Code, 
  Zap, 
  Shield, 
  Rocket,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Gamepad2,
      title: "Game Development",
      description: "Full-scale game development from concept to release using Unreal Engine's powerful capabilities.",
      features: ["Complete game design", "3D environments", "Character systems", "Gameplay mechanics"],
      color: "text-primary"
    },
    {
      icon: Puzzle,
      title: "Plugin Development",
      description: "Custom Unreal Engine plugins tailored to your specific needs and workflows.",
      features: ["Custom tools", "Editor extensions", "Runtime plugins", "Blueprint integration"],
      color: "text-accent"
    },
    {
      icon: Code,
      title: "Third-Party Integration",
      description: "Seamlessly integrate external services and APIs into your Unreal Engine projects.",
      features: ["API connections", "Cloud services", "Analytics platforms", "Payment systems"],
      color: "text-gaming-purple"
    },
    {
      icon: Zap,
      title: "Performance Optimization",
      description: "Optimize your games for peak performance across all target platforms.",
      features: ["Code optimization", "Memory management", "Rendering efficiency", "Platform-specific tuning"],
      color: "text-gaming-orange"
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Comprehensive testing and quality assurance to ensure your game meets the highest standards.",
      features: ["Automated testing", "Performance profiling", "Bug tracking", "Platform compliance"],
      color: "text-gaming-green"
    },
    {
      icon: Rocket,
      title: "Deployment & Support",
      description: "End-to-end deployment services and ongoing support for your gaming projects.",
      features: ["Multi-platform deployment", "Live operations", "Maintenance support", "Updates & patches"],
      color: "text-primary"
    }
  ];

  return (
    <section id="services" className="section-padding">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Our Services</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-space-grotesk font-bold mb-4">
            <span className="text-gradient">Comprehensive</span> Game Development Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From initial concept to final deployment, we provide end-to-end game development services powered by Unreal Engine expertise.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="gaming-card group">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-card flex items-center justify-center mb-4 ${service.color} group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="gaming" className="w-full group">
                  Learn More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-card border border-primary/20 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h3>
            <p className="text-muted-foreground mb-6">
              Let's discuss how we can bring your gaming vision to life with our Unreal Engine expertise.
            </p>
            <Button variant="hero" size="lg" className="group">
              Get a Free Consultation
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;