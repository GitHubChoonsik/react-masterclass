import { useState } from "react";
import { useQuery } from "react-query";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useMatch, useNavigate } from "react-router-dom";
import {
  IGetTvsResult,
  ITv,
  genresTable,
  getLatestTv,
  getTodayTvs,
  getPopularTvs,
  getTopTvs,
} from "../api";
import { makeImagePath } from "../utils";
import thumbUp from "../img/thumb-up.png";

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

const BigTv = styled(motion.div)`
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

function Tv() {
  const navigate = useNavigate();
  const bigTvMatch = useMatch("/tv/:index/:tvId");
  const { data, isLoading } = useQuery<ITv>(["latest"], getLatestTv);
  const useMultipleQuery = () => {
    const todayPlaying = useQuery<IGetTvsResult>(["todayPlaying"], getTodayTvs);
    const popularRated = useQuery<IGetTvsResult>(
      ["popularRated"],
      getPopularTvs
    );
    const top = useQuery<IGetTvsResult>(["top"], getTopTvs);
    return [todayPlaying, popularRated, top];
  };
  const [
    { isLoading: loadingToday, data: todayData },
    { isLoading: loadingPopular, data: popularData },
    { isLoading: loadingTop, data: topData },
  ] = useMultipleQuery();
  const [indexes, setIndexes] = useState([0, 0, 0, 0]);
  const increaseIndexes = (data: IGetTvsResult | undefined, index: number) => {
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
  const onBoxClicked = (index: number, tvId: number) => {
    navigate(`/tv/${index}/${tvId}`);
  };
  const onOverlayClick = () => navigate(-1);
  const allResultData = () => {
    return [
      ...(todayData?.results ?? []),
      ...(popularData?.results ?? []),
      ...(topData?.results ?? []),
    ];
  };
  const clickedTv =
    bigTvMatch?.params.tvId &&
    allResultData().find((tv) => String(tv.id) === bigTvMatch.params.tvId);
  return (
    <Wrapper>
      {isLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            bgPhoto={makeImagePath(todayData?.results[0].backdrop_path || "")}
          >
            <Title>{todayData?.results[0].name}</Title>
            <Overview>{todayData?.results[0].overview}</Overview>
            <BannerButton
              onClick={() => onBoxClicked(0, todayData?.results[0].id!)}
            >
              Detail
            </BannerButton>
          </Banner>
          <Slider key={1}>
            <SliderTitle>Airing Today</SliderTitle>
            <SliderButton onClick={() => increaseIndexes(todayData, 1)}>
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
                {todayData?.results
                  .slice(1)
                  .slice(offset * indexes[1], offset * indexes[1] + offset)
                  .map((tv) => (
                    <Box
                      layoutId={"1" + tv.id}
                      key={tv.id}
                      initial="normal"
                      whileHover="hover"
                      variants={boxVariants}
                      onClick={() => onBoxClicked(1, tv.id)}
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
          <Slider key={2}>
            <SliderTitle>Popular</SliderTitle>
            <SliderButton onClick={() => increaseIndexes(popularData, 2)}>
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
                {popularData?.results
                  .slice(offset * indexes[2], offset * indexes[2] + offset)
                  .map((tv) => (
                    <Box
                      layoutId={"2" + tv.id}
                      key={tv.id}
                      initial="normal"
                      whileHover="hover"
                      variants={boxVariants}
                      onClick={() => onBoxClicked(2, tv.id)}
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
          <Slider key={3}>
            <SliderTitle>Top Rated</SliderTitle>
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
                {topData?.results
                  .slice(offset * indexes[3], offset * indexes[3] + offset)
                  .map((tv) => (
                    <Box
                      layoutId={"3" + tv.id}
                      key={tv.id}
                      initial="normal"
                      whileHover="hover"
                      variants={boxVariants}
                      onClick={() => onBoxClicked(3, tv.id)}
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
            {bigTvMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigTv
                  layoutId={`${bigTvMatch.params.index}${bigTvMatch.params.tvId}`}
                >
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
                </BigTv>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Tv;
