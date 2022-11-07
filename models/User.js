const mongoose = require("mongoose");
//const Yup = require("yup");
const { schema } = require("./secure/userValidation");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "نام و نام خانوادگی الزامی می باشد"],
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 255,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// const schema = Yup.object().shape({
//   fullname: Yup.string()
//     .required("نام و نام خانوادگی الزامی می باشد")
//     .min(4, "نام و نام خانوادگی نباید کمتر از 4 کاراکتر باشد")
//     .max(255, "نام و نام خانوادگی نباید بیشتر از 255 کاراکتر باشد"),
//   email: Yup.string()
//     .email("ایمیل معتبر نمی باشد")
//     .required("ایمیل الزامی می باشد"),
//   password: Yup.string()
//     .min(4, "کلمه عبور نباید کمتر از 4 کاراکتر باشد")
//     .max(255, "کلمه عبور نباید بیشتر از 255 کاراکتر باشد")
//     .required("کلمه عبور الزامی می باشد"),
//   confirmPassword: Yup.string()
//     .required("تکرار کلمه عبور الزامی می باشد")
//     .oneOf([Yup.ref("password"), "کلمه عبور و تکرار آن یکسان نیستند"]),
// });

userSchema.statics.userValidation = function (body) {
  return schema.validate(body, { abortEarly: false });
};

userSchema.pre("save", function (next) {
  let user = this;

  if (!user.isModified("password")) return next();

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);

    user.password = hash;
    next();
  });
});

const User = mongoose.model("User", userSchema);

module.exports = User;
