const conexion = require('../database/db.js');

/**
 * Elimina una reserva de la base de datos.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `query` con un campo `id_reserva` que contiene el ID de la reserva a eliminar.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * Si la eliminación es exitosa, se envía una respuesta con el código de estado HTTP 200 y un mensaje indicando que la reserva fue borrada correctamente.
 * Si ocurre un error durante la eliminación, se envía una respuesta con el código de estado HTTP 500 y un mensaje indicando que hubo un error al intentar eliminar la reserva.
 * Si no se encuentra ninguna reserva con el ID proporcionado, se envía una respuesta con el código de estado HTTP 404 y un mensaje indicando que no se encontró ninguna reserva para eliminar.
 */
exports.delete = (req, res) => {
    const id = req.query.id_reserva;
    conexion.query('DELETE FROM reserva WHERE id_reserva = ?', [id], (error, result) => {
        if (error) {
            console.error('Error al eliminar la resertva:', error); // Imprimir error en consola
            res.status(500).json({ message: 'Error al intentar eliminar la reserva' }); // Responder con un mensaje de error
        } else {
            if (result.affectedRows === 0) {
                console.log('No se encontró ningúna reserva para eliminar con el ID:', id);
                res.status(404).json({ message: 'No se encontró ningúna reserva para eliminar' });
            } else {
                res.status(200).json({ message: 'Reserva borrada correctamente' });
            }
        }
    });
}

/**
 * Crea una nueva reserva y asocia mascotas a la reserva.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `body` con los campos `fecha_inicio`, `fecha_fin`, `peticiones`, `precio` y `mascotas`.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * Si la creación de la reserva es exitosa, se envía una respuesta con el código de estado HTTP 201 y un mensaje indicando que la reserva fue creada exitosamente.
 * Si ocurre un error durante la creación de la reserva, se envía una respuesta con el código de estado HTTP 500 y un mensaje indicando que hubo un error al crear la reserva.
 * Si ocurre un error al asociar una mascota a la reserva, se envía una respuesta con el código de estado HTTP 500 y un mensaje indicando que hubo un error al asociar la mascota a la reserva.
 */
exports.reservar = async (req, res) => {
    const { fecha_inicio, fecha_fin, peticiones, precio, mascotas } = req.body;
    let fechaInicioFormateada = '';
    if (fecha_inicio) {
        const fecha           = new Date(fecha_inicio);
        fechaInicioFormateada = fecha.toISOString().split('T')[0];
    }

    let fechaFinFormateada = '';
    if (fecha_fin) {
        const fecha        = new Date(fecha_fin);
        fechaFinFormateada = fecha.toISOString().split('T')[0];
    }

    // console.log(req.body.precio + 'recibo cosas')

    try {
        conexion.query('INSERT INTO reserva (fecha_inicio, fecha_fin, precio, peticiones) VALUES (?, ?, ?, ?)', 
        [fechaInicioFormateada, fechaFinFormateada, precio, peticiones], (error, results, fields) => {
            if (error) {
                console.error('Error al crear reserva:', error);
                res.status(500).json({ error: 'Error al crear reserva' });
                return;
            }

            // Obtener el ID_Reserva de la reserva recién creada
            const ID_Reserva = results.insertId;
            // console.log('id de la reserva -> -> '+ID_Reserva);
            // Insertar las mascotas asociadas a la reserva en la tabla Reserva_Mascota
            for (const mascota of mascotas) {
                conexion.query('INSERT INTO reserva_mascota (reserva, mascota) VALUES (?, ?)', 
                [ID_Reserva, mascota.id_mascota], (error, results, fields) => {
                    if (error) {
                        console.error('Error al asociar mascota a reserva:', error);
                        res.status(500).json({ error: 'Error al asociar mascota a reserva' });
                        return;
                    }
                });
            }
            console.log('Reserva creada exitosamente')
            res.status(201).json({ message: 'Reserva creada exitosamente' });
        });
    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({ error: 'Error al crear reserva' });
    }
};


