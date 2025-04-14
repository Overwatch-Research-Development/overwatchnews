import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const articleRouter = createTRPCRouter({
  // Get all published articles
  getPublished: publicProcedure.query(async ({ ctx: { supabase } }) => {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        author:profiles(name, avatar_url),
        comments(count)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return data
  }),

  // Get single article
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx: { supabase }, input }) => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(name, avatar_url),
          comments(
            *,
            author:profiles(name, avatar_url)
          )
        `)
        .eq('id', input.id)
        .single()

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: 'Article not found' })
      return data
    }),

  // Create article (admin only)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        excerpt: z.string().optional(),
        featured_image_url: z.string().url().optional(),
        status: z.enum(['draft', 'published', 'archived']),
      })
    )
    .mutation(async ({ ctx: { supabase, user }, input }) => {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'administrator') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only administrators can create articles' })
      }

      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      const { data, error } = await supabase.from('articles').insert({
        ...input,
        slug,
        author_id: user.id,
        published_at: input.status === 'published' ? new Date().toISOString() : null,
      })

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data
    }),

  // Add comment
  comment: protectedProcedure
    .input(
      z.object({
        article_id: z.string(),
        content: z.string().min(1),
        parent_id: z.string().optional(),
      })
    )
    .mutation(async ({ ctx: { supabase, user }, input }) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          ...input,
          author_id: user.id,
        })
        .select(`
          *,
          author:profiles(name, avatar_url)
        `)
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data
    }),
})