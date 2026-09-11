import { AccessSqlValue } from 'src/access/utils/access-sql-value';

export class CuentasCobroDeleteBuilder {

    private tableName = '';
    private readonly whereClauses: string[] = [];

    from(tableName: string): this {
        this.tableName = tableName;
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
        if (!this.tableName) {
            throw new Error('No se ha definido la tabla del DELETE.');
        }

        if (this.whereClauses.length === 0) {
            throw new Error(
                'El DELETE debe tener al menos una condición WHERE.'
            );
        }

        return `
      DELETE FROM [${this.tableName}]
      WHERE ${this.whereClauses.join(' AND ')};
    `;
    }
}
