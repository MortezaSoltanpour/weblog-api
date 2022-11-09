const { Router } = require("express");
const { authenticated } = require("../middlewares/auth");
const adminController = require("../controllers/adminController");

const router = new Router();

//  @desc   Dashboard Delete Post
//  @route  GET /dashboard/delete-post/:id
router.get("/delete-post/:id", authenticated, adminController.deletePost);

//  @desc   Dashboard handle post creation
//  @route  POST /dashboard/add-post
router.post("/add-post", authenticated, adminController.createPost);

//  @desc   Dashboard handle post Edit
//  @route  POST /dashboard/edit-post/:id
router.post("/edit-post/:id", authenticated, adminController.editPost);

//  @desc   Dashboard Handle Image Upload
//  @route  POST /dashboard/image-upload
router.post("/image-upload", authenticated, adminController.uploadImage);

//  @desc   Dashboard Handle Search
//  @route  POST /dashboard/search
router.post("/search", authenticated, adminController.handleDashSearch);

module.exports = router;
