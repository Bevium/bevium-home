import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { posts } from "../blog";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// If you have shadcn Input; otherwise replace with a simple <input>
import { Input } from "@/components/ui/input";

import {
  BookOpen,
  Calendar,
  Tag as TagIcon,
  Search,
  ArrowRight,
} from "lucide-react";
import BlogNavbar from "@/components/BlogNavbar";

function formatDate(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

export default function BlogIndex() {
  // Build tags list
  const allTags = useMemo(() => {
    const s = new Set<string>();
    posts.forEach(p => (p.meta.tags || []).forEach(t => s.add(t)));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, []);

  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(p => {
      const matchesQ =
        !q ||
        (p.meta.title || "").toLowerCase().includes(q) ||
        (p.meta.description || "").toLowerCase().includes(q) ||
        (p.meta.tags || []).some(t => t.toLowerCase().includes(q));
      const matchesTag = !activeTag || (p.meta.tags || []).includes(activeTag);
      return matchesQ && matchesTag;
    });
  }, [query, activeTag]);

  return (
    <>
    <BlogNavbar />
    <section className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur border border-primary/20 rounded-full px-4 py-2 mb-6">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Our Articles</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold mb-4">
            <span className="text-gradient">Insights</span> & Engineering Notes
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tutorials, deep dives, and dev logs from the team.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-8">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles (title, description, tags)…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={activeTag ? "outline" : "secondary"}
              className={`cursor-pointer ${!activeTag ? "border-primary/40" : ""}`}
              onClick={() => setActiveTag(null)}
            >
              All
            </Badge>
            {allTags.map((t) => (
              <Badge
                key={t}
                variant={activeTag === t ? "secondary" : "outline"}
                className={`cursor-pointer ${activeTag === t ? "border-primary/40" : ""}`}
                onClick={() => setActiveTag(activeTag === t ? null : t)}
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {t}
              </Badge>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p) => {
            const cover = p.meta.ogImage; // place relative to /public if you set this
            return (
              <Card key={p.slug} className="gaming-card group h-full flex flex-col overflow-hidden">
                {/* Cover */}
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  {cover ? (
                    <img
                      src={cover}
                      alt={p.meta.title || p.slug}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-card" />
                  )}
                </div>

                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(p.meta.date)}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {p.meta.title ?? p.slug}
                  </CardTitle>
                  {p.meta.description && (
                    <CardDescription className="text-sm">
                      {p.meta.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex-grow flex flex-col">
                  {/* Tags */}
                  {!!(p.meta.tags && p.meta.tags.length) && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.meta.tags!.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-2">
                    <Button asChild variant="gaming" className="group w-full">
                      <Link to={`/blog/${p.slug}`}>
                        Read Article
                        <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-20">
            No articles match your search/filter.
          </div>
        )}
      </div>
    </section>
    </>
  );
}
