import { api } from 'app/utils/api'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { useEffect } from 'react'
import { Button, Card, H2, H4, Image, Paragraph, Spinner, XStack, YStack } from '@my/ui'
import { useRouter } from 'solito/router'

export function ArticleList() {
  const { data: articles, isLoading, refetch } = api.article.getPublished.useQuery()
  const supabase = useSupabase()
  const router = useRouter()

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('articles-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'articles',
          filter: 'status=eq.published'
        }, 
        () => {
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, refetch])

  if (isLoading) return <Spinner />

  return (
    <YStack space="$4" p="$4">
      <H2>Latest News</H2>
      {articles?.map((article) => (
        <Card
          key={article.id}
          elevate
          bordered
          animation="bouncy"
          pressStyle={{ scale: 0.95 }}
          onPress={() => router.push(`/article/${article.id}`)}
        >
          <XStack space>
            {article.featured_image_url && (
              <Image
                source={{ uri: article.featured_image_url }}
                width={200}
                height={150}
                borderRadius="$4"
              />
            )}
            <YStack space="$2" flex={1}>
              <H4>{article.title}</H4>
              <Paragraph numberOfLines={2}>{article.excerpt || article.content}</Paragraph>
              <XStack space="$2" opacity={0.6}>
                <Paragraph>By {article.author?.name}</Paragraph>
                <Paragraph>•</Paragraph>
                <Paragraph>
                  {new Date(article.published_at || article.created_at).toLocaleDateString()}
                </Paragraph>
              </XStack>
            </YStack>
          </XStack>
        </Card>
      ))}
    </YStack>
  )
}