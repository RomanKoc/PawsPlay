const mysql = require('mysql');

const conexion = mysql.createConnection({
    host:           'localhost',
    user:           'root',
    password:       '',
    database:       'paws_play',
    unix_socket:    '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock'
    /* unix_socket: '/Applications/MAMP/tmp/mysql/mysql.sock' */
});

conexion.connect((error) => {
    if (error) {
        console.error('El error de conexión es: ' + error);
        return;
    }
    console.log('¡Conectado a la base de datos MASCOTA!');
});
// EXPORTAR MODULO PARA PODER UTILIZARLO FUERA
module.exports = conexion;