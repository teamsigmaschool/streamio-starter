const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function getViewer(id) {
  const viewer = await pool.query("SELECT * FROM streamio_viewers WHERE id = $1", [id]);
  if (viewer.rows.length === 0) return null;

  const list = await pool.query(
    "SELECT streamio_shows.title, streamio_watchlist.watched FROM streamio_watchlist INNER JOIN streamio_shows ON streamio_shows.id = streamio_watchlist.show_id WHERE streamio_watchlist.viewer_id = $1 ORDER BY streamio_watchlist.id",
    [id]
  );
  return { ...viewer.rows[0], list: list.rows };
}

module.exports = { pool, getViewer };
