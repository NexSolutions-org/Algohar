import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Calendar, User, ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import SEO from "@/components/SEO";
import { generateArticleSchema, generateBreadcrumbSchema } from "@/utils/structuredData";
import { SEO_CONFIG } from "@/config/seo.config";

type Blog = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string | null;
  publishDate: string | Date;
  author: string;
};

export default function BlogDetail() {
  const params = useParams();
  const blogId = params.id;

  const { data: blog, isLoading, error } = useQuery<Blog>({
    queryKey: ["/api/blogs", blogId],
    enabled: !!blogId,
  });

  const { data: allBlogs = [] } = useQuery<Blog[]>({
    queryKey: ["/api/blogs"],
  });

  const relatedBlogs = allBlogs
    .filter(b => b.id !== blogId)
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: blog?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Could add a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="aspect-video w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Blog Post Not Found</h1>
            <p className="text-muted-foreground mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link href="/blogs">
              <Button data-testid="button-back-to-blogs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Generate structured data for the blog article
  const articleSchema = blog ? generateArticleSchema({
    title: blog.title,
    description: blog.excerpt,
    image: blog.imageUrl || undefined,
    author: blog.author,
    publishedTime: new Date(blog.publishDate).toISOString(),
    modifiedTime: new Date(blog.publishDate).toISOString(),
    url: `/blogs/${blog.id}`,
  }) : null;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blogs", url: "/blogs" },
    { name: blog?.title || "Blog Post", url: `/blogs/${blogId}` },
  ]);

  const structuredData = articleSchema ? [articleSchema, breadcrumbSchema] : [breadcrumbSchema];

  return (
    <div className="min-h-screen bg-background">
      {blog && (
        <SEO
          title={blog.title}
          description={blog.excerpt}
          image={blog.imageUrl ? `${SEO_CONFIG.domain}${blog.imageUrl}` : undefined}
          type="article"
          publishedTime={new Date(blog.publishDate).toISOString()}
          modifiedTime={new Date(blog.publishDate).toISOString()}
          author={blog.author}
          structuredData={structuredData}
        />
      )}
      <div className="container mx-auto max-w-4xl px-4 py-16">
        {/* Back Button */}
        <Link href="/blogs">
          <Button variant="ghost" className="mb-8" data-testid="button-back-to-blogs">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
        </Link>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6" data-testid="blog-title">
              {blog.title}
            </h1>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span data-testid="blog-date">
                    {new Date(blog.publishDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span data-testid="blog-author">{blog.author}</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShare}
                data-testid="button-share"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {blog.imageUrl && (
              <div className="aspect-video mb-8">
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none" data-testid="blog-content">
            <div className="text-xl text-muted-foreground mb-8 font-medium leading-relaxed">
              {blog.excerpt}
            </div>
            
            <Separator className="my-8" />
            
            <div className="text-foreground leading-relaxed whitespace-pre-line">
              {blog.content}
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Related Posts</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Card key={relatedBlog.id} className="hover:shadow-lg transition-shadow" data-testid={`related-blog-${relatedBlog.id}`}>
                  <div className="aspect-video">
                    <img
                      src={relatedBlog.imageUrl || "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3"}
                      alt={relatedBlog.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg" data-testid={`related-title-${relatedBlog.id}`}>
                      {relatedBlog.title}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {new Date(relatedBlog.publishDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2 mb-4" data-testid={`related-excerpt-${relatedBlog.id}`}>
                      {relatedBlog.excerpt}
                    </p>
                    <Link href={`/blogs/${relatedBlog.id}`}>
                      <Button variant="outline" size="sm" className="w-full" data-testid={`button-read-related-${relatedBlog.id}`}>
                        Read More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="mt-16">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Support Our Mission</h3>
              <p className="text-lg opacity-90 mb-6">
                Help us continue our work and create more stories of positive impact in communities across Pakistan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/donate/ration">
                  <Button 
                    variant="secondary"
                    className="bg-white text-primary hover:bg-gray-100"
                    data-testid="button-donate-cta"
                  >
                    Donate Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button 
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-primary"
                    data-testid="button-contact-cta"
                  >
                    Get Involved
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
