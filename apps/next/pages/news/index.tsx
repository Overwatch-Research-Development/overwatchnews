import { HomeLayout } from 'app/features/home/layout.web'
import { ArticleList } from 'app/features/news/article-list'
import Head from 'next/head'

import type { NextPageWithLayout } from '../_app'

const NewsPage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>News</title>
      </Head>
      <ArticleList />
    </>
  )
}

NewsPage.getLayout = (page) => <HomeLayout fullPage>{page}</HomeLayout>

export default NewsPage
