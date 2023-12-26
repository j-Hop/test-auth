import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import gravatar from 'gravatar';
import fs from "fs/promises";
import path from "path";
import Jimp from 'jimp';
import { nanoid } from "nanoid";
import { crtlWrapper } from "../decorators/index.js";
import { HttpError, sendEmail } from "../helpers/index.js";
const { JWT_SECRET, BASE_URL } = process.env;


const avatarsPath = path.resolve("public", "avatars");

const createVerifyEmail = (email, verificationToken) => ({
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">Click verify email</a>`
  });
  

  const register = async (req, res) => {
    const {name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email in use");
    }
  
    const hashPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();
    const newUser = await User.create({ ...req.body, name, password: hashPassword, avatarURL,  verificationToken});
    const verifyEmail = createVerifyEmail(email, verificationToken);
  await sendEmail(verifyEmail);
  
    res.status(201).json({
        user: {
            name: newUser.name,
            email: newUser.email,
            userID: newUser._id,
          },
    });
  };

  const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }
    const payload = {
      id: user._id,
    };
  
      const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '23h'})
  await User.findByIdAndUpdate(user._id, {token});
    res.json({
      token,
      user: {
        name: user.name,
        email,
      },
    });
  };

  const logout = async(req, res)=> {
    const {_id} = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});
    res.status(204).json();
  }

  const updateAvatar = async (req, res) => {
    const { _id } = req.user;
    if (!req.file) {
      throw HttpError(400, 'no download file');
    }
  
    const {path: oldPath, filename} = req.file;
  
    (await Jimp.read(oldPath)).resize(250, 250).write(oldPath);
    // await pic
    //   .autocrop()
    //   .cover(250, 250, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
    //   .writeAsync(oldPath);
  
    const newPath = path.join(avatarsPath, filename);
    await fs.rename(oldPath, newPath);
    const avatarURL = path.join('avatars', filename);
    await User.findByIdAndUpdate(_id, { avatarURL });
  
  res.json({
    avatarURL,
  });
  };
  

  const currentUser = async (req, res) => {
    const { _id } = req.user;
    const { name, email, avatarURL, gender, waterRate } = await User.findById(_id, "-createdAt -updatedAt");
    res.json({
      name, email, avatarURL, gender, waterRate
    })
  }


const updateUser = async(req, res) =>{
    const { _id } = req.user;
    const updateUserInfo = req.body;
    const updateUser = await User.findByIdAndUpdate(_id , updateUserInfo);

    if (!updateUser) {
        return res.status(404).json({error : `User not found`})
    }
    const {
        name, email, avatarURL, gender, waterRate
      } = updateUser;
    res.status(200).json({
        name, email, avatarURL, gender, waterRate
      })
}
  





const updateWaterNorm = async (req, res) => {
    const { _id } = req.user;
    const { waterRate, gender } = req.body;
    await User.findByIdAndUpdate(_id, { waterRate, gender });
    res.status(200).json({ waterRate });
  }

  export default {
    register: crtlWrapper(register),
    login: crtlWrapper(login),
    logout: crtlWrapper(logout),
    updateAvatar: crtlWrapper(updateAvatar),
    currentUser: crtlWrapper(currentUser),
    updateUser: crtlWrapper(updateUser),
    updateWaterNorm: crtlWrapper(updateWaterNorm)
  };