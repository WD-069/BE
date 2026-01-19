// # OpenAI API Integration - Chat Completions, Image Generation & Structured Outputs
// * This file demonstrates how to integrate OpenAI's API (or compatible APIs like Google Gemini)
// * into an Express backend. Key concepts: Client setup, Chat Completions, Image Generation, Zod Schema Parsing.

import cors from "cors";
import type { ErrorRequestHandler } from "express";
import express from "express";

import mongoose from "mongoose";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { z } from "zod";

await mongoose.connect(process.env.MONGO_URI!, { dbName: "chat" });

const Chat = mongoose.model(
  "chat",
  new mongoose.Schema({
    history: {
      type: [Object],
      default: [],
    },
  }),
);

// # OpenAI Client Configuration
// * The OpenAI SDK is provider-agnostic! By changing baseURL, you can connect to:
// * - OpenAI directly (default), Google Gemini, or local models like Ollama.
// ! Make sure to use the correct model name for your chosen provider!

// const client = new OpenAI();
const client = new OpenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
// const client = new OpenAI({
//   // apiKey: "ollama",
//   baseURL: "http://127.0.0.1:11434/v1",
// });

const port = process.env.PORT || 8080;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Running" });
});

// # Chat Completions Endpoint
// * This endpoint demonstrates a stateful chat with message history stored in MongoDB.
// * The history array preserves context across multiple user messages.

app.post("/messages", async (req, res) => {
  const { prompt, chatId } = req.body;

  // * Session Management: Create new chat or continue existing conversation
  let chat;

  if (!chatId) {
    chat = await Chat.create({ history: [] });
  } else {
    chat = await Chat.findById(chatId);
  }

  console.log("Chat: ", chat);

  // * chat.completions.create() is the core method for generating AI responses.
  // * The messages array follows the OpenAI format: { role: "user" | "assistant" | "system", content: string }
  // ! Spreading history BEFORE the new prompt maintains conversation order - crucial for context!
  const result = await client.chat.completions.create({
    model: "gemini-3-flash-preview",
    // model: "gpt-5-mini",
    // model: "mistral",

    messages: [
      // {
      //   role: "system",
      //   content: "You are a helpful assistant",
      // },
      ...chat?.history,
      { role: "user", content: prompt },
    ],
  });

  // * The response contains a choices array - we extract the first message
  const answer = result.choices[0]?.message;

  // * Update history with BOTH the user prompt AND the assistant's answer
  // ! Both messages must be saved to maintain the full conversation context
  chat.history = [...chat.history, { role: "user", content: prompt }, answer];

  await chat.save();

  res.json({ result: answer.content, chatId: chat._id });
});

// # Image Generation Endpoint
// * images.generate() creates images from text prompts (text-to-image).
// * response_format: "b64_json" returns base64-encoded image data instead of a URL.
// ! Base64 is larger but doesn't require additional file hosting.

app.post("/images", async (req, res) => {
  const { prompt } = req.body;

  const result = await client.images.generate({
    model: "imagen-4.0-generate-001",
    prompt,
    response_format: "b64_json",
  });
  res.json({ b64_json: result.data[0].b64_json });
});

// # Structured Outputs with Zod Schema
// * Zod schemas define the EXACT structure the AI must return.
// * .describe() adds context for the AI - it reads these hints to generate better values!
// ! The AI will strictly follow this schema - invalid responses are automatically rejected.

const Recipe = z.object({
  title: z.string(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      quanity: z
        .string()
        .describe("The quanity of the required ingredient. Use metric units if possible."),
      estimated_cost_per_unit: z
        .number()
        .describe("The estimated cost of the required ingredient in EUR cents"),
    }),
  ),
  prepration_description: z.string(),
  time_in_minutes: z.number(),
});

// # Structured Output Parsing Endpoint
// * .parse() instead of .create() automatically validates against the Zod schema.
// * zodResponseFormat() converts the Zod schema to OpenAI's expected format.
// * The system message shapes the AI's "personality" and domain expertise.

app.post("/recipes", async (req, res) => {
  const { prompt } = req.body;

  const result = await client.chat.completions.parse({
    model: "gemini-3-flash-preview",
    messages: [
      {
        role: "system",
        content:
          "You are an innovative chef who creativelty designs new recipes. You really like pepper.",
      },
      { role: "user", content: prompt },
    ],
    // * zodResponseFormat wraps the schema and gives it a name for the API
    response_format: zodResponseFormat(Recipe, "recipe"),
  });

  // * .parsed contains the typed, validated object - no manual JSON.parse needed!
  // res.json({ recipe });
  res.json({ recipe: result.choices[0]?.message.parsed });
});

app.use("/{*splat}", () => {
  throw Error("Page not found", { cause: { status: 404 } });
});

app.use(((err, _req, res, _next) => {
  console.log(err);
  res.status(err.cause?.status || 500).json({ message: err.message });
}) satisfies ErrorRequestHandler);

app.listen(port, () => console.log(`AI Proxy listening on port ${port}`));
