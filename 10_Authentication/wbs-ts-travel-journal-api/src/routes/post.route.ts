import { Router } from 'express';
import { createPost, updatePost, deletePost, getSinglePost, getAllPosts } from '#controllers';
import { verifyToken, validateZod } from '#middlewares';
import { postSchema } from '#schemas';

const postRouter = Router();

postRouter
  .route('/:id')
  .get(getSinglePost)
  .put(verifyToken, validateZod(postSchema), updatePost)
  .delete(verifyToken, deletePost);

postRouter.route('/').get(getAllPosts).post(verifyToken, validateZod(postSchema), createPost);

export default postRouter;
