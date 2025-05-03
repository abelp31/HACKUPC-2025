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

interface InitialDestinationSuggestion {
    cityName: string;
    iataCode: string;
}

// Structure for checking individual player flights
interface FlightCheck {
    socketId: string; // Use socketId for unique player identification
    playerOriginIata: string;
    playerBudget: number;
    destinationIata: string;
    cityName: string; // Carry suggestion data along
}

// Result structure for each flight check (without error flag)
interface FlightCheckResult extends FlightCheck {
    flightInfo: { precio: number; escala: number }[] | null; // Result from obtenerVuelos
    isAffordable: boolean;
    // Removed 'error' flag
}

// Updated DestinationData interface to include iataCode
interface DestinationData {
    destinationName: string; // With emoji flag
    destinationNameNoEmoji: string; // Without emoji flag
    iataCode: string; // Added IATA code
    goodReasons: string[];
    badReasons: string[];
    features: string[];
    countryIsoCode: string;
    bestSeason: string;
    imageUrl: string | undefined; // Optional image URL
};

// Interface for the personalized recommendation sent to each player
interface PersonalizedDestinationData extends DestinationData {
    playerFlightInfo?: { // Make optional in case flight info is missing
        price: number;
        stops: number;
    } | null; // Use null to indicate no flight found for this player specifically
    isAffordableForPlayer: boolean; // Explicitly state if affordable for *this* player
}


/**
 * Processes the results of a finished game, aggregates answers,
 * gets personalized recommendations and flight info, and emits results to each player.
 * NOTE: Removed error handling (try/catch blocks). Errors in async operations
 * (Gemini, flights, image fetching) will likely cause this function to crash.
 * @param game The finished Game object.
 */
