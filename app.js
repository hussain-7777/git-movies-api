const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const dbPath = path.join(__dirname, 'moviesData.db')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

//Get list of all movie names
const movieObjToRespObj = movie => {
  return {
    movieName: movie.movie_name,
  }
}
app.get('/movies/', async (request, response) => {
  const getMovieNamesQuery = `select * from movie;`
  const moviesList = await db.all(getMovieNamesQuery)
  response.send(moviesList.map(movie => movieObjToRespObj(movie)))
})
//Post a new movie
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `insert into movie 
  (director_id, movie_name, lead_actor)
  values('${directorId}', '${movieName}', '${leadActor}');`
  const createdMovie = await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})
//Get a movie
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `select movie_id as movieId, director_id as 
  directorId, movie_name as movieName, lead_actor as leadActor
  from movie where movie_id = ${movieId};`
  const movie = await db.get(getMovieQuery)
  console.log(movie)
  response.send(movie)
})
//Update a movie
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `update movie set
  director_id = '${directorId}', 
  movie_name = '${movieName}',
  lead_actor = '${leadActor}' where movie_id = ${movieId};`
  const updatedMovie = await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})
//Delete a movie
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `delete from movie where 
  movie_id = ${movieId};`
  const deletedMovie = await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})
//Get directors list
const directorObjToRespObj = director => {
  return {
    directorId: director.director_id,
    directorName: director.director_name,
  }
}
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `select * from director;`
  const directorsList = await db.all(getDirectorsQuery)
  response.send(directorsList.map(director => directorObjToRespObj(director)))
})
//Get movies by specific director imp
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `select movie_name as movieName from director
  inner join movie on director.director_id = movie.director_id
  where director.director_id = ${directorId};`
  const directorMovies = await db.all(getDirectorMoviesQuery)
  response.send(directorMovies)
})

module.exports = app
