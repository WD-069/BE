import type { RequestHandler } from "express";
import OpenAI from "openai";
import type { ChatCompletionCreateParamsNonStreaming } from "openai/resources";
import type { z } from "zod";
import type { PromptBodySchema } from "#schemas";
import { createOpenAICompletion } from "#utils";

type IncomingPrompt = z.infer<typeof PromptBodySchema>;
type ResponseCompletion = { completion: string };

export const createCompletion: RequestHandler<unknown, ResponseCompletion, IncomingPrompt> = async (
  req,
  res,
) => {
  const { prompt, stream } = req.body;

  const client = new OpenAI({
    apiKey:
      process.env.NODE_ENV === "development" ? process.env.LOCAL_LLM_KEY : process.env.AI_API_KEY,
    baseURL:
      process.env.NODE_ENV === "development" ? process.env.LOCAL_LLM_URL : process.env?.AI_BASE_URL,
  });
  res.json({ completion: "To be implemented." });
};
