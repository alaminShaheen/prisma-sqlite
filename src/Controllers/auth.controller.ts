import { Request, Response } from "express";

import logging from "../Config/logging";
import { User as UserModel, PrismaClient, Prisma } from "@prisma/client";
import AuthServices from "../Services/auth.service";
import HttpException from "../Exceptions/httpException";
import TokenServices from "../Services/token.service";
import { StatusCodes } from "../Exceptions/ApiStatusCodes";

const { user: User } = new PrismaClient();

const userInfo = Prisma.validator<Prisma.UserSelect>()({
    password: false,
});

const register = async (req: Request, res: Response) => {
    try {
        const _emailExists = await AuthServices.findIfUserEmailExists(req.body.Email);
        if (_emailExists) return res.status(400).json({ message: "User with email already exists" });
        const _newUser = await AuthServices.register(req.body);
        return res.status(201).json(_newUser);
    } catch (error) {
        const _error = error as HttpException;
        return res.status(_error.status).json({message: _error.message});
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const { user, accessToken, refreshToken } = await AuthServices.login(req.body);
        return res.status(200).json({ user, accessToken, refreshToken });
    } catch (error) {
        const _error = error as HttpException;
        return res.status(_error.status).json({message: _error.message});
    }
};

const refreshToken = async (req: Request, res: Response) => {
    try {
        const tokens = await TokenServices.refreshToken(req.body.Token);
        if (!tokens.refreshToken || !tokens.accessToken) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        return res.status(StatusCodes.CREATED).json(tokens);
    } catch (error) {
        const _error = error as HttpException;
        return res.status(_error.status).json({message: _error.message});
    }
};

const logout = async (req: Request, res: Response) => {
    try {
        await AuthServices.logout(req.body.token);
        logging.info(`Logging out...`);
        return res.sendStatus(204);
    } catch (error) {
        const _error = error as HttpException;
        return res.status(_error.status).json({message: _error.message});
    }
};

const AuthController = {
    register,
    login,
    refreshToken,
    logout,
};

export default AuthController;
