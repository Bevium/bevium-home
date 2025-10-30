type Meta = {
  title?: string;
  description?: string;
  date?: string;
  updated?: string;
  author?: string;
  tags?: string[];
  slug?: string;
  ogImage?: string;
  featured?: boolean;
};

const eager = import.meta.glob('./content/posts/**/*.{md,mdx}', { eager: true }) as Record<string, any>;
const lazy  = import.meta.glob('./content/posts/**/*.{md,mdx}');

export type PostEntry = {
  slug: string;
  path: string;
  meta: Meta;
  import: () => Promise<any>;
};

function slugFromPath(p: string) {
  const f = p.split('/').pop() || '';
  return f.replace(/\.(md|mdx)$/, '');
}

export const posts: PostEntry[] = Object.entries(eager).map(([path, mod]) => {
  const meta: Meta = mod.meta || {};
  const slug = meta.slug || slugFromPath(path);
  return {
    slug,
    path,
    meta: { ...meta, slug },
    import: lazy[path] as any,
  };
}).sort((a, b) => {
  const ad = a.meta.date ? new Date(a.meta.date).getTime() : 0;
  const bd = b.meta.date ? new Date(b.meta.date).getTime() : 0;
  return bd - ad;
});

// Fast lookup by slug
export const postBySlug = new Map(posts.map(p => [p.slug, p]));
