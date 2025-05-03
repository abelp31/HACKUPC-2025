import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyD3Ith9cA7WcL-rlxFmWtUSaWTAWkyfax4" });

export async function generateContent() {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Explain how AI works in a few words",
    });
    console.log(response.text);
    return response;
}