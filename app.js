const express = require("express"); // require --> commonJS
const crypto = require("node:crypto");
const cors = require("cors"); //Midleware para los cors: npm install cors -E

const movies = require("./movies.json");
const { validateMovie, validatePartialMovie } = require("./schemas/movies");

const app = express();
app.use(express.json());
app.use(cors());

app.disable("x-powered-by"); //deshabilitar el header.

app.get("/", (req, res) => {
  res.json({ message: "hola mundo" });
});

const ACCEPTED_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:8083",
  "http://127.0.0.1:5500",
  "http://localhost:1234",
];

//url para todas las películas
app.get("/movies", (req, res) => {
  //#region CORS
  //Activar los CORS para el acceso.
  // const origin = req.header("origin");
  // if (ACCEPTED_ORIGINS.includes(origin)) {
  //   res.header("Access-Control-Allow-Origin", "*");
  // }

  const { genre } = req.query;
  if (genre) {
    const filteredMovies = movies.filter(
      (movie) =>
        movie.genre.some((g) => g.toLowerCase() === genre.toLocaleLowerCase()) //pasa todo a minúsculas
    );

    if (filteredMovies.length > 0) return res.json(filteredMovies);

    res.status(404).json({ message: "Movie not found" });
  }
  //enviamos todas las películas
  res.json(movies);
});

//Recuperar una película por medio del id
app.get("/movies/:id", (req, res) => {
  const { id } = req.params;

  const movie = movies.find((movie) => movie.id === id);

  if (movie) return res.json(movie);

  res.status(404).json({ message: "Movie not found" });
});

//Recuperar todas las películas por un género

//Crear una nueva pelicula
app.post("/movies", (req, res) => {
  const { title, genre, year, director, duration, rate, poster } = req.body;

  const result = validateMovie(req.body);

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };

  movies.push(newMovie);

  res.status(201).json(newMovie); //Devuelve ell recurso creado
});

//region DELETE
//Eliminar una pelicual
app.delete("/movies/:id", (req, res) => {
  // const origin = req.header("origin");
  // if (ACCEPTED_ORIGINS.includes(origin)) {
  //   res.header("Access-Control-Allow-Origin", "*");
  // }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  movies.splice(movieIndex, 1);

  return res.json({ message: "Movie deleted" });
});

//Actualizar parte de una película
app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body);

  if (!result.success) {
    return res.status(401).json({ error: JSON.parse(result.error.message) });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updateMovie;

  return res.json(updateMovie);
});

// app.options("/movies/:id", (req, res) => {
//   const origin = req.header("origin");
//   if (ACCEPTED_ORIGINS.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
//     res.header("Access-Control-Allow-Headers", "Content-Type");
//   }

//   res.send(200);
// });

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
