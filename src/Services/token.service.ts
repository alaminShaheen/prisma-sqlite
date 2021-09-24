import { PrismaClient, User } from ".prisma/client";
import jwt from "jsonwebtoken";
import config from "../Config/config";
import logging from "../Config/logging";
import { StatusCodes } from "../Exceptions/ApiStatusCodes";
import HttpException from "../Exceptions/httpException";
import { IUser } from "../Interfaces/user.interface";

const { token: Token, user: _User } = new PrismaClient();

const generateAccessToken = (user: IUser) => jwt.sign(user, config.token.accessTokenSecret, { expiresIn: "10s" });
const generateRefreshToken = (user: IUser) => jwt.sign(user, config.token.refreshTokenSecret, { expiresIn: "7d" });

const createRefreshToken = async (user: IUser) => {
    try {
        const _token = generateRefreshToken(user);
        await Token.create({ data: { value: _token } });
        return _token;
    } catch (error) {
        logging.error(error);
        throw new HttpException(StatusCodes.INTERNAL_SERVER);
    }
};

const deleteRefreshToken = async (token: string) => {
    try {
        const _token = await Token.findFirst({ where: { value: token } });
        if (!_token) throw new HttpException(StatusCodes.UNAUTHORIZED, "User is unauthorized");
        await Token.delete({ where: { id: _token.id } });
        return;
    } catch (error: any) {
        logging.error(error);
        if (error.status && error.message) {
            const _error = error as HttpException;
            throw new HttpException(_error.status, _error.message);
        }
        throw new HttpException(StatusCodes.INTERNAL_SERVER);
    }
};

const refreshToken = async (token: string) => {
    if (!token) throw new HttpException(StatusCodes.BAD_REQUEST, "Token is required");
    jwt.verify(token, config.token.refreshTokenSecret, async (err: any, user: any) => {
        if (err) {
            logging.error(err);
            throw new HttpException(StatusCodes.FORBIDDEN, "Invalid refresh token");
        } else {
            try {
                const _newAccessToken = generateAccessToken(user);
                await deleteRefreshToken(token);
                const _newRefreshToken = await createRefreshToken(user);
                return { accessToken: _newAccessToken, refreshToken: _newRefreshToken };
            } catch (error: any) {
                logging.error(error);
                if (error.status && error.message) {
                    const _error = error as HttpException;
                    throw new HttpException(_error.status, _error.message);
                }
                throw new HttpException(StatusCodes.INTERNAL_SERVER);
            }
        }
    });
};

const TokenServices = { createRefreshToken, generateAccessToken, generateRefreshToken, refreshToken };

export default TokenServices;
