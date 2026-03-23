// Safe global access
declare const __GEMINI_API_KEY__: string | undefined;

const env = (import.meta as any).env || {};
const API_KEY = env.VITE_GEMINI_API_KEY || (typeof __GEMINI_API_KEY__ !== 'undefined' ? __GEMINI_API_KEY__ : '') || '';

export const ai = {
    // ... verified existing code ...
    verifyIdCard: async (file: File): Promise<{ verified: boolean; confidence: number; reason: string }> => {
        if (!API_KEY) {
            console.warn("Gemini API Key missing");
            return { verified: false, confidence: 0, reason: "API Key Missing" };
        }

        try {
            // ... existing implementation ...
            const base64Data = await fileToGenerativePart(file);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: "Analyze this image. Is this a valid Indian Student ID Card? Return JSON with keys: 'is_valid' (boolean), 'confidence' (0-1), and 'reason' (string). Be strict. Look for College Name, Student Name, and Photo." },
                                { inline_data: { mime_type: file.type, data: base64Data } }
                            ]
                        }]
                    })
                }
            );

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) throw new Error("No response from AI");

            const jsonStr = text.replace(/```json|```/g, '').trim();
            const result = JSON.parse(jsonStr);

            return {
                verified: result.is_valid && result.confidence > 0.85,
                confidence: result.confidence,
                reason: result.reason
            };
        } catch (e) {
            console.error("AI Verification Failed", e);
            return { verified: false, confidence: 0, reason: "Analysis Failed" };
        }
    },

    onboardingChat: async (history: { role: 'user' | 'model'; parts: { text: string }[] }[]) => {
        const cleanKey = API_KEY ? API_KEY.trim() : '';
        if (!cleanKey) {
            console.warn("Gemini API Key missing (onboardingChat)");
            return { text: "Error: API Key Missing in Configuration. Please check Vercel Env Vars." };
        }

        const systemPrompt = `
SYSTEM ROLE:
You are an AI onboarding assistant for AssignMate, a campus-based student community platform.

CRITICAL CONSTRAINTS (DO NOT VIOLATE):
- Do NOT modify any existing application logic, UI components, APIs, or database schemas.
- Do NOT trigger any redirects, reloads, or state changes outside the onboarding module.
- Do NOT access or reference other system features.
- Do NOT generate academic answers, solutions, code, or assignment content.
- Do NOT rank, judge, or test the user.
- Only operate inside the onboarding conversation context.

PURPOSE:
Your sole task is to help the user reflect on their academic strengths, weaknesses, interests, and collaboration style,
and convert their own responses into structured profile metadata.

This onboarding is OPTIONAL, SAFE, and EDITABLE later by the user.

TONE & BEHAVIOR:
- Friendly, student-like, and encouraging
- Short and clear questions
- Never authoritative or evaluative
- No technical jargon
- No pressure language

ONBOARDING FLOW (STRICT ORDER):

STEP 1 – INTRODUCTION
Say:
"Hi! I’ll ask you a few quick questions to help build your academic profile.
This helps others understand how to collaborate with you.
You can skip or edit anything later."

WAIT FOR USER CONFIRMATION.

STEP 2 – STRENGTHS
Ask:
"Which subjects or topics do you feel confident helping others with?"

WAIT FOR USER RESPONSE.

STEP 3 – WEAKNESSES
Ask:
"Which subjects or topics do you usually find challenging or want to improve?"

WAIT FOR USER RESPONSE.

STEP 4 – PROJECT EXPERIENCE
Ask:
"Have you worked on any academic or personal projects? If yes, briefly describe what you worked on."

WAIT FOR USER RESPONSE.

STEP 5 – COLLABORATION STYLE
Ask:
"How do you usually help friends? (For example: explaining concepts, debugging, brainstorming ideas, sharing resources)"

WAIT FOR USER RESPONSE.

STEP 6 – CURRENT INTERESTS
Ask:
"What are you currently interested in learning or working on?"

WAIT FOR USER RESPONSE.

DATA PROCESSING RULES:
- Only extract information explicitly provided by the user.
- Do NOT infer grades, intelligence, or performance.
- If information is unclear, leave it empty.
- Be conservative in interpretation.

STRUCTURED OUTPUT FORMAT (INTERNAL ONLY):
Convert the conversation into structured JSON using ONLY the user's answers.

Format:
{
  "strengths": [],
  "weaknesses": [],
  "interests": [],
  "collaboration_style": [],
  "project_experience": [],
  "experience_level": "Beginner | Intermediate | Advanced | Unspecified"
}

Rules:
- Do not invent data
- Be conservative
- Leave fields empty if unclear
- Output JSON only

FINAL MESSAGE TO USER:
"Redirecting to your new profile... 🚀"
`;

        try {
            let response;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    console.log(`🤖 Call AI (Attempt ${attempts + 1}/${maxAttempts}): using Key ending in ...${cleanKey.slice(-4)}`);

                    response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${cleanKey}`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                system_instruction: {
                                    parts: [{ text: systemPrompt }]
                                },
                                contents: history,
                                generationConfig: {
                                    temperature: 0.7,
                                    maxOutputTokens: 500,
                                },
                                safetySettings: [
                                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
                                ]
                            })
                        }
                    );

                    if (response.status === 429) {
                        attempts++;
                        if (attempts === maxAttempts) break; // Final attempt failed, let it fall through to error handling

                        const waitTime = 2000 * Math.pow(2, attempts); // 4s, 8s
                        console.warn(`⏳ Rate Limited (429). Retrying in ${waitTime / 1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }

                    if (!response.ok) {
                        const errorBody = await response.text();
                        console.error(`❌ AI Error: ${response.status} ${response.statusText}`, errorBody);
                        throw new Error(`AI API HTTP ${response.status}: ${errorBody}`);
                    }

                    // If successful, break loop
                    break;
                } catch (err: any) {
                    if (attempts === maxAttempts - 1) throw err; // Throw on last attempt
                    attempts++;
                }
            }

            if (!response || !response.ok) {
                // If we exited loop without success (e.g. valid 429 on last try)
                const errorBody = await response?.text() || "Unknown Error";
                throw new Error(`AI API Failed after ${maxAttempts} attempts. Status: ${response?.status || 'Unknown'}.`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                console.warn("⚠️ AI returned empty text. Full Response:", JSON.stringify(data, null, 2));
                throw new Error(`No response from AI (Finish Reason: ${data.candidates?.[0]?.finishReason || 'Unknown'})`);
            }

            return { text };
        } catch (e: any) {
            console.error("AI Chat Failed", e);
            let userMessage = "Sorry, I'm having trouble connecting.";

            // If 404, try to list available models to help debug
            if (e.message.includes('404')) {
                userMessage += " (Model not found). Checking available models...";
                try {
                    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
                    const listData = await listResp.json();
                    console.log("📜 Available Models for this Key:", listData);
                    if (listData.models) {
                        const modelNames = listData.models.map((m: any) => m.name.replace('models/', ''));
                        console.warn("👉 Try using one of these:", modelNames.join(', '));
                    }
                } catch (listErr) {
                    console.error("Failed to list models", listErr);
                }
            } else if (e.message.includes('400')) {
                userMessage += " (Invalid Request)";
            } else if (e.message.includes('403')) {
                userMessage += " (Key Rejected)";
            }

            return { text: userMessage + " Please check console for details or try manually." };
        }
    }
};

async function fileToGenerativePart(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove data url prefix (e.g. "data:image/jpeg;base64,")
            resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
