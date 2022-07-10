const firebase = require("firebase");

const firebaseConfig = {
  apiKey: "AIzaSyDawp6S2_7yyhN_4jTx6spGLyTUgJbDg1Y",
  authDomain: "wordle-game-aef05.firebaseapp.com",
  projectId: "wordle-game-aef05",
  storageBucket: "wordle-game-aef05.appspot.com",
  messagingSenderId: "478367473963",
  appId: "1:478367473963:web:fd935f811e39db55e8a56e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const Words = db.collection("Words");
module.exports = Words;
