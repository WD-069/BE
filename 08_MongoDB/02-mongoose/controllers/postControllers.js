import Post from "../models/postsSchema.js";

export const getAllPosts = async(req, res) => {
    try{
        const posts = await Post.find();
        if(!posts) {
            return res.status(404).json({message: "Posts not found!"});
        }
        return res.status(200).json(posts);
    }catch(err){
        return res.status(500).json({ errorMessage: err });
    }
}

export const createPost = async (req, res) => {
  try {
    const {title, content, user_id, tags } = req.body;
    if(!title || !content || !user_id || !tags) {
        return res.send('All fields must be filled!');
    }

    const newPost = await Post.create({title, content, user_id, tags})
    return res.status(200).json({ message: 'Post created succesfully!', newPost });
  } catch (err) {
    return res.status(500).json({ errorMessage: err });
  }
};

export const getPostById = async (req, res) => {
  try {
    const {id} = req.params;
    const foundPost = await Post.findById(id);
    if(!foundPost) {
        return res.status(404).json({message: "Post not found!"});
    }
    return res.status(200).json(foundPost);
  } catch (err) {
    return res.status(500).json({ errorMessage: err });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, user_id, tags } = req.body;

    if (!title || !content || !user_id || !tags) {
      return res.send('All fields must be filled!');
    }

    const updatedPost = await Post.findByIdAndUpdate(id, req.body, { new: true});
     if (!updatedPost) {
       return res.status(404).json({ message: 'Post not found!' });
     }
     return res.status(200).json(updatedPost);

  } catch (err) {
    return res.status(500).json({ errorMessage: err });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await Post.findByIdAndDelete(id);
    if(!deletedPost) {
        return res.status(404).json({message: "post not found!"})
    }
    return res.status(200).json({message: "post deleted succesfully", deletePost})
  } catch (err) {
    return res.status(500).json({ errorMessage: err });
  }
};