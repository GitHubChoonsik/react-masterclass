import { useQuery } from "react-query";
import { useLocation, useMatch, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  IGetMoviesResult,
  IGetTvsResult,
  genresTable,
  getSearchMovies,
  getSearchTvs,
} from "../api";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { makeImagePath } from "../utils";
import thumbUp from "../img/thumb-up.png";

const Wrapper = styled.div`
  margin-top: 95px;
`;

const ResultTitle = styled.p`
  padding: 0 50px;
  font-size: 30px;
`;

const Slider = styled.div`
  height: 210px;
  position: relative;
  top: 50px;
`;

const SliderTitle = styled.h1`
  font-size: 25px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const SliderButton = styled.div`
  width: 30px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  position: absolute;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  color: black;
  font-size: 24px;
  cursor: pointer;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ bgPhoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 150px;
  font-size: 20px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
`;

const BigMovie = styled(motion.div)`
  position: fixed;
  width: 40vw;
  height: 80vh;
  top: 100px;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 100%;
`;

const BigContainer = styled.div`
  color: ${(props) => props.theme.white.lighter};
  padding: 15px;
  position: relative;
  top: -300px;
`;

const BigTitle = styled.h3`
  font-size: 36px;
`;

const BigScore = styled.div`
  img {
    width: 20px;
    height: 20px;
  }
  span {
    font-size: 20px;
  }
`;

const BigGenres = styled.p`
  margin-top: 10px;
  font-size: 15px;
`;

const BigOverview = styled.p`
  margin-top: 20px;
  padding: 10px;
  color: ${(props) => props.theme.white.lighter};
