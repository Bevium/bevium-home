import { Button } from "@/components/ui/button";
import {
  Twitter,
  Linkedin,
  Instagram,
  ArrowUp,
  Gamepad2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const base = import.meta.env.BASE_URL;
  const logoSrc = `${base}images/logo.svg`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goHomeThen = (cb?: () => void) => {
    if (location.pathname !== "/") {
      navigate("/");
      // let the home mount, then scroll
      setTimeout(() => cb?.(), 60);
    } else {
      cb?.();
    }
  };

  const scrollToSection = (sectionId: string) => {
    goHomeThen(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-card/30 backdrop-blur">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 border border-primary rounded-full" />
        <div className="absolute bottom-20 right-20 w-16 h-16 border border-accent rounded-full" />
        <div className="absolute top-32 right-32 w-12 h-12 border border-gaming-purple rounded-full" />
      </div>

      <div className="container-custom relative">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 py-16">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {/* Logo button → home */}
              <button
                onClick={() => goHomeThen(() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" }))}
                aria-label="Go to homepage"
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md"
              >
                <img
                  src={logoSrc}
                  alt="Bevium Studios"
                  className="h-9 w-auto md:h-10 select-none"
                  draggable={false}
                />
              </button>


            </div>

            <p className="text-muted-foreground mb-6 max-w-md">
              Specializing in Unreal Engine game development, custom plugins, and seamless third-party integrations.
              Bringing your gaming visions to life with cutting-edge technology.
            </p>

            <div className="flex gap-4">
              <Button asChild variant="ghost" size="icon" className="hover:text-primary gap-2">
                <a href="https://x.com/bevium" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                  <Twitter className="w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="hover:text-primary gap-2">
                <a href="https://www.linkedin.com/company/bevium/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="icon" className="hover:text-primary gap-2">
                <a href="https://www.instagram.com/bevium_it/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("home")}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("services")}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("portfolio")}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Portfolio
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Game Development</li>
              <li className="text-muted-foreground">Plugin Creation</li>
              <li className="text-muted-foreground">Third-Party Integration</li>
              <li className="text-muted-foreground">Performance Optimization</li>
              <li className="text-muted-foreground">Quality Assurance</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Bevium Studios. All rights reserved.
            </div>

            <div className="flex items-center gap-4">
              <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </button>
              <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="text-muted-foreground hover:text-primary"
              >
                <ArrowUp className="w-4 h-4 mr-1" />
                Back to Top
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
