import User from "../models/usersSchema.js";

export const getAllUsers = async(req, res) => {
    try{
        const users = await User.find();
        return res.status(200).json(users);
    }catch(err){
        console.error(err);
       return res.json(err)
    }
}

export const createUser = async(req, res) => {
    try {
      const {username, password} = req.body;
      if(!username, !password) {
        return res.send("Username nad password are required")
      }

      const foundUser = await User.find({username: username});
      if(foundUser){
        return res.send("User already exists!")
      }
      const newUser = await User.create({
        username,
        password,
      });
      
      return res.status(200).json({message: "User created succesfully", newUser});
    } catch (err) {
      console.error(err);
      return res.json(err);
    }
}

