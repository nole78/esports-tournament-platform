import mysql from "mysql2/promise"; // adjust if you use another driver

async function conn() {
  return mysql.createConnection({
    host: process.env.DB_MASTER_HOST,
    port: Number(process.env.DB_MASTER_PORT),
    user: process.env.DB_MASTER_USER,
    password: process.env.DB_MASTER_PASSWORD,
    database: process.env.DB_MASTER_NAME,
  });
}

export async function resetDb() {
  if (!process.env.DB_MASTER_NAME?.endsWith("_test")) throw new Error("Not a test DB");
  const c = await conn();
  try {
    const [rows] = await c.query<any[]>(
      "SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'"
    );
    await c.query("SET FOREIGN_KEY_CHECKS = 0");
    for (const { name } of rows) await c.query(`TRUNCATE TABLE \`${name}\``);
    await c.query("SET FOREIGN_KEY_CHECKS = 1");
  } finally {
    await c.end();
  }
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const c = await conn();
  try {
    const [rows] = await c.query(sql, params);
    return rows as T[];
  } finally {
    await c.end();
  }
}

export async function insert(table: string, row: Record<string, unknown>): Promise<number> {
  const cols = Object.keys(row);
  const c = await conn();
  try {
    const [res] = await c.query<any>(
      `INSERT INTO \`${table}\` (${cols.map((k) => `\`${k}\``).join(", ")}) VALUES (${cols.map(() => "?").join(", ")})`,
      Object.values(row)
    );
    return res.insertId;
  } finally {
    await c.end();
  }
}