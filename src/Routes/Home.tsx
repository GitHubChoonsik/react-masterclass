import { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useMatch, useNavigate } from "react-router-dom";
import {
  IGetMoviesResult,
  IMovie,
  genresTable,
  getLatestMovie,
  getNowMovies,
  getTopMovies,
  getUpcomingMovies,
} from "../api";
import { makeImagePath } from "../utils";

const Wrapper = styled.div`
  background-color: black;
  overflow-x: hidden;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ bgPhoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.bgPhoto});
  background-size: cover;
`;

const BannerButton = styled.button`
  margin-top: 15px;
  background-color: black;
  color: white;
  font-size: 17px;
  border: 1px solid white;
  border-radius: 50px;
  width: 200px;
  height: 50px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
  cursor: pointer;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 10px;
`;

const Overview = styled.p`
  font-size: 30px;
  width: 50%;
`;

const Slider = styled.div`
  height: 210px;
  position: relative;
  top: -100px;
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

const BigScore = styled.div``;

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

function Home() {
  const navigate = useNavigate();
  const bigMovieMatch = useMatch("/movies/:index/:movieId");
  const { data, isLoading } = useQuery<IMovie>(["latest"], getLatestMovie);
  const useMultipleQuery = () => {
    const nowPlaying = useQuery<IGetMoviesResult>(["nowPlaying"], getNowMovies);
    const topRated = useQuery<IGetMoviesResult>(["topRated"], getTopMovies);
    const upComing = useQuery<IGetMoviesResult>(
      ["upComing"],
      getUpcomingMovies
    );
    return [nowPlaying, topRated, upComing];
  };
  const [
    { isLoading: loadingNow, data: nowData },
    { isLoading: loadingTop, data: topData },
    { isLoading: loadingUpComing, data: upComingData },
  ] = useMultipleQuery();
  const [indexes, setIndexes] = useState([0, 0, 0, 0]);
  const increaseIndexes = (
    data: IGetMoviesResult | undefined,
    index: number
  ) => {
    if (data) {
      if (leaving) return;
      toggleLeaving();
      const totalMoives = data.results.length;
      const maxIndex = Math.floor(totalMoives / offset) - 1;
      setIndexes((prev) => {
        if (prev[index] === maxIndex) {
          prev[index] = 0;
        } else {
          prev[index] += 1;
        }
        return prev;
      });
    }
  };
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const [leaving, setLeaving] = useState(false);
  const onBoxClicked = (index: number, movieId: number) => {
    navigate(`/movies/${index}/${movieId}`);
  };
  const onOverlayClick = () => navigate(-1);
  const allResultData = () => {
    return [
      ...(nowData?.results ?? []),
      ...(topData?.results ?? []),
      ...(upComingData?.results ?? []),
    ];
  };
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    allResultData().find(
      (movie) => String(movie.id) === bigMovieMatch.params.movieId
    );
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(nowData?.results[0].backdrop_path || "")}
          >
            <Title>{nowData?.results[0].title}</Title>
            <Overview>{nowData?.results[0].overview}</Overview>
            <BannerButton
              onClick={() => onBoxClicked(0, nowData?.results[0].id!)}
            >
              Detail
            </BannerButton>
          </Banner>
          <Slider key={1}>
            <SliderTitle>Popular</SliderTitle>
            <SliderButton onClick={() => increaseIndexes(nowData, 1)}>
              ▶
            </SliderButton>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 0.5 }}
                key={indexes[1]}
              >
                {nowData?.results
                  .slice(1)
                  .slice(offset * indexes[1], offset * indexes[1] + offset)
                  .map((movie) => (
                    <Box
                      layoutId={"1" + movie.id}
                      key={movie.id}
                      initial="normal"
                      whileHover="hover"
                      variants={boxVariants}
                      onClick={() => onBoxClicked(1, movie.id)}
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
            <SliderTitle>Top Rated Movies</SliderTitle>
            <SliderButton onClick={() => increaseIndexes(topData, 2)}>
              ▶
            </SliderButton>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 0.5 }}
                key={indexes[2]}
              >
                {topData?.results
                  .slice(offset * indexes[2], offset * indexes[2] + offset)
                  .map((movie) => (
                    <Box
                      layoutId={"2" + movie.id}
                      key={movie.id}
                      initial="normal"
                      whileHover="hover"
                      variants={boxVariants}
                      onClick={() => onBoxClicked(2, movie.id)}
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
          <Slider key={3}>
            <SliderTitle>Upcoming Movies</SliderTitle>
            <SliderButton onClick={() => increaseIndexes(topData, 3)}>
              ▶
            </SliderButton>
            <AnimatePresence initial={false} onExitComplete={toggleLeaving}>
              <Row
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 0.5 }}
                key={indexes[3]}
              >
                {upComingData?.results
                  .slice(offset * indexes[3], offset * indexes[3] + offset)
                  .map((movie) => (
                    <Box
                      layoutId={"3" + movie.id}
                      key={movie.id}
                      initial="normal"
                      whileHover="hover"
                      variants={boxVariants}
                      onClick={() => onBoxClicked(3, movie.id)}
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
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  layoutId={`${bigMovieMatch.params.index}${bigMovieMatch.params.movieId}`}
                >
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
        </>
      )}
    </Wrapper>
  );
}

export default Home;
