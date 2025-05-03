const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

export const getUnsplashImages = async (query: string) => {
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
    return data.results[0]?.urls?.regular || "https://http.cat/images/202.jpg";
}

export const getWikipediaImage = async (query: string) => {
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
    return pages[pageId]?.thumbnail?.source || "https://http.cat/images/202.jpg";
}