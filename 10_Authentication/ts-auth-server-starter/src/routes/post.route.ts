import { Router } from 'express';
import { createPost, updatePost, deletePost } from '#controllers';
import { verifyToken } from '#middlewares';

const postRouter = Router();

postRouter.post('/', verifyToken, createPost);
postRouter.put('/', updatePost);
postRouter.delete('/', deletePost);

export default postRouter;
