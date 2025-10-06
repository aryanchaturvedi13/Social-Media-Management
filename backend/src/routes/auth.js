import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import { PrismaClient } from "@prisma/client";

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "login_signup"; // use env in production

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { username,name, email, password, accountType } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedpassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        name,
        email,
        passwordHashed: hashedpassword,
        accountType,
      },
    });

    res.status(201).json({
      message: "User created successfully",
      user: { username: newUser.username, id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username,email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    const user_name = await prisma.user.findUnique({ where: { username } });

    if(!user_name)
      return res.status(400).json({ message: "User not found" });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHashed);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      token,
      user: { username: user.username, id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

export default router;
