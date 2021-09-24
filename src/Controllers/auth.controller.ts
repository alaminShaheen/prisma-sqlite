import { Request, Response } from "express";

import logging from "../Config/logging";
import { generateAccessToken, generateRefreshToken } from "../Functions/auth.function";
import jwt from "jsonwebtoken";
import config from "../Config/config";
import { User as UserModel, PrismaClient, Prisma } from "@prisma/client";
import UserServices from "../Services/auth.service";
import HttpException from "../Exceptions/httpException";

const { user: User } = new PrismaClient();

const userInfo = Prisma.validator<Prisma.UserSelect>()({
    password: false,
});

const register = async (req: Request, res: Response) => {
    try {
        const _emailExists = await UserServices.findIfUserEmailExists(req.body.Email);
        if (_emailExists) return res.status(400).json({ message: "User with email already exists" });
        const _newUser = await UserServices.register(req.body);
        return res.status(201).json(_newUser);
    } catch (error) {
        const _error = error as HttpException;
        return res.status(_error.status).json(_error.message);
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const { user, accessToken, refreshToken } = await UserServices.login(req.body);
        return res.status(200).json({ user, accessToken, refreshToken });
    } catch (error) {
        const _error = error as HttpException;
        return res.status(_error.status).json(_error.message);
    }
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
    try {
        await UserServices.logout(req.body.token)
        logging.info(`Logging out...`);
        return res.sendStatus(204);
    } catch (error) {
        const _error = error as HttpException;
        return res.status(_error.status).json(_error.message);
    }
};

const AuthController = {
    register,
    login,
    refreshToken,
    logout,
};

export default AuthController;
