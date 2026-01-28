import "#db";
import { appendFile } from "node:fs";
import { Post, User } from "#models";

// const user = { name: "Alice", age: 25 };
// await db.collection("user").insertOne(user);

// # CREATE (Variante 1): new User(...) + .save()
// const user = new User({
//   firstName: "John",
//   lastName: "Doe",
//   email: "john@example.com",
// });

// const userToSave = await user.save();
// console.log(userToSave);

// # CREATE (Variante 2): User.create(...)
// const newUser = await User.create({
//   firstName: "Jane",
//   lastName: "Doe",
//   email: "jane@example.com",
// });

// console.log(newUser);

// const newUser = await User.create({
//   firstName: "",
//   lastName: "",
//   email: "",
// });

// console.log(newUser);

// * Read
// const allUsers = await User.find();
// console.log(allUsers);

// const findJohn = await User.find({ firstName: "John" });
// console.log(findJohn);

// const findJane = await User.find({ firstName: "Jane" });
// console.log(findJane);

// const findByEmail = await User.find({ email: "jane@example.com" });
// console.log(findJane);

// const findById = await User.findById("694565be040f5c2ad7c2b6e6");
// console.log(findById);

// * Update
// const updateJohn = await User.updateOne(
//   { email: "john@example.com" },
//   { firstName: "Jack" },
// );
// console.log(updateJohn);

// const userRole = await User.updateMany({ lastName: "Doe" }, { role: "admin" });
// console.log(userRole);

// const findAndUpdate = await User.findOneAndUpdate(
//   { email: "john@example.com" },
//   { firstName: "updated again" },
//   { new: true },
// );
// console.log(findAndUpdate);

// const findByIdAndupdate = await User.findByIdAndUpdate(
//   "694565be040f5c2ad7c2b6e6",
//   { firstName: "John" },
//   { new: true },
// );
// console.log(findByIdAndupdate);

// * Delete
// const deleteOne = await User.deleteOne({ email: "john@example.com" });
// console.log(deleteOne);

// const deleteById = await User.findByIdAndDelete("694570a544b1de3ecf09d2ba");
// console.log(deleteById);

// const newUser = await User.create({
//   firstName: "New",
//   lastName: "User",
//   email: "newuser2@example.com",
// });

// const newPost = await Post.create({
//   title: "Mein erster Post",
//   content: "Hallo Mongoose!",
//   author: newUser._id,
// });

// console.log(newPost);

// const postWithUser = await Post.find().populate("author", "firstName lastName");
// console.log(postWithUser);

// 2nd query done automatically by mongoose via .populate()
// User.findById("authorId", "firstname lastName");

// # 1. Creata a new user
const newUser = await User.create({
  firstName: "Lisa",
  lastName: "Schmidt",
  email: "lisa@mail.com",
});

// # 2. Create several favourites
const favourite1 = await Post.create({
  title: "My first Favourite",
  content: "This is the stop in front of my house",
  author: newUser._id,
});

const favourite2 = await Post.create({
  title: "My 2nd Favourite",
  content: "This is the stop in front of my house",
  author: newUser._id,
});

const favourite3 = await Post.create({
  title: "My 3rd Favourite",
  content: "This is the stop in front of my house",
  author: newUser._id,
});

// # 3.
const updatedUser = await User.findByIdAndUpdate(
  newUser._id,
  {
    $push: { favourites: { $each: [favourite1._id, favourite2._id, favourite3._id] } },
  },
  { new: true },
);

console.log("User with favourites (ID only):", updatedUser);

// # 4. Populate/Read favourites to see the full post data
const userWithFavourites = await User.findById(newUser._id).populate("favourites", "title content");

console.log("User with populated favourites: ", userWithFavourites);

// # concept

// // FE
// // User clicks "Remove from Favourites"

// (fetch(`/users/${userId}/favourites/${postId}`),
//   {
//     method: "DELETE",
//   });

// // BE
// req.params = {
//   userId: "4354563456464556",
//   postId: "3244356456456456",
// };

// User.findByIdAndUpdate(userId, { $pull: { favourites: postId } });

// // routes/favourites
// app.lenght("/api/favourites", async (req, res) => {
//   const favourites = await Favourites.find();
//   res.json();
// });
