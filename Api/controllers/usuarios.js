const conexion = require('../database/db.js');
const CryptoJS = require('crypto-js');
require('dotenv').config(); //variables entorno
/* process.env.SECRET */

/**
 * Obtiene el ID del usuario a partir de un token.
 *
 * @param {string} token - El token del usuario.
 * @returns {Promise<number>} Una promesa que se resuelve con el ID del usuario si se encuentra un usuario con el token proporcionado, o -1 si no se encuentra ningún usuario.
 *
 * La función ejecuta una consulta SQL para obtener todos los usuarios. 
 * Luego, busca un usuario cuyo ID, cuando se combina con una cadena secreta y se aplica un algoritmo de hash SHA256, coincide con el token proporcionado.
 * Si se encuentra un usuario, la promesa se resuelve con el ID del usuario.
 * Si no se encuentra ningún usuario, la promesa se resuelve con -1.
 * Si ocurre un error durante la consulta, la promesa se rechaza con el error.
 */
const obtenerIdToken = (token) => {
    return new Promise((resolve, reject) => {
        conexion.query('SELECT * FROM usuario', (error, results) => {
            if (error) {
                reject(error);
            } else {
                const usuarioEncontrado = results.find(usuario => {
                    const idUsuario  = CryptoJS.SHA256(usuario.id_usuario.toString() + process.env.SECRET).toString(CryptoJS.enc.Hex);
                    return idUsuario === token;
                });
                if (usuarioEncontrado) {
                    resolve(usuarioEncontrado.id_usuario);
                } else {
                    resolve(-1);
                }
            }
        });
    });
}
/* se exporta el token obtenido para usarlo en otro controladores */
exports.obtenerIdToken = obtenerIdToken;

/**
 * Obtiene todos los usuarios y sus mascotas correspondientes de la base de datos.
 *
 * @param {Object} req - El objeto de solicitud HTTP.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función ejecuta una consulta SQL para obtener todos los usuarios. 
 * Para cada usuario, ejecuta otra consulta SQL para obtener todas las mascotas que pertenecen a ese usuario.
 * Si todas las consultas son exitosas, se envía una respuesta con el código de estado HTTP 200 y un objeto JSON que contiene los usuarios y sus mascotas.
 * Si ocurre un error durante alguna de las consultas, se lanza una excepción con el error.
 */
exports.get = (req, res) => {
    conexion.query('SELECT id_usuario, nombre, apellidos, email, direccion, rol FROM usuario', (error, usuarios) => {
      if (error) {
        throw error;
      } else {
        let completed_requests = 0;
        for (let i = 0; i < usuarios.length; i++) {
          conexion.query('SELECT * FROM mascota WHERE propietario = ?', [usuarios[i].id_usuario], (error, mascotas) => {
            if (error) {
              throw error;
            } else {
              usuarios[i].mascotas = mascotas;
              completed_requests++;
              if (completed_requests == usuarios.length) {
                res.status(200).json(usuarios);
              }
            }
          });
        }
      }
    });
  }

/**
 * Inserta un nuevo usuario en la base de datos.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `body` con los campos del usuario, incluyendo `password`.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función extrae la contraseña del cuerpo de la solicitud, la encripta con SHA256, y luego inserta el usuario en la base de datos con la contraseña encriptada.
 * Si la inserción es exitosa, se envía una respuesta con el código de estado HTTP 200 y un mensaje indicando que el usuario fue registrado correctamente.
 * Si ocurre un error durante la inserción y el error es debido a una entrada duplicada (es decir, el correo electrónico del usuario ya está en uso), se envía una respuesta con el código de estado HTTP 203 y un mensaje indicando que el correo electrónico ya está en uso.
 * Si ocurre cualquier otro error durante la inserción, se envía una respuesta con el código de estado HTTP 400 y un mensaje indicando que hubo un error al registrar el usuario.
 */
exports.insert = (req, res) => {
    // Obtener la contraseña del cuerpo de la solicitud
    const { password, ...usuario } = req.body;

    // Encriptar la contraseña con SHA256
    const passwordEncriptado = CryptoJS.SHA256(password).toString();

    // Agregar la contraseña encriptada al objeto de usuario
    const usuarioConPasswd = { ...usuario, password: passwordEncriptado };
    conexion.query('INSERT INTO usuario set ?', [usuarioConPasswd], (error, result) => {
        if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                // Manejar el error de entrada duplicada
                console.log('El correo electrónico ya está en uso');
                res.status(203).json({ message: 'correo en uso' });
            } else {
                // Lanzar cualquier otro error
                res.status(400).json({ message: 'Error al registrar el usuario' });
            }
        } else {
            console.log('Usuario registrado correctamente');
            res.status(200).json({ respuesta: 'Usuario registrado correctamente' });
        }
    });
}

