import { useEffect } from "react";
import { useLocation } from "wouter";

// SEO titles for admin pages
const adminPageTitles: Record<string, string> = {
  "/admin/dashboard": "Admin Dashboard | Al Gohar Foundation",
  "/admin/users": "User Management | Admin Panel | Al Gohar Foundation",
  "/admin/donations": "Donations Management | Admin Panel | Al Gohar Foundation",
  "/admin/payments": "Payments Management | Admin Panel | Al Gohar Foundation",
  "/admin/settings": "Admin Settings | Al Gohar Foundation",
  "/admin/projects": "Projects Management | Admin Panel | Al Gohar Foundation",
  "/admin/blogs": "Blogs Management | Admin Panel | Al Gohar Foundation",
  "/admin/reports": "Reports & Analytics | Admin Panel | Al Gohar Foundation",
  "/admin/media": "Media Library | Admin Panel | Al Gohar Foundation",
  "/admin/messages": "Messages | Admin Panel | Al Gohar Foundation",
  "/admin/login": "Admin Login | Al Gohar Foundation",
};

// SEO titles for user pages
const userPageTitles: Record<string, string> = {
  "/user/dashboard": "Dashboard | My Account | Al Gohar Foundation",
  "/user/donate-now": "Donate Now | My Account | Al Gohar Foundation",
  "/user/my-donations": "My Donations | My Account | Al Gohar Foundation",
  "/user/payments": "Payment History | My Account | Al Gohar Foundation",
  "/user/settings": "Account Settings | My Account | Al Gohar Foundation",
};

// Default title
const defaultTitle = "Al Gohar Foundation";

/**
 * Custom hook to manage SEO document titles based on the current route
 * @param titleMap - Map of routes to SEO titles
 * @param defaultTitle - Default title to use if route is not found
 */
export function useSEOTitle(
  titleMap: Record<string, string> = {},
  fallbackTitle: string = defaultTitle
) {
  const [location] = useLocation();

  useEffect(() => {
    // Find matching title from the title map
    let pageTitle = fallbackTitle;

    // Check for exact match first
    if (titleMap[location]) {
      pageTitle = titleMap[location];
    } else {
      // Check for route prefix matches (for nested routes)
      for (const [path, title] of Object.entries(titleMap)) {
        if (location.startsWith(path)) {
          pageTitle = title;
          break;
        }
      }
    }

    // Set document title
    document.title = pageTitle;

    // Optional: Also set meta description if needed
    // This can be extended to set meta tags as well
  }, [location, titleMap, fallbackTitle]);
}

/**
 * Hook specifically for admin pages
 */
export function useAdminSEOTitle() {
  useSEOTitle(adminPageTitles, "Admin Panel | Al Gohar Foundation");
}

/**
 * Hook specifically for user pages
 */
export function useUserSEOTitle() {
  useSEOTitle(userPageTitles, "My Account | Al Gohar Foundation");
}





