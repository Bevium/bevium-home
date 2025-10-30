import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import BlogIndex from './pages/BlogIndex'
import BlogPost from './pages/BlogPost'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <div>Home</div> },
      { path: 'blog', element: <BlogIndex /> },
      { path: 'blog/:slug', element: <BlogPost /> },
    ],
  },
])