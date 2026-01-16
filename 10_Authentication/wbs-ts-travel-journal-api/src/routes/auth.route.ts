import { Router } from 'express';
import { login, logout, me, register } from '#controllers';
import { verifyToken, validateZod } from '#middlewares';
import { loginSchema, registerSchema } from '#schemas'; // TODO: use the schemas for validation

const authRouter = Router();

authRouter.post('/register', validateZod(registerSchema), register);
authRouter.post('/login', validateZod(loginSchema), login);
authRouter.delete('/logout', logout);
authRouter.get('/me', verifyToken, me);

export default authRouter;
