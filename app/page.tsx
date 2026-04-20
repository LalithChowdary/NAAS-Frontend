import HeroSection from '../components/home/HeroSection';
import CategoriesSection from '../components/home/CategoriesSection';
import FeaturedPublications from '../components/home/FeaturedPublications';
import FeaturesSection from '../components/home/FeaturesSection';

// Adjust this URL to match your Spring Boot backend port and endpoint
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getPublications(search?: string) {
  try {
    // The backend's public endpoint currently ignores the search param, 
    // so we just fetch all ACTIVE publications and filter on the frontend.
    const url = `${BACKEND_API_URL}/api/publications`;

    const res = await fetch(url, { 
      next: { revalidate: 60 } // Incrementally regenerate cache every 60 seconds
    });
    
    if (!res.ok) {
      console.warn(`Failed to fetch: ${res.status} ${res.statusText}`);
      return [];
    }
    
    let data: any[] = await res.json();
    
    // Fallback client/server-side filter for robustness
    if (search) {
      const lowerQuery = search.toLowerCase();
      data = data.filter(pub => pub.name.toLowerCase().includes(lowerQuery));
    }
    
    return data;
  } catch (error) {
    console.error("Failed to fetch publications. Backend might be down:", error);
    return []; // Graceful fallback to empty state UI
  }
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ search?: string }> | { search?: string } }) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams === 'object' && 'search' in resolvedParams ? resolvedParams.search : undefined;
  const publications = await getPublications(search);

  return (
    <div className="min-h-screen bg-[#FBFBFD] pt-12 pb-24">
      <FeaturedPublications publications={publications} />
    </div>
  );
}
