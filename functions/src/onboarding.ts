import * as functions from "firebase-functions";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
// NOTE: Make sure to set GEMINI_API_KEY in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const MODEL_NAME = "gemini-1.5-flash"; // Fast and efficient for chat

const SYSTEM_INSTRUCTION = `
You are a friendly, student-like onboarding assistant for "AssignMate".
Your goal is to build an academic profile for the student by asking 5-7 reflective questions.

CORE RULES:
1. Tone: Casual, encouraging, peer-to-peer (no stiff corporate speak).
2. DO NOT ask all questions at once. Ask ONE question at a time.
3. NEVER generate academic answers, code, or solutions. If asked, politely decline and redirect to the profile.
4. Security: Never ask for passwords or API keys.

QUESTIONS TO COVER (Adapt the order based on flow):
- Subjects they are confident explaining (Strengths)
- Subjects they struggle with (Weaknesses)
- Academic interests (e.g. AI, Web Dev, Exams)
- Helping style (Explaining, debugging, resources)
- Project experience (Brief description)
- Current focus/Year

WHEN TO FINISH:
- When you have enough info for a profile (approx 5-7 turns), end the conversation.
- To finish, your last message MUST look like this EXACT JSON format (no markdown code blocks, just raw JSON):
{
  "strengths": ["..."],
  "weaknesses": ["..."],
  "interests": ["..."],
  "collaboration_styles": ["..."],
  "project_experience": [{"title": "...", "domain": "...", "role": "..."}],
  "experience_level": "Beginner" | "Intermediate" | "Advanced",
  "bio_summary": "Short 1-2 sentence bio based on chat"
}
`;

export const processOnboardingChat = functions.runWith({ secrets: ["GEMINI_API_KEY"] }).https.onCall(async (data: { history?: { role: string, text: string }[], message?: string }, context: functions.https.CallableContext) => {
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");
    }

    const history = data.history || []; // Array of { role: 'user' | 'model', parts: [{ text: '...' }] }
    const userMsg = data.message; // Current user message (string)

    try {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: SYSTEM_INSTRUCTION }]
                },
                {
                    role: "model",
                    parts: [{ text: "Got it! I'm ready to help the student build their profile. I'll keep it friendly and ask one question at a time." }]
                },
                ...history.map((msg: any) => ({
                    role: msg.role === 'ai' ? 'model' : 'user', // Map 'ai' to 'model' if needed
                    parts: [{ text: msg.text }]
                }))
            ],
            generationConfig: {
                maxOutputTokens: 500,
            }
        });

        const result = await chat.sendMessage(userMsg || "Hi, I'm ready to start.");
        const responseText = result.response.text();

        // Check for JSON completion
        let profileData = null;
        let replyText = responseText;
        let isComplete = false;

        // Simple heuristic to detect if the model output the JSON block
        if (responseText.trim().startsWith("{") && responseText.includes("strengths")) {
            try {
                // Try to parse the JSON
                profileData = JSON.parse(responseText);
                isComplete = true;
                replyText = "Thanks! I've built your profile based on our chat.";
            } catch (e) {
                console.error("Failed to parse JSON profile:", e);
                // Fallback: Ask model to try again or just continue
            }
        }

        return {
            reply: replyText,
            isComplete,
            profileData
        };

    } catch (error: any) {
        console.error("Gemini Error:", error);
        throw new functions.https.HttpsError("internal", "AI processing failed. Please try again.");
    }
});
