const API_KEY = "2d5442fe420dca1b763c2572b2c2fe8d";
const BASE_PATH = "https://api.themoviedb.org/3";

export interface IMovie {
  id: number;
  backdrop_path: string;
  poster_path: string;
  title: string;
  overview: string;
}

export interface IGetMoviesResult {
  dates: {
    maximum: string;
    minimum: string;
  };
  page: number;
  results: IMovie[];
  total_pages: number;
  total_results: number;
}

export function getMovieDetail({ id }: IMovie) {
  return fetch(`${BASE_PATH}/movie/${id}?api_key=${API_KEY}`).then((response) =>
    response.json()
  );
}

export function getLastestMovie() {
  return fetch(`${BASE_PATH}/movie/latest?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getNowMovies() {
  return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getTopMovies() {
  return fetch(`${BASE_PATH}/movie/top_rated?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getUpcomingMovies() {
  return fetch(`${BASE_PATH}/movie/upcoming?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

// https://api.themoviedb.org/3/movie/{movie_id}?api_key=<<api_key>>&language=en-US
