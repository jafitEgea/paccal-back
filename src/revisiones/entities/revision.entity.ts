export class RevisionEntity {

    id_revision: number;

    id_cuentacobro: number;

    id_autor: number;

    nombre_autor: string;

    rol_autor: string;

    descripcion: string;

    fecha_creacion?: Date;

    fecha_modificacion?: Date;

}