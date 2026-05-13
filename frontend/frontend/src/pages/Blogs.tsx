import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import SEO from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/utils/structuredData";

type Blog = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string | null;
  publishDate: string | Date;
  author: string;
};

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group" data-testid={`blog-card-${blog.id}`}>
      <div className="aspect-video relative overflow-hidden">
        <img
          src={blog.imageUrl || "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3"}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      </div>

      <CardHeader>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span data-testid={`date-${blog.id}`}>
              {new Date(blog.publishDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span data-testid={`author-${blog.id}`}>{blog.author}</span>
          </div>
        </div>
        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors" data-testid={`title-${blog.id}`}>
          {blog.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-3" data-testid={`excerpt-${blog.id}`}>
          {blog.excerpt}
        </p>

        <Link href={`/blogs/${blog.id}`}>
          <Button 
            variant="outline" 
            className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
            data-testid={`button-read-more-${blog.id}`}
          >
            Read More
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function BlogSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader>
        <div className="flex gap-4 mb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function Blogs() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: blogs = [], isLoading } = useQuery<Blog[]>({
    queryKey: ["/api/blogs"],
  });

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredBlog = blogs[0];
  const otherBlogs = filteredBlogs.slice(searchTerm ? 0 : 1);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blogs", url: "/blogs" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        pageKey="blogs"
        structuredData={[breadcrumbSchema]}
      />
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="page-title">
            Our Blog
          </h1>
          <p className="text-xl opacity-90 leading-relaxed max-w-3xl mx-auto" data-testid="page-description">
            Stay updated with our latest news, stories of impact, and insights from the field. 
            Read about the communities we serve and the difference your support makes.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-16">
        {/* Search */}
        <section className="mb-12">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search blog posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>
        </section>

        {/* Featured Blog */}
        {!searchTerm && featuredBlog && !isLoading && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Featured Post</h2>
            <Card className="overflow-hidden hover:shadow-xl transition-shadow" data-testid="featured-blog">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="aspect-video lg:aspect-auto">
                  <img
                    src={featuredBlog.imageUrl || "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3"}
                    alt={featuredBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span data-testid="featured-date">
                        {new Date(featuredBlog.publishDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span data-testid="featured-author">{featuredBlog.author}</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4" data-testid="featured-title">
                    {featuredBlog.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 line-clamp-4" data-testid="featured-excerpt">
                    {featuredBlog.excerpt}
                  </p>
                  <Link href={`/blogs/${featuredBlog.id}`}>
                    <Button className="btn-primary" data-testid="button-featured-read-more">
                      Read Full Post
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Blog Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              {searchTerm ? `Search Results (${filteredBlogs.length})` : "Recent Posts"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="blogs-grid">
            {isLoading ? (
              Array.from({ length: 6 }, (_, i) => <BlogSkeleton key={i} />)
            ) : filteredBlogs.length > 0 ? (
              otherBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))
            ) : (
              <div className="col-span-full text-center py-16" data-testid="empty-blogs-state">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  {searchTerm ? "No Posts Found" : "No Blog Posts Available"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "Try adjusting your search terms or browse all posts."
                    : "Blog posts will appear here as they are published."
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm("")}
                    className="mt-4"
                    data-testid="button-clear-search"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-16">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-lg opacity-90 mb-6">
                Subscribe to our newsletter to receive the latest updates and stories directly in your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input 
                  placeholder="Enter your email"
                  className="bg-white text-foreground"
                  data-testid="input-newsletter-email"
                />
                <Button 
                  variant="secondary"
                  className="bg-white text-primary hover:bg-gray-100"
                  data-testid="button-subscribe"
                >
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
