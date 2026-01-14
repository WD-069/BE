import { Router } from 'express';
import { createPost, updatePost, deletePost, getSinglePost, getAllPosts } from '#controllers';
import { verifyToken } from '#middlewares';

const postRouter = Router();

postRouter
  .route('/:id')
  .get(getSinglePost)
  .put(verifyToken, updatePost)
  .delete(verifyToken, deletePost);

postRouter.route('/').get(getAllPosts).post(verifyToken, createPost);

export default postRouter;
