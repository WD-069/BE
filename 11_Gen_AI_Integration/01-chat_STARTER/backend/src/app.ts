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

app.post("/messages", async (req, res) => {
  const { prompt, chatId } = req.body;

  let chat;

  if (!chatId) {
    chat = await Chat.create({ history: [] });
  } else {
    chat = await Chat.findById(chatId);
  }

  console.log("Chat: ", chat);

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

  const answer = result.choices[0]?.message;

  chat.history = [...chat.history, { role: "user", content: prompt }, answer];

  await chat.save();

  res.json({ result: answer.content, chatId: chat._id });
});

app.post("/images", async (req, res) => {
  const { prompt } = req.body;

  const result = await client.images.generate({
    model: "imagen-4.0-generate-001",
    prompt,
    response_format: "b64_json",
  });
  res.json({ b64_json: result.data[0].b64_json });
});

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
    response_format: zodResponseFormat(Recipe, "recipe"),
  });

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
