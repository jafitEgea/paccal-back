import { AccessSqlValue } from 'src/access/utils/access-sql-value';

export class CuentasCobroInsertBuilder {

    private tableName = 'CuentasCobro';

    private readonly columns: string[] = [];
    private readonly values: string[] = [];

    into(tableName: string): this {
        this.tableName = tableName;
        return this;
    }

    setNumber(column: string, value: number): this {
        this.columns.push(`[${column}]`);
        this.values.push(AccessSqlValue.number(value));
        return this;
    }

    setString(column: string, value: string | null | undefined): this {
        this.columns.push(`[${column}]`);
        this.values.push(AccessSqlValue.string(value));
        return this;
    }

    setRaw(column: string, value: string | null | undefined): this {
        this.columns.push(`[${column}]`);
        this.values.push(AccessSqlValue.raw(value));
        return this;
    }

    setBoolean(column: string, value: boolean): this {
        this.columns.push(`[${column}]`);
        this.values.push(AccessSqlValue.boolean(value));
        return this;
    }

    setNull(column: string): this {
        this.columns.push(`[${column}]`);
        this.values.push(AccessSqlValue.null());
        return this;
    }

    build(): string {
        if (this.columns.length === 0) {
            throw new Error('No se han definido columnas para el INSERT.');
        }

        if (this.columns.length !== this.values.length) {
            throw new Error('Las columnas y valores del INSERT no coinciden.');
        }

        return `
      INSERT INTO [${this.tableName}]
      (${this.columns.join(', ')})
      VALUES (${this.values.join(', ')});
    `;
    }
}
