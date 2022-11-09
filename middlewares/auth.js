const jwt = require("jsonwebtoken");

exports.authenticated = (req, res, next) => {
  const authHeader = req.get("Authorization");

  try {
    if (!authHeader) {
      const error = new Error("مجوز کافی ندارید");
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(" ")[1]; //Bearer Token => ['Bearer', token]

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      const error = new Error("شما مجوز کافی ندارید");
      error.statusCode = 401;
      throw error;
    }

    req.userId = decodedToken.user.userId;
    next();
  } catch (err) {
    next(err);
  }
};
