import { GoogleGenAI, Type } from "@google/genai";
import { getUnsplashImages, getWikipediaImage } from "./unsplash";
import { socketServer } from "./main";
import { Game, Player } from "./types";
const { obtenerVuelos } = require("./flights.js");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set. AI suggestions cannot function.");
    process.exit(1); // Exit if the key is mandatory
}

// Initialize the SDK directly
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
console.log("Google AI SDK initialized.");

/**
 * Processes the results of a finished game, aggregates answers,
 * constructs a prompt for Gemini, and calls the API.
 * @param game The finished Game object.
 */
export async function processGameResults(game: Game) {
    console.log(`Processing results for finished game: ${game.id}`);
    const playerCount = Object.keys(game.players).length;
    let recommendations: DestinationData[] = []; // Default empty recommendations
    let aggregatedResults: { [questionId: number]: { questionText: string, options: { [optionId: number]: { optionText: string, count: number } } } } = {};
    let errorProcessing = null; // Store potential processing errors

    try {
        if (playerCount === 0) {
            console.log("No players in the game, skipping result processing.");
            socketServer.to(game.id).emit('gameFinished', {
                players: game.players,
                aggregatedResults: {},
                suggestions: [],
                message: "Game finished, but no players participated."
            });
            return;
        }

        // 1. Aggregate Answers
        game.questions.forEach(q => {
            aggregatedResults[q.id] = { questionText: q.text, options: {} };
            q.options.forEach(opt => {
                aggregatedResults[q.id].options[opt.id] = { optionText: opt.text, count: 0 };
            });
        });
        for (const socketId in game.players) {
            const player = game.players[socketId];
            player.answers.forEach(answer => {
                if (aggregatedResults[answer.questionId]) {
                    answer.selectedOptionIds.forEach(optionId => {
                        if (aggregatedResults[answer.questionId].options[optionId]) {
                            aggregatedResults[answer.questionId].options[optionId].count++;
                        }
                    });
                }
            });
        }

        // 2. Format Aggregated Data for Prompt
        let formattedAnswers = "";
        for (const qId in aggregatedResults) {
            const questionResult = aggregatedResults[qId];
            formattedAnswers += `\nQuestion: "${questionResult.questionText}"\n`;
            let hasVotes = false;
            for (const optId in questionResult.options) {
                const optionResult = questionResult.options[optId];
                if (optionResult.count > 0) {
                    formattedAnswers += `  - "${optionResult.optionText}": ${optionResult.count} votes\n`;
                    hasVotes = true;
                }
            }
            if (!hasVotes) {
                formattedAnswers += "  (No votes)\n";
            }
        }

        // 3. Construct Prompt
        const sharedPrompt = `
We asked ${playerCount} friends the following questions to choose a travel destination, and these were the aggregated results of their choices:
${formattedAnswers}
`

        const prompt = `
${sharedPrompt}

Based *only* on these preferences, suggest a list of 15 travel destinations (cities only, no countries).
For each destination, return the following:
- cityName: The name of the city (e.g., "Barcelona")
- iataCode: The IATA code of the most important airport near the city (e.g., "BCN")
`;

        console.log(`--- Generated Prompt for Game ${game.id} ---`);
        console.log(`-----------------------------------------`);

        try {
            console.log(`Sending prompt to Gemini for game ${game.id}...`);

            const result = await genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                cityName: { type: Type.STRING },
                                iataCode: { type: Type.STRING },
                            },
                            required: ["cityName", "iataCode"],
                        }
                    },
                }
            });
            const firstRoundSuggestions = JSON.parse(result.text!) as { cityName: string, iataCode: string }[];

            console.log(`--- Gemini Response Raw Text for Game ${game.id} ---`);
            console.log(firstRoundSuggestions);
            console.log(`-------------------------------------------------`);

            const destinationsThatMatchPlayerCriterias = await filterMatchedCriterias(game, firstRoundSuggestions);

            recommendations = await generateFinalData(sharedPrompt, destinationsThatMatchPlayerCriterias);
            console.log("FINAL DATA: ", recommendations);

        } catch (apiError) {
            console.error(`Error calling Gemini API for game ${game.id}:`, apiError);
            errorProcessing = 'Could not generate AI suggestions due to an API error.';
        }

    } catch (processingError) {
        console.error(`Error during game result processing (before API call) for game ${game.id}:`, processingError);
        errorProcessing = "An internal error occurred while processing results.";
    }




    // 5. Emit Final Results
    console.log(`Emitting final results for game ${game.id}`);
    const finalPayload: any = {
        players: game.players,
        aggregatedResults: aggregatedResults,
        recommendations: (await fillImages(recommendations)) as any, // Cast to any[] to avoid TypeScript errors
    };
    if (errorProcessing) {
        finalPayload.error = errorProcessing; // Include error message if any occurred
    }
    socketServer.to(game.id).emit('gameFinished', finalPayload);

    // Optional: Clean up the game from memory after processing
    // games.delete(game.id);
    // console.log(`Game ${game.id} removed from memory.`);
}

const fillImages = async (destinations: DestinationData[]): Promise<DestinationData[]> => {
    // 1. Create an array of promises
    const promises = destinations.map(async (destination) => {
        // If the image URL already exists, return the destination object as is.
        if (destination.imageUrl) {
            // No async operation needed, return the original object directly.
            // Promise.resolve() is implicitly handled by async function return.
            return destination;
        } else {
            // If the image URL is missing, fetch it.
            try {
                const imageUrl = await getWikipediaImage(destination.destinationName);
                return { ...destination, imageUrl: imageUrl };
            } catch (error) {
                console.error(`Failed to fetch image for ${destination.destinationName}:`, error);
                return { ...destination, imageUrl: "https://http.cat/images/202.jpg" };
            }
        }
    });

    return await Promise.all(promises);
};

