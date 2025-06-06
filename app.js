const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes/route');
const User = require('./models/userModel');

app.use(cors());
app.use(express.json());
app.use('/', routes);

// Sync table
User.sync({ alter: true }) // Or use { force: true } to drop & recreate
  .then(() => console.log('Users table synced'))
  .catch((err) => console.error('Error syncing users table:', err));

const authRoutes = require('./routes/AuthRoute');
app.use('/api', authRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
