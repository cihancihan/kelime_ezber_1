import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { db, schema } from "./src/db/index.js";
import { eq, lte } from "drizzle-orm";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateContentWithRetry(options: any) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    throw new Error("Geçerli bir GEMINI_API_KEY bulunamadı. Lütfen .env dosyanızı kontrol edin.");
  }
  for (let i = 0; i < 3; i++) {
    try {
      return await ai.models.generateContent(options);
    } catch (e: any) {
      if (i === 2) throw e;
      const isUnavailable = e?.status === 503 || e?.status === "UNAVAILABLE" || e?.message?.includes("demand") || e?.message?.includes("503");
      if (isUnavailable) {
        await new Promise(r => setTimeout(r, 1500 * (i + 1)));
        continue;
      }
      throw e;
    }
  }
  throw new Error("Failed after retries");
}

// API Route: Add a word via AI
app.post("/api/words", async (req, res) => {
  const { word } = req.body;
  if (!word) {
    return res.status(400).json({ error: "Word is required" });
  }

  try {
    // 1. Fetch translation, POS, synonyms, example
    const enrichResponse = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: `Provide the following for the English word '${word}' suitable for IELTS preparation:
      - Turkish translation
      - partOfSpeech
      - synonyms (array of max 3 words)
      - exampleSentence
      - level (CEFR level: A1, A2, B1, B2, C1, C2)
      Return ONLY a valid JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING },
            synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
            exampleSentence: { type: Type.STRING },
            level: { type: Type.STRING }
          },
          required: ["translation", "partOfSpeech", "synonyms", "exampleSentence", "level"]
        }
      }
    });

    const enrichedText = enrichResponse.text?.replace(/```json/g, '')?.replace(/```/g, '')?.trim() || "{}";
    const enriched = JSON.parse(enrichedText);

    // 2. Fetch distractors for the quiz
    const distractorsResponse = await generateContentWithRetry({
      model: "gemini-2.5-flash",
      contents: `Generate 3 plausible but incorrect Turkish translations for the English word '${word}' (whose correct Turkish translation is '${enriched.translation}'). They should be the same word type (${enriched.partOfSpeech}). 
      Return ONLY a JSON array of 3 strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Array of exactly 3 incorrect Turkish words"
        }
      }
    });

    const distractorsText = distractorsResponse.text?.replace(/```json/g, '')?.replace(/```/g, '')?.trim() || "[]";
    const distractors = JSON.parse(distractorsText);

    // 3. Save to database
    const newWordRes = db.insert(schema.words).values({
      word: word.toLowerCase(),
      translation: enriched.translation,
      partOfSpeech: enriched.partOfSpeech,
      synonyms: enriched.synonyms,
      example: enriched.exampleSentence,
      distractors: distractors,
      level: enriched.level,
      nextReview: Date.now(), // Due immediately
    }).returning()
    .get();

    res.json(newWordRes);

  } catch (error: any) {
    console.error("AI Enrichment Error:", error);
    res.status(500).json({ error: "Failed to enrich word", details: error.message });
  }
});

// API Route: Get words due for review
app.get("/api/reviews", async (req, res) => {
  try {
    const dueWords = db.select()
      .from(schema.words)
      .where(lte(schema.words.nextReview, Date.now()))
      .limit(20)
      .all();
    res.json(dueWords);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// API Route: Submit review
app.post("/api/reviews", async (req, res) => {
  const { id, isCorrect } = req.body;
  if (!id || typeof isCorrect !== 'boolean') {
    return res.status(400).json({ error: "Invalid review payload" });
  }

  try {
    const wordData = db.select().from(schema.words).where(eq(schema.words.id, id)).get();
    if (!wordData) return res.status(404).json({ error: "Word not found" });

    // Simple SRS Algorithm (SuperMemo-2 simplified)
    let { interval, repetitions, easeFactor, streak } = wordData;

    if (isCorrect) {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * (easeFactor / 1000));
      }
      repetitions += 1;
      streak += 1;
      easeFactor = Math.min(3000, easeFactor + 100); // increase ease a bit up to 3.0
    } else {
      repetitions = 0;
      interval = 0; // immediate review
      streak = 0;
      easeFactor = Math.max(1300, easeFactor - 200); // 1.3 is lowest ease
    }

    const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;

    const updated = db.update(schema.words)
      .set({ interval, repetitions, easeFactor, streak, nextReview })
      .where(eq(schema.words.id, id))
      .returning()
      .get();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// API Route: Get stats
app.get("/api/stats", async (req, res) => {
  try {
    const allWords = db.select().from(schema.words).all();
    const dueWordsCount = db.select().from(schema.words).where(lte(schema.words.nextReview, Date.now())).all().length;
    
    // Group level stats
    const levels: Record<string, number> = {};
    for (const w of allWords) {
      if (w.level) {
        levels[w.level] = (levels[w.level] || 0) + 1;
      }
    }

    res.json({
      totalWords: allWords.length,
      dueReviews: dueWordsCount,
      totalLearned: allWords.filter(w => w.repetitions > 2).length,
      levels
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
