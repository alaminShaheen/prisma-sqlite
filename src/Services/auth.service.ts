import { User as UserModel, PrismaClient, Prisma } from "@prisma/client";
import { IUser, IUserFormData } from "../Interfaces/user.interface";
import bcrypt from "bcryptjs";
import logging from "../Config/logging";
import HttpException from "../Exceptions/httpException";
import { StatusCodes } from "../Exceptions/ApiStatusCodes";
import TokenServices from "./token.service";

const { user: User, token: Token } = new PrismaClient();

const userInfoWithoutPassword = Prisma.validator<Prisma.UserSelect>()({
    email: true,
    lastName: true,
    firstName: true,
    id: true,
    createdAt: true,
    updatedAt: true,
});

const findIfUserEmailExists = async (email: string) => {
    let emailExists = false;
    try {
        const _user = await User.findUnique({ where: { email } });
        emailExists = !!_user;
    } catch (error) {
        logging.error(error);
        throw new HttpException(StatusCodes.INTERNAL_SERVER);
    }
    return emailExists;
};

const register = async (data: IUserFormData) => {
    const { Email, LastName, FirstName, Password } = data;
    if (
        !Email ||
        !Password ||
        !LastName ||
        !FirstName ||
        typeof Email !== "string" ||
        typeof Password !== "string" ||
        typeof LastName !== "string" ||
        typeof FirstName !== "string"
    )
        throw new HttpException(StatusCodes.BAD_REQUEST, "Invalid request");
    try {
        const hashedPassword = await bcrypt.hash(Password, 10);
        const { createdAt, updatedAt, id, lastName, firstName, email } = await User.create({
            data: { email: Email, lastName: LastName, firstName: FirstName, password: hashedPassword },
            select: userInfoWithoutPassword,
        });
        const _accessToken = TokenServices.generateAccessToken({
            createdAt,
            updatedAt,
            id,
            lastName,
            firstName,
            email,
        });
        const _refreshToken = await TokenServices.createRefreshToken({
            createdAt,
            updatedAt,
            id,
            lastName,
            firstName,
            email,
        });
        return {
            user: { createdAt, updatedAt, id, lastName, firstName, email },
            accessToken: _accessToken,
            refreshToken: _refreshToken,
        };
    } catch (error) {
        logging.error(error);
        throw new HttpException(StatusCodes.INTERNAL_SERVER);
    }
};

const login = async (data: IUserFormData) => {
    const { Email, Password } = data;
    if (!Email || !Password || typeof Email !== "string" || typeof Password !== "string")
        throw new HttpException(StatusCodes.BAD_REQUEST, "Invalid request");
    try {
        const _user = await User.findUnique({ where: { email: Email } });
        if (!_user) throw new HttpException(StatusCodes.NOT_FOUND, "User with email not registered");
        const { createdAt, updatedAt, id, lastName, firstName, email, password: hashedPassword } = _user;
        const passwordsMatch = await bcrypt.compare(Password, hashedPassword);
        if (!passwordsMatch) throw new HttpException(StatusCodes.NOT_FOUND, "Email or password does not match");
        logging.info(`Creating tokens for user ${firstName} ${lastName}`);
        const _accessToken = TokenServices.generateAccessToken({
            createdAt,
            updatedAt,
            id,
            lastName,
            firstName,
            email,
        });
        const _refreshToken = await TokenServices.createRefreshToken({
            createdAt,
            updatedAt,
            id,
            lastName,
            firstName,
            email,
        });

        return {
            accessToken: _accessToken,
            refreshToken: _refreshToken,
            user: {
                id,
                email,
                firstName,
                lastName,
                createdAt,
                updatedAt,
            },
        };
    } catch (error: any) {
        logging.error(error);
        if (error.status && error.message) {
            const _error = error as HttpException;
            throw new HttpException(_error.status, _error.message);
        }
        throw new HttpException(StatusCodes.INTERNAL_SERVER);
    }
};

const logout = async (refreshToken: string) => {
    if (!refreshToken) throw new HttpException(StatusCodes.BAD_REQUEST, "Invalid request");
    try {
        const _token = await Token.findFirst({ where: { value: refreshToken } });
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

const UserServices = { findIfUserEmailExists, register, login, logout };

export default UserServices;
