const Mongoose = require('mongoose');
const User = require('./users.model');
const Product = require('./products.model');
const OrderSchema = new Mongoose.Schema({
    iduser: { type: String, required: true },
    products: [{ idproduct: String, title: String, price: Number, qty: Number }],
    total: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
})

OrderSchema.pre('save', async function (next) {
    if (this.isModified('products') || this.isNew) {
        const document = this;
        const idUser = document.iduser;
        const products = document.products;

        document.total = 0;

        let user;
        let promises = [];

        try {
            user = await User.findById(idUser);
        } catch (error) {
            next(new Error(`El usuario con ID ${idUser} does not exist`))
        }
        try {
            if (products.length == 0) {
                next(new Error(`no hay productos en el pedido. Agrega algunos productos para continuar`))
            } else {
                for (const product of products) {
                    promises.push(await Product.findById(product.idproduct));
                }
                const resultPromises = await Promise.all(promises);
                resultPromises.forEach((product, index) => {
                    document.total += product.price * products[index].qty;
                    document.products[index].title = product.title;
                    document.products[index].price = product.price;
                })
            }
        } catch (error) {
            next(new Error(`La informacion esta incompleta`))
        }
    } else {
        next();
    }
})

module.exports = Mongoose.model('Orders', OrderSchema)