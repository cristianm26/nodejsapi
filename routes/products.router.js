const express = require('express');
const createError = require('http-errors');
const router = express.Router();

const auth = require('../auth/auth.middleware');
const Product = require('../models/products.model');
const { jsonResponse } = require('../lib/jsonresponse');


router.get('/', auth.checkAuth, async (req, res, next) => {
    let results = {};
    try {
        results = await Product.find({}, 'title price')
    } catch (error) {
        next(createError(500, `Error al obtener los resultados`))
    }

    res.json(jsonResponse(200, { results }))
})

router.post('/', auth.checkAuth, async (req, res, next) => {
    const { title, price } = req.body;
    if (!title || !price) {
        next(createError(400, `Error al registrar el producto. Proporcione toda la información`))
    } else if (title && price) {

        try {
            const product = new Product({ title, price });
            await product.save();
        } catch (ex) {
            next(createError(500, `error al intentar registrar el producto, inténtalo de nuevo`))
        }
        res.json(jsonResponse(200, {
            message: 'El producto se ha creado correctamente'
        }))
    }
})

router.get('/:idproduct', auth.checkAuth, async (req, res, next) => {
    let results = {};
    const { idproduct } = req.params;
    if (!idproduct) next(createError(400, `No se ha encontrado El producto Id `))
    try {
        results = await Product.findById(idproduct, 'title price')
    } catch (error) {
        next(createError(500, `error al intentar obtener el producto o la identificación del producto es incorrecta`))
    }
    res.json(jsonResponse(200, {
        idproduct
    }))
})

router.put('/:idproduct', auth.checkAuth, async (req, res, next) => {
    let update = {};

    const { idproduct } = req.params;
    const { title, price } = req.body;

    if (!idproduct) next(createError(400, `No se ha encontrado El producto Id `));

    if (!title && !price) next(createError(400, `No hay información de producto disponible para actualizar`))

    if (title) update['title'] = title;
    if (price) update['price'] = price;

    try {
        await Product.findByIdAndUpdate(idproduct, update)
    } catch (error) {
        next(createError(500, `error al intentar actualizar el producto o la identificación del producto es incorrecta`))
    }
    res.json(jsonResponse(200, {
        message: `El producto ${idproduct} ha sido actualizado `
    }))
})

router.delete('/:idproduct', auth.checkAuth, async (req, res, next) => {
    const { idproduct } = req.params;

    try {
        await Product.findByIdAndDelete(idproduct);
    } catch (error) {
        next(createError(500, `error al intentar eliminar el producto o la identificación del producto es incorrecta`))
    }
    res.json(jsonResponse(200, {
        message: `El producto ${idproduct} ha sido eliminado `
    }))
})

module.exports = router;
