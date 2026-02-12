import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini with the specific Agent Key
const genAI = new GoogleGenerativeAI(process.env.Agent_Gemini_Key);

const systemInstruction = `
You are the "Nexor Navigator AI Agent", a professional and helpful career assistant.
Your goal is to help users with:
1. Skill Gap Analysis
2. Role Mapping and Career Paths
3. Upskilling Recommendations

Tone: Professional, encouraging, and precise.
If you don't know the answer or if the query is outside your scope (e.g., general chit-chat, unrelated topics), politely steer the user back to career navigation or say you don't have that information.
`;

export async function POST(req) {
    try {
        const { query, history } = await req.json();
        const apiKey = process.env.Agent_Gemini_Key;

        if (!apiKey) {
            console.error("Agent_Gemini_Key is missing in environment variables.");
            return NextResponse.json({ error: "Agent_Gemini_Key not configured" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey.trim());

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            systemInstruction: systemInstruction
        });

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(query);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ response: text });

    } catch (error) {
        console.error("Agent API Error:", error);
        return NextResponse.json(
            { error: "Failed to process your request." },
            { status: 500 }
        );
    }
}
