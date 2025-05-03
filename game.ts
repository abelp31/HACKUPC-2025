import { GoogleGenAI, Type } from "@google/genai";
import { socketServer } from "./main";
import { Game } from "./types";
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
            const suggestions = JSON.parse(result.text!) as { cityName: string, iataCode: string }[];

            console.log(`--- Gemini Response Raw Text for Game ${game.id} ---`);
            console.log(suggestions);
            console.log(`-------------------------------------------------`);
            /* TODO: iataOrigen, iataDesti, preuMaxim, dataInici, dataFinal */

            recommendations = await generateFinalData(sharedPrompt, suggestions);
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
        recommendations, // Cast to any[] to avoid TypeScript errors
    };
    if (errorProcessing) {
        finalPayload.error = errorProcessing; // Include error message if any occurred
    }
    socketServer.to(game.id).emit('gameFinished', finalPayload);

    // Optional: Clean up the game from memory after processing
    // games.delete(game.id);
    // console.log(`Game ${game.id} removed from memory.`);
}

interface DestinationData {
    destinationName: string,
    goodReasons: string[],
    badReasons: string[],
    features: string[],
    countryIsoCode: string,
    bestSeason: string
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