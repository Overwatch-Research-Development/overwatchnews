import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

export const categoryRouter = createTRPCRouter({
  // Get all categories
  getAll: publicProcedure.query(async ({ ctx: { supabase } }) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return data
  }),

  // Get category by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx: { supabase }, input }) => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error) throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' })
      return data
    }),

  // Create category (admin only)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        color: z.string().optional(),
        icon_name: z.string().optional(),
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
          message: 'Only administrators can create categories',
        })
      }

      // Generate a URL-friendly slug from the name
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...input,
          slug,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Update category (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        icon_name: z.string().optional(),
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
          message: 'Only administrators can update categories',
        })
      }

      // If name is being updated, generate a new slug
      let slug
      if (input.name) {
        slug = input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }

      const { data, error } = await supabase
        .from('categories')
        .update({
          ...input,
          ...(slug && { slug }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  // Delete category (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
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
          message: 'Only administrators can delete categories',
        })
      }

      // Check if category is being used by any articles
      const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('id')
        .eq('category_id', input.id)
        .limit(1)

      if (articlesError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: articlesError.message,
        })
      }

      if (articles && articles.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete category that is being used by articles',
        })
      }

      const { error } = await supabase.from('categories').delete().eq('id', input.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return { success: true }
    }),
})