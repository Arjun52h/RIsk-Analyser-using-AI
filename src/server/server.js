import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Check API key
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing.");
    console.error("Make sure your .env file exists in the project root.");
    process.exit(1);
}

// Gemini client
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// ------------------------------------
// Health check
// ------------------------------------

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "RiskPilot Gemini backend is running"
    });
});

// ------------------------------------
// Gemini Risk Analysis
// ------------------------------------

app.post("/api/analyze-risk", async (req, res) => {

    try {

        const transaction = req.body;

        if (!transaction) {
            return res.status(400).json({
                success: false,
                error: "Transaction data is required"
            });
        }

        console.log("🤖 Analyzing transaction:", transaction.id);

        const prompt = `
You are RiskPilot AI, an expert payment fraud and transaction risk analyst.

Analyze the following payment transaction.

IMPORTANT RULES:

1. Use ONLY the information provided.
2. Do not invent customer information.
3. Do not invent transaction history.
4. Do not change the numerical risk score.
5. The RiskPilot local risk engine has already calculated the risk score.
6. Your job is to explain the risk intelligently.
7. Look for combinations of suspicious signals.
8. Give practical investigation guidance.
9. Never claim with certainty that a transaction is fraudulent.
10. Distinguish between risk indicators and proof of fraud.

TRANSACTION DATA:

${JSON.stringify(transaction, null, 2)}

Return ONLY this format:

SUMMARY:
One short sentence explaining the main risk.

WHY RISKY:
- Short reason 1
- Short reason 2
- Short reason 3

ADVICE:
One short practical action.

Maximum 80 words.
Do not repeat transaction details unnecessarily.
Do not mention information that is not provided.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        console.log("✅ Gemini analysis completed");

        res.json({
            success: true,
            analysis: response.text
        });

    } catch (error) {

        console.error("❌ Gemini API Error:");
        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message || "Gemini analysis failed"
        });
    }
});

// ------------------------------------
// Start server
// ------------------------------------

app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log("🚀 RiskPilot Gemini Backend");
    console.log("======================================");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log("======================================");
    console.log("");
});