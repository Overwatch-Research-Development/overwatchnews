import { HomeLayout } from 'app/features/home/layout.web'
import { ArticleView } from 'app/features/news/article-view'
import Head from 'next/head'
import { useRouter } from 'next/router'

import type { NextPageWithLayout } from '../_app'
const ArticlePage: NextPageWithLayout = () => {
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

ArticlePage.getLayout = (page) => <HomeLayout fullPage>{page}</HomeLayout>

export default ArticlePage