/**
 * Obtiene todas las reservas realizadas por un usuario específico.
 *
 * @param {Object} req - El objeto de solicitud HTTP. Se espera que tenga una propiedad `query` con un campo `id_usuario` que contiene el ID del usuario.
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función ejecuta una consulta SQL para obtener todas las reservas realizadas por el usuario especificado. 
 * Cada reserva incluye la información de la reserva y las mascotas asociadas a la reserva.
 * Si la consulta es exitosa, se envía una respuesta con el código de estado HTTP 200 y un objeto JSON que contiene las reservas.
 * Si ocurre un error durante la consulta, se envía una respuesta con el código de estado HTTP 500 y un mensaje indicando que hubo un error al obtener las reservas.
 */
exports.obtenerReservasPorUsuario = (req, res) => {
    const id_usuario = req.query.id_usuario;

    const sql = `
        SELECT r.id_reserva, r.fecha_inicio, r.fecha_fin, r.precio, r.peticiones, m.id_mascota, m.nombre
        FROM reserva r
        JOIN reserva_mascota rm ON r.id_reserva = rm.reserva
        JOIN mascota m ON rm.mascota = m.id_mascota
        WHERE m.propietario = ?
        ORDER BY r.id_reserva
    `;

    conexion.query(sql, [id_usuario], (error, results) => {
        if (error) {
            console.error('Error al obtener reservas:', error);
            res.status(500).json({ error: 'Error al obtener reservas' });
            return;
        }

        const reservas = [];
        let currentReserva = null;

        for (const result of results) {
            if (!currentReserva || currentReserva.id_reserva !== result.id_reserva) {
                currentReserva = {
                    id_reserva:     result.id_reserva,
                    id_usuario:     id_usuario,
                    fecha_inicio:   result.fecha_inicio,
                    fecha_fin:      result.fecha_fin,
                    precio:         result.precio,
                    peticiones:     result.peticiones,
                    mascotas:       []
                };
                reservas.push(currentReserva);
            }

            currentReserva.mascotas.push({
                id_mascota: result.id_mascota,
                nombre:     result.nombre
            });
        }
        // console.log('reservas por usuario -> -> '+reservas)
        res.json(reservas);
    });
};

/**
 * Obtiene todas las reservas existentes en la base de datos.
 *
 * @param {Object} res - El objeto de respuesta HTTP. Se utiliza para enviar la respuesta al cliente.
 *
 * La función ejecuta una consulta SQL para obtener todas las reservas. 
 * Cada reserva incluye la información de la reserva y las mascotas asociadas a la reserva.
 * Si la consulta es exitosa, se envía una respuesta con el código de estado HTTP 200 y un objeto JSON que contiene las reservas.
 * Si ocurre un error durante la consulta, se envía una respuesta con el código de estado HTTP 500 y un mensaje indicando que hubo un error al obtener las reservas.
 */
exports.obtenerTodasLasReservas = (req, res) => {
    const sql = `
        SELECT r.id_reserva, r.fecha_inicio, r.fecha_fin, r.precio, r.peticiones, m.propietario as id_usuario,
        m.id_mascota, m.nombre, m.alergias, m.observaciones
        FROM reserva r
        JOIN reserva_mascota rm ON r.id_reserva = rm.reserva
        JOIN mascota m ON rm.mascota = m.id_mascota
        ORDER BY r.id_reserva
    `;

    conexion.query(sql, (error, results) => {
        if (error) {
            console.error('Error al obtener reservas:', error);
            res.status(500).json({ error: 'Error al obtener reservas' });
            return;
        }

        const reservas = [];
        let currentReserva = null;

        for (const result of results) {
            if (!currentReserva || currentReserva.id_reserva !== result.id_reserva) {
                currentReserva = {
                    id_reserva:     result.id_reserva,
                    id_usuario:     result.id_usuario,
                    fecha_inicio:   result.fecha_inicio,
                    fecha_fin:      result.fecha_fin,
                    precio:         result.precio,
                    peticiones:     result.peticiones,
                    mascotas:       []
                };
                reservas.push(currentReserva);
            }
            currentReserva.mascotas.push({
                id_mascota:     result.id_mascota,
                nombre:         result.nombre,
                alergias:       result.alergias,
                observaciones:  result.observaciones,
            });
        }
        // console.log('TODASSS RESERVAS -> '+reservas)
        res.json(reservas);
    });
};
