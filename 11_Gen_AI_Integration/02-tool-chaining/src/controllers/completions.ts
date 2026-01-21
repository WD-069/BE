import type { RequestHandler } from "express";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources";
import type { Pokemon } from "pokedex-promise-v2";
import { FinalResponse, Intent } from "#schemas";
import type { ErrorResponseDTO, FinalResponseDTO, IncomingPrompt } from "#types";
import { getPokemon, returnError } from "#utils";

const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      strict: true,
      name: "get_pokemon",
      description: "Get details for a single Pokémon by name",
      parameters: {
        type: "object",
        description: "The name of the Pokémon to get details for",
        properties: {
          pokemonName: {
            type: "string",
            description: "The name of the Pokémon to get details for",
            example: "Pikachu",
          },
        },
        required: ["pokemonName"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      strict: true,
      name: "return_error",
      description: "Return an error when the user asks something that is NOT about Pokémon.",
      parameters: {
        type: "object",
        description: "The reason why the question is not about Pokémon",
        properties: {
          message: {
            type: "string",
            description: "The reason why the question is not about Pokémon",
            example: "This question is not about Pokémon.",
          },
        },
        required: ["message"],
        additionalProperties: false,
      },
    },
  },
];

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
       If the user asks about a Pokémon, you will call the get_pokemon function to fetch data about it.
       If the question is not about Pokémon, you will call the return_error function with a reason why 
       the question is not about Pokémon.
      `,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  // # Tool Calling: Step 1 - ask the model (it may request tool calls)
  const checkIntentCompletion = await client.chat.completions.create({
    model,
    tools,
    tool_choice: "auto",
    messages,
    temperature: 0,
  });

  const checkIntentCompletionMessage = checkIntentCompletion.choices[0]?.message;

  if (!checkIntentCompletionMessage) {
    res.status(500).json({
      success: false,
      error: "Failed to generate a response from the model.",
    });
    return;
  }

  console.log("checkIntentCompletionMessage: ", checkIntentCompletionMessage);

  // # Keep history: add the assitant message (with tool_calls) to messages
  messages.push(checkIntentCompletionMessage);

  // # Tool Calling: Step 2 - run tools (0..n)
  for (const toolCall of checkIntentCompletionMessage.tool_calls || []) {
    console.log("toolCall: ", toolCall);

    if (toolCall.type === "function") {
      const name = toolCall.function.name;
      // name = "get_Pokemon"
      const args = JSON.parse(toolCall.function.arguments);
      // args = {"pokemonName": "Pikachu" }
      console.log(`\x1b[36mTool call detected: ${name} with args: ${JSON.stringify(args)}\x1b[0m`);

      let result: Pokemon | ErrorResponseDTO | string = "";

      if (name === "get_pokemon") {
        result = await getPokemon({ pokemonName: args.pokemonName });
      }
      if (name === "return_error") {
        result = await returnError({ message: args.message });
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result.toString(),
        // content: JSON.stringify(result)
      });
    }
  }

  console.log("messages:", messages);

  // # Tool Calling: Step 3 - final response after tools ran
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
