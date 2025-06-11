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
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');

dotenv.config();
app.use(cors({
    credentials:true,
    origin:'https://insight.cmtprooptiki.gr',
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow specific headers
    preflightContinue: false,  // Set to false to handle OPTIONS in route
    optionsSuccessStatus: 204,  // 204 status code for successful OPTIONS request
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE','PATCH'],
}));
app.use(express.json());
app.use(session({
    secret:process.env.SESS_SECRET,
    resave:false,
    saveUninitialized:"true",
    store:store,
    cookie:{
        secure:'auto',
        httpOnly:true,
        sameSite:"lax"
    }
}))
app.use('/uploads', express.static('uploads'));
app.use('/', routes);
app.use(UserRoute);
app.use(AuthRoute);
// Sync table
Users.sync({ alter: true }) // Or use { force: true } to drop & recreate
  .then(() => console.log('Users table synced'))
  .catch((err) => console.error('Error syncing users table:', err));



const credentials = {
    key: fs.readFileSync("/home/insight/ssl/keys/96bf4_9c751_fbca2bcffecae297377260f177c8e681.key"),
    cert: fs.readFileSync("/home/insight/ssl/certs/api_insight_cmtprooptiki_gr_96bf4_9c751_1756894744_f653f2a0c44a4b224669ffdba7b70b2e.crt"),

};

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(process.env.APP_PORT, () => {
    console.log("Server up and running over HTTPS....");
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
