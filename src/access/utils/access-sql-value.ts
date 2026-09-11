import { escapeAccessString } from './escape-access-string';

export class AccessSqlValue {

    static number(value: number): string {
        if (!Number.isFinite(value)) {
            throw new Error(`Valor numérico inválido: ${value}`);
        }

        return String(value);
    }

    static string(value: string | null | undefined): string {
        if (value === null || value === undefined) {
            return 'NULL';
        }

        return `'${escapeAccessString(String(value))}'`;
    }

    static boolean(value: boolean): string {
        return value ? '1' : '0';
    }

    static null(): string {
        return 'NULL';
    }

    /**
     * Para valores que ya vienen convertidos al formato SQL de Access.
     *
     * Ejemplo:
     * #09/09/2026#
     */
    static raw(value: string | null | undefined): string {
        if (value === null || value === undefined) {
            return 'NULL';
        }

        return value;
    }
}