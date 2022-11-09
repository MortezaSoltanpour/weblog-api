const fs = require("fs");
const multer = require("multer");
const sharp = require("sharp");
const uuid = require("uuid").v4;
const appRoot = require("app-root-path");
const Blog = require("../models/Blog");
var path = require("path");

const { fileFilter } = require("../utils/multer");
const util = require("../utils/helpers");

exports.editPost = async (req, res, next) => {
  const errorArr = [];

  const post = await Blog.findOne({ _id: req.params.id });
  try {
    const thumbnail = req.files
      ? req.files.thumbnail
      : { name: post.thumbnail, size: 10, mimetype: "image/jpeg" };
    req.body = { ...req.body, thumbnail };
    await Blog.postValidation(req.body);

    if (!post) {
      const error = new Error("پست یافت نشد");
      error.statusCode = 400;
      throw error;
    }
    if (post.user.toString() != req.userId) {
      const error = new Error("شما مجوز ویرایش این پست را ندارید");
      error.statusCode = 400;
      throw error;
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

      return res.status(200).json({ message: "پست با موفقیت ویرایش گردید" });
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
    res.status(400).json({ errorArr });
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Blog.findOne({ _id: req.params.id });

    if (!post) {
      const error = new Error("پست یافت نشد");
      error.statusCode = 400;
      throw error;
    }

    fs.unlink(
      `${appRoot}/public/uploads/thumbnails/${post.thumbnail}`,
      async (err) => {
        if (err) console.log(err);
        else await Blog.findByIdAndRemove(req.params.id);
      }
    );

    res.status(200).json({ message: "پست با موفقیت حذف گردید" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.createPost = async (req, res) => {
  const errorArr = [];
  const thumbnail = req.files ? req.files.thumbnail : {};
  try {
    if (!req.files) {
      errorArr.push({
        name: "image",
        message: "تصویر الزامی می باشد",
      });

      throw error;
    }

    const fileName = `${util.replaceAll(uuid(), "-", "")}${path.extname(
      thumbnail.name
    )}`;

    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

    req.body = { ...req.body, thumbnail };

    await Blog.postValidation(req.body);

    await sharp(thumbnail.data)
      .jpeg({ quality: 60 })
      .toFile(uploadPath)
      .catch((err) => console.log(err));

    const postCreated = await Blog.create({
      ...req.body,
      user: req.userId,
      thumbnail: fileName,
    });

    res.status(200).json({
      _id: postCreated._id.toString(),
      message: "مطلب با موفقیت ذخیره گردید",
    });
  } catch (err) {
    console.log(err);

    if (err.inner) {
      err.inner.forEach((e) => {
        errorArr.push({
          name: e.path,
          message: e.message,
        });
      });
    }
    return res.status(400).json({ errorArr });
  }
};

exports.uploadImage = (req, res) => {
  const upload = multer({
    limits: { fileSize: 4000000 },
    fileFilter: fileFilter,
  }).single("image");

  upload(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(422).json({
          error: "حجم عکس ارسالی نباید بیشتر از 4 مگابایت باشد",
        });
      }
      res.status(400).json({ error: err });
    } else {
      if (req.files) {
        const fileName = `${shortId.generate()}_${req.files.image.name}`;
        await sharp(req.files.image.data)
          .jpeg({
            quality: 60,
          })
          .toFile(`./public/uploads/${fileName}`)
          .catch((err) => console.log(err));
        res.status(200).json({
          image: `http://localhost:3000/uploads/${fileName}`,
        });
      } else {
        res.status(400).json({
          error: "جهت آپلود باید عکسی انتخاب کنید",
        });
      }
    }
  });
};
