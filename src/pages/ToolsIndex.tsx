import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, FileSearch, ArrowRight } from "lucide-react";

export default function ToolsIndex() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Wrench className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Tools</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold mb-4">
            <span className="text-gradient">Engineering</span> Utilities
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Small focused tools for Unreal Engine workflows.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="gaming-card group relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-intense">
            <Link
              to="/tools/unreal-log-inspector"
              aria-label="Open Unreal Engine Log Inspector"
              className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="relative z-0 pointer-events-none">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-card flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                  <FileSearch className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl mb-2">Unreal Engine Log Inspector</CardTitle>
                <CardDescription className="text-base">
                  Upload or paste UE logs, auto-extract categories/verbosity, filter, search, and slice by time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="gaming" className="w-full group pointer-events-auto relative z-20" asChild>
                  <Link to="/tools/unreal-log-inspector">
                    Open Tool
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
