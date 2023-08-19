const User = require("../models/user");

const Joi = require("joi");
const { HttpError } = require("../helpers");

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// !=================== joi Schemas ================

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

// const logInSchema = Joi.object({
//   email: Joi.string().required(),
//   password: Joi.string().min(6).required(),
// });

// !=================== controllers ================

const register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    throw HttpError(404, "missing required name field");
  }

  const newUser = await User.create(req.body);
  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
  });
};

module.exports = {
  register,
};
