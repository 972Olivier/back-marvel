const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

require("dotenv").config();

const app = express();

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGOATLAS);
const User = require("./models/Users");

const axios = require("axios").default;

app.use(cors());
app.use(formidable());
//-------------------Route singup for create User--------------------//
//-----------and create token------//
app.post("/signup", async (req, res) => {
  try {
    const { name, username, password, description, email } = req.fields;
    const userEmail = await User.findOne({ email: email });
    // console.log("userEmail===>", userEmail);
    const userUsername = await User.findOne({
      "account.username": username,
    });
    // console.log("userUsername===>", userUsername);
    if (userEmail) {
      res.status(400).json({ error: "this email already exist" });
    } else if (userUsername) {
      res.status(400).json({ error: "this username already exist" });
    } else {
      if (name && username && password && description && email) {
        //si l'ensemble des élément sont là on continue
        const token = uid2(64);
        const salt = uid2(64);
        const hash = SHA256(password + salt).toString(encBase64);
        // console.log(hash);
        // console.log(token);
        // console.log(salt);
        const newUser = new User({
          account: {
            name: name,
            username: username,
            description: description,
          },

          email: email,
          salt: salt,
          hash: hash,
          token: token,
        });
        await newUser.save();
        res.json({
          _id: newUser._id,
          token: newUser.token,
          email: newUser.email,
          username: newUser.account.username,
          name: newUser.account.name,
          description: newUser.account.description,
        });
        console.log("L'user est dans la boîte");
      } else {
        res.status(400).json({ error: "il manque des paramètre" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//-------------------Route sign In ---------------------------------//
// for connexion if already an account
app.post("/signin", async (req, res) => {
  const { password, email } = req.fields;
  console.log(password, email);
  const findUser = await User.findOne({ email });
  console.log(findUser);
  if (findUser) {
    const hash = SHA256(password + findUser.salt).toString(encBase64);
    if (hash === findUser.hash) {
      res.json(findUser);
    } else {
      res.json("Unauthorized");
    }
  } else {
    res.json("Create an account before connexion");
  }
});

//-------------------Route of characters----------------------------//
app.get("/characters", async (req, res) => {
  // res.json("here");
  // console.log(req.query);
  const title = req.query.title;
  const skip = req.query.skip;
  let limit = req.query.limit;
  let page = "";
  let result = "";
  // console.log(title);
  // console.log(skip);
  // console.log(limit);
  if (limit === "") {
    limit = 100;
  }
  if (skip >= 2) {
    page = skip - 1;
  }
  if (skip >= 2) {
    result = page * limit;
  }
  // console.log(page);
  // console.log(result);
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.MARVEL_API_KEY}&name=${title}&skip=${result}&limit=${limit}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

app.get("/character/:characterId", async (req, res) => {
  // console.log(req.params.characterId);

  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/character/${req.params.characterId}?apiKey=${process.env.MARVEL_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});
//------------------------------routes of comics------------------//
app.get("/comics", async (req, res) => {
  const title = req.query.title;
  const skip = req.query.skip;
  let limit = req.query.limit;
  let page = "";
  let result = "";
  // console.log(title);
  // console.log(skip);
  // console.log(limit);
  if (limit === "") {
    limit = 100;
  }
  if (skip >= 2) {
    page = skip - 1;
  }
  if (skip >= 2) {
    result = page * limit;
  }
  // console.log(page);
  // console.log(result)
  try {
    const response = await axios.get(
      ` https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.MARVEL_API_KEY}&title=${title}&skip=${result}&limit=${limit}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

app.get("/comics/:characterId", async (req, res) => {
  // console.log(req.params.characterId);
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${req.params.characterId}?apiKey=${process.env.MARVEL_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Cette route n'existe pas" });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("Server Marvel Started 🚀");
});
