export class CuentasCobroRequisitoEntity {
    id_cuentacobro: number;
    id_contratista: number;
    nombre_contratista: string;
    id_contrato: number;
    num_contrato: string;
    objeto: string;
    id_aprobador: number;
    nombre_aprobador: string;
    fecha_aprobacion: Date;
    id_revisor: number;
    nombre_revisor: string;
    fecha_revision: Date;
    observaciones: string;
    oficina_receptora: string;
    fecha_inicial: Date;
    fecha_final: Date;
    periodo: string;
    url: string;
    requisitos: CuentasCobroRequisitoEntity[];
}
