// packages/app/features/components/ImageUpload.tsx
import { Button, Image, XStack } from '@my/ui'
import { useSupabase } from 'app/utils/supabase/useSupabase'

export function ImageUpload({ onImageSelected }: { onImageSelected: (url: string) => void }) {
  const supabase = useSupabase()

  const handleUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const filePath = `${Math.random()}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage
      .from('article-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error(uploadError)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('article-images').getPublicUrl(filePath)

    onImageSelected(publicUrl)
  }

  return (
    <XStack space="$2" ai="center">
      <Button
        onPress={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) handleUpload(file)
          }
          input.click()
        }}
      >
        Upload Image
      </Button>
    </XStack>
  )
}
