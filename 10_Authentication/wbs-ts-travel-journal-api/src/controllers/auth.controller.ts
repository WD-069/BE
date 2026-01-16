import type { RequestHandler, CookieOptions } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '#models';
import { ACCESS_JWT_SECRET, SALT_ROUNDS } from '#config';
import type { UserType } from '#models/User';

const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'none'
};

export const register: RequestHandler = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  const userExists = await User.exists({ email });
  if (userExists) {
    throw new Error('Email already exists', { cause: { status: 409 } });
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPW = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    password: hashedPW,
    firstName,
    lastName
  });

  const token = jwt.sign({ userID: user._id }, ACCESS_JWT_SECRET, { expiresIn: '7d' });

  const userObj = user.toObject() as Partial<UserType>;
  delete userObj.password;

  res.cookie('token', token, cookieOptions);
  res.status(201).json(userObj);
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Email not found', { cause: { status: 404 } });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error('Incorrect Credentials', { cause: { status: 400 } });
  }

  const token = jwt.sign({ userID: user._id, userRoles: user.roles }, ACCESS_JWT_SECRET, {
    expiresIn: '7d'
  });

  const userObj = user.toObject() as Partial<UserType>;
  delete userObj.password;

  res.cookie('token', token, cookieOptions);
  res.status(200).json(userObj);
};

export const logout: RequestHandler = async (req, res) => {
  res.clearCookie('token', cookieOptions);
  res.status(200).json({ message: 'Goodbye!' });
};

export const me: RequestHandler = async (req, res, next) => {
  const user = await User.findById(req.userID);

  res.json(user);
};
