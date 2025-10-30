import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { posts, postBySlug } from "../blog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Share2,
  Tag as TagIcon,
  Link as LinkIcon,
  X,
  ZoomOut,
} from "lucide-react";
import BlogNavbar from "@/components/BlogNavbar";
import Footer from "@/components/Footer";

function formatDate(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const loc = useLocation();

  if (!slug) return <div className="container-custom py-16">Post not found.</div>;

  const entry = postBySlug.get(slug);
  if (!entry) return <div className="container-custom py-16">Post not found.</div>;

  const MDX = useMemo(() => React.lazy(entry.import as any), [entry.import]);
  const meta = entry.meta || {};

  const base = import.meta.env.BASE_URL;
  const cover = meta.ogImage ? `${base}${String(meta.ogImage).replace(/^\/+/, "")}` : undefined;

  const url =
    typeof window !== "undefined"
      ? window.location.origin + loc.pathname + loc.search + loc.hash
      : loc.pathname;

  const idx = posts.findIndex((p) => p.slug === entry.slug);
  const prev = idx > 0 ? posts[idx - 1] : null;
  const next = idx < posts.length - 1 ? posts[idx + 1] : null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };

  const shareToX = () => {
    const text = `${meta.title ?? entry.slug}`;
    const t = encodeURIComponent(text);
    const u = encodeURIComponent(url);
    window.open(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, "_blank");
  };

  const shareToLinkedIn = () => {
    const u = encodeURIComponent(url);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${u}`, "_blank");
  };

  // ---- Lightweight lightbox (no deps) ----
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [hoveringImg, setHoveringImg] = useState(false);
  const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  useEffect(() => {
    if (!zoomSrc) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomSrc(null);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [zoomSrc]);

  const onContentClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    let img: HTMLImageElement | null = null;
    if (target.tagName === "IMG") img = target as HTMLImageElement;
    else img = target.closest?.("img");

    if (!img) return;
    if (img.dataset.noZoom !== undefined) return;

    const src = img.currentSrc || img.src;
    if (src) setZoomSrc(src);
  };

  return (
    <>
      <BlogNavbar />
      <React.Suspense fallback={<div className="container-custom py-16">Loading…</div>}>
        <article className="section-padding">
          <div className="container-custom">
            {/* Breadcrumb / back */}
            <div className="mb-6">
              <Button asChild variant="gaming" className="gap-2">
                <Link to="/blog">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Blog
                </Link>
              </Button>
            </div>

            {/* Hero */}
            <Card className="gaming-card mb-8">
              {cover && (
                <div className="relative aspect-[16/7] w-full overflow-hidden">
                  <img
                    src={cover}
                    alt={meta.title ?? entry.slug}
                    className="w-full h-full object-cover"
                    data-no-zoom
                  />
                </div>
              )}

              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(meta.date)}</span>
                  </div>

                  {!!(meta.tags && meta.tags.length) && (
                    <div className="inline-flex items-center gap-2 flex-wrap">
                      <TagIcon className="w-4 h-4" />
                      {meta.tags.map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <CardTitle className="text-3xl md:text-4xl font-space-grotesk">
                  {meta.title ?? entry.slug}
                </CardTitle>

                {meta.description && (
                  <CardDescription className="text-base">{meta.description}</CardDescription>
                )}

                {/* Share actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="gaming" className="gap-2" onClick={copyLink}>
                    <LinkIcon className="w-4 h-4" />
                    Copy Link
                  </Button>
                  <Button variant="gaming" className="gap-2" onClick={shareToX}>
                    <Share2 className="w-4 h-4" />
                    Share on X
                  </Button>
                  <Button variant="gaming" className="gap-2" onClick={shareToLinkedIn}>
                    <Share2 className="w-4 h-4" />
                    Share on LinkedIn
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div
                  onClick={onContentClick}
                  className="prose max-w-none prose-invert prose-headings:font-space-grotesk prose-h1:text-foreground prose-h2:text-foreground prose-p:text-muted-foreground prose-li:marker:text-muted-foreground"
                >
                  <MDX />
                </div>
              </CardContent>
            </Card>

            {/* Prev / Next */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prev ? (
                <Card className="gaming-card">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground mb-1">Previous</div>
                      <Link to={`/blog/${prev.slug}`} className="font-medium hover:underline line-clamp-2">
                        {prev.meta.title ?? prev.slug}
                      </Link>
                    </div>
                    <Button asChild variant="gaming" className="gap-2">
                      <Link to={`/blog/${prev.slug}`}>
                        <ArrowLeft className="w-4 h-4" />
                        Read
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div />
              )}

              {next ? (
                <Card className="gaming-card">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground mb-1">Next</div>
                      <Link to={`/blog/${next.slug}`} className="font-medium hover:underline line-clamp-2">
                        {next.meta.title ?? next.slug}
                      </Link>
                    </div>
                    <Button asChild variant="gaming" className="gap-2">
                      <Link to={`/blog/${next.slug}`}>
                        Read
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div />
              )}
            </div>

            {/* Lightbox overlay */}
            {zoomSrc && (
              <div
                className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setZoomSrc(null)}
                role="dialog"
                aria-modal="true"
              >
                {/* Close button */}
                <button
                  aria-label="Close image"
                  className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 text-white p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                  onClick={(e) => { e.stopPropagation(); setZoomSrc(null); }}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Zoom-out hint (hidden while hovering the image on non-touch) */}
                {(!hoveringImg || isTouch) && (
                  <div className="pointer-events-none absolute bottom-4 inset-x-0 flex justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 text-white px-3 py-1 text-xs shadow">
                      <ZoomOut className="w-4 h-4" />
                      <span>Click to close</span>
                    </div>
                  </div>
                )}

                <img
                  src={zoomSrc}
                  alt=""
                  className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={() => setHoveringImg(true)}
                  onMouseLeave={() => setHoveringImg(false)}
                />
              </div>
            )}
          </div>
        </article>
      </React.Suspense>
      <Footer />
    </>
  );
}
