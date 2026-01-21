import type { z } from "zod";
import { FinalResponse, Intent, type PromptBodySchema } from "#schemas";

export type IncomingPrompt = z.infer<typeof PromptBodySchema>;

export type FinalResponseDTO =
  | z.infer<typeof FinalResponse>
  | { completion: string }
  | ErrorResponseDTO;

export type ErrorResponseDTO = {
  success: false;
  error: string;
};
