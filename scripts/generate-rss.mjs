import fg from 'fast-glob'
import fs from 'fs'
import matter from 'gray-matter'
import RSS from 'rss'

const SITE = 'https://<your-gh-username>.github.io/<repo-name>'
const FEED = new RSS({
  title: 'Your Site Blog',
  site_url: SITE,
  feed_url: `${SITE}/rss.xml`,
  description: 'Articles from Your Site',
  language: 'en',
})

const files = await fg('src/content/posts/**/*.mdx')
files.forEach((p) => {
  const { data, content } = matter.read(p)
  const slug = data.slug || p.split('/').pop().replace(/\.mdx$/, '')
  FEED.item({
    title: data.title,
    url: `${SITE}/blog/${slug}`,
    date: data.date,
    description: data.description,
    author: data.author || 'Your Name',
  })
})

fs.mkdirSync('public', { recursive: true })
fs.writeFileSync('public/rss.xml', FEED.xml({ indent: true }))
console.log('rss.xml generated.')
