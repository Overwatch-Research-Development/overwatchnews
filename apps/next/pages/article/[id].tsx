import { ArticleView } from 'app/features/news/article-view'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function ArticlePage() {
  const router = useRouter()
  
  // Wait for router to be ready before rendering ArticleView
  if (!router.isReady) {
    return null
  }

  const { id } = router.query
  if (typeof id !== 'string') {
    return null
  }

  return (
    <>
      <Head>
        <title>Article</title>
      </Head>
      <ArticleView id={id} />
    </>
  )
}