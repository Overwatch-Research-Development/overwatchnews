import { useQuery } from '@tanstack/react-query'

import { useSupabase } from '../supabase/useSupabase'

const getPosts = async (supabase) => {
  return supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(4)
}

function usePostQuery() {
  const supabase = useSupabase()
  const queryKey = ['posts']

  const queryFn = async () => {
    return getPosts(supabase).then((result) => result.data)
  }

  return useQuery({ queryKey, queryFn })
}

export default usePostQuery