export async function processGameResults(game: Game) {
    console.log(`Processing results for finished game: ${game.id}`);
    const playerCount = Object.keys(game.players).length;
    let aggregatedResults: { [questionId: number]: { questionText: string, options: { [optionId: number]: { optionText: string, count: number } } } } = {};
    // Removed errorProcessing variable

    if (playerCount === 0) {
        console.log("No players in the game, skipping result processing.");
        return;
    }

    // 1. Aggregate Answers (same as before)
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

    // 2. Format Aggregated Data for Prompt (same as before)
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
    console.log("Formatted answers for prompt:", formattedAnswers);

    // 3. Construct Shared Prompt Base (same as before)
    const sharedPrompt = `
We asked ${playerCount} friends the following questions to choose a travel destination, and these were the aggregated results of their choices:
${formattedAnswers}
`;

    // 4. Get Initial Suggestions from Gemini (No try/catch)
    console.log(`Sending initial prompt to Gemini for game ${game.id}...`);
    const firstPrompt = `
${sharedPrompt}

Based *only* on these preferences, suggest a list of up to 10 travel destinations (cities only, no countries).
For each destination, return the following JSON format:
- cityName: The name of the city (e.g., "Barcelona")
- iataCode: The IATA code of the most important airport near the city (e.g., "BCN")
`;
    const initialResult = await genAI.models.generateContent({
        model: "gemini-1.5-flash", // Or your preferred model
        contents: firstPrompt,
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
            }
        }
    });

    // Safely access the response text - if it's empty/invalid JSON, JSON.parse will throw an error
    const initialResponseText = initialResult.text!;
    if (!initialResponseText) {
        // If Gemini gives no text, throw an error which will halt processing.
        throw new Error("Gemini API returned an empty response for initial suggestions.");
    }
    const initialSuggestions = JSON.parse(initialResponseText) as InitialDestinationSuggestion[];

    console.log(`--- Gemini Initial Suggestions for Game ${game.id} ---`);
    console.log(initialSuggestions);
    console.log(`-------------------------------------------------`);

    if (initialSuggestions.length === 0) {
        console.log(`Gemini returned no initial suggestions for game ${game.id}. Halting processing.`);
        // Emit a simple message to the whole game room and stop
        socketServer.to(game.id).emit('gameFinished', {
            players: game.players,
            aggregatedResults: aggregatedResults,
            recommendations: [],
            message: "AI could not suggest any destinations based on the preferences." // Use message instead of error
        });
        return;
    }


    // 5. Filter Destinations Based on Player Budgets and Get Flight Details (No try/catch)
    const filterResult = await filterMatchedCriterias(game, initialSuggestions);
    const { finalDestinations, validFlightResults } = filterResult;

    if (finalDestinations.length === 0) {
        console.log(`No destinations were affordable for all players in game ${game.id}. Halting processing.`);
        // Emit message to the whole game room and stop
        socketServer.to(game.id).emit('gameFinished', {
            players: game.players,
            aggregatedResults: aggregatedResults,
            recommendations: [],
            message: "No suggested destinations fit within everyone's budget." // Use message
        });
        return;
    }


    // 6. Generate Detailed Destination Data from Gemini for the *Valid* Destinations (No try/catch)
    console.log(`Generating detailed data for ${finalDestinations.length} valid destinations...`);
    let detailedDestinations = await generateFinalData(sharedPrompt, finalDestinations);
    console.log("Detailed Destination Data Received:", detailedDestinations);

    // Add images (No try/catch)
    detailedDestinations = await fillImages(detailedDestinations);
    console.log("Destination Data with Images:", detailedDestinations);


    // 7. Prepare and Emit Personalized Results to Each Player
    console.log(`Preparing and emitting personalized results for game ${game.id}`);

    // Create a map of detailed destinations by IATA code for quick lookup
    const detailedDestinationsMap = new Map<string, DestinationData>();
    detailedDestinations.forEach(dest => {
        if (dest.iataCode) {
            detailedDestinationsMap.set(dest.iataCode, dest);
        } else {
            console.warn(`Destination ${dest.destinationNameNoEmoji} is missing IATA code in detailed data. Skipping map entry.`);
        }
    });


    // Create a map of flight results by socketId and destinationIata for quick lookup
    const flightResultsMap = new Map<string, Map<string, FlightCheckResult>>();
    validFlightResults.forEach(result => {
        if (!flightResultsMap.has(result.socketId)) {
            flightResultsMap.set(result.socketId, new Map<string, FlightCheckResult>());
        }
        flightResultsMap.get(result.socketId)!.set(result.destinationIata, result);
    });

    // This loop remains the same - emitting personalized data to each player
    for (const socketId in game.players) {
        const player = game.players[socketId];
        const playerFlightResults = flightResultsMap.get(socketId) || new Map<string, FlightCheckResult>();

        const personalizedRecommendations: PersonalizedDestinationData[] = [];

        finalDestinations.forEach(validDest => {
            const baseDetails = detailedDestinationsMap.get(validDest.iataCode);
            if (!baseDetails) {
                console.warn(`Could not find detailed data for valid destination ${validDest.cityName} (${validDest.iataCode}). Skipping for player ${socketId}.`);
                return;
            }

            const playerSpecificFlightResult = playerFlightResults.get(validDest.iataCode);

            let playerFlightInfo: PersonalizedDestinationData['playerFlightInfo'] = null;
            let isAffordableForPlayer = false;

            if (playerSpecificFlightResult) {
                // Check flightInfo directly; 'error' flag is removed
                if (playerSpecificFlightResult.flightInfo && playerSpecificFlightResult.flightInfo.length > 0) {
                    playerFlightInfo = {
                        price: playerSpecificFlightResult.flightInfo[0].precio,
                        stops: playerSpecificFlightResult.flightInfo[0].escala
                    };
                    isAffordableForPlayer = playerSpecificFlightResult.isAffordable;
                    console.log(`Flight info found for player ${socketId} to ${validDest.iataCode}: Price ${playerFlightInfo.price}, Affordable: ${isAffordableForPlayer}`);
                } else {
                    // Flight info was null or empty (no flights found by API)
                    playerFlightInfo = null;
                    isAffordableForPlayer = false;
                    console.log(`No flight info array found for player ${socketId} to ${validDest.iataCode}`);
                }
            } else {
                // This case implies the flight check didn't run or wasn't mapped correctly,
                // which shouldn't happen with the current logic but handled defensively.
                console.warn(`Missing flight result for player ${socketId} and destination ${validDest.iataCode}`);
                playerFlightInfo = null;
                isAffordableForPlayer = false;
            }

            personalizedRecommendations.push({
                ...baseDetails,
                playerFlightInfo: playerFlightInfo,
                isAffordableForPlayer: isAffordableForPlayer,
            });
        });

        // Construct the final payload for this specific player
        const playerFinalPayload = {
            players: game.players,
            aggregatedResults: aggregatedResults,
            recommendations: personalizedRecommendations,
            // Removed 'error' field
        };

        console.log(`Emitting final results to player ${player.name} (Socket ID: ${socketId})`);
        socketServer.to(socketId).emit('gameFinished', playerFinalPayload); // Emit personalized payload to individual socket
    }

    // Optional: Clean up the game from memory after processing
    // delete games[game.id]; // Or use games.delete(game.id) if it's a Map
    console.log(`Game ${game.id} processing complete. Consider removing from memory.`);
}


/**
 * Fetches images for destinations. Errors during fetching will propagate.
 * @param destinations Array of DestinationData objects.
 * @returns Promise resolving to the array with imageUrl populated.
 */
