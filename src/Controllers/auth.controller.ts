import { Request, Response } from "express";

import logging from "../Config/logging";
import { generateAccessToken, generateRefreshToken } from "../Functions/auth.function";
import jwt from "jsonwebtoken";
import config from "../Config/config";
import { User as UserModel, PrismaClient, Prisma } from "@prisma/client";
import UserServices from "../Services/user.service";

const { user: User } = new PrismaClient();

const userInfo = Prisma.validator<Prisma.UserSelect>()({
    password: false,
})

const register = async (req: Request, res: Response) => {
    const { Email, Password, LastName, FirstName } = req?.body;
    if (
        !Email ||
        !Password ||
        !LastName ||
        !FirstName ||
        typeof Email !== "string" ||
        typeof Password !== "string" ||
        typeof LastName !== "string" ||
        typeof FirstName !== "string"
    ) {
        return res.status(400).json({ message: "Invalid request" });
    }
    const _emailExists = await UserServices.findIfUserEmailExists(Email);
    if (_emailExists) return res.status(400).json({ message: "User with email already exists" });
    else {
        try {
            const _newUser = await UserServices.createUser(req?.body);
            logging.info(`Created new user ${_newUser.id} ...`);
            return res.status(201).json({
                Email: _newUser.Email,
                Id: _newUser._id,
                CreatedAt: _newUser.CreatedAt,
                LastName: _newUser.LastName,
                FirstName: _newUser.FirstName,
            });
        } catch (error) {
            const result = error as Error;
            logging.error(error);
            return res.status(500).json({ message: result.message });
        }
    }
};

const login = async (req: Request, res: Response) => {
    const { Email, Password } = req?.body;
    if (!Email || !Password || typeof Email !== "string" || typeof Password !== "string") {
        return res.status(400).json({ message: "Invalid request" });
    }
    const user = await User.findOne({ Email });
    if (user) {
        const isValidPassword = await bcrypt.compare(Password, user.Password);
        if (isValidPassword) {
            logging.info(`Logging in user ${user._id}`);
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            const newRefreshToken = await Token.create({ Value: refreshToken });
            const fetchedUser = await User.findById(user._id, { Password: false });
            // await User.findById({ _id: user._id }, { projection: { Password: false } });
            return res.status(200).json({ AccessToken: accessToken, RefreshToken: newRefreshToken.Value, User: fetchedUser });
        } else {
            return res.status(403).json({ message: "Invalid email or password" });
        }
    } else return res.status(403).json({ message: "Invalid email or password" });
};

const refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.body.Token;
    if (!refreshToken) return res.status(401).json({ message: "User not authenticated" });
    else {
        console.log(refreshToken);
        const token = await Token.findOne({ Value: refreshToken });
        if (!token) return res.status(403).json({ message: "Invalid refresh token" });
    }
    jwt.verify(refreshToken, config.token.refreshTokenSecret, async (err: any, user: any) => {
        if (err) {
            console.log(err);
            logging.error(err);
            return res.status(403).json({ message: "Invalid refresh token" });
        } else {
            const fetchedUser = await User.findById(user._id, { Password: false });
            const newAccessToken = generateAccessToken(fetchedUser!);
            return res.json({ AccessToken: newAccessToken });
        }
    });
};

const logout = async (req: Request, res: Response) => {
    const refreshToken = req.body.Token;
    if (!refreshToken) return res.status(400).json({ message: "Invalid request" });
    try {
        logging.info(`Logging out...`);
        await Token.deleteOne({ Value: refreshToken });
        return res.sendStatus(204);
    } catch (error) {
        logging.error(error);
        return res.status(500).json(error);
    }
};

const AuthController = {
    register,
    login,
    refreshToken,
    logout,
};

export default AuthController;