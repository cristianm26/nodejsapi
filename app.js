var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

require('dotenv').config();


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users.router');
var productsRouter = require('./routes/products.router');
var ordersRouter = require('./routes/orders.router');
var authRouter = require('./routes/auth.router');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * La conexion a la base de datos
 */
mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})

const connection = mongoose.connection;

connection.on('error', () => {
  console.log('Error de conexión en la base de datos')
})

connection.once('open', () => {
  console.log('Conectando a la base de datos')
})

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/auth', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, 'La ruta no existe'));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    errorcode: err.status || 500,
    message: res.locals.message
  });
});

module.exports = app;
