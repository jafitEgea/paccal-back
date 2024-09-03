export class CuentasCobroEntity {

    id_cuentacobro: number;

    id_contrato: number;

    id_aprobador: number;

    fecha_aprobacion: Date;

    id_revisor: number;

    observaciones: string;

    oficina_receptora: string;

    nombre_receptor: string;

    fecha_recibido: Date;

    fecha_inicial: Date;

    fecha_final: Date;

    periodo: string;

    url: string;

    fecha_creacion: Date;

    fecha_modificacion: Date;

}