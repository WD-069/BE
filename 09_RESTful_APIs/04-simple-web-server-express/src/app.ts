import '#db';
import { Post } from '#models';
import { isValidObjectId } from 'mongoose';
import express from 'express';
import type { Request } from 'express';

type PostType = {
	title: string;
	content: string;
	createdAt?: Date;
	updatedAt?: Date;
};

type PostRequestBody = {
	title: string;
	content: string;
};

const app = express();
app.use(express.json());

app.get('/posts', async (req, res) => {
	const posts = await Post.find();
	res.json(posts);
});

// app.post('/posts', async (req: Request<{}, {}, PostRequestBody>, res) => {
// 	const { title, content } = req.body;
// 	if (!title || !content) {
// 		return res.status(400).json({ message: 'Invalid request body' });
// 	}
// 	const newPost = await Post.create({ title, content });
// 	res.json(newPost);
// });

app.post('/posts', async (req, res) => {
	const { title, content } = req.body as PostRequestBody;
	if (!title || !content) {
		return res.status(400).json({ message: 'Invalid request body' });
	}
	const newPost = await Post.create({ title, content });
	res.json(newPost);
});

app.get('/posts/:id', async (req, res) => {
	const { id } = req.params;
	if (!isValidObjectId(id)) {
		return res.status(400).json({ message: 'Invalid Post Id' });
	}
	const post = await Post.findById(id);
	if (!post) {
		return res.status(404).json({ message: 'Post not found' });
	}
	res.json(post);
});

app.put(
	'/posts/:id',
	async (req: Request<{ id: string }, {}, PostRequestBody>, res) => {
		const { id } = req.params;
		if (!isValidObjectId(id)) {
			return res.status(400).json({ message: 'Invalid Post Id' });
		}
		const { title, content } = req.body;
		if (!title || !content) {
			return res.status(400).json({ message: 'Invalid request body' });
		}
		const post = await Post.findByIdAndUpdate(
			id,
			{ title, content },
			{ new: true }
		);
		if (!post) {
			return res.status(404).json({ message: 'Post not found' });
		}

		res.json(post);
	}
);

app.delete('/posts/:id', async (req, res) => {
	const { id } = req.params;
	if (!isValidObjectId(id)) {
		return res.status(400).json({ message: 'Invalid Post Id' });
	}

	const post = await Post.findByIdAndDelete(id);
	res.json({ message: `Post with ${id} deleted` });
});

app.use('*splat', (req, res) => {
	res.status(404).json({ message: 'Not found' });
});

const port = 3000;
app.listen(port, () =>
	console.log(`Server running at http://localhost:${port}/`)
);
