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
import { Clock, BookOpen, Share2, Facebook, Twitter, Linkedin } from '@tamagui/lucide-icons'

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
  code: ({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean
    className?: string
    children: any
  }) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''

    return !inline ? (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} mb="$6" mt="$2">
        <YStack width="100%" minWidth={300}>
          <Highlight
            theme={themes.vsDark}
            code={String(children).replace(/\n$/, '')}
            language={language || 'typescript'}
          >
            {({ tokens, getLineProps, getTokenProps }) => (
              <YStack tag="pre" backgroundColor="$color1" borderRadius="$4" p="$4" space="$1">
                {tokens.map((line, i) => (
                  <XStack key={i} {...getLineProps({ line })} space="$2">
                    <Paragraph color="$color9" size="$3" w={25} ta="right" opacity={0.5}>
                      {i + 1}
                    </Paragraph>
                    <XStack>
                      {line.map((token, key) => (
                        <Paragraph
                          key={key}
                          fontFamily="$mono"
                          size="$4"
                          {...getTokenProps({ token })}
                        />
                      ))}
                    </XStack>
                  </XStack>
                ))}
              </YStack>
            )}
          </Highlight>
        </YStack>
      </ScrollView>
    ) : (
      <Paragraph
        tag="code"
        fontFamily="$mono"
        backgroundColor="$backgroundHover"
        px="$2"
        mx="$1"
        borderRadius="$2"
        size="$4"
        {...props}
      >
        {children}
      </Paragraph>
    )
  },
  table: (props: any) => (
    <ScrollView horizontal mb="$6" showsHorizontalScrollIndicator={false}>
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

const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const readTime = Math.ceil(words / wordsPerMinute)
  return readTime
}

export function ArticleView({ id }: { id: string }) {
  const { data: article, isLoading, refetch } = api.article.getById.useQuery({ id })
  const supabase = useSupabase()
  const { user } = useUser()
  const [comment, setComment] = useState('')
  const form = useForm()
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
            </XStack>
          </YStack>
        </XStack>

        {/* Social Share Buttons */}
        <XStack space="$2">
          <Theme name="blue">
            <Card elevate bordered padded pressStyle={{ scale: 0.95 }}>
              <Facebook size={20} />
            </Card>
          </Theme>
          <Theme name="blue">
            <Card elevate bordered padded pressStyle={{ scale: 0.95 }}>
              <Twitter size={20} />
            </Card>
          </Theme>
          <Theme name="blue">
            <Card elevate bordered padded pressStyle={{ scale: 0.95 }}>
              <Linkedin size={20} />
            </Card>
          </Theme>
          <Theme name="gray">
            <Card elevate bordered padded pressStyle={{ scale: 0.95 }}>
              <Share2 size={20} />
            </Card>
          </Theme>
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
                <XStack space="$2">
                  <Input
                    flex={1}
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Write a comment..."
                  />
                  <SubmitButton onPress={form.handleSubmit(handleSubmit)}>Comment</SubmitButton>
                </XStack>
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
