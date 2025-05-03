import { GoogleGenAI, Type } from "@google/genai";
import { io } from "./main";
import { Game } from "./types";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("FATAL ERROR: GEMINI_API_KEY environment variable is not set. AI suggestions cannot function.");
    process.exit(1); // Exit if the key is mandatory
}

// Initialize the SDK directly
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
console.log("Google AI SDK initialized.");

interface Destination {
    destinationName: string;
    reasoning: string;
    features: string[];
    countryIsoCode: string;
}

/**
 * Processes the results of a finished game, aggregates answers,
 * constructs a prompt for Gemini, and calls the API.
 * @param game The finished Game object.
 */
export async function processGameResults(game: Game) {
    console.log(`Processing results for finished game: ${game.id}`);
    const playerCount = Object.keys(game.players).length;
    let suggestions: any[] = []; // Default empty suggestions
    let aggregatedResults: { [questionId: number]: { questionText: string, options: { [optionId: number]: { optionText: string, count: number } } } } = {};
    let errorProcessing = null; // Store potential processing errors

    try {
        if (playerCount === 0) {
            console.log("No players in the game, skipping result processing.");
            io.to(game.id).emit('gameFinished', {
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

        console.log(`Players: ${JSON.stringify(game.players)}`);

        // 2. Format Aggregated Data for Prompt
        let formattedAnswers = "";
        for (const qId in aggregatedResults) {
            const questionResult = aggregatedResults[qId];
            formattedAnswers += `\nQuestion: "${questionResult.questionText}"\n`;
            let hasVotes = false;
            for (const optId in questionResult.options) {
                const optionResult = questionResult.options[optId];
                if (optionResult.count > 0) {
                    formattedAnswers += `  - "${optionResult.optionText}": ${optionResult.count} vote(s)\n`;
                    hasVotes = true;
                }
            }
            if (!hasVotes) {
                formattedAnswers += "  (No votes recorded for this question's options)\n";
            }
        }

        // 3. Construct Prompt
        const sharedPrompt = `
We asked ${playerCount} friends the following questions to choose a travel destination, and these were the aggregated results of their choices:
${formattedAnswers}
`

        const prompt = `
${sharedPrompt}

Based *only* on these preferences, suggest a list of 15 travel destinations (countries only!!!).
For each destination, return the following:
- iso country code (ISO 3166-1 alpha-2)
- country name
`;

        console.log(`--- Generated Prompt for Game ${game.id} ---`);
        // console.log(prompt); // Keep commented out unless debugging prompts
        console.log(`-----------------------------------------`);

        // 4. Call Gemini API (Assume 'model' is initialized)
        try {
            console.log(`Sending prompt to Gemini for game ${game.id}...`);

            // Call generateContent without safetySettings
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
                                isoCountry: { type: Type.STRING },
                                countryName: { type: Type.STRING },
                            },
                            required: ["isoCountry", "countryName"],
                        }
                    },
                }
            });
            suggestions = JSON.parse(result.text!) as Destination[];

            console.log(`--- Gemini Response Raw Text for Game ${game.id} ---`);
            console.log(suggestions);
            console.log(`-------------------------------------------------`);


            // const finalDestinationsThatMatchCriteria = await filterWithConstraints(Object.values(game.players), suggestions.map(dest => dest.isoCountry), game.month);
            const finalDestinationsThatMatchCriteria = suggestions.map(dest => dest.isoCountry);
            console.log(`Final destinations that match criteria: ${finalDestinationsThatMatchCriteria}`);

            const data = await generateFinalData(sharedPrompt, finalDestinationsThatMatchCriteria);

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
        suggestions: suggestions as any[], // Cast to any[] to avoid TypeScript errors
    };
    if (errorProcessing) {
        finalPayload.error = errorProcessing; // Include error message if any occurred
    }
    io.to(game.id).emit('gameFinished', finalPayload);

    // Optional: Clean up the game from memory after processing
    // games.delete(game.id);
    // console.log(`Game ${game.id} removed from memory.`);
}

const generateFinalData = async (sharedPrompt: string, destinations: string[]) => {
    const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `
${sharedPrompt}

We have a list of ${destinations.length} isoCodes of available travel destinations.

For each destination, return the following:
- destinationName: The name of the destination (country). Add the emoji flag of the country at the start of the name if available.
- reasoning: A short explanation of why this destination is a good fit for the group. Make sure to include the most relevant features based on the aggregated answers.
- features: A list of features that make this destination appealing (e.g., "beach", "mountains", "historical sites"). Include an emoji in  the start of each feature. Make sure to be distinctive and not repeat the same features for different destinations.
- countryIsoCode: The ISO code of the country where the destination is located (e.g., "FR" for France)
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        destinationName: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        features: { type: Type.ARRAY, items: { type: Type.STRING } },
                        countryIsoCode: { type: Type.STRING },
                    },
                    required: ["destinationName", "reasoning", "features", "countryIsoCode"],
                }
            },
        }
    });
    return JSON.parse(result.text!) as { destinationName: string, reasoning: string, features: string[], countryIsoCode: string }[];
}