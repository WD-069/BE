import type { RequestHandler } from 'express';
import { Post } from '#models';
import type { CreatePostInput } from '#models/Post';

export const getAllPosts: RequestHandler = async (req, res) => {
  const allPosts = await Post.find();

  res.json(allPosts);
};

export const createPost: RequestHandler = async (req, res) => {
  const { userID } = req;
  const { title, image, content } = req.sanitizedBody as Omit<CreatePostInput, 'author'>;

  if (!userID) throw new Error('Unauthorized', { cause: 401 });

  // satisfies ensures compile-time type checking for our input shape
  const postData = { title, image, content, author: userID } satisfies CreatePostInput;
  // Cast needed because Mongoose v9 expects ObjectId but accepts string at runtime
  const newPost = await Post.create(postData as Parameters<typeof Post.create>[0]);

  res.status(201).json(newPost);
};

export const getSinglePost: RequestHandler = async (req, res) => {
  const {
    params: { id }
  } = req;

  const post = await Post.findById(id).lean().populate('author');

  if (!post) throw new Error(`Post with id of ${id} doesn't exist`, { cause: 404 });

  res.json(post);
};

export const deletePost: RequestHandler = async (req, res) => {
  const { userID, userRoles } = req;
  const postID = req.params.id;
  const isAdmin = userRoles?.includes('admin');

  const post = await Post.findById(postID);

  if (post?.author.toString() === userID || isAdmin) {
    await Post.findByIdAndDelete(req.params.id);
  } else {
    throw new Error('Unauthorized', { cause: { status: 401 } });
  }

  res.status(200).json({ message: 'Successfully deleted' });
};

export const updatePost: RequestHandler = async (req, res) => {
  const {
    sanitizedBody,
    params: { id }
  } = req;

  const updatedPost = await Post.findByIdAndUpdate(id, sanitizedBody, { new: true }).populate(
    'author'
  );
  if (!updatedPost) throw new Error(`Post with id of ${id} doesn't exist`, { cause: 404 });
  res.json(updatedPost);
};
