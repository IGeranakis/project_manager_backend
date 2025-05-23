const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes/route');

app.use(cors());
app.use(express.json());
app.use('/', routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
