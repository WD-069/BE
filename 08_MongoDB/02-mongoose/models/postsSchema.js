import { Schema, model } from 'mongoose';

const postSchema = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"]
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            maxLength: 120
        },
        content: {
            type: String,
            required: [true, "Content is required"],
            maxLength: 2000
        },
        tags: [String]
    },
    {timestamps: true}
)

export default model("Post", postSchema);