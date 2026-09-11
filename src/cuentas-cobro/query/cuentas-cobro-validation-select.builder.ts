import { escapeAccessString } from 'src/access/utils/escape-access-string';

export class CuentasCobroValidationSelectBuilder {
    private readonly whereClauses: string[] = [];

    private selectClause = '*';
    private fromClause = 'CuentasCobro';
    private orderByClause?: string;

    select(...fields: string[]): this {
        this.selectClause = fields.join(', ');
        return this;
    }

    count(): this {
        this.selectClause = 'COUNT(*) AS [count]';
        return this;
    }

    from(table: string): this {
        this.fromClause = table;
        return this;
    }

    whereNumber(field: string, value: number): this {
        this.whereClauses.push(`[${field}] = ${value}`);
        return this;
    }

    whereNumberNullOrEquals(field: string, value?: number): this {
        if (value === undefined || value === null) {
            this.whereClauses.push(`[${field}] IS NULL`);
        } else {
            this.whereClauses.push(`[${field}] = ${value}`);
        }

        return this;
    }

    whereStringNullOrEquals(field: string, value?: string): this {
        if (value === undefined || value === null) {
            this.whereClauses.push(`[${field}] IS NULL`);
        } else {
            this.whereClauses.push(
                `[${field}] = '${escapeAccessString(value)}'`
            );
        }

        return this;
    }

    whereRaw(field: string, value: string): this {
        this.whereClauses.push(`[${field}] = ${value}`);
        return this;
    }

    whereRawNullOrEquals(field: string, value?: string | null): this {
        if (value === undefined || value === null) {
            this.whereClauses.push(`[${field}] IS NULL`);
        } else {
            this.whereClauses.push(`[${field}] = ${value}`);
        }

        return this;
    }

    whereEstadoActivo(): this {
        this.whereClauses.push(`[estado] = 1`);
        return this;
    }

    orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
        this.orderByClause = `[${field}] ${direction}`;
        return this;
    }

    build(): string {
        const whereClause = this.whereClauses.length > 0
            ? `WHERE ${this.whereClauses.join(' AND ')}`
            : '';

        const orderByClause = this.orderByClause
            ? `ORDER BY ${this.orderByClause}`
            : '';

        return `
            SELECT ${this.selectClause}
            FROM ${this.fromClause}
            ${whereClause}
            ${orderByClause};
        `;
    }
}
