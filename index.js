const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
require("dotenv").config();
const app = express();

const axios = require("axios").default;

app.use(cors());
app.use(formidable());

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
  console.log(req.params.characterId);

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
  try {
    const response = await axios.get(
      ` https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.MARVEL_API_KEY}`
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

app.listen(process.env.PORT, () => {
  console.log("Server Marvel Started 🚀");
});
