import HeroSection from '../components/home/HeroSection';
import CategoriesSection from '../components/home/CategoriesSection';
import FeaturedPublications from '../components/home/FeaturedPublications';
import FeaturesSection from '../components/home/FeaturesSection';

// Adjust this URL to match your Spring Boot backend port and endpoint
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getPublications() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/api/publications`, { 
      next: { revalidate: 60 } // Incrementally regenerate cache every 60 seconds
    });
    
    if (!res.ok) {
      console.warn(`Failed to fetch: ${res.status} ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch publications. Backend might be down:", error);
    return []; // Graceful fallback to empty state UI
  }
}

export default async function HomePage() {
  const publications = await getPublications();

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedPublications publications={publications} />
      <FeaturesSection />
    </>
  );
}
