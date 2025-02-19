import {
  FullscreenSpinner,
  SubmitButton,
  Theme,
  useToastController,
  YStack,
  Card,
  Paragraph,
  Button,
} from '@my/ui'
import { useMutation } from '@tanstack/react-query'
import { SchemaForm, formFields } from 'app/utils/SchemaForm'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { useUser } from 'app/utils/useUser'
import { z } from 'zod'
import { api } from 'app/utils/api'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

// Define proper field types
const articleStatus = ['draft', 'published'] as const
type ArticleStatus = (typeof articleStatus)[number]

const CreateArticleSchema = z.object({
  title: formFields.text.min(5).describe('Title // Article title'),
  excerpt: z.string()
    .min(10)
    .max(300)
    .describe('Excerpt // A brief summary (max 300 chars)'),
  content: z.string().min(50).describe('Content // Article content (Markdown supported)'),
  featured_image_url: z
    .string()
    .url()
    .optional()
    .describe('Featured Image // Main article image URL'),
  categories: formFields.select.describe('Categories // Article categories'),
  collaborators: formFields.select.describe('Collaborators // Add other authors'),
  status: z.enum(articleStatus).describe('Status // Article status'),
})

type ArticleFormData = z.infer<typeof CreateArticleSchema>

export function ArticleEditor({ onSuccess }: { onSuccess: () => void }) {
  const { profile, user } = useUser()
  const toast = useToastController()
  const supabase = useSupabase()
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const createArticle = api.article.create.useMutation({
    onSuccess: () => {
      toast.show('Article created successfully!', {
        type: 'success',
      })
      onSuccess()
    },
    onError: (error) => {
      toast.show('Error creating article: ' + error.message, {
        type: 'error',
      })
    },
  })

  if (!profile || !user?.id) {
    return <FullscreenSpinner />
  }

  const categories = [
    { name: 'News', value: 'news' },
    { name: 'Guide', value: 'guide' },
    { name: 'Update', value: 'update' },
    { name: 'Event', value: 'event' },
  ]

  return (
    <SchemaForm<ArticleFormData>
      onSubmit={(values) => createArticle.mutate(values)}
      schema={CreateArticleSchema}
      defaultValues={{
        title: '',
        excerpt: '',
        content: '',
        featured_image_url: '',
        categories: [],
        collaborators: [],
        status: 'draft',
      }}
      props={{
        content: {
          minHeight: 400,
          multiline: true,
          renderAfter: ({ value }) =>
            isPreviewMode && (
              <Card bordered p="$4" mt="$2">
                <ReactMarkdown>{value as string}</ReactMarkdown>
              </Card>
            ),
          rightElement: (
            <Button size="$3" onPress={() => setIsPreviewMode(!isPreviewMode)}>
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
          ),
        },
        categories: {
          placeholder: 'Select categories',
          multiple: true,
          options: categories,
        },
        status: {
          placeholder: 'Choose status',
          options: [
            { name: 'Draft', value: 'draft' },
            { name: 'Published', value: 'published' },
          ],
        },
        collaborators: {
          placeholder: 'Select collaborators',
          multiple: true,
          asyncOptions: async () => {
            const { data: users } = await supabase
              .from('profiles')
              .select('id, name, email')
              .neq('id', user.id)

            return (
              users?.map((user) => ({
                name: user.name || user.email,
                value: user.id,
              })) || []
            )
          },
        },
        featured_image_url: {
          placeholder: 'Image URL',
          helperText: 'Enter a valid image URL or upload an image',
          // renderAfter: ({ value }) =>
          //   value && (
          //     <Image
          //       source={{ uri: value as string }}
          //       width={200}
          //       height={120}
          //       borderRadius="$4"
          //       mt="$2"
          //     />
          //   ),
        },
      }}
      renderAfter={({ submit, isValid, isDirty }) => (
        <Theme inverse>
          <SubmitButton onPress={submit} disabled={!isValid || !isDirty || createArticle.isLoading}>
            {createArticle.isLoading ? 'Creating...' : 'Create Article'}
          </SubmitButton>
        </Theme>
      )}
    >
      {(fields) => (
        <YStack gap="$4" py="$4" minWidth="100%" $gtSm={{ minWidth: 480 }}>
          {Object.values(fields)}
        </YStack>
      )}
    </SchemaForm>
  )
}
