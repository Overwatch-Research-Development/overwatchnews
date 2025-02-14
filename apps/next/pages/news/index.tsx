import { ArticleList } from 'app/features/news/article-list'
import Head from 'next/head'

export default function NewsPage() {
  return (
    <>
      <Head>
        <title>News</title>
      </Head>
      <ArticleList />
    </>
  )
}