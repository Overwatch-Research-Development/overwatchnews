import { useToastController, Spinner, H2 } from '@my/ui'
import { getBaseUrl } from 'app/utils/getBaseUrl'
import { useEffect } from 'react'
import { Platform } from 'react-native'

export const Greetings = () => {
  const baseUrl = getBaseUrl()
  const toast = useToastController()
  const isNative = Platform.OS === 'ios' || Platform.OS === 'android'
  useEffect(() => {
    toast.show('tRPC server connected.', {
      native: isNative,
      duration: 2000,
      burntOptions: {
        from: 'top',
        preset: 'done',
      },
    })
  }, [data, isError, toast])
  return <H2 m="$4"></H2>
}
