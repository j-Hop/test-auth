import Joi from "joi";
import { Schema, model } from "mongoose";
import { handleSaveError, preUpdate } from "./hooks.js";

const sex = ["mail", "femail"];
const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
    {
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: emailRegexp,
        unique: true,
    }, 
    password : {
         type: String,
         required: true,
    },
    gender: {
        type:String,
        enum : sex,
        default: "mail",
    },
    token: String,
    avatarURL: String,
    verify: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        required: true,
    },
})


userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", preUpdate);

userSchema.post("findOneAndUpdate", handleSaveError);

const User = model("user", userSchema);


export const userRegisterForm = Joi.object({
    name: Joi.string().min(1).max(32).required(),
    password: Joi.string().min(8).max(64).required(),
    email: Joi.string().pattern(emailRegexp).required(),
    gender: Joi.string().valid(...sex).default("mail"),
    waterRate: Joi.number().default(0),
    token: Joi.string(),
  });
  
  export const userLoginSchema = Joi.object({
      password: Joi.string().min(8).max(64).required(),
      email: Joi.string().pattern(emailRegexp).required(),
      token: Joi.string(),
  });
  
  export const userUpdateSchema = Joi.object({
      name: Joi.string().min(1).max(32),
      email: Joi.string().pattern(emailRegexp),
      gender: Joi.string().valid(...sex).default("mail"),
      waterRate: Joi.number().min(1).max(15000),
    })
  
  export const userInfoSchema = Joi.object({
      email: Joi.string().pattern(emailRegexp),
      password: Joi.string().min(8).max(64),
      oldPassword: Joi.string().min(8).max(64),
      gender: Joi.string().valid(...sex),
      name: Joi.string().min(1).max(32),
  });
  
  export const userNormWaterSchema = Joi.object({
      waterRate: Joi.number().min(1).max(15000).required(),
      gender: Joi.string().valid(...sex),
    })



export default User;

