import { api } from 'app/utils/api'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { useEffect, useState } from 'react'
import {
  Card,
  Code,
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
  TableCell,
  TableRow,
  XStack,
  YStack,
} from '@my/ui'
import { useUser } from 'app/utils/useUser'
import { FormProvider, useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { ScrollView } from 'react-native'

// Custom components for Markdown rendering
const MarkdownComponents = {
  h1: (props: any) => <H1 mb="$4" {...props} />,
  h2: (props: any) => <H2 mb="$4" mt="$6" {...props} />,
  h3: (props: any) => <H3 mb="$3" mt="$5" {...props} />,
  h4: (props: any) => <H4 mb="$3" mt="$4" {...props} />,
  h5: (props: any) => <H5 mb="$2" mt="$4" {...props} />,
  h6: (props: any) => <H6 mb="$2" mt="$4" {...props} />,
  p: (props: any) => <Paragraph mb="$4" {...props} />,
  ul: (props: any) => <YStack tag="ul" mb="$4" {...props} />,
  ol: (props: any) => <YStack tag="ol" mb="$4" {...props} />,
  li: (props: any) => <ListItem mb="$2" {...props} />,
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <Image
      source={{ uri: src }}
      width="100%"
      height={300}
      alt={alt}
      mb="$4"
      mt="$2"
      borderRadius="$4"
    />
  ),
  code: ({ inline, children, ...props }: { inline?: boolean; children: any }) => 
    inline ? (
      <Code mx="$1" {...props}>{children}</Code>
    ) : (
      <Code 
        p="$3" 
        mb="$4"
        backgroundColor="$backgroundHover"
        borderRadius="$3"
        width="100%"
        {...props}
      >
        {children}
      </Code>
    ),
  table: (props: any) => (
    <ScrollView horizontal mb="$4">
      <YStack 
        tag="table" 
        borderWidth={1}
        borderColor="$borderColor"
        borderRadius="$3"
        {...props}
      />
    </ScrollView>
  ),
  tr: (props: any) => <TableRow {...props} />,
  td: (props: any) => (
    <TableCell p="$2" borderRightWidth={1} borderColor="$borderColor" {...props} />
  ),
  th: (props: any) => (
    <TableCell 
      p="$2" 
      borderRightWidth={1} 
      borderBottomWidth={1}
      borderColor="$borderColor"
      backgroundColor="$backgroundHover"
      fontWeight="bold"
      {...props} 
    />
  ),
  hr: () => <Separator my="$4" />,
  a: (props: any) => (
    <Paragraph 
      tag="a" 
      color="$blue10" 
      textDecorationLine="underline" 
      {...props} 
    />
  ),
  blockquote: (props: any) => (
    <YStack 
      borderLeftWidth={4}
      borderColor="$borderColor"
      pl="$4"
      my="$4"
      opacity={0.8}
      {...props}
    />
  ),
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

  return (
    <YStack space="$4" p="$4" maxWidth={800} mx="auto">
      {article.featured_image_url && (
        <Image
          source={{ uri: article.featured_image_url }}
          width="100%"
          height={400}
          borderRadius="$4"
        />
      )}
      <H1>{article.title}</H1>
      <XStack space="$2" opacity={0.6} mb="$6">
        <Paragraph>By {article.author?.name}</Paragraph>
        <Paragraph>•</Paragraph>
        <Paragraph>
          {new Date(article.published_at ?? article.created_at ?? '').toLocaleDateString()}
        </Paragraph>
      </XStack>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]}
        components={MarkdownComponents}
      >
        {article.content}
      </ReactMarkdown>

      <YStack space="$4" mt="$8">
        <H2>Comments</H2>
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
                <SubmitButton 
                  loading={addComment.isLoading}
                  onPress={form.handleSubmit(handleSubmit)}
                >
                  Comment
                </SubmitButton>
              </XStack>
            </Form>
          </FormProvider>
        )}

        <YStack space="$4">
          {article.comments?.map((comment) => (
            <Card key={comment.id} bordered padding="$4">
              <YStack space="$2">
                <XStack space="$2" opacity={0.6}>
                  <Paragraph>{comment.author?.name}</Paragraph>
                  <Paragraph>•</Paragraph>
                  <Paragraph>
                    {comment.created_at
                      ? new Date(comment.created_at).toLocaleDateString()
                      : 'Unknown date'}
                  </Paragraph>
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