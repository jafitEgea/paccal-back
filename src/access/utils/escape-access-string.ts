/**
 * Mitigación de inyección SQL para el dialecto de Microsoft Access (Jet/ACE).
 *
 * IMPORTANTE — por qué esto y no consultas parametrizadas:
 * El driver ODBC de Microsoft Access no implementa por completo
 * SQLBindParameter/SQLDescribeParam: node-odbc responde con
 * "[Microsoft][ODBC Microsoft Access Driver] Optional feature not
 * implemented" (HYC00) al intentar ejecutar `pool.query(sql, params)` con
 * marcadores `?`. Es una limitación documentada y antigua del driver, no un
 * error de esta implementación (ver DIAGNOSTICO_PATRONES.md, Anexo 2).
 *
 * Como el proyecto sigue atado a MS Access vía ODBC, la solución real
 * (parámetros preparados) no es viable hoy. Esta función es una mitigación
 * práctica, no una solución completa: escapa la comilla simple duplicándola
 * (regla del propio dialecto SQL de Access) y elimina bytes de control, que
 * es el vector más común de inyección en este código (cerrar la cadena de
 * texto antes de tiempo). NO reemplaza migrar a un motor con soporte real
 * de parámetros
 */
export function escapeAccessString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value)
    .replace(/[\x00-\x1F\x7F]/g, '') // quita bytes de control (incluye \0)
    .replace(/'/g, "''");            // Access: comilla simple se escapa duplicándola
}
