const { GoogleGenAI } = require('@google/genai');

async function generateExplanation(monument, site, language, level) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        const prompt = `
You are a heritage information assistant for Bagalkot district, Karnataka.

STRICT RULES:
1. Answer using ONLY the heritage evidence provided below.
2. If the evidence does not contain information to answer something, say: "This information is not available in our heritage records."
3. Do NOT invent dates, ruler names, architectural classifications, or historical events.
4. Do NOT add information beyond what is in the evidence.

HERITAGE EVIDENCE:
Site: ${JSON.stringify(site)}
Monument: ${JSON.stringify(monument)}

LANGUAGE: ${language}
EXPLANATION LEVEL: ${level}

Generate a heritage explanation in the following JSON format:
{
  "what_am_i_looking_at": "...",
  "why_is_it_important": "...",
  "historical_context": "...",
  "architectural_features": "...",
  "what_to_observe": "...",
  "interesting_fact": "..."
}

Level descriptions:
- quick: 2-3 sentences total. Simple language.
- tourist: 1-2 short paragraphs per section. Engaging, accessible.
- student: Detailed paragraphs with proper terminology.
- detailed: Comprehensive explanation with architectural and historical depth.

Respond in ${language} language.
Return ONLY the JSON, no additional text.
`;

        const ai = new GoogleGenAI({ apiKey });
        
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Gemini explanation generation timed out")), 7000)
        );

        const responsePromise = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt
        });

        const response = await Promise.race([responsePromise, timeoutPromise]);
        let jsonStr = response.text.trim();
        
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
        else if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3);
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        
        return JSON.parse(jsonStr.trim());
    } catch (error) {
        console.error("Explanation Generation Error:", error.message || error);
        return null;
    }
}

async function generateFollowUp(question, monument, site, previousContext, language) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        const prompt = `
You are a heritage information assistant answering follow-up questions.

STRICT RULES:
1. Answer using ONLY the heritage evidence provided below.
2. Do NOT invent information.

HERITAGE EVIDENCE:
Site: ${JSON.stringify(site)}
Monument: ${JSON.stringify(monument)}

PREVIOUS CONTEXT: ${JSON.stringify(previousContext)}
LANGUAGE: ${language}
QUESTION: ${question}

Return a JSON object:
{
  "answer": "..."
}
`;

        const ai = new GoogleGenAI({ apiKey });
        
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Gemini follow-up generation timed out")), 6000)
        );

        const responsePromise = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt
        });

        const response = await Promise.race([responsePromise, timeoutPromise]);
        let jsonStr = response.text.trim();
        
        if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
        else if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3);
        if (jsonStr.endsWith('```')) jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        
        return JSON.parse(jsonStr.trim());
    } catch (error) {
        console.error("Follow-up Generation Error:", error.message || error);
        return { answer: "Sorry, I am unable to answer that right now." };
    }
}

module.exports = {
    generateExplanation,
    generateFollowUp
};
