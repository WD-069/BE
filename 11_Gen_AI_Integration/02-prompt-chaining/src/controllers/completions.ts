import type { RequestHandler } from "express";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
} from "openai/resources";
import Pokedex from "pokedex-promise-v2";
import type { z } from "zod";
import { FinalResponse, Intent, type PromptBodySchema } from "#schemas";
import { createOpenAICompletion } from "#utils";

type IncomingPrompt = z.infer<typeof PromptBodySchema>;
type FinalResponseDTO = z.infer<typeof FinalResponse> | { completion: string };

export const createCompletion: RequestHandler<unknown, FinalResponseDTO, IncomingPrompt> = async (
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
  const model =
    process.env.NODE_ENV === "development" ? process.env.LOCAL_LLM_MODEL! : process.env?.AI_MODEL!;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You determine if a question is about Pokémon.
        You can only answer questions about a single Pokémon
        and not open-ended questions.`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  // # Step 1: Intent Detection: Check if the prompt is about Pokémon
  const checkIntentCompletion = await client.chat.completions.parse({
    model,
    messages,
    temperature: 0,
    response_format: zodResponseFormat(Intent, "Intent"),
  });

  // console.log("checkIntentCompletion: ", checkIntentCompletion);

  const intent = checkIntentCompletion.choices[0]?.message.parsed;

  // console.log("intent: ", intent);

  if (!intent?.isPokemon) {
    res.status(400).json({
      completion: intent?.reason || "I cannot answer this question, try asking about a Pokémon",
    });
    return;
  }

  console.log(`\x1b[34mIntent detected. Received a question about: ${intent.pokemonName}\x1b[0m`);

  messages.push({
    role: "assistant",
    content: JSON.stringify(intent, null, 2),
  });

  // # Step 2: Fetch the Pokemon data from the PokeAPI
  const P = new Pokedex();
  const pokemonData = await P.getPokemonByName(intent.pokemonName.toLowerCase());

  if (!pokemonData) {
    res.status(400).json({
      completion: `Pokémon ${intent.pokemonName} not found.`,
    });
    return;
  }

  // * If Pokedex throws 404/networks errors, instead of null/undefined
  // let pokemonData;

  // try {
  //   pokemonData = await P.getPokemonByName(intent.pokemonName.toLowerCase());
  // } catch (error) {
  //   res.status(404).json({
  //     completion: `Pokémon ${intent.pokemonName} not found or API error.`,
  //   });
  //   return;
  // }

  console.log(`\x1b[32mFetched data for Pokémon: ${pokemonData.name}\x1b[0m`);

  // # Step 3: Add the Pokemon data to the messages and generate a final response
  messages.push({
    role: "assistant",
    content: `This is all the relevant data about the Pokémon: ${
      intent.pokemonName
    }: ${JSON.stringify(pokemonData, null, 2)}
      Combine it with what you know about it to give the user a complete answer.`,
  });

  console.log(`\x1b[33mAdded Pokémon data to messages for further processing.\x1b[0m`);

  const finalCompletion = await client.chat.completions.parse({
    model,
    messages,
    temperature: 0,
    response_format: zodResponseFormat(FinalResponse, "FinalResponse"),
  });

  const finalResponse = finalCompletion.choices[0]?.message.parsed;

  if (!finalResponse) {
    res.status(500).json({
      completion: "Failed to generate a final response.",
    });
    return;
  }

  res.json(finalResponse);
};
