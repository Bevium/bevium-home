import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const ToolsPageNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const base = import.meta.env.BASE_URL;
  const logoSrc = `${base}images/logo.svg`; 

  const closeMenu = () => setIsMenuOpen(false);

  const goHome = () => {
    navigate("/");
    closeMenu();
    if (location.pathname === "/") {
      try { document.getElementById("home")?.scrollIntoView({ behavior: "smooth" }); } catch { }
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo (click → home) */}
          <button
            onClick={goHome}
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md"
            aria-label="Go to homepage"
          >
            <img
              src={logoSrc}
              alt="Bevium Studios"
              className="h-8 w-auto md:h-9"
              draggable={false}
            />
          </button>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/tools" className="text-foreground hover:text-primary transition-colors">
              All Tools
            </Link>
            <Button variant="hero" onClick={goHome}>
              Back to Home
            </Button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(v => !v)} aria-label="Toggle menu">
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile sheet */}
        {isMenuOpen && (
          <div className="md:hidden bg-card/95 backdrop-blur-md border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={goHome}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
              >
                Home
              </button>
              <Link
                to="/tools"
                onClick={closeMenu}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
              >
                All Tools
              </Link>
              <div className="px-3 py-2">
                <Button variant="hero" className="w-full" onClick={goHome}>
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ToolsPageNavBar;
