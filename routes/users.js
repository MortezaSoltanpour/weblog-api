const { Router } = require("express");
const { authenticated } = require("../middlewares/auth");

const userController = require("../controllers/userController");

const router = new Router();

//  @desc   Login Handle
//  @route  POST /users/login
router.post("/login", userController.handleLogin);

//  @desc   Login Handle
//  @route  GET /users/logout
router.get("/logout", authenticated, userController.logout);

//  @desc   Register Handle
//  @route  POST /users/register
router.post("/register", userController.createUser);

//  @desc   Forget Password Page
//  @route  GET /users/forget-password
router.get("/forget-password", userController.forgetPasswrod);

//  @desc   Handle Forget Password
//  @route  POST /users/forget-password
router.post("/forget-password", userController.handleForgetPassword);

//  @desc   Reset Password Page
//  @route  GET /users/reset-password/:token
router.get("/reset-password/:token", userController.resetPassword);

//  @desc   Handle reset Password
//  @route  POST /users/reset-password/:id
router.post("/reset-password/:id", userController.handleResetPassword);

module.exports = router;
