const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

//EJS TEMPLATE ENGINE
app.set("view engine", "ejs");

//MIDLEWARES
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

//DATABASES
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "User1ID",
    email: "user1@example.com",
    password: "purple-monkey-dinosaur",
  },

  user2RandomID: {
    id: "User2ID",
    email: "user2@example.com",
    password: "dishwasher-funk",
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
    password,
  };
  return id;
};

const checkEmail = (database, email) => {
  for (const user in database) {
    if (users[user]["email"] === email) {
      return true;
    }
  }
  return false;
};

//URL ROUTES
app.get("/", (req, res) => {
  res.send("Hello!");
});

// get request registration endpoint
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies.userID]
  };
  res.render("urls_register", templateVars);
  res.redirect("/urls");
});

//Login endpoint
app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.user_id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.userID],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userID]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.userID],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.params.longURL;
  urlDatabase[shortURL] = longURL;
  
  res.redirect("/urls");
});

// register post request
app.post("/register", (req, res) => {
  const { emailEntered, passwordEntered } = req.body;

  //Checks for password or email blank fields
  if (!emailEntered && !passwordEntered) {
    res.status = 400;
    res.status(400).send("Please enter a valid email or password!");
  }
  // checks for already registered email.
  if (checkEmail(users, emailEntered)) {
    res.status = 400;
    res.send("This email is already in use, login or sign up with a different email.");
  } else {
    const user_id = addUser(emailEntered, passwordEntered);
    res.cookie("user_id", user_id);
    console.log(users);
    res.redirect("/urls");
  }
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});