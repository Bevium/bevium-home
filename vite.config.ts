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
        rehypeSlug,                           // ids on headings
        [rehypeAutolinkHeadings, {           // clickable heading anchors
          behavior: 'wrap'
        }],
        [rehypePrettyCode, {                  // code highlighting with Shiki
          theme: 'github-dark',               // pick any shiki theme you like
          keepBackground: false
        }],
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

