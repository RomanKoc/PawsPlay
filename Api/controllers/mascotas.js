const conexion = require('../database/db.js');

/**
 * Inserta una nueva mascota en la base de datos.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `body` con los campos de la mascota, incluyendo `nombre`, `fecha_nac`, `alergias`, `observaciones` y `propietario`.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función extrae el ID del propietario y los datos de la mascota del cuerpo de la solicitud, y luego inserta la mascota en la base de datos con los datos proporcionados.
 * Si el ID del propietario es -1, se envía una respuesta con el código de estado HTTP 404 y un mensaje indicando que el usuario no fue encontrado.
 * Si la inserción es exitosa, se envía una respuesta con el código de estado HTTP 200 y un mensaje indicando que la mascota fue registrada correctamente.
 * Si ocurre un error durante la inserción, se lanza una excepción con el error.
 */
exports.insert = (req, res) => {
/*     let fecha_nac = new Date(req.body.fecha_nac);
    fecha_nac.setUTCDate(fecha_nac.getUTCDate() + 1);  */ // formato de fecha para angular enviar aqui -> 2024-04-01
    const propietario = req.body.propietario;
    if (propietario === -1) {
        res.status(404).json({ message: 'Usuario no encontrado' });
    } else {
        const mascota = {
            nombre:         req.body.nombre,
            fecha_nac:      req.body.fecha_nac,
            alergias:       req.body.alergias,
            observaciones:  req.body.observaciones,
            propietario:    propietario
        };
        // Comrpobar que todos los campos necesarios están presentes y no son NULL
        if (!mascota.nombre || !mascota.fecha_nac) {
            res.status(400).json({ message: 'Faltan campos necesarios' });
            return;
        }
        // console.log(mascota);
        conexion.query('INSERT INTO mascota set ?', [mascota], (error, result) => {
            if (error) {
                throw error;
            } else {
                res.status(200).json({ message: 'mascota registrado correctamente' });
            }
        });
    } }
/**
 * Actualiza la información de una mascota en la base de datos.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `body` con los campos de la mascota a actualizar, incluyendo `id_mascota`.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función extrae el ID de la mascota y los datos de la mascota del cuerpo de la solicitud. 
 * Si se proporciona una fecha de nacimiento, se convierte a un objeto de fecha y luego a una cadena en formato ISO.
 * Si no se proporciona una fecha de nacimiento, se utiliza la fecha actual.
 * Luego, actualiza la mascota en la base de datos con los datos proporcionados.
 * Si la actualización es exitosa, se envía una respuesta con el código de estado HTTP 200 y un mensaje indicando que la mascota fue actualizada correctamente.
 * Si ocurre un error durante la actualización, se lanza una excepción con el error.
 */
exports.update = (req, res) => {
    const id      = req.body.id_mascota;
    const mascota = req.body;
    if (mascota.fecha_nac) {
        const fecha_nac   = new Date(mascota.fecha_nac);
        mascota.fecha_nac = fecha_nac.toISOString().split('T')[0];
    } else {
        const fechaActual = new Date();
        mascota.fecha_nac = fechaActual.toISOString().split('T')[0];
    }
    conexion.query('UPDATE mascota set ? WHERE id_mascota = ?', [mascota, id], (error, result) => {
        if (error) {
            throw error;
        } else {
            console.log('editado con exito');
            res.status(200).json({ message: 'Mascota actualizada correctamente' });
        }
    });
}

/**
 * Elimina una mascota de la base de datos.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `query` con un campo `id_mascota` que contiene el ID de la mascota a eliminar.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función ejecuta una consulta SQL para eliminar la mascota con el ID proporcionado. 
 * Si la eliminación es exitosa y se eliminó al menos una fila, se envía una respuesta con el código de estado HTTP 200 y un mensaje indicando que la mascota fue borrada correctamente.
 * Si la eliminación es exitosa pero no se eliminó ninguna fila (es decir, no se encontró ninguna mascota con el ID proporcionado), se envía una respuesta con el código de estado HTTP 404 y un mensaje indicando que no se encontró ninguna mascota para eliminar.
 * Si ocurre un error durante la eliminación, se envía una respuesta con el código de estado HTTP 500 y un mensaje indicando que hubo un error al intentar eliminar la mascota.
 */
exports.delete = (req, res) => {
    const id = req.query.id_mascota;
    // console.log(id)
    conexion.query('DELETE FROM mascota WHERE id_mascota = ?', [id], (error, result) => {
        if (error) {
            console.error('Error al eliminar mascota:', error);
            res.status(500).json({ message: 'Error al intentar eliminar la mascota' });
        } else {
            if (result.affectedRows === 0) {
                console.log('No se encontró ningúna mascota para eliminar con el ID:', id);
                res.status(404).json({ message: 'No se encontró ningúna mascota para eliminar' });
            } else {
                res.status(200).json({ message: 'Mascota borrado correctamente' });
            }
        }
    });
}