const bcrypt = require("bcrypt");
const Joi = require("joi");
const { User } = require("../models/user");
const genAuthToken = require("../utils/genAuthToken");

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().min(3).max(100).required().email(),
    password: Joi.string().min(6).max(200).required(),
  });

  const { error } = userSchema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email });

  if (user) return res.status(400).send("User already exist.");

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = genAuthToken(newUser);

  res.send(token);
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  const userSchema = Joi.object({
    email: Joi.string().min(3).max(100).required().email(),
    password: Joi.string().min(6).max(200).required(),
  });

  const { error } = userSchema.validate(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).send("Invalid email or password.");

  const token = genAuthToken(user);

  res.send(token);
};
