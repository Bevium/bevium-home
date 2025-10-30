import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeRaw from 'rehype-raw'
import { visit } from 'unist-util-visit'

function rehypePrefixImages(base: string) {
  return () => (tree: any) => {
    visit(tree, 'element', (node: any) => {
      if (node.tagName === 'img' && node.properties?.src) {
        const src: string = node.properties.src.replace(/\\/g, '/'); // fix backslashes
        if (/^(https?:)?\/\//.test(src)) return;                      // leave absolute URLs
        const withoutLeading = src.replace(/^\/+/, '');
        node.properties.src = `${base}${withoutLeading}`;
      }
    });
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    mdx({
      include: ['**/*.mdx', '**/*.md'],
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: 'meta' }],
        remarkGfm,                            // tables, task-lists, strikethrough, autolinks
      ],
      rehypePlugins: [
         [rehypeRaw, { passThrough: ['mdxjsEsm', 'mdxJsxFlowElement', 'mdxJsxTextElement'] }],
        rehypeSlug,                           // ids on headings
        [rehypeAutolinkHeadings, {           // clickable heading anchors
          behavior: 'wrap'
        }],
        [rehypePrettyCode, {                  // code highlighting with Shiki
          theme: 'github-dark',               // pick any shiki theme you like
          keepBackground: false
        }],
        rehypePrefixImages('/')
      ],
    }),
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: '/',
}));

