const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

const cache = new Map<string, string>();

export const getUnsplashImages = async (query: string) => {
    if (cache.has(query)) {
        return cache.get(query);
    }

    const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&page=1&per_page=1&orientation=landscape`, {
        method: 'GET',
        headers: {
            "Authorization": `Client-ID ${UNSPLASH_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        console.error("Error fetching Unsplash images:", response.statusText);
        return [];
    }
    const data = await response.json();

    const imageUrl = data.results[0]?.urls?.regular || "https://http.cat/images/202.jpg";
    cache.set(query, imageUrl);

    return imageUrl;
}

export const getWikipediaImage = async (query: string) => {
    if (cache.has(query)) {
        return cache.get(query);
    }

    //  Query https://en.wikipedia.org/w/api.php?action=query&titles=Kyoto&prop=pageimages&format=json&pithumbsize=1024
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${query}&prop=pageimages&format=json&pithumbsize=1024`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        console.error("Error fetching Wikipedia images:", response.statusText);
        return [];
    }
    const data = await response.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];

    const imageUrl = pages[pageId]?.thumbnail?.source || "https://http.cat/images/202.jpg";
    cache.set(query, imageUrl);

    return imageUrl;
}