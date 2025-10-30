import fg from 'fast-glob'
import fs from 'fs'
import matter from 'gray-matter'

const SITE = 'https://<your-gh-username>.github.io/<repo-name>'

const files = await fg('src/content/posts/**/*.mdx')
const urls = files.map((p) => {
  const { data } = matter.read(p)
  const slug = data.slug || p.split('/').pop().replace(/\.mdx$/, '')
  const lastmod = (data.updated || data.date || new Date().toISOString()).slice(0, 10)
  return { loc: `${SITE}/blog/${slug}`, lastmod }
})

const staticUrls = [
  { loc: `${SITE}/`, lastmod: new Date().toISOString().slice(0, 10) },
  { loc: `${SITE}/blog`, lastmod: new Date().toISOString().slice(0, 10) },
]

const all = [...staticUrls, ...urls]
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(u => `<url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>`

fs.mkdirSync('public', { recursive: true })
fs.writeFileSync('public/sitemap.xml', xml)
fs.writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`)
console.log('sitemap.xml and robots.txt generated.')
