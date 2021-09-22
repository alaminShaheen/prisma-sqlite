import { StatusCodes } from "./ApiStatusCodes";

class HttpException extends Error {
    status: StatusCodes;
    message: string;
    constructor(status: StatusCodes, message?: string) {
        super(message);
        this.status = status;
        this.message = message ?? "Internal server error";
    }
}

export default HttpException;
