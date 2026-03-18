import { supabase } from './supabase';

export interface DestinationStat {
    name: string;
    count: number;
    slug: string;
    image: string;
}

export const fetchDestinationStats = async (): Promise<DestinationStat[]> => {
    // 1. Get all published listings with their destination and primary image
    const { data: listings, error } = await supabase
        .from('listings')
        .select(`
      destination,
      listing_images(url, is_primary, created_at)
    `)
        .eq('status', 'published');

    if (error) {
        console.error('Error fetching destination stats:', error);
        return [];
    }

    // 2. Group by destination
    const statsMap: Record<string, { count: number; latestImage: string; latestDate: string }> = {};

    listings.forEach((listing) => {
        const dest = listing.destination;
        const primaryImg = listing.listing_images?.find((img: any) => img.is_primary) || listing.listing_images?.[0];
        const imgUrl = primaryImg?.url || 'https://images.unsplash.com/photo-1512918766675-ed406e3c7432?w=800&fit=crop';
        const imgDate = primaryImg?.created_at || '';

        if (!statsMap[dest]) {
            statsMap[dest] = { count: 1, latestImage: imgUrl, latestDate: imgDate };
        } else {
            statsMap[dest].count += 1;
            // If this listing's image is newer, update the latestImage
            if (imgDate > statsMap[dest].latestDate) {
                statsMap[dest].latestImage = imgUrl;
                statsMap[dest].latestDate = imgDate;
            }
        }
    });

    // 3. Transform to array
    return Object.entries(statsMap).map(([slug, data]) => ({
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        count: data.count,
        slug: slug,
        image: data.latestImage
    }));
};

export const fetchAmenityStats = async (): Promise<Record<string, number>> => {
    const { data, error } = await supabase
        .from('listings')
        .select('amenities')
        .eq('status', 'published');

    if (error) {
        console.error('Error fetching amenity stats:', error);
        return {};
    }

    const amenityCounts: Record<string, number> = {};
    data.forEach((listing) => {
        listing.amenities?.forEach((amenity: string) => {
            amenityCounts[amenity] = (amenityCounts[amenity] || 0) + 1;
        });
    });

    return amenityCounts;
};
