export function makeImagePath(id: string, format = "original") {
  return `https://image.tmdb.org/t/p/${format}/${id}`;
}
