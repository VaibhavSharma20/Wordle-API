# Wordle
A Game of Wordle 


# Getting Started

To start this project please go to RapidAPI to sign up for the [APIs](https://bit.ly/rapidapi-hub). 



### `.env`
Now create a `.env` file in the root of your project with the following:

```
RAPID_API_KEY={your_rapid_api_key}
MONGO_URL={your_mongo_url}
```

### `create config.js file`
Now create a `config.js` file in the root of your project with the following syntax:

```
const firebase = require("firebase");

const firebaseConfig = {
  apiKey: ,
  authDomain: ,
  projectId: ,
  storageBucket: ,
  messagingSenderId: ,
  appId: 
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const Words = db.collection("Words");
module.exports = Words;

```

To run this project please type the following commands:

### `npm i`

This will install all the necessary dependencies.

### `npm run start:backend`

This will start the backend on  [http://localhost:8000](http://localhost:8000).

### `copy the path to your index.html file`

Copy the path to this file and paste it in your browser to see the game and play.
