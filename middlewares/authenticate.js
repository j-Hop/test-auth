import { HttpError } from "../helpers/index.js";
import jwt from "jsonwebtoken";
import {crtlWrapper} from "../decorators/index.js";
const {JWT_SECRET} = process.env;
import "dotenv/config";
import User from "../models/User.js"


const authenticate = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        throw HttpError(401, "'Not authorized'");
    }
    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer" || !token) {
    throw HttpError(401, 'Not authorized');
}
try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
        throw HttpError(401, "user not found");
    }
    req.user = user;
    next();
} catch (error) {
    throw HttpError(401, 'Not authorized');
}
}

export default crtlWrapper(authenticate) ;


