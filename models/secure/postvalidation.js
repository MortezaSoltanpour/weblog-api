const Yup = require("yup");

exports.schema = Yup.object().shape({
  title: Yup.string()
    .required("عنوان پست الزامی می باشد")
    .min(5, "عنوان پست نباید کمتر از 5 کارکتر باشد")
    .max(100, "عنوان پست نباید بیشتر از 100 کاراکتر باشد"),
  body: Yup.string().required("پست جدید باید دارای محتوا باشد"),
  status: Yup.mixed().oneOf(
    ["public", "private"],
    "یکی از 2 وضعیت خصوصی یا عمومی را انتخاب کنید"
  ),
  thumbnail: Yup.object().shape({
    name: Yup.string().required("عکس الزامی می باشد"),
    size: Yup.number().max(
      3 * 1024 * 1024,
      "عکس نباید بیشتر از 3 مگابایت باشد"
    ),
    mimetype: Yup.mixed().oneOf(
      ["image/jpeg", "image/png"],
      "تنها پسوندهای png و jpeg پشتیبانی می شوند"
    ),
  }),
});
