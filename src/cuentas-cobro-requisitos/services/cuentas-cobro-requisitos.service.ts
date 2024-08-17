import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { CreateCuentasCobroRequisitoDto } from '../dto/create-cuentas-cobro-requisito.dto';
import { UpdateCuentasCobroRequisitoDto } from '../dto/update-cuentas-cobro-requisito.dto';

@Injectable()
export class CuentasCobroRequisitosService {

  constructor(private accessService: AccessService) { }

  async findAll() {
    const query = `SELECT TOP 50 * from CuentasCobroRequisitos;`;

    const result = await this.accessService.executeQuery(query);

    return result;
  }

  async findOne(id: number) {
    const query = `SELECT * from CuentasCobroRequisitos
                   WHERE [id_cuentacobro_requisito] = ${id};`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Requisitos de la cuenta de cobro no encontrados");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findByIdContratoYIdRequisito(body: UpdateCuentasCobroRequisitoDto) {
    const { id_cuentacobro, id_requisito } = body;
    const query = `SELECT * FROM CuentasCobroRequisitos
                   WHERE [id_cuentacobro] = ${id_cuentacobro} AND [id_requisito] = ${id_requisito};`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Requisitos de la cuenta de cobro no encontrados");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async cuentaCobrorequirementExists(body: UpdateCuentasCobroRequisitoDto) {
    const { id_cuentacobro, id_requisito } = body;

    const query = `SELECT COUNT(*) as [count] FROM CuentasCobroRequisitos
                   WHERE [id_cuentacobro] = ${id_cuentacobro} AND [id_requisito] = ${id_requisito};`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async cuentaCobrorequirementExistsById(id: number) {
    const query = `SELECT COUNT(*) as [count] FROM CuentasCobroRequisitos
                   WHERE [id_cuentacobro_requisito] = ${id};`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async create(cuentaCobroRequisito: CreateCuentasCobroRequisitoDto[]) {
    let query = null, result = null;
    cuentaCobroRequisito.forEach((item: CreateCuentasCobroRequisitoDto) => {
      query = `INSERT INTO CuentasCobroRequisitos(id_cuentacobro, id_requisito, marcado)
               VALUES( ${item.id_cuentacobro}, ${item.id_requisito}, ${item.marcado} )`;
      result = this.accessService.executeQuery(query);
    })

    return result;
  }

  async update(cuentaCobroRequisito: UpdateCuentasCobroRequisitoDto[]) {
    let query = null, result = null;
    cuentaCobroRequisito.forEach((item: CreateCuentasCobroRequisitoDto) => {
      query = `UPDATE CuentasCobroRequisitos SET
                [marcado] = ${item.marcado}
               WHERE [id_cuentacobro] = ${item.id_cuentacobro} AND [id_requisito] = ${item.id_requisito};`;
      result = this.accessService.executeQuery(query);
    })

    return result;
  }

  async delete(id_cuentacobro: number) {
    const query = `DELETE FROM CuentasCobroRequisitos WHERE [id_cuentacobro] = ${id_cuentacobro}`;
    const result = await this.accessService.executeQuery(query);
    return result;
  }
}
