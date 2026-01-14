import { z } from 'zod/v4';
import type { RequestHandler } from 'express';

type ValidateZod = (zodSchema: z.ZodObject) => RequestHandler;

const validateZod: ValidateZod = zodSchema => (req, res, next) => {
  const { data, error } = zodSchema.safeParse(req.body);
  if (error) {
    next(new Error(z.prettifyError(error), { cause: 400 }));
  } else {
    req.sanitizedBody = data;
    next();
  }
};

export default validateZod;
