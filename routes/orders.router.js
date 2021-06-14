const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const Order = require('../models/orders.model');
const { jsonResponse } = require('../lib/jsonresponse');
const auth = require('../auth/auth.middleware');

router.get('/', async (req, res, next) => {
    let results = {};
    try {
        results = await Order.find({}, 'id user total date products')
    } catch (error) {
        next(createError(500, `Error al obtener los resultados`))
    }

    res.json(jsonResponse(200, { results }))
})

router.post('/', auth.checkAuth, async (req, res, next) => {
    const { iduser, products } = req.body;
    if (!iduser || !products) {
        next(createError(400, `no se proporciona información para crear un pedido`))
    } else if (iduser && products && products.length > 0) {
        const order = new Order({ iduser, products });

        try {
            const result = await order.save();


        } catch (error) {
            return next(createError(500, error))
        }
        res.json(jsonResponse(200, { message: `Orden creada Correctamente` }))
    }
})

router.get('/:idproduct', async (req, res, next) => {
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

router.put('/:idproduct', async (req, res, next) => {
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

router.delete('/:idproduct', async (req, res, next) => {
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
