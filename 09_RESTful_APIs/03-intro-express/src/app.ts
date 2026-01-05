import express from 'express';
import type { Request } from 'express';

const app = express();
const port = 3000;

type PostRequestBody = {
	title: string;
	content: string;
};

app.use(express.json());

app.get('/posts', async (req, res) => {
	const posts = await Post.find();
	res.json(posts);
});

app.post('/posts', (req: Request<{}, {}, PostRequestBody>, res) => {
	if (!req.body.title || !req.body.content)
		return res.status(404).json({ message: 'Post not found' });
	const newPost = await Post.create(body);
	res.json(newPost);
});

app.get('/posts/:id', (req, res) => {
	const id = req.params.id;
	res.json({ post: { id } });
});

app.put('/posts/:id', (req, res) => {
	//
	res.json({ message: 'Put request on /posts' });
});

app.delete('/posts/:id', (req, res) => {
	res.json({ message: 'Delete request on /posts' });
});

app.listen(port, () => {
	console.log(`Server is listening`);
});
