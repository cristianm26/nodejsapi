var express = require('express');
const createError = require('http-errors');
var router = express.Router();
const User = require('../models/users.model');
const { jsonResponse } = require('../lib/jsonresponse');
const auth = require('../auth/auth.middleware');
/* GET users listing. */
router.get('/', auth.checkAuth, async function (req, res, next) {
  let results = {};

  try {
    results = await User.find({}, 'username password');
  } catch (ex) {

  }
  res.json(results);
});

router.post('/', auth.checkAuth, async function (req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    next(createError(400, 'Falta el nombre de usuario y / o contraseña'));
  } else if (username && password) {
    const user = new User({ username, password });
    const exists = await user.usernameExists(username);
    if (exists) {
      //Existe el nombre de usuario
      next(createError(400, 'El usuario ya existe'));

    } else {
      await user.save();
      res.json(jsonResponse(200, {
        messahe: 'Usuario creado Correctamente'
      }));
    }
  }

})


module.exports = router;
