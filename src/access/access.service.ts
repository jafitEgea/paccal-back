import { Injectable } from '@nestjs/common';

@Injectable()
export class AccessService {
  public connection: any;

  constructor() {
    this.connectToDatabase();
  }

  /* async query(query: any, params?: any[]): Promise<any> {
    return new Promise(res => {
      const odbc = require('odbc');
      const connectionConfig = {
        connectionString: 'DSN=paccal-dns',
        connectionTimeout: 10,
        loginTimeout: 10,
      }
      
      const connectionInstance = odbc.connect(connectionConfig, (error: any, connection: any) => {
        if (error) { console.log(error); res(error); }

        connection.query(query, params, (error: any, result: any) => {
          if (error) { console.log(error); res(error); }

          res(result);

          connection.close( (error: any) => {
            if (error) return;
          });

        });

      });

    });

  }; */

  async connectToDatabase() {
    const odbc = require('odbc');
    const connectionConfig = {
      connectionString: 'DSN=paccal-dns',
      connectionTimeout: 10,
      loginTimeout: 10,
    }

    try {
      //CONFIGURAR DSN EN EL PC -> ORIGENES DE DATOS 64-BIT -- 'paccal-dns'
      this.connection = await odbc.connect(connectionConfig);
      console.log('Conexión a la base de datos MS Access establecida');
    } catch (error) {
      console.error('Error al conectar a la base de datos Access:', error);
    }
  }

  async executeQuery(query: string): Promise<any> {
    try {
      const result = await this.connection.query(query);
      return result;
    } catch (error) {
      if (error.odbcErrors[0].message) {
        return `Error al ejecutar la consulta: ${error.odbcErrors[0].message}`;
      } else {
        return `Error al ejecutar la consulta: ${error}`;
      }
    }
  }

  async executeTransaction() {
    await this.connection.beginTransaction();
  }

  async commitTransaction() {
    await this.connection.commit();
  }

  async rollbackTransaction() {
    await this.connection.rollback();
  }

}