/**
 * Filters destination suggestions based on whether all players can afford the flight within their budget.
 * Uses Promise.all to fetch flight information concurrently.
 *
 * @param {Game} game - The game object containing players and dates.
 * @param {DestinationSuggestion[]} suggestions - An array of potential destination suggestions.
 * @returns {Promise<DestinationSuggestion[]>} A promise that resolves with the filtered list of destinations.
 */
const filterMatchedCriterias = async (game: Game, suggestions: { cityName: string, iataCode: string }[]) => {

    // 1. Create a list of all flight checks needed (Player x Suggestion)
    const flightChecks = [];
    for (const player of Object.values(game.players)) {
        for (const suggestion of suggestions) {
            flightChecks.push({
                playerId: player.name, // Keep track for logging/debugging
                playerOriginIata: player.originIata,
                playerBudget: player.maxBudget,
                destinationIata: suggestion.iataCode,
                cityName: suggestion.cityName // Carry suggestion data along
            });
        }
    }

    // 2. Create an array of Promises for each flight check
    const flightPromises = flightChecks.map(check => {
        return obtenerVuelos(check.playerOriginIata, check.destinationIata, game.startDate, game.endDate)
            .then((flightInfo: any) => ({
                ...check, // Include original check data
                flightInfo: flightInfo, // Add the result
                isAffordable: flightInfo && flightInfo.length > 0 && flightInfo[0].precio <= check.playerBudget,
                error: false
            }))
            .catch((error: any) => {
                console.error(`Error fetching flight for ${check.playerId} (${check.playerOriginIata} to ${check.destinationIata}):`, error);
                // Treat errors as if the flight is not available/affordable
                return {
                    ...check,
                    flightInfo: null,
                    isAffordable: false,
                    error: true // Mark that an error occurred
                };
            });
    });

    // 3. Execute all promises in parallel
    console.log(`Starting ${flightPromises.length} parallel flight checks...`);
    const flightResults = await Promise.all(flightPromises);
    console.log("All flight checks completed.");

    // 4. Determine which destinations are invalid for *any* player
    const invalidDestinationIatas = new Set<string>();
    for (const result of flightResults) {
        if (!result.isAffordable) {
            // If a flight is not affordable (or errored/missing) for even one player,
            // the destination is invalid for the group.
            if (!invalidDestinationIatas.has(result.destinationIata)) {
                console.log(`Marking destination ${result.destinationIata} as invalid due to player ${result.playerId}. Reason: ${result.error ? 'API Error' : (result.flightInfo && result.flightInfo.length > 0 ? `Unaffordable (Price: ${result.flightInfo[0].precio}, Budget: ${result.playerBudget})` : 'No flight info')}`);
                invalidDestinationIatas.add(result.destinationIata);
            }
        }
    }

    // 5. Filter the original suggestions list
    const finalDestinations = suggestions.filter(suggestion =>
        !invalidDestinationIatas.has(suggestion.iataCode)
    );

    console.log(`Initial suggestions: ${suggestions.length}, Final valid destinations: ${finalDestinations.length}`);
    return finalDestinations;
}

interface DestinationData {
    destinationName: string,
    goodReasons: string[],
    badReasons: string[],
    features: string[],
    countryIsoCode: string,
    bestSeason: string
    imageUrl: string | undefined
};

const generateFinalData = async (sharedPrompt: string, destinations: { cityName: string, iataCode: string }[]): Promise<DestinationData[]> => {
    const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `
${sharedPrompt}

We have a list of ${destinations.length} city names, and their corresponding IATA codes so you can reference proximity, available travel destinations.

The destinations are: ${destinations.map(d => `${d.cityName} (${d.iataCode})`).join(", ")}.

Now, for each city destination, return the following:
- destinationName: The name of the destination (city name). Add the emoji flag of the country at the start of the name if available.
- goodReasons: A short list of 5 elements about why this destination is a good fit for the group. Make sure to include the most relevant features based on the aggregated answers.
- badReasons: A short list of 5 elements about why this destination might not be the best choice (e.g: anti lgbt laws, robbery, political situation, recent conflicts, difficult visa requirements, etc). Take into account, if needed, the answers of the different questions.
- features: A list of features that make this destination appealing (e.g: beach, mountains, historical sites, local cuisine, shopping, etc). Include an emoji in  the start of each feature. Highlight the unique or defining features of each destination compared to the others on the list.
- countryIsoCode: The ISO code of the country where the destination is located (e.g., "FR" for France)
- bestSeason: The best season to visit this destination (e.g., "Summer", "Winter", "Spring", "Autumn"). This is a single word.
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        destinationName: { type: Type.STRING },
                        goodReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                        badReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                        features: { type: Type.ARRAY, items: { type: Type.STRING } },
                        countryIsoCode: { type: Type.STRING },
                        bestSeason: { type: Type.STRING },
                    },
                    required: ["destinationName", "goodReasons", "badReasons", "features", "countryIsoCode", "bestSeason"],
                }
            },
        }
    });
    return JSON.parse(result.text!) as DestinationData[];
}