const fillImages = async (destinations: DestinationData[]): Promise<DestinationData[]> => {
    console.log(`Attempting to fill images for ${destinations.length} destinations.`);
    const promises = destinations.map(async (destination) => {
        if (destination.imageUrl) {
            return destination;
        }
        if (!destination.destinationNameNoEmoji) {
            console.warn("Destination missing name for image search, using placeholder:", destination);
            // Return with placeholder directly, don't attempt fetch
            return { ...destination, imageUrl: "https://placehold.co/600x400/eee/ccc?text=Missing+Name" };
        }

        // Try Wikipedia first - if getWikipediaImage throws, the Promise.all will reject
        // No try/catch here.
        console.log(`Attempting Wiki image for ${destination.destinationNameNoEmoji}`);
        const wikiImageUrl = await getWikipediaImage(destination.destinationNameNoEmoji);
        console.log(`Got Wiki image for ${destination.destinationNameNoEmoji}`);
        return { ...destination, imageUrl: wikiImageUrl };

        // Removed fallback logic (Unsplash/placeholder) as the primary fetch
        // will now halt execution on error if not caught higher up.
        // If you *need* fallbacks even without try/catch, you'd have to structure
        // getWikipediaImage itself to return null/undefined on error instead of throwing.
    });

    // If any promise in 'promises' rejects, Promise.all will reject.
    return await Promise.all(promises);
};


/**
 * Filters destination suggestions based on whether *all* players can afford the flight.
 * Fetches flight information concurrently. Errors in flight fetching will propagate.
 *
 * @param game The game object containing players, dates.
 * @param suggestions An array of potential destination suggestions {cityName, iataCode}.
 * @returns A promise resolving with an object containing:
 * - finalDestinations: An array of destinations affordable by *all* players.
 * - validFlightResults: An array of FlightCheckResult for *all* checks made for the *finalDestinations*.
 */
const filterMatchedCriterias = async (
    game: Game,
    suggestions: InitialDestinationSuggestion[]
): Promise<{ finalDestinations: InitialDestinationSuggestion[], validFlightResults: FlightCheckResult[] }> => {

    const originDestinationCache = new Map<string, Promise<FlightCheckResult>>();

    // 1. Create a list of all unique flight checks needed
    const flightChecks: FlightCheck[] = [];
    for (const socketId in game.players) {
        const player = game.players[socketId];
        for (const suggestion of suggestions) {
            if (player.originIata !== suggestion.iataCode) {
                flightChecks.push({
                    socketId: socketId,
                    playerOriginIata: player.originIata,
                    playerBudget: player.maxBudget,
                    destinationIata: suggestion.iataCode,
                    cityName: suggestion.cityName
                });
            }
        }
    }

    // 2. Create and cache Promises for each unique flight check
    console.log(`Initiating ${flightChecks.length} flight checks (some might be cached)...`);
    const flightPromises: Promise<FlightCheckResult>[] = flightChecks.map(check => {
        const cacheKey = `${check.socketId}-${check.destinationIata}`;

        if (originDestinationCache.has(cacheKey)) {
            return originDestinationCache.get(cacheKey)!;
        }

        const promise = (async (): Promise<FlightCheckResult> => {
            // No try/catch around obtenerVuelos. If it throws, this promise rejects.
            // console.log(`Calling obtenerVuelos for ${check.socketId} to ${check.destinationIata}`, { playerOriginIata: check.playerOriginIata, destinationIata: check.destinationIata, startDate: game.startDate, endDate: game.endDate });
            const flightInfo = await obtenerVuelos(check.playerOriginIata, check.destinationIata, game.startDate, game.endDate);

            const isAffordable = flightInfo !== null && flightInfo.length > 0 && flightInfo[0].precio <= check.playerBudget;

            return {
                ...check,
                flightInfo: flightInfo,
                isAffordable: isAffordable,
                // No 'error' field needed
            };
        })();

        originDestinationCache.set(cacheKey, promise);
        return promise;
    });


    // 3. Execute all promises in parallel. If any rejects, Promise.all rejects.
    const allFlightResults = await Promise.all(flightPromises);
    console.log("All flight checks completed.");

    // 4. Determine which destinations are invalid for *any* player
    const invalidDestinationIatas = new Set<string>();
    const resultsByDestination = new Map<string, FlightCheckResult[]>();

    allFlightResults.forEach(result => {
        if (!resultsByDestination.has(result.destinationIata)) {
            resultsByDestination.set(result.destinationIata, []);
        }
        resultsByDestination.get(result.destinationIata)!.push(result);
    });

    for (const [destinationIata, results] of resultsByDestination.entries()) {
        // A destination is invalid if *any* player's check resulted in isAffordable being false
        const isInvalid = results.some(r => !r.isAffordable);
        if (isInvalid) {
            invalidDestinationIatas.add(destinationIata);
            const firstInvalidResult = results.find(r => !r.isAffordable)!;
            const reason = (firstInvalidResult.flightInfo && firstInvalidResult.flightInfo.length > 0)
                ? `Unaffordable (Price: ${firstInvalidResult.flightInfo[0].precio}, Budget: ${firstInvalidResult.playerBudget})`
                : 'No flight info/empty result';
            console.log(`Marking destination ${destinationIata} (${firstInvalidResult.cityName}) as invalid due to player ${firstInvalidResult.socketId}. Reason: ${reason}`);
        }
    }

    // 5. Filter the original suggestions list
    const finalDestinations = suggestions.filter(suggestion =>
        !invalidDestinationIatas.has(suggestion.iataCode)
    );

    // 6. Filter the flight results to only include those for the final valid destinations
    const validFlightResults = allFlightResults.filter(result =>
        finalDestinations.some(fd => fd.iataCode === result.destinationIata)
    );


    console.log(`Initial suggestions: ${suggestions.length}, Final valid destinations: ${finalDestinations.length}`);
    return { finalDestinations, validFlightResults };
}


