import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  MapPin,
  Send,
  Phone,
  Zap
} from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Get in touch for project inquiries",
      value: "info@bevium.com",
      action: "mailto:info@bevium.com"
    },
    /*
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our team",
      value: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Real-time support and consultation",
      value: "Available 9 AM - 6 PM EST",
      action: "#"
    },
    {
      icon: MapPin,
      title: "Location",
      description: "Our development hub",
      value: "San Francisco, CA",
      action: "#"
    }*/
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted");
  };

  return (
    <section id="contact" className="section-padding">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Contact Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-space-grotesk font-bold mb-4">
            <span className="text-gradient">Let's Build</span> Something Amazing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to start your next gaming project? Get in touch with our Unreal Engine experts today.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-2xl">Start Your Project</CardTitle>
                <CardDescription>
                  Tell us about your project and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium block mb-2">
                        Full Name
                      </label>
                      <Input 
                        id="name"
                        placeholder="John Doe"
                        className="bg-input/50 backdrop-blur border-border/50 focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium block mb-2">
                        Email Address
                      </label>
                      <Input 
                        id="email"
                        type="email"
                        placeholder="john@company.com"
                        className="bg-input/50 backdrop-blur border-border/50 focus:border-primary/50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="text-sm font-medium block mb-2">
                        Company (Optional)
                      </label>
                      <Input 
                        id="company"
                        placeholder="Your Company"
                        className="bg-input/50 backdrop-blur border-border/50 focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="budget" className="text-sm font-medium block mb-2">
                        Project Budget
                      </label>
                      <select className="w-full h-10 px-3 rounded-md bg-input/50 backdrop-blur border border-border/50 focus:border-primary/50 focus:outline-none text-sm">
                        <option value="">Select budget range</option>
                        <option value="5k-15k">$5k - $15k</option>
                        <option value="15k-50k">$15k - $50k</option>
                        <option value="50k-100k">$50k - $100k</option>
                        <option value="100k+">$100k+</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="service" className="text-sm font-medium block mb-2">
                      Service Type
                    </label>
                    <select className="w-full h-10 px-3 rounded-md bg-input/50 backdrop-blur border border-border/50 focus:border-primary/50 focus:outline-none text-sm">
                      <option value="">Select a service</option>
                      <option value="game-development">Game Development</option>
                      <option value="plugin-development">Plugin Development</option>
                      <option value="third-party-integration">Third-Party Integration</option>
                      <option value="consulting">Consulting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="text-sm font-medium block mb-2">
                      Project Description
                    </label>
                    <Textarea 
                      id="message"
                      placeholder="Tell us about your project, goals, and requirements..."
                      rows={6}
                      className="bg-input/50 backdrop-blur border-border/50 focus:border-primary/50 resize-none"
                    />
                  </div>
                  
                  <Button type="submit" variant="hero" size="lg" className="w-full group">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                    <Zap className="w-4 h-4 ml-2 transition-transform group-hover:scale-110" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Response */}
            <Card className="gaming-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quick Response</h3>
                    <p className="text-sm text-muted-foreground">Usually within 24 hours</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  We understand the fast-paced nature of game development. That's why we prioritize quick responses to all project inquiries.
                </p>
              </CardContent>
            </Card>

            {/* Contact Methods */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <Card key={index} className="gaming-card group cursor-pointer hover:scale-105 transition-transform duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-card flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                        <info.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{info.title}</h4>
                        <p className="text-xs text-muted-foreground mb-1">{info.description}</p>
                        <p className="text-sm font-medium text-primary">{info.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;