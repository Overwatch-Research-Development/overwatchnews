import { api } from 'app/utils/api'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { useEffect, useState } from 'react'
import { Button, Card, Form, H1, Image, Input, Paragraph, Spinner, XStack, YStack } from '@my/ui'
import { useUser } from 'app/utils/useUser'

export function ArticleView({ id }: { id: string }) {
  const { data: article, isLoading, refetch } = api.article.getById.useQuery({ id })
  const supabase = useSupabase()
  const { user } = useUser()
  const [comment, setComment] = useState('')
  const addComment = api.article.comment.useMutation({
    onSuccess: () => {
      setComment('')
      refetch()
    },
  })

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('article-comments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `article_id=eq.${id}`
        }, 
        () => {
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, id, refetch])

  if (isLoading) return <Spinner />
  if (!article) return <Paragraph>Article not found</Paragraph>

  return (
    <YStack space="$4" p="$4">
      {article.featured_image_url && (
        <Image
          source={{ uri: article.featured_image_url }}
          width="100%"
          height={400}
          borderRadius="$4"
        />
      )}
      <H1>{article.title}</H1>
      <XStack space="$2" opacity={0.6}>
        <Paragraph>By {article.author?.name}</Paragraph>
        <Paragraph>•</Paragraph>
        <Paragraph>
          {new Date(article.published_at || article.created_at).toLocaleDateString()}
        </Paragraph>
      </XStack>
      <Paragraph>{article.content}</Paragraph>

      <YStack space="$4" mt="$8">
        <H2>Comments</H2>
        {user && (
          <Form
            onSubmit={() => {
              addComment.mutate({
                article_id: id,
                content: comment,
              })
            }}
          >
            <XStack space="$2">
              <Input
                flex={1}
                value={comment}
                onChangeText={setComment}
                placeholder="Write a comment..."
              />
              <Button type="submit" loading={addComment.isLoading}>
                Comment
              </Button>
            </XStack>
          </Form>
        )}

        <YStack space="$4">
          {article.comments?.map((comment) => (
            <Card key={comment.id} bordered padding="$4">
              <YStack space="$2">
                <XStack space="$2" opacity={0.6}>
                  <Paragraph>{comment.author?.name}</Paragraph>
                  <Paragraph>•</Paragraph>
                  <Paragraph>{new Date(comment.created_at).toLocaleDateString()}</Paragraph>
                </XStack>
                <Paragraph>{comment.content}</Paragraph>
              </YStack>
            </Card>
          ))}
        </YStack>
      </YStack>
    </YStack>
  )
}