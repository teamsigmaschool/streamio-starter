const { z } = require("zod");
const { pool } = require("./db");

const GENRES = ["comedy", "drama", "thriller", "sci-fi", "documentary", "animation"];

const registry = {
  search_shows: {
    description: "Find shows by genre or by title. Returns each show's title, genre, minutes, year and what it is about",
    schema: z.object({
      query: z.string().describe(`A genre (${GENRES.join(", ")}) or part of a title, e.g. sci-fi or Habitat Nine`),
    }),
    run: async (args) => {
      const query = args.query ?? args.genre;
      const result = await pool.query(
        "SELECT title, genre, minutes, year, about FROM streamio_shows WHERE genre = $1 OR title ILIKE $2 ORDER BY year DESC",
        [query, `%${query}%`]
      );
      if (result.rows.length === 0) return { error: `No show matches ${query}. The genres are: ${GENRES.join(", ")}` };
      return result.rows;
    },
  },
  add_to_watchlist: {
    description: "Save one show to the viewer's watchlist by its title, when they ask you to. It checks that the show exists, so no search is needed first. Returns the show that was saved",
    schema: z.object({
      title: z.string().describe("The show's full title, e.g. Last Signal from Titan"),
    }),
    run: async (args, viewer) => {
      const show = await pool.query("SELECT id, title, genre, minutes FROM streamio_shows WHERE title ILIKE $1", [args.title]);
      if (show.rows.length === 0) return { error: `Streamio has no show called ${args.title}` };

      const saved = viewer.list.find((item) => item.title === show.rows[0].title);
      if (saved) return { error: `${show.rows[0].title} is already on the watchlist` };

      await pool.query("INSERT INTO streamio_watchlist (viewer_id, show_id) VALUES ($1, $2)", [viewer.id, show.rows[0].id]);
      return { saved: show.rows[0].title, genre: show.rows[0].genre, minutes: show.rows[0].minutes };
    },
  },
  get_show: {
    description: "Get full details of a show by its id",
    schema: z.object({
      show_id: z.number().describe("The show's id"),
    }),
    run: async (args) => {
      const result = await pool.query("SELECT * FROM streamio_shows WHERE id = $1", [args.show_id]);
      if (result.rows.length === 0) return { error: `No show with id ${args.show_id}` };
      return result.rows[0];
    },
  },
};

const toolNames = ["search_shows", "add_to_watchlist"];
const tools = toolNames.map((name) => ({
  type: "function",
  function: {
    name: name,
    description: registry[name].description,
    parameters: z.toJSONSchema(registry[name].schema),
  },
}));

module.exports = { registry, tools };
