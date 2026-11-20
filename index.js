require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { pool, getViewer } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/shows", async (req, res) => {
  const result = await pool.query("SELECT * FROM streamio_shows ORDER BY id");
  res.json(result.rows);
});

app.get("/api/viewers/:id", async (req, res) => {
  const viewer = await getViewer(req.params.id);
  if (!viewer) return res.status(404).json({ error: "No viewer with that id" });
  res.json(viewer);
});

app.listen(3000, () => console.log("Streamio on port 3000"));
