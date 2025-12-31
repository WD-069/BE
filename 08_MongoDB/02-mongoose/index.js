import express from 'express';
import connectDB from './DB/db.js';
import postRouter from './routes/postRoutes.js';
import userRouter from './routes/userRoutes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
connectDB();

// middleware
app.use(express.json());
app.use('/users', userRouter);
app.use('/posts', postRouter);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(port, () => console.log(`Server is running on localhost:${port}`));
