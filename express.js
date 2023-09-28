const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize session middleware
app.use(
  session({
    secret: 'bigsecrets', // 
    resave: false,
    saveUninitialized: true,
  })
);

// Server Variable Structure
const users = [
  {
    username: 'whovile',
    password: '#issa#password#', // 
  },
];

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.redirect('/login');
  }
}

app.get('/', (req, res) => {
  res.send('Welcome to the home page');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (users.some((user) => user.username === username)) {
    return res.render('register', { error: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ username, password: hashedPassword });

  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('login', { error: 'Invalid username or password' });
  }

  req.session.userId = username;

  res.redirect('/dashboard');
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  res.send(`Welcome to the dashboard, ${req.session.userId}!`);
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.clearCookie('connect.sid'); 
    res.redirect('/login');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
