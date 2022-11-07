const Yup = require("yup");
const Blog = require("../models/Blog");
const { sendEmail } = require("../utils/mailer");

exports.getIndex = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = process.env.PAGE_CONTENT;

  try {
    const numberOfPosts = await Blog.countDocuments({ status: "public" });

    const posts = await Blog.find({ status: "public" })
      .sort({
        createdAt: "desc",
      })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);

    res.status(200).json({ posts, total: numberOfPosts });
  } catch (err) {
    res.status(400).json({ err });
  }
};

exports.getSinglePost = async (req, res) => {
  try {
    const post = await Blog.findOne({ _id: req.params.id }).populate("user");

    if (!post) return res.redirect("/errors/404");

    res.status(200).json({ post });
  } catch (err) {
    console.log(err);
    // get500(req, res);
    res.redirect("/errors/500");
  }
};

exports.handleContactPage = async (req, res) => {
  const errorArr = [];

  const { fullname, email, message } = req.body;

  const schema = Yup.object().shape({
    fullname: Yup.string().required("نام و نام خانوادگی الزامی می باشد"),
    email: Yup.string()
      .email("آدرس ایمیل صحیح نیست")
      .required("آدرس ایمیل الزامی می باشد"),
    message: Yup.string().required("پیام اصلی الزامی می باشد"),
  });

  try {
    await schema.validate(req.body, { abortEarly: false });

    sendEmail(
      email,
      fullname,
      "پیام از طرف وبلاگ",
      `${message} <br/> ایمیل کاربر : ${email}`
    );

    res.status(200).json({ message: "پیام شما با موفقیت ارسال گردید" });
  } catch (err) {
    err.inner.forEach((e) => {
      errorArr.push({
        name: e.path,
        message: e.message,
      });
    });

    res.status(400).json({ errorArr });
  }
};

exports.handleSearch = async (req, res) => {
  const page = +req.query.page || 1;
  const postPerPage = 5;

  try {
    const keyword = req.body.search.trim();
    const numberOfPosts = await Blog.find({
      status: "public",
      //$text: { $search: keyword },
      title: { $regex: ".*" + keyword + ".*" },
    }).countDocuments();

    const posts = await Blog.find({
      status: "public",
      //$text: { $search: keyword },
      title: { $regex: ".*" + keyword + ".*" },
    })
      .sort({
        createdAt: "desc",
      })
      .skip((page - 1) * postPerPage)
      .limit(postPerPage);

    res.status(200).json({ posts, numberOfPosts });

    //? Smooth Scrolling
  } catch (err) {
    console.log(err);
    res.status(400).json({ err });
  }
};