/**
 * Actualiza la información de un usuario en la base de datos.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `body` con los campos del usuario a actualizar, incluyendo `id_usuario`.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función extrae el ID del usuario y los datos del usuario del cuerpo de la solicitud, y luego actualiza el usuario en la base de datos con los datos proporcionados.
 * Si la actualización es exitosa, se envía una respuesta con el código de estado HTTP 200 y un mensaje indicando que el usuario fue actualizado correctamente.
 * Si ocurre un error durante la actualización, se lanza una excepción con el error.
 */
exports.update = (req, res) => { 
    const id = req.body.id_usuario;
    const usuario = req.body;
    conexion.query('UPDATE usuario set ? WHERE id_usuario = ?', [usuario, id], (error, result) => {
        if (error) {
            throw error;
        } else {
            console.log('editado con exito');
            res.status(200).json({ message: 'Usuario actualizado correctamente' });
        }
    });
}

/**
 * Elimina un usuario y sus reservas huérfanas de la base de datos.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `query` con un campo `id_usuario` que contiene el ID del usuario a eliminar.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función ejecuta una consulta SQL para eliminar el usuario especificado. 
 * Si la eliminación del usuario es exitosa, ejecuta otra consulta SQL para eliminar todas las reservas que no están asociadas a ninguna mascota (reservas huérfanas).
 * Si ambas eliminaciones son exitosas, se envía una respuesta con el código de estado HTTP 200 y un mensaje indicando que el usuario y sus reservas huérfanas fueron borrados correctamente.
 * Si ocurre un error durante la eliminación del usuario, se envía una respuesta con el código de estado HTTP 500 y un mensaje indicando que hubo un error al intentar eliminar el usuario.
 * Si ocurre un error durante la eliminación de las reservas huérfanas, se envía una respuesta con el código de estado HTTP 500 y un mensaje indicando que hubo un error al intentar eliminar las reservas huérfanas.
 */
exports.delete = (req, res) => {
    const id = req.query.id_usuario;
    // console.log(id)
    conexion.query('DELETE FROM usuario WHERE id_usuario = ?', [id], (error, result) => {
        if (error) {
            console.error('Error al eliminar usuario:', error); // Imprimir error en consola
            res.status(500).json({ message: 'Error al intentar eliminar el usuario' }); 
        } else {
            conexion.query('DELETE FROM reserva WHERE id_reserva NOT IN (SELECT reserva FROM reserva_mascota)', (error) => {
                if (error) {
                  console.error('Error al eliminar reservas huérfanas:', error);
                  res.status(500).json({ message: 'Error al intentar eliminar las reservas huérfanas' });
                } else {
                  res.status(200).json({ message: 'Usuario y sus reservas huérfanas borrados correctamente' });
                }
              });
            //   res.status(200).json({ message: 'Usuario y sus reservas huérfanas borrados correctamente' });
        }
    });
}

/**
 * Comprueba si las credenciales de inicio de sesión (correo electrónico y contraseña) son válidas.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `body` con los campos `email` y `password`.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función ejecuta una consulta SQL para obtener el usuario con el correo electrónico proporcionado. 
 * Luego, comprueba si la contraseña proporcionada, cuando se aplica un algoritmo de hash SHA256, coincide con la contraseña del usuario.
 * Si las credenciales son válidas, genera un token a partir del ID del usuario y una cadena secreta, y envía una respuesta con el código de estado HTTP 200 y el token.
 * Si la contraseña es incorrecta, envía una respuesta con un mensaje indicando que la contraseña es incorrecta.
 * Si no se encuentra ningún usuario con el correo electrónico proporcionado, envía una respuesta con un mensaje indicando que el usuario es inválido.
 * Si ocurre un error durante la consulta, envía una respuesta con el código de estado HTTP 500 y un mensaje indicando que hubo un error interno del servidor.
 */
