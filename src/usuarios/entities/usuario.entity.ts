export class UsuarioEntity {

    id_usuario: number;

    nombres: string;

    apellidos: string;

    nombre_usuario: string;

    contraseña: string;

    cargo?: string;

    rol: string;

    fecha_creacion?: Date;

    fecha_modificacion?: Date;

}