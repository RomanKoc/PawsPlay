const express = require('express');
const cors = require('cors');
const CryptoJS = require('crypto-js');
const app = express();
const router = require('./routers/router.js');

/* esto nos quita el problema de las Cors en angular! */
app.use(cors());
/* const router = require('./router.js'); */

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* app.use('/', require('./router.js')); */
app.use('/', router);

app.listen(3000, () => {
    console.log('Servidor corriendo en -> http://localhost:3000/');
});