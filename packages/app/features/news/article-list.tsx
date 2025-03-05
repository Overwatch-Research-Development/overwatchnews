import { api } from 'app/utils/api'
import { useSupabase } from 'app/utils/supabase/useSupabase'
import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  H2,
  H4,
  Image,
  Paragraph,
  FullscreenSpinner,
  XStack,
  YStack,
  Text,
  Avatar,
  ScrollView,
  Spinner,
} from '@my/ui'
import { useRouter } from 'solito/router'
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow'

export function ArticleList() {
  const {
    data: articles,
    isLoading: articlesLoading,
    refetch,
  } = api.article.getPublished.useQuery()
  const { data: categories, isLoading: categoriesLoading } = api.category.getAll.useQuery()
  const supabase = useSupabase()
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('articles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'articles',
          filter: 'status=eq.published',
        },
        () => {
          refetch()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, refetch])

  const isLoading = articlesLoading || categoriesLoading

  if (isLoading) return <FullscreenSpinner />

  // Add "All" category to the beginning of the list
  const categoryOptions = [{ id: 'all', name: 'All' }, ...(categories || [])]

  // Filter articles by category if needed
  const filteredArticles =
    activeCategory === 'All'
      ? articles
      : articles?.filter((article) => article.category_id === activeCategory)

  // Get the first article for the featured section
  const featuredArticle =
    filteredArticles && filteredArticles.length > 0 ? filteredArticles[0] : null
  const remainingArticles =
    filteredArticles && filteredArticles.length > 1 ? filteredArticles.slice(1) : []

  return (
    <YStack w="100%" ai="center" space="$6" pb="$8">
      {/* Category Tabs */}
      <XStack w="100%" jc="center" borderBottomWidth={1} borderBottomColor="$borderColor" pb="$1">
        <XStack space="$4" px="$4" maw={1000} w="100%" jc="flex-start" overflow="visible">
          {categoryOptions.map((category) => (
            <Button
              key={category.id}
              chromeless
              onPress={() => setActiveCategory(category.id === 'all' ? 'All' : category.id)}
              pressStyle={{ opacity: 0.7 }}
              px="$3"
              py="$2"
              borderBottomWidth={
                activeCategory === (category.id === 'all' ? 'All' : category.id) ? 2 : 0
              }
              borderBottomColor="$color"
            >
              <Text
                fontWeight={
                  activeCategory === (category.id === 'all' ? 'All' : category.id) ? '700' : '400'
                }
                color={
                  activeCategory === (category.id === 'all' ? 'All' : category.id)
                    ? '$color'
                    : '$color10'
                }
              >
                {category.name}
              </Text>
            </Button>
          ))}
        </XStack>
      </XStack>

      {/* Main Content */}
      <YStack w="100%" maw={1000} mx="auto" px="$4" space="$6">
        {/* Featured Article */}
        {featuredArticle && (
          <Card
            elevate
            bordered
            animation="bouncy"
            scale={0.99}
            hoverStyle={{ scale: 1 }}
            pressStyle={{ scale: 0.97 }}
            onPress={() => router.push(`/article/${featuredArticle.id}`)}
            overflow="hidden"
            borderRadius="$6"
          >
            <Image
              source={{ uri: featuredArticle.featured_image_url || undefined }}
              width="100%"
              height={400}
            />
            <Card.Footer p="$4">
              <YStack space="$2" f={1}>
                <H2>{featuredArticle.title}</H2>
                <XStack ai="center" space="$2" mb="$2">
                  {featuredArticle.author?.avatar_url && (
                    <Avatar size="$3" circular>
                      <Avatar.Image source={{ uri: featuredArticle.author.avatar_url }} />
                      <Avatar.Fallback bc="$gray5" />
                    </Avatar>
                  )}
                  <Text size="$3" theme="alt1">
                    {featuredArticle.author?.name} •{' '}
                    {featuredArticle.created_at
                      ? formatDistanceToNow(new Date(featuredArticle.created_at), {
                          addSuffix: true,
                        })
                      : 'Unknown date'}
                  </Text>
                  {featuredArticle.categories && (
                    <Text px="$2" py="$1" borderRadius="$4" color="$color12">
                      {categories?.find((c) => c.id === featuredArticle.category_id)?.name}
                    </Text>
                  )}
                </XStack>
                <Paragraph theme="alt2" size="$4">
                  {featuredArticle.excerpt}
                </Paragraph>
              </YStack>
            </Card.Footer>
          </Card>
        )}

        {/* Article Grid */}
        <XStack flexWrap="wrap" gap="$4" jc="flex-start">
          {remainingArticles.map((article) => (
            <Card
              key={article.id}
              elevate
              bordered
              animation="bouncy"
              scale={0.98}
              hoverStyle={{ scale: 1 }}
              pressStyle={{ scale: 0.96 }}
              onPress={() => router.push(`/article/${article.id}`)}
              // width={{ lg: 'calc(33.33% - 11px)' }}
              overflow="hidden"
              mb="$4"
            >
              <Image
                source={{ uri: article.featured_image_url || undefined }}
                width="100%"
                height={180}
                resizeMode="cover"
              />
              <Card.Footer p="$3">
                <YStack f={1}>
                  <H4 numberOfLines={2}>{article.title}</H4>
                  <XStack ai="center" mt="$1" flexWrap="wrap">
                    {article.author?.avatar_url && (
                      <Avatar size="$2" circular>
                        <Avatar.Image source={{ uri: article.author.avatar_url }} />
                        <Avatar.Fallback bc="$gray5" />
                      </Avatar>
                    )}
                    <Text theme="alt1">
                      {article.created_at
                        ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true })
                        : 'Unknown date'}
                    </Text>
                    {article.category_id && (
                      <Text size="$1" px="$1.5" py="$0.5" borderRadius="$3" color="$color12">
                        {categories?.find((c) => c.id === article.category_id)?.name}
                      </Text>
                    )}
                  </XStack>
                  <Paragraph theme="alt2" size="$3" numberOfLines={2} mt="$1">
                    {article.excerpt}
                  </Paragraph>
                </YStack>
              </Card.Footer>
            </Card>
          ))}
        </XStack>
      </YStack>
    </YStack>
  )
}
