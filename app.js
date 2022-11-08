const path = require("path");
const fileUpload = require("express-fileupload");
const debug = require("debug")("weblog-project");
const express = require("express");

const dotEnv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler } = require("./middlewares/errors");
const { setHeaders } = require("./middlewares/headers");

// Load Config
dotEnv.config({ path: "./config/config.env" });
connectDB();

const app = express();

// express fileupload
app.use(fileUpload());
// Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(setHeaders);

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/blog"));
app.use("/users", require("./routes/users"));
app.use("/dashboard", require("./routes/dashboard"));

//* Error Controller
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  debug(`Server is running in ${process.env.NODE_ENV} mode on port number : ${PORT}`)
);
