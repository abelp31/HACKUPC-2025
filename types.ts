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
    originIata: string;
    maxBudget: number;
    answers: PlayerAnswer[];
}

// Represents the overall game state
export interface Game {
    id: string; // Unique game ID (e.g., "ABC123")
    questions: Question[]; // Array of questions for the game (loaded from JSON)
    currentQuestionIndex: number; // Index of the question currently being asked
    startDate: string;
    endDate: string,
    state: 'waiting' | 'playing' | 'finished'; // Current phase of the game
    players: {
        [socketId: string]: Player; // Map socket IDs to player data
    };
}



export const predefinedQuestions: Question[] = [
    {
        id: 0,
        text: "What continents are you interested in?",
        allowMultiple: true,
        options: [
            { id: 1, text: "Asia" },
            { id: 2, text: "North America" },
            { id: 3, text: "Europe" },
            { id: 4, text: "Africa" },
            { id: 5, text: "South America" },
            { id: 6, text: "Oceania" },
            { id: 7, text: "Australia" },
            { id: 8, text: "Antarctica" }
        ]
    },
    {
        id: 1, // Numeric ID
        text: "What kind of climate are you looking for?",
        allowMultiple: false,
        options: [
            { id: 101, text: "Warm and Sunny" },
            { id: 102, text: "Cool and Crisp" },
            { id: 103, text: "Moderate Temps" },
            { id: 104, text: "Snowy and Cold" },
        ]
    },
    {
        id: 2,
        text: "Which activities interest you most?",
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
    },
    // {
    //     id: 4,
    //     text: "What kind of scenery calls to you most?",
    //     allowMultiple: false,
    //     options: [
    //         { id: 401, text: "Bustling Cityscapes & Architecture" },
    //         { id: 402, text: "Sandy Coastlines & Ocean Views" },
    //         { id: 403, text: "Majestic Mountains & Forests" },
    //         { id: 404, text: "Rolling Countryside & Quaint Villages" },
    //         { id: 405, text: "Vast Deserts & Unique Landscapes" }
    //     ]
    // },
    // {
    //     id: 6,
    //     text: "How important is nightlife and evening entertainment?",
    //     allowMultiple: false,
    //     options: [
    //         { id: 601, text: "Essential! Looking for vibrant nightlife." },
    //         { id: 602, text: "Nice to have options (bars, shows)." },
    //         { id: 603, text: "Prefer quiet evenings (relaxing, early nights)." },
    //         { id: 604, text: "Depends on the place, but not a priority." }
    //     ]
    // },
    // {
    //     id: 7,
    //     text: "What's your tolerance for travel time *to* the destination?",
    //     allowMultiple: false,
    //     options: [
    //         { id: 701, text: "Short haul preferred (under 4-5 hours)" },
    //         { id: 702, text: "Medium haul is okay (up to 8-10 hours)" },
    //         { id: 703, text: "Long haul is fine, worth it for the right place!" },
    //         { id: 704, text: "Distance doesn't matter at all." }
    //     ]
    // },
    // {
    //     id: 8,
    //     text: "How adventurous are you feeling for activities?",
    //     allowMultiple: false,
    //     options: [
    //         { id: 801, text: "Thrill-seeker (bungee, rafting, extreme sports)" },
    //         { id: 802, text: "Moderate adventure (zip-lining, kayaking, challenging hikes)" },
    //         { id: 803, text: "Gentle exploration (easy walks, cycling, boat trips)" },
    //         { id: 804, text: "Mostly relaxing (minimal physical exertion needed)" }
    //     ]
    // },
    // {
    //     id: 9,
    //     text: "What role does food play in your ideal trip? (Select one)",
    //     allowMultiple: false,
    //     options: [
    //         { id: 901, text: "It's THE main event! Culinary destination." },
    //         { id: 902, text: "A key highlight - love trying local specialties." },
    //         { id: 903, text: "Nice to have good food, but not a focus." },
    //         { id: 904, text: "Just need fuel - fine with simple/convenient." }
    //     ]
    // },
    // {
    //     id: 10,
    //     text: "How important is interacting with local culture?",
    //     allowMultiple: false,
    //     options: [
    //         { id: 1001, text: "Very important - want authentic immersion." },
    //         { id: 1002, text: "Quite important - enjoy museums, markets, local interactions." },
    //         { id: 1003, text: "Somewhat important - happy to observe." },
    //         { id: 1004, text: "Not a priority - more focused on scenery/relaxation." }
    //     ]
    // },
    // {
    //     id: 11,
    //     text: "What's your preferred accommodation style?",
    //     allowMultiple: true,
    //     options: [
    //         { id: 1101, text: "Standard Hotel Chain (predictable comfort)" },
    //         { id: 1102, text: "Boutique Hotel (unique character)" },
    //         { id: 1103, text: "Hostel/Guesthouse (budget-friendly, social)" },
    //         { id: 1104, text: "Airbnb/Vacation Rental (local feel, space)" },
    //         { id: 1105, text: "Luxury Resort (all amenities included)" },
    //         { id: 1106, text: "Unique Stay (treehouse, boat, yurt etc.)" }
    //     ]
    // },
    // {
    //     id: 12,
    //     text: "How much 'off-the-grid' are you willing to be?",
    //     allowMultiple: false,
    //     options: [
    //         { id: 1201, text: "Need reliable Wi-Fi and connectivity." },
    //         { id: 1202, text: "Okay with spotty internet, can disconnect." },
    //         { id: 1203, text: "Happy to be completely disconnected for a while." },
    //         { id: 1204, text: "Doesn't matter either way." }
    //     ]
    // }
];