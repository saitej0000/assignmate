import { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to init Firebase safely
const initFirebase = () => {
    if (getApps().length) return;

    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        if (!privateKey) throw new Error("Missing FIREBASE_PRIVATE_KEY");

        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
    } catch (e) {
        console.error("Firebase Init Error:", e);
        throw e; // Re-throw to be caught in handler
    }
};

if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = "gemini-1.5-flash-001";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 0. Init Firebase
    try {
        initFirebase();
    } catch (error: any) {
        return res.status(500).json({ error: `Server Init Failed: ${error.message}` });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 1. Verify Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        // Use verified Auth instance
        await getAuth().verifyIdToken(idToken);
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // 2. Process Chat
    const { history = [], message } = req.body;

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
                    role: msg.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                }))
            ],
        });

        const result = await chat.sendMessage(message || "Hi, I'm ready to start.");
        const responseText = result.response.text();

        // 3. Parse Response
        let profileData = null;
        let replyText = responseText;
        let isComplete = false;

        if (responseText.trim().startsWith("{") && responseText.includes("strengths")) {
            try {
                profileData = JSON.parse(responseText);
                isComplete = true;
                replyText = "Thanks! I've built your profile based on our chat.";
            } catch (e) {
                console.error("Failed to parse JSON profile:", e);
            }
        }

        return res.status(200).json({
            reply: replyText,
            isComplete,
            profileData
        });

    } catch (error: any) {
        console.error("Gemini Error:", error);
        const msg = error.message || 'AI processing failed';
        return res.status(500).json({ error: msg });
    }
}
