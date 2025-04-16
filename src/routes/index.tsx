import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Menu, Search, X, Loader2, View } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useConvexAuth } from "@convex-dev/react-query";
import { Route as AuthLoginRoute } from "@/routes/_app/login/_layout.index";
import { Route as DashboardRoute } from "@/routes/_app/_auth/dashboard/_layout.index";
import siteConfig from "~/site.config";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [newsItems, setNewsItems] = useState(initialNewsItems);
  const { isLoading, isAuthenticated } = useConvexAuth();
  // Simulate real-time news updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Add a new news item every 15 seconds
      if (Math.random() > 0.5) {
        const newItem = generateNewsItem();
        setNewsItems((prev) => [newItem, ...prev.slice(0, prev.length - 1)]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
            <View className="h-6 w-6" />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold tracking-tight"
            >
              {siteConfig.siteTitle}
            </motion.div>
          </div>

          {!isMobile && (
            <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    activeCategory === category
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            <Link
              to={
                isAuthenticated
                  ? DashboardRoute.fullPath
                  : AuthLoginRoute.fullPath
              }
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="animate-spin w-16 h-4" />}
              {!isLoading && isAuthenticated && "Dashboard"}
              {!isLoading && !isAuthenticated && "Get Started"}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="container overflow-hidden border-b"
          >
            <nav className="flex flex-col py-4">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  className={cn(
                    "justify-start text-sm font-medium transition-colors hover:text-primary",
                    activeCategory === category
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                  onClick={() => {
                    setActiveCategory(category);
                    setIsMenuOpen(false);
                  }}
                >
                  {category}
                </Button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="container py-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <div className="space-y-4">
            <Badge className="bg-red-500 hover:bg-red-600">Breaking</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              {newsItems[0].title}
            </h1>
            <p className="text-muted-foreground">{newsItems[0].excerpt}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{newsItems[0].author}</span>
              <span>•</span>
              <span>{newsItems[0].date}</span>
              <span>•</span>
              <span>{newsItems[0].readTime} min read</span>
            </div>
            <Button className="mt-2">Read Full Story</Button>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src={newsItems[0].image || "/placeholder.svg"}
              alt={newsItems[0].title}
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* Latest News Section */}
      <section className="bg-muted py-10">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Latest News</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {newsItems.slice(1, 4).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group relative overflow-hidden rounded-lg border bg-background shadow-sm transition-all hover:shadow-md"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {item.category}
                    </Badge>
                    <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.date}</span>
                      <span>{item.readTime} min read</span>
                    </div>
                  </div>
                  {item.isNew && (
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute left-0 top-0 bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
                    >
                      New
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="container py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
          <Button variant="link">See All</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {newsItems.slice(4, 6).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex gap-4 rounded-lg border p-4 hover:bg-muted/50"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md sm:h-32 sm:w-32">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
                {item.isNew && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute left-0 top-0 bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
                  >
                    New
                  </motion.div>
                )}
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {item.category}
                  </Badge>
                  <h3 className="mb-2 font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">
                    {item.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.date}</span>
                  <span>{item.readTime} min read</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Real-time Updates Section */}
      <section className="bg-muted py-10">
        <div className="container">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Real-time Updates
              </h2>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2,
                }}
                className="h-3 w-3 rounded-full bg-red-500"
              />
            </div>
            <Button variant="outline" size="sm">
              <Bell className="mr-2 h-4 w-4" />
              Subscribe to Alerts
            </Button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {newsItems.slice(6, 10).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border bg-background p-4",
                    item.isNew && "border-l-4 border-l-primary",
                  )}
                >
                  <div className="flex-shrink-0">
                    <Badge
                      variant={item.isNew ? "default" : "outline"}
                      className="whitespace-nowrap"
                    >
                      {formatTimeAgo(item.timestamp)}
                    </Badge>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.excerpt.substring(0, 100)}...
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    Read
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-lg bg-primary/5 p-6 md:p-10"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-3 text-2xl font-bold tracking-tight">
                Stay updated with our newsletter
              </h2>
              <p className="text-muted-foreground">
                Get the latest news delivered to your inbox. We promise not to
                spam you.
              </p>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex gap-2">
                <Input type="email" placeholder="Enter your email" />
                <Button>Subscribe</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                By subscribing, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container py-8 md:py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-medium">Overwatch</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Delivering the latest and most important news from around the
                world.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" aria-label="Twitter">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" aria-label="Facebook">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" aria-label="Instagram">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect
                      width="20"
                      height="20"
                      x="2"
                      y="2"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </Button>
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Categories</h3>
              <ul className="space-y-2 text-sm">
                {categories.map((category) => (
                  <li key={category}>
                    <Button
                      variant="link"
                      className="p-0 text-muted-foreground hover:text-foreground"
                    >
                      {category}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Button
                    variant="link"
                    className="p-0 text-muted-foreground hover:text-foreground"
                  >
                    About Us
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 text-muted-foreground hover:text-foreground"
                  >
                    Advertise
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Button
                    variant="link"
                    className="p-0 text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="p-0 text-muted-foreground hover:text-foreground"
                  >
                    Cookie Policy
                  </Button>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Overwatch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper data and functions
const categories = [
  "All",
  "Politics",
  "Business",
  "Technology",
  "Science",
  "Health",
  "Sports",
  "Entertainment",
];

const initialNewsItems = [
  {
    id: 1,
    title: "Global Summit Addresses Climate Change with New Initiatives",
    excerpt:
      "World leaders gathered to announce ambitious new targets to reduce carbon emissions and combat climate change in a historic agreement.",
    author: "Sarah Johnson",
    date: "Apr 16, 2025",
    readTime: 5,
    category: "Politics",
    image: "/placeholder.svg?height=600&width=800",
    isNew: false,
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
  },
  {
    id: 2,
    title: "Tech Giant Unveils Revolutionary AI Assistant",
    excerpt:
      "The new AI system can understand and respond to complex queries with human-like understanding, marking a significant leap in artificial intelligence.",
    author: "Michael Chen",
    date: "Apr 16, 2025",
    readTime: 4,
    category: "Technology",
    image: "/placeholder.svg?height=400&width=600",
    isNew: true,
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
  },
  {
    id: 3,
    title: "Stock Markets Reach Record Highs Amid Economic Recovery",
    excerpt:
      "Global markets surged as new economic data suggests a stronger than expected recovery from recent economic challenges.",
    author: "Jessica Williams",
    date: "Apr 16, 2025",
    readTime: 3,
    category: "Business",
    image: "/placeholder.svg?height=400&width=600",
    isNew: false,
    timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
  },
  {
    id: 4,
    title: "Breakthrough in Renewable Energy Storage Announced",
    excerpt:
      "Scientists have developed a new battery technology that could solve one of the biggest challenges in renewable energy adoption.",
    author: "David Miller",
    date: "Apr 16, 2025",
    readTime: 6,
    category: "Science",
    image: "/placeholder.svg?height=400&width=600",
    isNew: false,
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
  },
  {
    id: 5,
    title: "Major Sports League Announces Expansion Teams",
    excerpt:
      "The league will add three new franchises in the next two years, bringing the total number of teams to 36.",
    author: "Robert Thompson",
    date: "Apr 16, 2025",
    readTime: 3,
    category: "Sports",
    image: "/placeholder.svg?height=300&width=500",
    isNew: false,
    timestamp: Date.now() - 1000 * 60 * 90, // 1.5 hours ago
  },
  {
    id: 6,
    title: "New Study Reveals Benefits of Mediterranean Diet",
    excerpt:
      "Research confirms that following a Mediterranean diet can significantly reduce the risk of heart disease and improve longevity.",
    author: "Emily Parker",
    date: "Apr 16, 2025",
    readTime: 4,
    category: "Health",
    image: "/placeholder.svg?height=300&width=500",
    isNew: true,
    timestamp: Date.now() - 1000 * 60 * 20, // 20 minutes ago
  },
  {
    id: 7,
    title: "International Space Station Welcomes New Crew Members",
    excerpt:
      "Three astronauts successfully docked with the ISS, beginning a six-month mission focused on scientific research.",
    author: "James Wilson",
    date: "Apr 16, 2025",
    readTime: 5,
    category: "Science",
    isNew: false,
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
  },
  {
    id: 8,
    title: "Cryptocurrency Regulation Framework Proposed",
    excerpt:
      "Lawmakers have introduced a comprehensive bill aimed at providing clarity for digital asset markets.",
    author: "Alex Rodriguez",
    date: "Apr 16, 2025",
    readTime: 4,
    category: "Business",
    isNew: true,
    timestamp: Date.now() - 1000 * 60 * 10, // 10 minutes ago
  },
  {
    id: 9,
    title: "Award-Winning Film Director Announces New Project",
    excerpt:
      "The acclaimed filmmaker will begin production on an ambitious new series based on a bestselling novel.",
    author: "Olivia Brown",
    date: "Apr 16, 2025",
    readTime: 3,
    category: "Entertainment",
    isNew: false,
    timestamp: Date.now() - 1000 * 60 * 180, // 3 hours ago
  },
  {
    id: 10,
    title: "Global Health Organization Issues New Guidelines",
    excerpt:
      "Updated recommendations focus on preventing future pandemics through improved surveillance and response systems.",
    author: "Thomas Clark",
    date: "Apr 16, 2025",
    readTime: 6,
    category: "Health",
    isNew: true,
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
  },
];

// Generate a random news item for the real-time simulation
function generateNewsItem() {
  const categories = [
    "Politics",
    "Business",
    "Technology",
    "Science",
    "Health",
    "Sports",
    "Entertainment",
  ];
  const titles = [
    "Breaking: Major Policy Change Announced",
    "New Technology Breakthrough Changes Industry",
    "Economic Indicators Show Surprising Growth",
    "Scientific Discovery Opens New Possibilities",
    "Health Officials Update Public Guidelines",
    "Championship Match Ends With Unexpected Result",
    "Entertainment Industry Faces New Challenges",
  ];
  const authors = [
    "Sarah Johnson",
    "Michael Chen",
    "Jessica Williams",
    "David Miller",
    "Emily Parker",
    "Robert Thompson",
    "Olivia Brown",
  ];

  const randomCategory =
    categories[Math.floor(Math.random() * categories.length)];
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const randomAuthor = authors[Math.floor(Math.random() * authors.length)];

  return {
    id: Date.now(),
    title: randomTitle,
    excerpt:
      "This is a newly generated news item that simulates real-time updates on the website. The content would typically contain the latest information about this breaking story.",
    author: randomAuthor,
    date: "Apr 16, 2025",
    readTime: Math.floor(Math.random() * 5) + 2,
    category: randomCategory,
    image: `/placeholder.svg?height=${400 + Math.floor(Math.random() * 200)}&width=${600 + Math.floor(Math.random() * 200)}`,
    isNew: true,
    timestamp: Date.now(),
  };
}

// Format time ago for real-time updates
function formatTimeAgo(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  } else if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h ago`;
  } else {
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}
