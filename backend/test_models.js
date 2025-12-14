const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init to access client? No, need to look at docs or just use the one generic client?
        // Actually the GoogleGenerativeAI instance doesn't have listModels directly on it in some versions?
        // Let's try to find how to list models.
        // In @google/generative-ai, it's usually not on the client main class directly?
        // But usually error message suggests calling ListModels.
        // Let's try this:
        // Actually I can't easily list models with the high-level SDK unless I know the method.
        // But I can try to access the underlying API if possible.
        // However, simplest fix is often just `gemini-pro` works if the key is valid.
        // Maybe the key is invalid?
        // But error said "models/gemini-1.5-flash is not found". 
        // If key was invalid, it would say "API Key invalid" or "Permission denied".
        // 404 on model usually means model name is wrong relative to the API version.

        // Let's try to just use "gemini-1.5-flash-latest" or "gemini-1.0-pro".
        // Or I can try to console log the error details more?

        console.log("Mock listing - I will try to use a known stable model name 'gemini-1.5-flash-001' or 'gemini-1.0-pro-001'");
        // But let's try to run a script that tries multiple model names.

        const modelsToTry = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.0-pro"];

        for (const modelName of modelsToTry) {
            console.log(`Trying model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                console.log(`SUCCESS with ${modelName}`);
                console.log(await result.response.text());
                break;
            } catch (e) {
                console.log(`FAILED with ${modelName}: ${e.message}`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
