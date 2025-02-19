import { api } from 'app/utils/api'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { useEffect } from 'react'
import {
  Button,
  Card,
  H2,
  H4,
  Image,
  Paragraph,
  FullscreenSpinner,
  XStack,
  YStack,
  Separator,
} from '@my/ui'
import { useRouter } from 'solito/router'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'

export function ArticleList() {
  const { data: articles, isLoading, refetch } = api.article.getPublished.useQuery()
  const supabase = useSupabase()
  const router = useRouter()

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('articles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'articles',
          filter: 'status=eq.published',
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

  if (isLoading) return <FullscreenSpinner />

  return (
    <YStack w="100%" ai="stretch">
      <YStack space="$4" p="$4" maw={800} mx="auto" w="100%">
        {articles?.map((article) => (
          <Card
            key={article.id}
            elevate
            bordered
            animation="bouncy"
            scale={0.98}
            hoverStyle={{ scale: 1 }}
            pressStyle={{ scale: 0.96 }}
            onPress={() => router.push(`/article/${article.id}`)}
            w="100%"
          >
            <Card.Header padded>
              <XStack gap="$4" ai="flex-start" w="100%">
                <Image
                  source={{ uri: article.featured_image_url || undefined }}
                  width={120}
                  height={120}
                  borderRadius="$4"
                />
                <YStack flex={1} space="$2" w="100%">
                  <H4>{article.title}</H4>
                  <Paragraph theme="alt2" size="$3" numberOfLines={2}>
                    {article.excerpt}
                  </Paragraph>
                  <YStack space="$1"> {/* Change XStack to YStack for vertical layout */}
                    <Paragraph size="$2" theme="alt1">
                      {article.created_at
                        ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true })
                        : 'Unknown date'}
                    </Paragraph>
                    <Paragraph size="$2" theme="alt1">
                      By {article.author?.name} {/* Added "By" prefix */}
                    </Paragraph>
                  </YStack>
                </YStack>
              </XStack>
            </Card.Header>
          </Card>
        ))}
      </YStack>
    </YStack>
  )
}
