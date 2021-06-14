const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Token = require('../models/token.model');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;
const User = require('../models/users.model');
const { jsonResponse } = require('../lib/jsonresponse');

router.post('/signup', async (req, res, next) => {
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
            const accessToken = user.createAccessToken();
            const refreshToken = await user.createRefreshToken();
            await user.save();
            res.json(jsonResponse(200, {
                message: 'Usuario creado Correctamente',
                accessToken,
                refreshToken
            }));
        }
    }

})

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        next(createError(400, 'Falta el nombre de usuario y / o contraseña'));
    } else if (username && password) {
        let user = new User({ username, password });
        const userExists = user.usernameExists(username);
        if (userExists) {
            user = await User.findOne({ username });
            const passwordCorrect = user.isCorrectPassword(password, user.password);
            if (passwordCorrect) {
                const accessToken = user.createAccessToken();
                const refreshToken = await user.createRefreshToken();
                res.json(jsonResponse(200, {
                    message: 'Información de Usuario Correcto',
                    accessToken,
                    refreshToken
                }));
            } else {
                next(createError(400, 'Usuario y Contraseña incorrecta'));
            }
        } else {
            next(createError(400, 'Usuario y Contraseña incorrecta'));
        }
    }
})

router.post('/logout', async (req, res, next) => {
    const { refreshToken } = req.body;
    if (!refreshToken) next(createError(400, `No se ha proporcionado ningún token`))
    try {
        await Token.findOneAndRemove({ token: refreshToken });
        res.json({
            message: 'Logout Completamente'
        })
    } catch (error) {
        next(createError(400, `No se encontrado ningun token`))
    }
})

router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new Error('No token provided'));
    }

    try {

        const tokenDocument = await Token.findOne({ token: refreshToken });

        if (!token) {
            return next(new Error('No token found'));
        }

        const payload = jwt.verify(tokenDocument.token, REFRESH_TOKEN_SECRET);
        const accessToken = jwt.sign({ user: payload }, ACCESS_TOKEN_SECRET, { expiresIn: '10m' });

        res.json({
            accessToken
        });
    } catch (err) {

    }
});

module.exports = router;