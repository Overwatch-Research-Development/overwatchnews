import { protectedProcedure, createTRPCRouter } from '../trpc'

export const userRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx: { supabase } }) => {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, name, email')
      .order('name')

    if (error) throw error
    return users
  }),
})
