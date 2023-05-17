const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;
app.use(express.json());

const users = [
  { id: "1", username: "john", password: "123", isAdmin: true },
  { id: "2", username: "jane", password: "456", isAdmin: false },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    //Generate an access token
    const access_token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      "mySecretKey"
    );
    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      access_token: access_token,
    });
  } else {
    res.status(400).json({ message: "User not found" });
  }
});

const verifyToken = (req, res, next) => {
  //take the token from the header
  const authHeader = req.headers.authorization;
  //check if the token exists
  if (authHeader) {
    const token = authHeader.split(" ")[1]; //Bearer TOKEN
    //verify the token
    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token is not valid" });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "You are not authenticated" });
  }
};

app.delete("/api/users/:userId", verifyToken, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json({ message: "User has been deleted" });
  }else{
    res.status(403).json({ message: "You are not allowed to delete this user" });
  }
});

app.get("/" , (req,res) => {
  res.send("Hello World")
})

app.listen(port, () => console.log("Server is running"));
