require("dotenv").config();
const { pool } = require("./db");
const { registry, tools } = require("./tools");

async function check() {
  console.log(JSON.stringify(tools[0], null, 2));
  console.log(await registry.search_shows.run({ genre: "sci-fi" }));
  console.log(await registry.get_show.run({ show_id: 1 }));
  console.log(await registry.get_show.run({ show_id: 99 }));
  console.log(registry.search_shows.schema.safeParse({ genre: "horror" }).success);
  await pool.end();
}

check();
