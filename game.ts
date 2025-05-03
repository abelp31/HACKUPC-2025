import { GoogleGenAI } from "@google/genai";
import { io } from "./main";
import { Game } from "./types";
import { LIMITED_COUNTRIES } from "./countries";
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
    let suggestions = []; // Default empty suggestions
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
        const prompt = `
We asked ${playerCount} friends the following questions to choose a travel destination, and these were the aggregated results of their choices:
${formattedAnswers}

You can only return countries within Europe and in the following list:
${LIMITED_COUNTRIES.join(", ")}

Based *only* on these preferences, suggest a list of 5 specific travel destinations (city or specific region/park). For each destination, briefly explain why it matches the group's preferences according to the answers provided. Return the suggestions *only* as a valid JSON array, where each object has 'destination' (string) and 'reasoning' (string) properties. Do not include any other text, markdown formatting (like \`\`\`json), or explanations outside the JSON structure. Example format: [{"destination": "City, Country", "reasoning": "Explanation..."}, ...]
`;

        console.log(`--- Generated Prompt for Game ${game.id} ---`);
        // console.log(prompt); // Keep commented out unless debugging prompts
        console.log(`-----------------------------------------`);

        // 4. Call Gemini API (Assume 'model' is initialized)
        try {
            console.log(`Sending prompt to Gemini for game ${game.id}...`);
            // REMOVED safetySettings constant declaration

            // Call generateContent without safetySettings
            const result = await genAI.models.generateContent({
                model: "gemini-2.0-flash",
                contents: prompt,
            });
            const text = result.text!;

            console.log(`--- Gemini Response Raw Text for Game ${game.id} ---`);
            console.log(text);
            console.log(`-------------------------------------------------`);

            // Attempt to parse the JSON response
            try {
                const cleanedText = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
                suggestions = JSON.parse(cleanedText);
                if (!Array.isArray(suggestions) || !suggestions.every(item => item && typeof item.destination === 'string' && typeof item.reasoning === 'string')) {
                    console.error("Gemini response was not a valid JSON array with the expected structure.");
                    suggestions = [];
                    errorProcessing = "AI response format was invalid.";
                } else {
                    console.log("Successfully parsed suggestions from Gemini.");
                }
            } catch (parseError) {
                console.error("Failed to parse Gemini response as JSON:", parseError);
                suggestions = [];
                errorProcessing = "Could not parse AI suggestions.";
            }

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
        suggestions: suggestions
    };
    if (errorProcessing) {
        finalPayload.error = errorProcessing; // Include error message if any occurred
    }
    io.to(game.id).emit('gameFinished', finalPayload);

    // Optional: Clean up the game from memory after processing
    // games.delete(game.id);
    // console.log(`Game ${game.id} removed from memory.`);
}