const express = require("express");
const { createUser, loginUser } = require("../controllers/users-controller");

const router = express.Router();

router.post("/", createUser);

router.post("/login", loginUser);

module.exports = { usersRouter: router };
