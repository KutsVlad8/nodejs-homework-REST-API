const User = require("../models/user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");
require("dotenv").config();

const { SECRET_KEY, BASE_URL } = process.env;
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const Joi = require("joi");

const { HttpError, ctrlWrapper, sendEmail } = require("../helpers");

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// !=================== joi Schemas ================

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
});

const logInSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

// !=================== controllers ================

const register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    throw HttpError(404, "missing required  field");
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email alredy in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarUrl = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarUrl,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/users/verify/${verificationToken}">Click verify email<a/>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;

  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.status(200).json({
    message: "Verification successful",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { error } = emailSchema.validate(req.body);
  if (error) {
    throw HttpError(400, "missing required  field");
  }

  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(400, "Email not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/users/verify/${user.verificationToken}">Click verify email<a/>`,
  };

  await sendEmail(verifyEmail);

  res.status(200).json({
    message: "Verification email sent",
  });
};

const login = async (req, res) => {
  const { error } = logInSchema.validate(req.body);
  if (error) {
    throw HttpError(404, "missing required  field");
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }

  if (!user.verify) {
    throw HttpError(401, "Email not verified");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.status(201).json({
    token,
  });
};

const getCurrent = async (req, res) => {
  const { email, name } = req.user;

  res.json({
    name,
    email,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "Logout success",
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;

  Jimp.read(tempUpload, (err, image) => {
    if (err) throw err;
    image.resize(250, 250).write(`${avatarsDir}/${_id}_${originalname}`);
  });

  const avatarName = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, avatarName);

  await fs.rename(tempUpload, resultUpload);

  const avatarUrl = path.join("avatars", avatarName);
  await User.findByIdAndUpdate(_id, { avatarUrl });

  res.json({ avatarUrl });
};

module.exports = {
  register: ctrlWrapper(register),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
};
