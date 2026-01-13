import { Router } from 'express';
import { login, logout, me, register } from '#controllers';
// import { validateBodyZod } from '#middlewares';
import { loginSchema, registerSchema } from '#schemas'; // TODO: use the schemas for validation

const authRouter = Router();

authRouter.post('/register', register);

authRouter.post('/login', login);

authRouter.delete('/logout', logout);

authRouter.get('/me', me);

export default authRouter;
