const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require("./helpers")
const PORT = 8080; // default port 8080


//EJS TEMPLATE ENGINE
app.set("view engine", "ejs");

//MIDDLEWARES
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"],
}));

//DATABASES
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userID: {
    id: "userID",
    email: "user1@example.com",
    password: bcrypt.hashSync("purplemonkeydinosaur", 10),
  },
  user2ID: {
    id: "user2ID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
};

//FUNCTIONS
function generateRandomString() {
  return Math.random().toString(36).substring(6);
}

const addUser = (email, password) => {
  let id = generateRandomString();

  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  return id;
};

const urlsForUser = (id) => {
  const userURLs = {};
  let db = Object.keys(urlDatabase);

  for (let shortURLID of db) {
    if (urlDatabase[shortURLID]["userID"] === id) {
      console.log(urlDatabase[shortURLID]["userID"]);
      userURLs[shortURLID] = urlDatabase[shortURLID];
    }
  }
  return userURLs;
};

//URL ROUTES
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]],
    urls: urlsForUser(req.session["user_id"]),
  };

  if (templateVars.user) {
    res.render("urls_index", templateVars)
  } else {
    res.status(400).send("You must be logged in to have access to your URLs.");
    res.redirect
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]]
  };

  if (!templateVars.user) {
    res.render("urls_login", templateVars);
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    longURL: urlDatabase[req.params.id]["longURL"],
    user: users[req.session["user_id"]],
  };

  if (req.session["user_id"] === urlDatabase[req.params.id]["userID"]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Error, the following URL does not belong to you!")
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// get request registration endpoint
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  res.render("urls_register", templateVars);
  // req.redirect("/urls");
});

//GET /login endpoint that reponds with a new login form template
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session["user_id"]]
  };
  res.render("urls_login", templateVars);
  // res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"],
  };
  res.redirect(`/urls/${shortURL}`);
});

//Deletes URl resources
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session["user_id"];
  const id = req.params.id;

  if (user !== urlDatabase[id]["userID"]) {
    res.status(400).send("Error, Do Not Have Permission To Delete This URL.");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

//Updates URL
app.post("/urls/:id", (req, res) => {
  // const shortURL = req.params.shortURL;
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  
  urlDatabase[shortURL]["longURL"] = longURL;

  const user = req.session["user_id"];
  if (user !== urlDatabase[shortURL]["user_id"]) {
    res.status(400).send("You don't have permission to edit the following URL.");
  } else {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${shortURL}`);
  }
  // res.redirect("/urls/new");
});

//Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user) {
    res.status(403).send("Error, email not found!");
  } else if (!bcrypt.compareSync(password, users[user]["password"])) {
    res.status(403).send("Error, wrong password!");
  } else {
    // req.session("user_id", user);
    req.session.user_id = user;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// register post request
app.post("/register", (req, res) => {
  const { emailEntered, passwordEntered } = req.body;

  //Checks for password or email blank fields
  if (!emailEntered || !passwordEntered) {
    res.status(400).send("Error, Please enter an email or password!(blank)");
  }
  // checks for already registered email.
  if (getUserByEmail(emailEntered, users)) {
    res.status(400).send("Error, this email is already registered, login or sign up with a different email.");
  // creates a new user if above are false.
  } else {
    const user_id = addUser(emailEntered, passwordEntered);
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});