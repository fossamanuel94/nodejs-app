const express = require("express");
const app = express();
const users = require("./Routes/users");
const posts = require("./Routes/posts");
const comments = require("./Routes/comments");
const categories = require("./Routes/categories");
const jwt = require("./Routes/jwt")
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use('/users', users);
app.use('/posts', posts);
app.use('/comments', comments);
app.use('/categories', categories);
app.use('/jwt', jwt);


app.listen(8080, () => {
  console.log("Running on port 8080");
});
