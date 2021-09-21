import jwt from "jsonwebtoken";
import config from "../Config/config";
import logging from "../Config/logging";
import { User } from "@prisma/client";

export const generateAccessToken = (user: User) => {
    logging.info(user);
    return jwt.sign(user, config.token.accessTokenSecret, { expiresIn: config.token.expireTime });
};

export const generateRefreshToken = (user: User) => {
    return jwt.sign(user, config.token.refreshTokenSecret);
};
