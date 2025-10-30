import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BlogNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo (click → home) */}
          <button
            onClick={() => navigate("/")}
            className="text-xl font-space-grotesk font-bold text-gradient"
          >
            Bevium Studios
          </button>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors">
              All Articles
            </Link>
            <Button variant="hero" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(v => !v)}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile sheet */}
        {isMenuOpen && (
          <div className="md:hidden bg-card/95 backdrop-blur-md border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
              >
                Home
              </Link>
              <Link
                to="/blog"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
              >
                All Articles
              </Link>
              <a
                href="/#contact"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
              >
                Contact
              </a>
              <div className="px-3 py-2">
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/");
                  }}
                >
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

export default BlogNavbar;
