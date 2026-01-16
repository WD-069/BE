import { Schema, model } from 'mongoose';

export type PostType = {
  _id: Schema.Types.ObjectId;
  title: string;
  author: Schema.Types.ObjectId;
  image: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

const postSchema = new Schema<PostType>(
  {
    title: { type: String, required: [true, 'Title is required'] },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'Author is required'] },
    image: { type: String, required: [true, 'Cover image is required'] },
    content: { type: String, required: [true, 'Body is required'] }
  },
  {
    timestamps: true
  }
);

export default model('Post', postSchema);