`;

const rowVariants = {
  hidden: {
    x: window.outerWidth + 5,
  },
  visible: {
    x: 0,
  },
  exit: {
    x: -window.outerWidth - 5,
  },
};

const boxVariants = {
  normal: {
    scale: 1,
    transition: {
      type: "tween",
    },
  },
  hover: {
    scale: 1.3,
    y: -50,
    transition: {
      delay: 0.5,
      duraiton: 0.3,
      type: "tween",
    },
  },
};

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duraiton: 0.3,
      type: "tween",
    },
  },
};

const offset = 6;

function Search() {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get("keyword");
  const navigate = useNavigate();
  const bigMovieMatch = useMatch("/search/movie/:movieId");
  const bigTvMatch = useMatch("/search/tv/:tvId");
  const { isLoading: loadingMovie, data: movies } = useQuery<IGetMoviesResult>(
    ["movies", keyword],
    () => getSearchMovies(keyword!)
  );
  const { isLoading: loadingTv, data: tvs } = useQuery<IGetTvsResult>(
    ["tvs", keyword],
    () => getSearchTvs(keyword!)
  );
  const [leaving, setLeaving] = useState(false);
  const [indexMovie, setIndexMovie] = useState(0);
  const [indexTv, setIndexTv] = useState(0);
  const increaseIndexes = (type: number) => {
    if (type === 1 && movies!.results.length > 0) {
      if (leaving) return;
      toggleLeaving();
      const totalMoives = movies!.results.length;
      const maxIndex = Math.floor(totalMoives / offset);
      setIndexMovie((prev) => (prev === maxIndex ? 0 : prev + 1));
    } else if (type === 2 && tvs!.results.length > 0) {
      if (leaving) return;
      toggleLeaving();
      const totalTvs = tvs!.results.length;
      const maxIndex = Math.floor(totalTvs / offset);
      setIndexTv((prev) => (prev === maxIndex ? 0 : prev + 1));
    }
  };
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const onMovieBoxClicked = (movieId: number) => {
    navigate(`/search/movie/${movieId}?keyword=${keyword}`);
  };
  const onTvBoxClicked = (tvId: number) => {
    navigate(`/search/tv/${tvId}?keyword=${keyword}`);
  };
  const onOverlayClick = () => navigate(-1);
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    movies?.results.find(
      (movie) => String(movie.id) === bigMovieMatch.params.movieId
    );
  const clickedTv =
    bigTvMatch?.params.tvId &&
    tvs?.results.find((tv) => String(tv.id) === bigTvMatch.params.tvId);
  return (
    <Wrapper>
      <ResultTitle>{`'${keyword}' search result...`}</ResultTitle>
      {loadingMovie && loadingTv ? (
        "Loading..."
      ) : (
        <>
          <Slider key={1}>
            <SliderTitle>Movie</SliderTitle>
            <SliderButton onClick={() => increaseIndexes(1)}>▶</SliderButton>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 0.5 }}
                key={indexMovie}
              >
                {movies?.results
                  .slice(offset * indexMovie, offset * indexMovie + offset)
                  .map((movie) => (
                    <Box
                      layoutId={"m" + movie.id}
                      key={movie.id}
                      initial="normal"
                      whileHover="hover"
                      variants={boxVariants}
                      onClick={() => onMovieBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <Slider key={2}>
            <SliderTitle>Tv series</SliderTitle>
            <SliderButton onClick={() => increaseIndexes(2)}>▶</SliderButton>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 0.5 }}
                key={indexTv}
              >
                {tvs?.results
                  .slice(offset * indexTv, offset * indexTv + offset)
                  .map((tv) => (
                    <Box
                      layoutId={"t" + tv.id}
                      key={tv.id}
                      initial="normal"
                      whileHover="hover"
                      variants={boxVariants}
                      onClick={() => onTvBoxClicked(tv.id)}
                      transition={{ type: "tween" }}
                      bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
              </Row>
            </AnimatePresence>
          </Slider>
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie layoutId={`m${bigMovieMatch.params.movieId}`}>
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(
                            ${makeImagePath(
                              clickedMovie.backdrop_path,
                              "original"
                            )})`,
                        }}
                      />
                      <BigContainer>
                        <BigTitle>{clickedMovie.title}</BigTitle>
                        <BigScore>
                          {[1, 2, 3, 4, 5].map((score) =>
                            score <=
                            Math.round(clickedMovie.vote_average / 2) ? (
                              <span
                                style={{ color: "#FEE501", fontSize: "20px" }}
                              >
                                ★
                              </span>
                            ) : (
                              <span style={{ fontSize: "20px" }}>★</span>
                            )
                          )}
                        </BigScore>
                        <BigGenres>
                          {`Release ${
                            clickedMovie.release_date
                          } | ${clickedMovie.genre_ids
                            .map((genre_id) => {
                              const genre = genresTable.movie.find(
                                (g) => g.id === genre_id
                              );
                              return genre ? genre.name : null;
                            })
                            .join(", ")}`}
                        </BigGenres>
                        <BigOverview>{clickedMovie.overview}</BigOverview>
                      </BigContainer>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
          <AnimatePresence>
            {bigTvMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie layoutId={`t${bigTvMatch.params.tvId}`}>
                  {clickedTv && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `linear-gradient(to top, black, transparent), url(
                            ${makeImagePath(
                              clickedTv.backdrop_path,
                              "original"
                            )})`,
                        }}
                      />
                      <BigContainer>
                        <BigTitle>{clickedTv.name}</BigTitle>
                        <BigScore>
                          Like it! <img src={thumbUp} alt="" />
                          <span>{clickedTv.vote_count}</span>
                        </BigScore>
                        <BigGenres>
                          {`First air ${
                            clickedTv.first_air_date
                          } | ${clickedTv.genre_ids
                            .map((genre_id) => {
                              const genre = genresTable.tv.find(
                                (g) => g.id === genre_id
                              );
                              return genre ? genre.name : null;
                            })
                            .join(", ")}`}
                        </BigGenres>
                        <BigOverview>{clickedTv.overview}</BigOverview>
                      </BigContainer>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Search;
