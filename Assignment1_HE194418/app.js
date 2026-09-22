
var express = require("express");
const app = express();
const port = 3000;


const articleRouter = require("./routes/articleRouter");
const commentRouter = require("./routes/commentRouter");


app.use(express.json());

app.use(express.urlencoded({extended: true}));


app.use("/articles", articleRouter);
app.use("/comments", commentRouter);


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
module.exports = app;
