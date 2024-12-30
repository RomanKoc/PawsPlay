const express  = require('express');
const router   = express.Router();

const usuarios = require('../controllers/usuarios.js');
const mascotas = require('../controllers/mascotas.js');
const reservas = require('../controllers/reservas.js');

router.get('/usuarios',                 usuarios.get);
router.post('/usuarios-insert',         usuarios.insert);
router.post('/usuarios-update',         usuarios.update);
router.delete('/usuarios-delete',       usuarios.delete);
router.post('/usuarios-comprobar-login',usuarios.comprobarLogin);      // devuelve el token
router.post('/usuarios-obtener-usuario',usuarios.obtenerDatosUsuario); // devuelve los datos del usuario
router.post('/usuarios-comprobar-admin',usuarios.comprobarAdmin);      // devuelve true false

router.post('/mascotas-insert',         mascotas.insert);
router.post('/mascotas-update',         mascotas.update);
router.delete('/mascotas-delete',       mascotas.delete);


router.delete('/reservas-delete',       reservas.delete);
router.post('/reservas-insert',         reservas.reservar);
router.get('/reservas',                 reservas.obtenerTodasLasReservas);
router.get('/reservas-obtener-reservas',reservas.obtenerReservasPorUsuario);

module.exports = router;