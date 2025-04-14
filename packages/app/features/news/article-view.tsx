import { api } from 'app/utils/api'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { useEffect, useState, useMemo } from 'react'
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
  Input,
  ListItem,
  Paragraph,
  Separator,
  Spinner,
  SubmitButton,
  Theme,
  XStack,
  YStack,
} from '@my/ui'
import { useUser } from 'app/utils/useUser'
import { FormProvider, useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { ScrollView } from 'react-native'
import { Highlight, themes } from 'prism-react-renderer'
import { Clock, BookOpen, Share2, Facebook, Twitter, Linkedin, Eye } from '@tamagui/lucide-icons'

// Custom components for Markdown rendering
const MarkdownComponents = {
  // ... keep existing MarkdownComponents
}

const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const readTime = Math.ceil(words / wordsPerMinute)
  return readTime
}

export function ArticleView({ id }: { id: string }) {
  const { data: article, isLoading, refetch } = api.article.getById.useQuery({ id })
  const incrementViewCount = api.article.incrementViews.useMutation()
  const supabase = useSupabase()
  const { user, avatarUrl } = useUser()
  const [comment, setComment] = useState('')
  const form = useForm()
  const addComment = api.article.comment.useMutation({
    onSuccess: () => {
      setComment('')
      refetch()
    },
  })

  // Increment view count on initial load
  useEffect(() => {
    if (id) {
      incrementViewCount.mutate({ id })
    }
  }, [id])

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

  if (isLoading) return <Spinner />
  if (!article) return <Paragraph>Article not found</Paragraph>

  const handleSubmit = () => {
    addComment.mutate({
      article_id: id,
      content: comment,
    })
  }

  const readTime = useMemo(() => {
    if (!article?.content) return 0
    return calculateReadTime(article.content)
  }, [article?.content])

  return (
    <YStack space="$4" p="$4" maxWidth={800} mx="auto">
      {/* Article Header */}
      <YStack space="$4" mb="$6">
        <H1 size="$9" lh="$9">
          {article?.title}
        </H1>

        {/* Author and Meta Info */}
        <XStack ai="center" space="$4" mb="$4">
          <Avatar circular size="$5">
            {article?.author?.avatar_url ? (
              <Avatar.Image source={{ uri: article.author.avatar_url }} width={48} height={48} />
            ) : (
              <Avatar.Fallback>{article?.author?.name?.charAt(0) || 'A'}</Avatar.Fallback>
            )}
          </Avatar>

          <YStack>
            <Paragraph size="$5" fontWeight="bold">
              {article?.author?.name}
            </Paragraph>
            <XStack space="$2" opacity={0.7}>
              <XStack ai="center" space="$1">
                <Clock size={16} />
                <Paragraph size="$3">
                  {new Date(
                    article?.published_at ?? article?.created_at ?? ''
                  ).toLocaleDateString()}
                </Paragraph>
              </XStack>
              <Paragraph>•</Paragraph>
              <XStack ai="center" space="$1">
                <BookOpen size={16} />
                <Paragraph size="$3">{readTime} min read</Paragraph>
              </XStack>
              <Paragraph>•</Paragraph>
              <XStack ai="center" space="$1">
                <Eye size={16} />
                <Paragraph size="$3">{article.view_count || 0} views</Paragraph>
              </XStack>
            </XStack>
          </YStack>
        </XStack>
      </YStack>

      {/* Featured Image */}
      {article?.featured_image_url && (
        <YStack mb="$6">
          <Image
            source={{ uri: article.featured_image_url }}
            width="100%"
            height={500}
            borderRadius="$4"
          />
          {article?.image_caption && (
            <Paragraph size="$3" opacity={0.7} mt="$2">
              {article.image_caption}
            </Paragraph>
          )}
        </YStack>
      )}

      {/* Article Content */}
      <YStack backgroundColor="$background" p="$4" borderRadius="$4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={MarkdownComponents}
        >
          {article?.content}
        </ReactMarkdown>
      </YStack>

      {/* Comments Section */}
      <Card bordered p="$4" mt="$8">
        <YStack space="$4">
          <H2 size="$7">Comments</H2>
          {user && (
            <FormProvider {...form}>
              <Form onSubmit={form.handleSubmit(handleSubmit)}>
                <YStack space="$2">
                  <XStack space="$2" ai="center">
                    <Avatar circular size="$3">
                      {avatarUrl ? (
                        <Avatar.Image source={{ uri: avatarUrl }} width={32} height={32} />
                      ) : (
                        <Avatar.Fallback>
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </Avatar.Fallback>
                      )}
                    </Avatar>
                    <Paragraph size="$4" fontWeight="600">
                      {user.email}
                    </Paragraph>
                  </XStack>
                  <XStack space="$2">
                    <Input
                      flex={1}
                      value={comment}
                      onChangeText={setComment}
                      placeholder="Write a comment..."
                    />
                    <SubmitButton onPress={form.handleSubmit(handleSubmit)}>Comment</SubmitButton>
                  </XStack>
                </YStack>
              </Form>
            </FormProvider>
          )}

          <YStack space="$4">
            {article?.comments?.map((comment) => (
              <Card key={comment.id} bordered padding="$4">
                <YStack space="$2">
                  <XStack space="$2" ai="center">
                    <Avatar circular size="$3">
                      {comment.author?.avatar_url ? (
                        <Avatar.Image
                          source={{ uri: comment.author.avatar_url }}
                          width={32}
                          height={32}
                        />
                      ) : (
                        <Avatar.Fallback>{comment.author?.name?.charAt(0) || 'U'}</Avatar.Fallback>
                      )}
                    </Avatar>
                    <YStack>
                      <Paragraph fontWeight="bold">{comment.author?.name}</Paragraph>
                      <Paragraph size="$3" opacity={0.6}>
                        {comment.created_at
                          ? new Date(comment.created_at).toLocaleDateString()
                          : 'Unknown date'}
                      </Paragraph>
                    </YStack>
                  </XStack>
                  <Paragraph ml="$4">{comment.content}</Paragraph>
                </YStack>
              </Card>
            ))}
          </YStack>
        </YStack>
      </Card>
    </YStack>
  )
}
