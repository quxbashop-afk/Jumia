import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize GoogleGenAI client (used server-side with key kept safe)
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// API Route for analyzing product images and generating formatted product details
app.post("/api/gemini/analyze-product", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Missing imageUrl field in request body." });
    }

    let imagePart: any = null;

    if (imageUrl.startsWith("data:")) {
      const matches = imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        imagePart = {
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        };
      } else {
        return res.status(400).json({ error: "Could not parse base64 image data." });
      }
    } else {
      // Fetch URL and convert to inline base64 part
      try {
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) {
          throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
        }
        const buffer = await imageRes.arrayBuffer();
        const base64Str = Buffer.from(buffer).toString("base64");
        const contentType = imageRes.headers.get("content-type") || "image/jpeg";
        imagePart = {
          inlineData: {
            mimeType: contentType,
            data: base64Str
          }
        };
      } catch (fetchErr: any) {
        console.error("Error fetching remote image URL on backend:", fetchErr);
        return res.status(400).json({ error: `Could not load image from the provided web URL: ${fetchErr.message}` });
      }
    }

    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [
          imagePart,
          { text: "Analyze the provided product image and generate premium listing details for Quxba's marketplace." }
        ]
      },
      config: {
        systemInstruction: "You are an expert e-commerce catalog optimizer. Analyze the provided product image and generate premium marketing and listing details for the African e-commerce store Quxba. The output must strictly follow the schema structure provided. Choose the most specific category from: 'Electronics & Appliances', 'Phones & Tablets', 'Computers & Accessories', 'Fashion & Apparel', 'Supermarket & Groceries', 'Health & Beauty'. Estimate a realistic sale price in Nigerian Naira (₦) for standard consumer markets, and a slightly higher original/regular price (approx 15-30% discount). Write a rich, detailed, persuasive, and completely realistic consumer description.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["name", "category", "price", "originalPrice", "description"],
          properties: {
            name: {
              type: Type.STRING,
              description: "The name of the product. Keep it clear, descriptive, and under 10 words."
            },
            category: {
              type: Type.STRING,
              description: "The e-commerce category. Must be exactly one of: 'Electronics & Appliances', 'Phones & Tablets', 'Computers & Accessories', 'Fashion & Apparel', 'Supermarket & Groceries', 'Health & Beauty'."
            },
            price: {
              type: Type.NUMBER,
              description: "The discount sale price in Naira. Must be a clean integer number (e.g. 14500)."
            },
            originalPrice: {
              type: Type.NUMBER,
              description: "The original regular price in Naira. Must be higher than the sale price (e.g. 18900)."
            },
            description: {
              type: Type.STRING,
              description: "A rich, detailed, premium, and persuasive marketing description of the product detailing its features."
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText.trim());
    return res.json(data);

  } catch (error: any) {
    console.error("AI Generation error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze product image with Gemini AI." });
  }
});

async function startServer() {
  // Vite middleware for development, static serve for production
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
    console.log(`[Quxba Server] running on port ${PORT}`);
  });
}

startServer();
