import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Trophy, 
  Code2, 
  Gamepad2, 
  ArrowRight,
  Clock,
  Target,
  Lightbulb
} from "lucide-react";

const About = () => {
  const stats = [
    { icon: Clock, value: "10+", label: "Years Experience", color: "text-primary" },
    { icon: Gamepad2, value: "5+", label: "Games Delivered", color: "text-accent" },
    { icon: Code2, value: "10+", label: "Plugins Created", color: "text-gaming-purple" },
    { icon: Users, value: "5+", label: "Happy Clients", color: "text-gaming-orange" }
  ];

  const values = [
    {
      icon: Target,
      title: "Precision",
      description: "Every line of code is crafted with meticulous attention to detail and performance."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We stay at the forefront of gaming technology to deliver cutting-edge solutions."
    },
    {
      icon: Trophy,
      title: "Excellence",
      description: "Our commitment to quality ensures your project exceeds expectations."
    }
  ];

  return (
    <section id="about" className="section-padding">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">About Us</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-space-grotesk font-bold mb-6">
              <span className="text-gradient">Expert Unreal Engine</span>
              <br />
              Development Team
            </h2>
            
            <div className="space-y-4 text-lg text-muted-foreground mb-8">
              <p>
                We are a specialized team of game developers and Unreal Engine experts passionate about creating exceptional gaming experiences. Our expertise spans the entire development pipeline, from initial concept to final deployment.
              </p>
              <p>
                With years of experience in the gaming industry, we've mastered the art of seamlessly integrating third-party services into Unreal Engine projects, creating custom plugins, and optimizing performance across all platforms.
              </p>
              <p>
                Our mission is to empower game developers and studios with the tools and integrations they need to bring their creative visions to life efficiently and effectively.
              </p>
            </div>

            <Button variant="hero" size="lg" className="group">
              Work With Us
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Right Content - Stats Grid */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="gaming-card text-center group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-card flex items-center justify-center mx-auto mb-4 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Values */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Our Core Values</h3>
              {values.map((value, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-card/30 backdrop-blur border border-border/50 hover:border-primary/30 transition-all duration-300">
                  <div className="w-8 h-8 rounded-lg bg-gradient-card flex items-center justify-center flex-shrink-0 text-primary">
                    <value.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{value.title}</h4>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;