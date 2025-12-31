import { Schema, model } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, "Username required"],
            maxLength: 100
        },
        password: {
            type: String,
            required: [true, "Password required"],
            minLength: 6,
            maxLength: 16
        },
        posts: {
            type: [Schema.Types.ObjectId],
            ref: "Post",
        }
    }, 
    {timestamps: true}

)

export default model("User", userSchema);