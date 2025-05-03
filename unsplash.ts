const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;

const cache = new Map<string, string>();

export const getUnsplashImages = async (query: string) => {
    query = removeEmoji(query);

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
    query = removeEmoji(query);

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

const removeEmoji = (str: string) => {
    const emojiRegex = /^\p{Extended_Pictographic}(?:\p{Emoji_Modifier}|\u{FE0F}|\u{200D}\p{Extended_Pictographic})*/u;

    if (emojiRegex.test(str)) {
        // If it does, replace the matched emoji sequence with an empty string
        // The result of replace is guaranteed to be a string here.
        return str.replace(emojiRegex, '').trimStart(); // Also trim leading whitespace that might follow emoji
    } else {
        // If it doesn't start with an emoji, return the original string
        return str;
    }
}