exports.comprobarLogin = (req, res) => {
    let token = '';
    // console.log('comprobando loguinnnn')
    const { email, password } = req.body;
    conexion.query('SELECT * FROM usuario WHERE email = ?', [email], (error, result) => {
        if (error) {
            console.error('Error en la consulta SQL:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        } else {
            if (result.length > 0) {
                if (result[0].password === CryptoJS.SHA256(password).toString()) {
                    token = CryptoJS.SHA256(String(result[0].id_usuario) + process.env.SECRET).toString();
                    res.status(200).json({
                        /* nombre: result[0].nombre, apellidos: result[0].apellidos, direccion: result[0].direccion, */
                        token: token
                    });
                } else {
                    res.json({ message: 'Contraseña incorrecta' });
                }
            } else {
                res.json({ message: 'Usuario invalido' });
            }
        }
    });
}


/**
 * Obtiene los datos de un usuario y sus mascotas a partir de un token.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `body` con un campo `token` que contiene el token del usuario.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función obtiene el ID del usuario a partir del token proporcionado, y luego ejecuta una consulta SQL para obtener los datos del usuario con ese ID.
 * Si se encuentra el usuario, ejecuta otra consulta SQL para obtener todas las mascotas que pertenecen a ese usuario.
 * Si ambas consultas son exitosas, se envía una respuesta con el código de estado HTTP 200 y un objeto JSON que contiene los datos del usuario, un indicador de inicio de sesión y las mascotas del usuario.
 * Si no se encuentra ningún usuario con el ID obtenido, se envía una respuesta con el código de estado HTTP 200, un mensaje indicando que el usuario no fue encontrado y un indicador de inicio de sesión en falso.
 * Si ocurre un error durante alguna de las consultas o al obtener el ID del usuario a partir del token, se envía una respuesta con el código de estado HTTP 500 y un mensaje indicando que hubo un error al obtener los datos del usuario.
 */
exports.obtenerDatosUsuario = async (req, res) => {
    const token = req.body.token;
    try {
        const id = await obtenerIdToken(token);
        conexion.query('SELECT * FROM usuario WHERE id_usuario = ?', [id], (error, result) => {
            if (error) {
                console.error('Error en la consulta SQL:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            } else {
                if (result.length > 0) {
                    conexion.query('SELECT * FROM mascota WHERE propietario = ?', [id], (errorMascotas, resultMascotas) => {
                        if (errorMascotas) {
                            console.error('Error en la consulta SQL:', errorMascotas);
                            res.status(500).json({ message: 'Error interno del servidor' });
                        } else {
                            res.status(200).json({
                                id_usuario: result[0].id_usuario, nombre: result[0].nombre, apellidos: result[0].apellidos, direccion: result[0].direccion, isLogged: true, mascotas: resultMascotas
                            });
                        }
                    });
                } else {
                    /* cambiar a 203 si da problemas en angular, como manejo isLogged no deberia de pasar nada */
                    res.status(200).json({ message: 'Usuario no encontrado', isLogged: false });
                }
                /* if (result.length > 0) {
                    res.status(200).json({
                        id_usuario: result[0].id_usuario, nombre: result[0].nombre, apellidos: result[0].apellidos, direccion: result[0].direccion, isLogged: true
                    });
                } else {
                    // cambiar a 203 si da problemas en angular, como manejo isLogged no deberia de pasar nada 
                    res.status(200).json({ message: 'Usuario no encontrado', isLogged: false });
                } */
            }
        });
    } catch (error) {
        // Manejar el error
        //console.error(error);
        res.status(500).json({ message: 'Error al obtener los datos del usuario' });
    }
}


/**
 * Comprueba si un usuario es administrador a partir de un token.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `body` con un campo `token` que contiene el token del usuario.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función obtiene el ID del usuario a partir del token proporcionado, y luego ejecuta una consulta SQL para obtener los datos del usuario con ese ID.
 * Si se encuentra el usuario y su rol es 1 (lo que indica que es un administrador), se envía una respuesta con el código de estado HTTP 200 y el valor `true`.
 * Si se encuentra el usuario y su rol no es 1, o si no se encuentra ningún usuario con el ID obtenido, se envía una respuesta con el código de estado HTTP 200 y el valor `false`.
 * Si ocurre un error durante la consulta o al obtener el ID del usuario a partir del token, se envía una respuesta con el código de estado HTTP 500 y un mensaje indicando que hubo un error al obtener los datos del usuario.
 */
exports.comprobarAdmin = async (req, res) => {
    const token = req.body.token;
    try {
        const id = await obtenerIdToken(token);
        conexion.query('SELECT * FROM usuario WHERE id_usuario = ?', [id], (error, result) => {
            if (error) {
                console.error('Error en la consulta SQL:', error);
                res.status(500).json({ message: 'Error interno del servidor' });
            } else {
                if (result.length > 0) {
                    if (result[0].rol === 1) {
                        res.status(200).send(true);
                    } else {
                        res.status(200).send(false);
                    }
                } else {
                    /* res.json({ message: 'Usuario no encontrado' }); */
                    // esto es para tokens invalidos, tambien deben de ser false
                    res.status(200).send(false);
                }
            }
        });
    } catch (error) {
        // Manejar el error
        // console.error(error); 
        res.status(500).json({ message: 'Error al obtener los datos del usuario' });
    }
}