/**
 * Generates detailed data for a list of destinations using Gemini. Errors will propagate.
 * @param sharedPrompt The base prompt with aggregated answers.
 * @param destinations List of destinations {cityName, iataCode} to get details for.
 * @returns Promise resolving to an array of DestinationData.
 */
const generateFinalData = async (sharedPrompt: string, destinations: InitialDestinationSuggestion[]): Promise<DestinationData[]> => {

    if (destinations.length === 0) {
        console.log("generateFinalData called with empty destinations list.");
        return []; // Return empty if no destinations provided
    }

    const finalPrompt = `
${sharedPrompt}

We have filtered the list down to ${destinations.length} potential city destinations that fit the criteria (like budget).

The valid destinations are: ${destinations.map(d => `${d.cityName} (${d.iataCode})`).join(", ")}.

Now, for each of these valid city destinations, provide detailed information in the following JSON format. Ensure the 'iataCode' matches the input for each city:
- destinationName: The name of the destination (city name). Add the emoji flag of the country at the start of the name if available.
- destinationNameNoEmoji: The name of the destination (city name) without the emoji flag.
- iataCode: The IATA code of the city's main airport (must match the input list).
- goodReasons: A short list of 5 elements about why this destination is a good fit for the group based on the shared preferences.
- badReasons: A short list of up to 5 potential drawbacks (e.g., safety concerns, visa issues, political climate, mismatch with preferences). Be objective.
- features: A list of 5-7 key features/attractions (e.g., 🏖️ Beach, 🏛️ Historical Sites, 🍜 Local Cuisine). Start each with a relevant emoji. Highlight unique aspects.
- countryIsoCode: The ISO 3166-1 alpha-2 code of the country (e.g., "ES" for Spain).
- bestSeason: The generally recommended best season to visit (e.g., "Summer", "Autumn", "Spring", "Winter", or "Year-round"). Single word or hyphenated.
`;

    const result = await genAI.models.generateContent({
        model: "gemini-1.5-flash", // Or your preferred model
        contents: finalPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        destinationName: { type: Type.STRING },
                        destinationNameNoEmoji: { type: Type.STRING },
                        iataCode: { type: Type.STRING }, // Ensure IATA code is required in the response
                        goodReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                        badReasons: { type: Type.ARRAY, items: { type: Type.STRING } },
                        features: { type: Type.ARRAY, items: { type: Type.STRING } },
                        countryIsoCode: { type: Type.STRING },
                        bestSeason: { type: Type.STRING },
                    },
                    required: ["destinationName", "destinationNameNoEmoji", "iataCode", "goodReasons", "badReasons", "features", "countryIsoCode", "bestSeason"],
                }
            }
        }

    });

    const responseText = result.text!;
    if (!responseText) {
        throw new Error("Gemini API returned an empty response for final destination details.");
    }
    // If JSON.parse fails, it will throw, halting execution.
    const finalData = JSON.parse(responseText) as DestinationData[];

    // Optional validation: Check if the returned data matches the requested IATA codes
    const returnedIatas = new Set(finalData.map(d => d.iataCode));
    const requestedIatas = new Set(destinations.map(d => d.iataCode));
    if (returnedIatas.size !== requestedIatas.size || !destinations.every(d => returnedIatas.has(d.iataCode))) {
        console.warn("Mismatch between requested IATA codes and Gemini response IATA codes in final data.");
        // Decide how to handle: proceed with potentially incomplete/incorrect data, or throw an error?
        // For now, just log a warning.
    }


    return finalData;
}