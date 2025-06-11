const express = require('express');
const express_session = require('express-session')
const cors = require('cors');
const app = express();
const routes = require('./routes/route');
const UserRoute = require('./routes/UserRoute');
const Users = require('./models/userModel');
const session = require('express-session');
const store = require('./config/db');
const AuthRoute = require('./routes/AuthRoute');

app.use(cors({
    credentials:true,
    origin:'http://localhost:3000',
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow specific headers
    preflightContinue: false,  // Set to false to handle OPTIONS in route
    optionsSuccessStatus: 204,  // 204 status code for successful OPTIONS request
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE','PATCH'],
}));
app.use(express.json());
app.use('/', routes);
app.use('/uploads', express.static('uploads'));
app.use(UserRoute);
app.use(AuthRoute);
// Sync table
Users.sync({ alter: true }) // Or use { force: true } to drop & recreate
  .then(() => console.log('Users table synced'))
  .catch((err) => console.error('Error syncing users table:', err));

app.use(session({
    secret:process.env.SESS_SECRET,
    resave:false,
    saveUninitialized:"true",
    store:store,
    cookie:{
        secure:false,
        httpOnly:true,
        sameSite:"lax"
    }
}))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
