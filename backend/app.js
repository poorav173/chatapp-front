const express = require('express');
const cors = require('cors');
const app = express();
const authRoute = require('./Routes/authRoute');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const chatRoute = require('./Routes/chatRoute');
const messageRoute = require('./Routes/messageRoute');

const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use('/auth',authRoute);
app.use('/chat', chatRoute);
app.use('/message',messageRoute);

app.use(notFound);
app.use(errorHandler);
module.exports = app;