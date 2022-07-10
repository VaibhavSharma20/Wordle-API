const axios = require("axios").default;
const express = require("express");
const cors = require("cors");
const dict = require(__dirname + "/dictionary.js");
const rword = require(__dirname + "/words.js");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
app.use(express.json());

const Words = require("./config");

const dbSchema = {
  id: Number,
  games: Number,
  share: Number,
  thumbsup: Number,
  thumbsdown: Number,
};

const stat = mongoose.model("Stat", dbSchema);

let wordle = "";
let meridian;
let leaderboard = [];
let scoreTime = [];
let thumbsup = 0;
let thumbsdown = 0;
let shares = 0;
let gamesplayed = 0;
let wordlist = [];

stat.find(function (err, val) {
  if (val[0] == undefined) {
    const values = new stat({
      id: 1,
      games: 0,
      share: 0,
      thumbsup: 0,
      thumbsdown: 0,
    });

    values.save();
  } else {
    thumbsup = val[0].thumbsup;
    thumbsdown = val[0].thumbsdown;
    shares = val[0].share;
    gamesplayed = val[0].games;

    //console.log(val[0]);
  }
});

app.use(cors());

app.get("/word", async (req, res) => {
  const options = {
    method: "GET",
    url: "https://world-time2.p.rapidapi.com/timezone/Asia/Kolkata",
    headers: {
      "X-RapidAPI-Host": "world-time2.p.rapidapi.com",
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    },
  };

  try {
    const response = await axios.request(options);

    let time = response.data.datetime.slice(11, 13);
    let day = String(response.data.day_of_year);

    time = parseInt(time);
    if (time >= 0 && time <= 11) {
      M = "AM" + day;
    } else {
      M = "PM" + day;
    }

    if (wordle == "" || meridian != M) {
      wordlist = [];
      meridian = M;
      const snapshot = await Words.get();
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      for (var i = 0; i < data.length; i++) {
        if (data[i].word == wordle) {
          data.splice(i, 1);
          i--;
        }
      }
      if (data[0] == undefined) {
        wordle = rword.words[Math.floor(Math.random() * rword.words.length)];
        // console.log(wordle);
        res.json(wordle);
      } else {
        data.forEach(async (val) => {
          wordlist.push(val.word);
          if (wordlist.length == data.length) {
            wordle = wordlist[Math.floor(Math.random() * wordlist.length)];
            //  console.log(wordle);
            await Words.doc(wordle).delete();

            res.json(wordle);
          }
        });
      }

      leaderboard = [];
      scoreTime = [];
    } else {
      // console.log(wordle);
      res.json(wordle);
    }
  } catch (error) {
    console.error(error);
  }
});

app.get("/check", (req, res) => {
  console.log(wordlist);
  let word = req.query.word;
  let word1 = word.toLowerCase();
  let word2 = word.toUpperCase();

  if (dict.dictionary.includes(word1)) {
    res.json(dict.dictionary.includes(word1));
  } else if (wordlist.includes(word2)) {
    res.json(wordlist.includes(word2));
  } else if (word1 == wordle || word2 == wordle) {
    res.json("true");
  } else {
    res.json(false);
  }
  // console.log(dict.dictionary.includes(word));
  //console.log(wordlist);
});

app.get("/weekno", (req, res) => {
  const options = {
    method: "GET",
    url: "https://world-time2.p.rapidapi.com/timezone/Asia/Kolkata",
    headers: {
      "X-RapidAPI-Host": "world-time2.p.rapidapi.com",
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      // console.log(response.data.week_number);
      res.json(response.data.week_number);
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.post("/leaderboard", (req, res) => {
  const options = {
    method: "GET",
    url: "https://world-time2.p.rapidapi.com/timezone/Asia/Kolkata",
    headers: {
      "X-RapidAPI-Host": "world-time2.p.rapidapi.com",
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      const time = response.data.datetime.slice(11, 19);
      points = req.body.Score;

      if (leaderboard.length < 5) {
        leaderboard.push(points);
        scoreTime.push(time);
        for (i = 0; i < leaderboard.length; i++) {
          for (j = 0; j < leaderboard.length; j++) {
            if (leaderboard[j] < leaderboard[j + 1]) {
              temp = leaderboard[j];
              leaderboard[j] = leaderboard[j + 1];
              leaderboard[j + 1] = temp;

              temp = scoreTime[j];
              scoreTime[j] = scoreTime[j + 1];
              scoreTime[j + 1] = temp;
            }
          }
        }
      } else {
        for (i = 0; i < 5; i++) {
          if (leaderboard[i] < points) {
            leaderboard.splice(i, 0, points);
            scoreTime.splice(i, 0, time);
            leaderboard = leaderboard.slice(0, 5);
            scoreTime = scoreTime.slice(0, 5);
            break;
          }
        }
      }
      // console.log(leaderboard)
      // console.log(scoreTime)
    })
    .catch(function (error) {
      console.error(error);
    });
});

app.get("/getleaderboard", (req, res) => {
  res.json({ leaderboard, scoreTime });
});

app.post("/feedbackup", (req, res) => {
  const thumbs = req.body.up;
  thumbsup = thumbsup + thumbs;

  stat.updateOne({ id: 1 }, { thumbsup: thumbsup }, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

app.post("/feedbackdown", (req, res) => {
  const thumbs = req.body.down;
  thumbsdown = thumbsdown + thumbs;

  stat.updateOne({ id: 1 }, { thumbsdown: thumbsdown }, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

app.post("/share", (req, res) => {
  shares = shares + 1;
  // console.log(shares);
  stat.updateOne({ id: 1 }, { share: shares }, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

app.post("/gamesplayed", (req, res) => {
  gamesplayed = gamesplayed + 1;
  //console.log(gamesplayed);
  stat.updateOne({ id: 1 }, { games: gamesplayed }, function (err) {
    if (err) {
      console.log(err);
    }
  });
});

app.get("/dashboard", (req, res) => {
  stat.find(function (err, val) {
    if (err) {
      console.log(err);
    } else {
      var values = val[0];
      res.json(values);
    }
  });
});

app.get("/get", async (req, res) => {
  const snapshot = await Words.get();
  const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.send(list);
});

app.post("/create", async (req, res) => {
  const word = req.body.word;
  const insert = Words.doc(word);
  await insert.set({
    word: word,
  });
  res.send({ msg: "Added" });
});

app.post("/delete", async (req, res) => {
  const word = req.body.word;
  await Words.doc(word).delete();
  res.send({ msg: "Deleted" });
});

mongoose.connect("mongodb://localhost:27017/statsDB", {
  useNewUrlParser: true,
});
const port = process.env.PORT || 8000;
app.listen(port, () => console.log("Server running on port " + port));
