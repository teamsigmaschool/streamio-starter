DROP TABLE IF EXISTS streamio_watchlist;
DROP TABLE IF EXISTS streamio_viewers;
DROP TABLE IF EXISTS streamio_shows;

CREATE TABLE streamio_shows (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  year INTEGER NOT NULL,
  about TEXT NOT NULL
);

CREATE TABLE streamio_viewers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  favourite_genres TEXT NOT NULL
);

CREATE TABLE streamio_watchlist (
  id SERIAL PRIMARY KEY,
  viewer_id INTEGER NOT NULL REFERENCES streamio_viewers(id),
  show_id INTEGER NOT NULL REFERENCES streamio_shows(id),
  watched BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO streamio_shows (title, genre, minutes, year, about) VALUES
  ('Last Signal from Titan', 'sci-fi', 118, 2024, 'A radio operator on a dying research station picks up a message that should be impossible.'),
  ('The Quiet Orbit', 'sci-fi', 96, 2022, 'Two engineers fix a broken satellite while the ground stops answering their calls.'),
  ('Clockwork Monsoon', 'sci-fi', 134, 2025, 'A weather machine meant to end floods starts making its own decisions.'),
  ('Habitat Nine', 'sci-fi', 104, 2023, 'Nine strangers test a sealed home for Mars, and one of them is not who they say.'),
  ('Night Shift at the Pier', 'thriller', 101, 2023, 'A dock guard sees a container being loaded that is not on any list.'),
  ('The Night Locksmith', 'thriller', 112, 2021, 'A locksmith''s daughter finds out which doors her father has been opening at night.'),
  ('Ninety Seconds', 'thriller', 89, 2025, 'A bank alarm gives a getaway driver ninety seconds to choose a side.'),
  ('Uncle Lim and the Food Truck', 'comedy', 94, 2024, 'A retired chef buys a food truck and refuses to change a single recipe.'),
  ('Wrong Flat, Right Neighbour', 'comedy', 99, 2022, 'A moving company delivers everything to the wrong flat, and nobody wants to move it back.'),
  ('The Group Chat', 'comedy', 87, 2025, 'Six old classmates plan a reunion entirely through one very long group chat.'),
  ('Rain Over Ipoh', 'drama', 121, 2021, 'Three sisters come home for their mother''s birthday and finally talk about the shop.'),
  ('Second Shift', 'drama', 108, 2024, 'A night nurse and a day nurse share a locker and slowly share their lives.'),
  ('Reef Keepers', 'documentary', 78, 2023, 'Divers spend a year bringing a dead coral reef back to life.'),
  ('The Last Kampung Cinema', 'documentary', 84, 2022, 'The final months of an open-air cinema that has shown films for sixty years.'),
  ('Paper Kites', 'animation', 92, 2024, 'A boy''s paper kites come alive and carry messages across the city.'),
  ('Moss and the Mountain', 'animation', 81, 2021, 'A small moss creature climbs a mountain to see what is on the other side.');

INSERT INTO streamio_viewers (name, favourite_genres) VALUES
  ('Sigma', 'sci-fi, thriller'),
  ('Delta', 'comedy, animation');

INSERT INTO streamio_watchlist (viewer_id, show_id, watched) VALUES
  (1, 2, true),
  (1, 4, true),
  (1, 7, false),
  (2, 8, true);
