import { AccessSqlValue } from 'src/access/utils/access-sql-value';

export class CuentasCobroUpdateBuilder {

    private tableName = 'CuentasCobro';

    private readonly setClauses: string[] = [];
    private readonly whereClauses: string[] = [];

    table(tableName: string): this {
        this.tableName = tableName;
        return this;
    }

    setNumber(column: string, value: number): this {
        this.setClauses.push(
            `[${column}] = ${AccessSqlValue.number(value)}`
        );

        return this;
    }

    setString(column: string, value: string | null | undefined): this {
        this.setClauses.push(
            `[${column}] = ${AccessSqlValue.string(value)}`
        );

        return this;
    }

    setRaw(column: string, value: string | null | undefined): this {
        this.setClauses.push(
            `[${column}] = ${AccessSqlValue.raw(value)}`
        );

        return this;
    }

    setBoolean(column: string, value: boolean): this {
        this.setClauses.push(
            `[${column}] = ${AccessSqlValue.boolean(value)}`
        );

        return this;
    }

    setNull(column: string): this {
        this.setClauses.push(
            `[${column}] = NULL`
        );

        return this;
    }

    whereNumber(column: string, value: number): this {
        this.whereClauses.push(
            `[${column}] = ${AccessSqlValue.number(value)}`
        );

        return this;
    }

    whereString(column: string, value: string): this {
        this.whereClauses.push(
            `[${column}] = ${AccessSqlValue.string(value)}`
        );

        return this;
    }

    build(): string {
        if (this.setClauses.length === 0) {
            throw new Error('No se han definido campos para actualizar.');
        }

        if (this.whereClauses.length === 0) {
            throw new Error(
                'El UPDATE debe tener al menos una condición WHERE.'
            );
        }

        return `
      UPDATE [${this.tableName}]
      SET ${this.setClauses.join(',\n')}
      WHERE ${this.whereClauses.join(' AND ')};
    `;
    }
}
