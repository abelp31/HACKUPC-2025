// Represents a single choice for a question
export interface Option {
    id: number; // Unique NUMERIC ID for this option within the question
    text: string; // Text displayed to the user
}

// Represents a single question in the game
export interface Question {
    id: number; // Unique NUMERIC ID for this question
    text: string; // The question text
    options: Option[]; // Array of possible options for this question
    allowMultiple: boolean; // Whether the user can select more than one option
}

// Represents a player's submitted answer for a single question
export interface PlayerAnswer {
    questionId: number; // NUMERIC ID of the question being answered
    selectedOptionIds: number[]; // Array of NUMERIC IDs of the options the player chose
    timestamp: number; // When the answer was submitted
}

// Represents the state of a player in the game
export interface Player {
    name: string;
    originCountry: string;
    answers: PlayerAnswer[]; // Array of answers submitted by the player
}

// Represents the overall game state
export interface Game {
    id: string; // Unique game ID (e.g., "ABC123")
    questions: Question[]; // Array of questions for the game (loaded from JSON)
    currentQuestionIndex: number; // Index of the question currently being asked
    state: 'waiting' | 'playing' | 'finished'; // Current phase of the game
    players: {
        [socketId: string]: Player; // Map socket IDs to player data
    };
}



export const predefinedQuestions: Question[] = [
    {
        id: 1, // Numeric ID
        text: "What kind of climate are you looking for?",
        allowMultiple: false,
        options: [
            { id: 101, text: "Warm and Sunny" }, // Numeric IDs for options
            { id: 102, text: "Cool and Crisp" },
            { id: 103, text: "Moderate Temps" },
            { id: 104, text: "Snowy and Cold" },
        ]
    },
    {
        id: 2,
        text: "Which activities interest you most? (Select up to 2)",
        allowMultiple: true,
        options: [
            { id: 201, text: "Relaxing on a beach" },
            { id: 202, text: "Hiking in mountains" },
            { id: 203, text: "Exploring historical sites" },
            { id: 204, text: "Trying local cuisine" },
            { id: 205, text: "Shopping" },
        ]
    },
    {
        id: 3,
        text: "What's your preferred travel pace?",
        allowMultiple: false,
        options: [
            { id: 301, text: "Fast-paced, see as much as possible" },
            { id: 302, text: "Relaxed, take it easy" },
            { id: 303, text: "A mix of both" },
        ]
    }
];