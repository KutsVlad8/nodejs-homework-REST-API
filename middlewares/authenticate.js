const jwt = require("jsonwebtoken");
const { HttpError } = require("../helpers");
const { SECRET_KEY } = process.env;
const User = require("../models/user");

const authenticate = (req, res, next) => {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    next(HttpError(401));
  }

  try {
    const { id } = jwt.verify(token, SECRET_KEY);
    const user = User.findById(id);

    if (!user) {
      next(HttpError(401));
    }

    next();
  } catch {
    next(HttpError(401));
  }
};

module.exports = authenticate;
