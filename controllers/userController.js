const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { sendEmail } = require("../utils/mailer");

exports.handleLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const errMessage = "آدرس ایمیل یا کلمه عبور اشتباه است";
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error(errMessage);
      error.statusCode = 404;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (isEqual) {
      const token = jwt.sign(
        {
          user: {
            userId: user._id.toString(),
            email: user.email,
            fullname: user.fullname,
          },
        },
        process.env.JWT_SECRET
      );
      res.status(200).json({ token, userId: user._id.toString() });
    } else {
      const error = new Error(errMessage);
      error.statusCode = 404;
      throw error;
    }
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
  });
  req.session = null;
  //req.flash("success_msg", "خروج موفقیت آمیز بود");
  res.redirect("/users/login");
};

exports.createUser = async (req, res) => {
  const errors = [];
  try {
    await User.userValidation(req.body);
    const { fullname, email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      errors.push({
        message: "ایمیل وارد شده تکراری می باشد",
      });
      return res.render("register", {
        pageTitle: "ثبت نام کاربر",
        path: "/register",
        errors,
      });
    }

    const hash = await bcrypt.hash(password, 10);
    await User.create({
      fullname,
      email,
      password: hash,
    });

    //await User.create(req.body);

    req.flash("success_msg", "ثبت نام با موفقیت انجام شد");

    res.redirect("/users/login");
  } catch (err) {
    if (err.inner) {
      err.inner.forEach((e) => {
        errors.push({
          name: e.path,
          message: e.message,
        });
      });
    } else {
      console.log(err);
      errors.push({
        message: "خطایی رخ داده است",
      });
    }

    return res.render("register", {
      pageTitle: "ثبت نام کاربر",
      path: "/register",
      errors,
    });
  }
};

exports.forgetPasswrod = async (req, res) => {
  res.render("forgetPass", {
    pageTitle: "فراموشی رمز عبور",
    path: "/login",
    message: req.flash("success_msg"),
    error: req.flash("error"),
  });
};

exports.handleForgetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    req.flash("error", "کاربری با ایمیل در پایگاه داده ثبت نیست");

    return res.render("forgetPass", {
      pageTitle: "فراموشی رمز عبور",
      path: "/login",
      message: req.flash("success_msg"),
      error: req.flash("error"),
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const resetLink = `http://localhost:3000/users/reset-password/${token}`;

  console.log(resetLink);
  sendEmail(
    user.email,
    user.fullname,
    "فراموشی رمز عبور",
    `
      جهت تغییر رمز عبور فعلی رو لینک زیر کلیک کنید
      <a href="${resetLink}">لینک تغییر رمز عبور</a>
  `
  );

  req.flash("success_msg", "ایمیل حاوی لینک با موفقیت ارسال شد");

  res.render("forgetPass", {
    pageTitle: "فراموشی رمز عبور",
    path: "/login",
    message: req.flash("success_msg"),
    error: req.flash("error"),
  });
};

exports.resetPassword = async (req, res) => {
  const token = req.params.token;

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken);
  } catch (err) {
    console.log(err);
    if (!decodedToken) {
      return res.redirect("/404");
    }
  }

  res.render("resetPass", {
    pageTitle: "تغییر پسورد",
    path: "/login",
    message: req.flash("success_msg"),
    error: req.flash("error"),
    userId: decodedToken.userId,
  });
};

exports.handleResetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  console.log(password, confirmPassword);

  if (password !== confirmPassword) {
    req.flash("error", "کلمه های عبور یاکسان نیستند");

    return res.render("resetPass", {
      pageTitle: "تغییر پسورد",
      path: "/login",
      message: req.flash("success_msg"),
      error: req.flash("error"),
      userId: req.params.id,
    });
  }

  const user = await User.findOne({ _id: req.params.id });

  if (!user) {
    return res.redirect("/404");
  }

  user.password = password;
  await user.save();

  req.flash("success_msg", "پسورد شما با موفقیت بروزرسانی شد");
  res.redirect("/users/login");
};
