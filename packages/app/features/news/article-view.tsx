import {
  Avatar,
  Card,
  Form,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Image,
  Paragraph,
  Separator,
  XStack,
  YStack,
  ListItem,
  FullscreenSpinner,
} from '@my/ui'
import { Clock, Eye } from '@tamagui/lucide-icons'
import { api } from 'app/utils/api'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import { ScrollView } from 'react-native'

// Custom components for Markdown rendering
const MarkdownComponents = {
  h1: (props: any) => <H1 mb="$6" mt="$8" {...props} />,
  h2: (props: any) => <H2 mb="$5" mt="$6" {...props} />,
  h3: (props: any) => <H3 mb="$4" mt="$5" {...props} />,
  h4: (props: any) => <H4 mb="$3" mt="$4" {...props} />,
  h5: (props: any) => <H5 mb="$3" mt="$4" {...props} />,
  h6: (props: any) => <H6 mb="$3" mt="$4" {...props} />,
  p: (props: any) => <Paragraph size="$5" lh="$6" mb="$4" {...props} />,
  ul: (props: any) => <YStack tag="ul" mb="$4" pl="$4" {...props} />,
  ol: (props: any) => <YStack tag="ol" mb="$4" pl="$4" {...props} />,
  li: (props: any) => <ListItem mb="$2" {...props} />,
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <Image
      source={{ uri: src }}
      width="100%"
      height={400}
      alt={alt}
      mb="$6"
      mt="$4"
      borderRadius="$4"
    />
  ),
  table: (props: any) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <YStack
        tag="table"
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$4"
        overflow="hidden"
        {...props}
      />
    </ScrollView>
  ),
  tr: (props: any) => (
    <XStack tag="tr" borderBottomWidth={1} borderColor="$borderColor" {...props} />
  ),
  td: (props: any) => (
    <XStack
      tag="td"
      p="$3"
      borderRightWidth={1}
      borderColor="$borderColor"
      minWidth={150}
      {...props}
    />
  ),
  th: (props: any) => (
    <XStack
      tag="th"
      p="$3"
      borderRightWidth={1}
      borderColor="$borderColor"
      backgroundColor="$backgroundHover"
      fontWeight="bold"
      minWidth={150}
      {...props}
    />
  ),
  hr: () => <Separator my="$6" />,
  a: (props: any) => (
    <Paragraph
      tag="a"
      color="$blue10"
      textDecorationLine="underline"
      hoverStyle={{ opacity: 0.8 }}
      {...props}
    />
  ),
  blockquote: (props: any) => (
    <YStack borderLeftWidth={4} borderColor="$blue8" pl="$4" my="$4" opacity={0.8} {...props} />
  ),
}

export function ArticleView({ id }: { id: string }) {
  const { data: article, isLoading, refetch } = api.article.getById.useQuery({ id })
  const { data: relatedArticles } = api.article.getRelated.useQuery({ id, limit: 5 })
  const supabase = useSupabase()
  const router = useRouter()
  const [comment, setComment] = useState('')
  const addComment = api.article.comment.useMutation({
    onSuccess: () => {
      setComment('')
      refetch()
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel('article-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${id}`,
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

  if (isLoading) return <FullscreenSpinner />
  if (!article) return <Paragraph>Article not found</Paragraph>

  const handleSubmit = () => {
    addComment.mutate({
      article_id: id,
      content: comment,
    })
  }

  return (
    <ScrollView>
      <XStack space flex={1} paddingHorizontal="$4">
        <YStack space="$4" flex={1}>
          <H1 size="$8" fontWeight="bold">
            {article.title}
          </H1>

          {/* Author and Meta Info */}
          <XStack ai="center" space="$4" mb="$4">
            <Avatar circular size="$4">
              {article.author?.avatar_url ? (
                <Avatar.Image source={{ uri: article.author.avatar_url }} />
              ) : (
                <Avatar.Fallback>{article.author?.name?.charAt(0) || 'A'}</Avatar.Fallback>
              )}
            </Avatar>
            <YStack>
              <Paragraph size="$4" fontWeight="bold">
                {article.author?.name}
              </Paragraph>
              <XStack space="$2" opacity={0.7}>
                <XStack ai="center" space="$1">
                  <Clock size={14} />
                  <Paragraph size="$2">
                    {new Date(
                      article.published_at ?? article.created_at ?? ''
                    ).toLocaleDateString()}
                  </Paragraph>
                </XStack>
                <Paragraph>•</Paragraph>
                <XStack ai="center" space="$1">
                  {/* <BookOpen size={14} />
                  <Paragraph size="$2">{article.read_time || '5 min read'}</Paragraph> */}
                </XStack>
                <Paragraph>•</Paragraph>
                <XStack ai="center" space="$1">
                  <Eye size={14} />
                  <Paragraph size="$2">{article.view_count || 0} views</Paragraph>
                </XStack>
              </XStack>
            </YStack>
          </XStack>

          {/* Featured Image */}
          {article.featured_image_url && (
            <Image
              source={{ uri: article.featured_image_url }}
              width="100%"
              height={400}
              alt="Featured Image"
              mb="$4"
              borderRadius="$4"
            />
          )}

          <Separator />
          <ReactMarkdown components={MarkdownComponents}>{article.content}</ReactMarkdown>
        </YStack>

        {/* Related Articles */}
        {/* <YStack width={300} paddingLeft="$4">
          <H2 size="$6" fontWeight="bold">
            More News
          </H2>
          {relatedArticles?.map((relatedArticle) => (
            <Card
              key={relatedArticle.id}
              bordered
              elevate
              onPress={() => router.push(`/article/${relatedArticle.id}`)}
            >
              <Card.Header padded>
                <H2 size="$5">{relatedArticle.title}</H2>
              </Card.Header>
              {relatedArticle.featured_image_url && (
                <Image
                  source={{ uri: relatedArticle.featured_image_url }}
                  width="100%"
                  height={120}
                  alt="Related Article Image"
                />
              )}
              <Card.Footer padded>
                <XStack space="$2" opacity={0.7}>
                  <Clock size={14} />
                  <Paragraph size="$2">
                    {new Date(
                      relatedArticle.published_at ?? relatedArticle.created_at ?? ''
                    ).toLocaleDateString()}
                  </Paragraph>
                </XStack>
              </Card.Footer>
            </Card>
          ))}
        </YStack> */}
        <YStack width={300} paddingLeft="$4">
          <H1>Related Articles</H1>
          {relatedArticles && relatedArticles.length > 0 ? (
            relatedArticles.map((relatedArticle) => (
              <YStack key={relatedArticle.id} paddingVertical="$2">
                <Card
                  key={relatedArticle.id}
                  bordered
                  elevate
                  onPress={() => router.push(`/article/${relatedArticle.id}`)}
                >
                  <Card.Header padded>
                    <H2 size="$5">{relatedArticle.title}</H2>
                  </Card.Header>
                  {relatedArticle.featured_image_url && (
                    <Image
                      source={{ uri: relatedArticle.featured_image_url }}
                      width="100%"
                      height={120}
                      alt="Related Article Image"
                    />
                  )}
                  <Card.Footer padded>
                    <XStack space="$2" opacity={0.7}>
                      <Clock size={14} />
                      <Paragraph size="$2">
                        {new Date(
                          relatedArticle.published_at ?? relatedArticle.created_at ?? ''
                        ).toLocaleDateString()}
                      </Paragraph>
                    </XStack>
                  </Card.Footer>
                </Card>
              </YStack>
            ))
          ) : (
            <Paragraph>No related articles found</Paragraph>
          )}
        </YStack>
      </XStack>
    </ScrollView>
  )
}
