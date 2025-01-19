import { json } from "express";
import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";

export const createUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }

  try {
    const user = await userService.createUser(req.body);

    const token = await user.generateJWT();

    // for not console the password in the frontend
    delete user._doc.password;

    res.status(201).json({ user, token });
  } catch (error) {
    console.log(error);

    res.status(401).send(error.message);
  }
};

export const loginController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ errors: "Invalid credentials" });
    }

    const isMatch = await user.isValidPassword(password);

    if (!isMatch) {
      return res.status(401).json({ errors: "Invalid credentials" });
    }

    const token = await user.generateJWT();

    // for not console the password in the frontend
    delete user._doc.password;

    res.status(200).json({ user, token });
  } catch (error) {
    return res.status(401).send(error.message);
  }
};

export const profileController = async (req, res) => {
  try {
    console.log(req.user);
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    redisClient.set(token, "logout", "EX", 60 * 60 * 24);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);

    res.status(400).send(error.message);
  }
};
