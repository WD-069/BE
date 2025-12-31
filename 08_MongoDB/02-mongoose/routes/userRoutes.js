import { Router } from "express";
import { getAllUsers, createUser } from "../controllers/userControllers.js";

const userRouter = Router();

userRouter.route("/").get(getAllUsers).post(createUser);
// userRouter.route("/:id").get().put().delete();

export default userRouter;
