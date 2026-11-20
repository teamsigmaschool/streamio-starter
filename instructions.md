# Streamio

Streamio is a streaming service with an assistant that helps a viewer choose what to watch tonight. Our AI agent searches the catalogue, recommends a show the viewer hasn't seen, and saves shows to their watchlist. It is backend only, and you test it in Postman.

## What the starter gives you

* `db/setup.sql` creates the `streamio_shows`, `streamio_viewers` and `streamio_watchlist` tables in SharedDatabase
* `db.js` connects to the database and has a `getViewer` function
* `index.js` has `GET /api/shows` and `GET /api/viewers/:id`
* `.env.example` lists the two keys you need, `GROQ_API_KEY` and `DATABASE_URL`

## What you will build

* `tools.js` with a tool registry holding `search_shows` and `add_to_watchlist`
* `agent.js` with `askGroq`, `runTool`, a system prompt built from the viewer, `runAgent` and `toPicks`
* `POST /api/chat`, which takes `{ "viewer_id", "messages" }` and returns `{ "reply", "picks" }`

## Getting started

```bash
npm install
cp .env.example .env
node index.js
```

Fill in `.env` before you run the server. Follow the Streamio lessons step by step from there.
