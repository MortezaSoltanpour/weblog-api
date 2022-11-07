const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const uuid = require("uuid").v4;
const appRoot = require("app-root-path");
const Blog = require("../models/Blog");
var path = require("path");

const { fileFilter } = require("../utils/multer");

exports.getDashboard = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = process.env.PAGE_CONTENT;

  try {
    const numberOfPosts = await Blog.find({
      user: req.user._id,
    }).countDocuments();

    const blogs = await Blog.find({ user: req.user.id })
      .sort({
        createdAt: "desc",
      })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);

    res.render("private/blogs", {
      pageTitle: "بخش مدیریت | داشبورد",
      path: "/dashboard",
      layout: "./layouts/dashlayout",
      fullname: req.user.fullname,
      blogs,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPosts,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPosts / postPerPage),
      postPerPage,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.getAddPost = (req, res) => {
  res.render("private/addPost", {
    pageTitle: "بخش مدیریت | ساخت پست جدید",
    path: "/dashboard/add-post",
    layout: "./layouts/dashLayout",
    fullname: req.user.fullname,
  });
};

exports.getEditPost = async (req, res) => {
  const post = await Blog.findOne({
    _id: req.params.id,
  });

  if (!post) {
    return res.redirect("errors/404");
  }

  if (post.user.toString() != req.user._id) {
    return res.redirect("/dashboard");
  } else {
    res.render("private/editPost", {
      pageTitle: "بخش مدیریت | ویرایش پست",
      path: "/dashboard/edit-post",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname,
      post,
    });
  }
};

exports.editPost = async (req, res) => {
  const errorArr = [];

  const post = await Blog.findOne({ _id: req.params.id });
  try {
    const thumbnail = req.files
      ? req.files.thumbnail
      : { name: post.thumbnail, size: 10, mimetype: "image/jpeg" };
    req.body = { ...req.body, thumbnail };
    await Blog.postValidation(req.body);

    if (!post) {
      return res.redirect("errors/404");
    }
    if (post.user.toString() != req.user._id) {
      return res.redirect("/dashboard");
    } else {
      const { title, status, body } = req.body;

      post.title = title;
      post.status = status;
      post.body = body;

      if (req.files) {
        fs.unlink(
          `${appRoot}/public/uploads/thumbnails/${post.thumbnail}`,
          async (err) => {
            if (err) console.log(err);
          }
        );

        const fileName = `${util.replaceAll(uuid(), "-", "")}${path.extname(
          thumbnail.name
        )}`;
        const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
        await sharp(thumbnail.data)
          .jpeg({ quality: 60 })
          .toFile(uploadPath)
          .catch((err) => console.log(err));
        post.thumbnail = fileName;
      }

      await post.save();

      return res.redirect("/dashboard");
    }
  } catch (err) {
    console.log(err);
    //get500(req, res);
    err.inner.forEach((e) => {
      errorArr.push({
        name: e.path,
        message: e.message,
      });
    });
    res.render("private/editPost", {
      pageTitle: "بخش مدیریت | ویرایش پست",
      path: "/dashboard/edit-post",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname,
      errors: errorArr,
      post,
    });
  }
  res.redirect("/dashboard");
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Blog.findOne({ _id: req.params.id });
    fs.unlink(
      `${appRoot}/public/uploads/thumbnails/${post.thumbnail}`,
      async (err) => {
        if (err) console.log(err);
        else await Blog.findByIdAndRemove(req.params.id);
      }
    );

    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.render("errors/500");
  }
};

exports.createPost = async (req, res) => {
  const errorArr = [];
  const thumbnail = req.files ? req.files.thumbnail : {};
  const fileName = `${util.replaceAll(uuid(), "-", "")}${path.extname(
    thumbnail.name
  )}`;
  const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

  try {
    req.body = { ...req.body, thumbnail };

    await Blog.postValidation(req.body);

    await sharp(thumbnail.data)
      .jpeg({ quality: 60 })
      .toFile(uploadPath)
      .catch((err) => console.log(err));

    await Blog.create({ ...req.body, user: req.user.id, thumbnail: fileName });
  } catch (err) {
    console.log(err);
    //get500(req, res);

    if (err.inner) {
      err.inner.forEach((e) => {
        errorArr.push({
          name: e.path,
          message: e.message,
        });
      });
    }
    res.render("private/addPost", {
      pageTitle: "بخش مدیریت | ساخت پست جدید",
      path: "/dashboard/add-post",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname,
      errors: errorArr,
    });
  }
  res.redirect("/dashboard");
};

exports.uploadImage = (req, res) => {
  const upload = multer({
    limits: { fileSize: 4000000 },
    // dest: "uploads/",
    // storage: storage,
    fileFilter: fileFilter,
  }).single("image");

  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .send("حجم عکس ارسالی نباید بیشتر از 4 مگابایت باشد");
      }
      res.send(err);
    } else {
      if (req.file) {
        const filename = `${uuid()}_${req.file.originalname}`;
        await sharp(req.file.buffer)
          .jpeg({
            quality: 60,
          })
          .toFile(`./public/uploads/${filename}`)
          .catch((err) => console.log(err));
        res.status(200).send(`http://localhost:3000/uploads/${filename}`);
      } else {
        res.send("جهت آپلود باید عکسی انتخاب کنید");
      }
    }
  });
};

exports.handleDashSearch = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = 2;

  try {
    const numberOfPosts = await Blog.find({
      user: req.user._id,
      //$text: { $search: req.body.search },
      title: { $regex: ".*" + req.body.search + ".*" },
    }).countDocuments();
    const blogs = await Blog.find({
      user: req.user.id,
      //$text: { $search: req.body.search },
      title: { $regex: ".*" + req.body.search + ".*" },
    })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);

    res.render("private/blogs", {
      pageTitle: "بخش مدیریت | داشبورد",
      path: "/dashboard",
      layout: "./layouts/dashLayout",
      fullname: req.user.fullname,
      blogs,
      currentPage: page,
      nextPage: page + 1,
      previousPage: page - 1,
      hasNextPage: postPerPage * page < numberOfPosts,
      hasPreviousPage: page > 1,
      lastPage: Math.ceil(numberOfPosts / postPerPage),
      postPerPage,
    });
  } catch (err) {
    console.log(err);
    get500(req, res);
  }
};
