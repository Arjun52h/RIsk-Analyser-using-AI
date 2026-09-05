import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function testGemini() {

    try {

        console.log("🤖 Testing Gemini...");

        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: "Reply with exactly: RiskPilot Gemini test successful"
        });

        console.log("");
        console.log("Gemini response:");
        console.log(response.text);
        console.log("");

    } catch (error) {

        console.error("");
        console.error("❌ Gemini test failed:");
        console.error(error.message);
        console.error("");

    }
}

testGemini();