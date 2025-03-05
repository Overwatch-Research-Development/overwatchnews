import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const articleRouter = createTRPCRouter({
  // Get all published articles
  getPublished: publicProcedure.query(async ({ ctx: { supabase } }) => {
    const { data, error } = await supabase
      .from('articles')
      .select(
        `
        *,
        author:profiles(name, avatar_url),
        comments(count)
      `
      )
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
        .select(
          `
          *,
          author:profiles(name, avatar_url),
          comments(
            *,
            author:profiles(name, avatar_url)
          )
        `
        )
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
        category_id: z.string().uuid().optional(), // Add this line
        status: z.enum(['draft', 'published']),
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
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only administrators can create articles',
        })
      }

      // Generate a URL-friendly slug from the title
      const slug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data, error } = await supabase
        .from('articles')
        .insert({
          ...input,
          slug,
          author_id: user.id,
          view_count: 0,
          is_featured: false,
          published_at: input.status === 'published' ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          meta: {
            version: 1,
            last_edited_by: user.id,
          },
        })
        .select(
          `
          *,
          author:profiles(name, avatar_url),
          comments(count)
        `
        )
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

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
        .select(
          `
          *,
          author:profiles(name, avatar_url)
        `
        )
        .single()

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data
    }),

  // Add this to the articleRouter in packages/api/src/routers/article.ts
  incrementViews: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx: { supabase }, input }) => {
      const { data, error } = await supabase.rpc('increment_article_views', {
        article_id: input.id,
      })

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
      return data
    }),
  getRelated: publicProcedure
    .input(z.object({ id: z.string(), limit: z.number().min(1).max(10).default(5) }))
    .query(async ({ ctx: { supabase }, input }) => {
      // First, get the categories of the current article
      const { data: currentArticle, error: currentArticleError } = await supabase
        .from('articles')
        .select('category_id')
        .eq('id', input.id)
        .single()

      if (currentArticleError) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Article not found' })
      }

      if (!currentArticle.category_id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Article category not found' })
      }
      // Then, get related articles based on the same category
      const { data: relatedArticles, error: relatedArticlesError } = await supabase
        .from('articles')
        .select(
          `
          id,
          title,
          excerpt,
          featured_image_url,
          published_at,
          created_at,
          author:profiles(name, avatar_url)
        `
        )
        .eq('status', 'published')
        .eq('category_id', currentArticle.category_id)
        .neq('id', input.id)
        .order('published_at', { ascending: false })
        .limit(input.limit)

      if (relatedArticlesError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: relatedArticlesError.message,
        })
      }

      return relatedArticles
    }),
})
