export interface Usuario {
    id_usuario: number;
    nombre:     string;
    rol:        number;
    email:      string;
    password:   string;
    direccion:  string;
    apellidos:  string;
}

export interface Reserva {
    id_reserva:   number;
    fecha_inicio: string;
    fecha_fin:    string;
    precio:       number;
    peticiones:   string;
}

export interface Mascota {
    id_mascota:    number;
    nombre:        string;
    fecha_nac:     Date;
    observaciones: string;
    alergias:      string;
}

export interface UsuarioLogged{
    id_usuario: number;
    nombre: string;
    apellidos: string;
    direccion: string;
    isLogged: boolean;
    mascotas: Mascota[];
}
