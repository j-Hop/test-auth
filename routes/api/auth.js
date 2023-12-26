import express from "express";
import userController from "../../controller/auth-controllers.js"
import {validaterBody} from "../../decorators/index.js";
import {authenticate, isEmptyBody,upload} from "../../middlewares/index.js";
import {userInfoSchema, userUpdateSchema, userNormWaterSchema, userLoginSchema, userRegisterForm} from "../../models/User.js";


const userRouter = express.Router();

userRouter.post("/register", isEmptyBody, validaterBody(userRegisterForm), userController.register);

userRouter.post("/login", isEmptyBody, validaterBody(userLoginSchema), userController.login);

userRouter.post("/logout", authenticate, userController.logout);

userRouter.patch("/avatar", authenticate, upload.single("avatarURL"), userController.updateAvatar);

userRouter.get("/:userId", authenticate, validaterBody(userInfoSchema), userController.currentUser);

userRouter.patch("/:userId", authenticate,isEmptyBody, validaterBody(userUpdateSchema), userController.updateUser);

userRouter.patch("/waterNorm", authenticate, isEmptyBody, validaterBody(userNormWaterSchema), userController.updateWaterNorm);

export default  userRouter;
