import { Router } from "express";
import { getAllPosts, createPost, getPostById, updatePost, deletePost } from "../controllers/postControllers.js";

const postRouter = Router();

postRouter.route('/').get(getAllPosts).post(createPost);
postRouter.route('/:id').get(getPostById).put(updatePost).delete(deletePost);

export default postRouter;