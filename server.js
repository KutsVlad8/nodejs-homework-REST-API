const app = require("./app");
const mongoose = require("mongoose");

// const DB_HOST =
//   "mongodb+srv://Vladyslav:nKkTMtrp8QSGU9Wr@cluster0.axzivqu.mongodb.net/db-contacts?retryWrites=true&w=majority";

const { DB_HOST } = process.env;

mongoose.set("strictQuery", true);

// console.log(process.env.DB_HOST);

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(3000);
    console.log("Database connect success");
  })
  .catch((error) => console.log(error.message));

// nKkTMtrp8QSGU9Wr
