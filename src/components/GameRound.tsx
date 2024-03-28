import { Socket } from "socket.io-client";
import {
  AudioElementActions,
  CurrentGameState,
  RoundStatus,
  SongData,
  User,
  UserScore,
} from "../types.ts";
import { useEffect, useState } from "react";
import "regenerator-runtime/runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
// import AudioMotionAnalyzer from 'audiomotion-analyzer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import Loading from "./Loading.tsx";

interface GameRoundProps {
  socket: Socket;
  roomCode: string;
  currentUser: User;
  setGameId: Function;
  gameId: string;
  setPendingGameId: Function;
  setIsLoading: Function;
  isMicrophoneBlocked: boolean;
}

function GameRound({
  socket,
  roomCode,
  currentUser,
  setGameId,
  gameId,
  setPendingGameId,
  setIsLoading,
  isMicrophoneBlocked
}: GameRoundProps) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [playerBuzzedIn, setPlayerBuzzedIn] = useState<User | null>(null);
  const [audioElem, setAudioElem] = useState<HTMLAudioElement | null>(null);
  // const [audioMotion, setAudioMotion] = useState<AudioMotionAnalyzer | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const { listening } = useSpeechRecognition();
  const [currentGame, setCurrentGame] = useState<CurrentGameState | null>(null);
  const [roundStatus, setRoundStatus] = useState<RoundStatus | null>(null);
  const [answersForRound, setAnwersForRound] = useState<SongData | null>(null);
  const [guessSecondsRemaining, setGuessSecondsRemaining] = useState<
    number | null
  >(null);
  const [guessTimeout, setGuessTimeout] = useState<number | null>(null);
  const [showAutoPlayModal, setShowAutoPlayModal] = useState(false);
  const [incorrectUserGuess, setIncorrectUserGuess] = useState<User | null>(
    null
  );
  const [correctUserGuess, setCorrectUserGuess] = useState<User | null>(null);
  const [finalGameResults, setFinalGameResults] = useState<UserScore[] | null>(
    null
  );
  const [resultsString, setResultsString] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const fetchGameById = async (id: string) => {
    try {
      const response = await fetch(`${apiUrl}games/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      });

      const responseJSON = await response.json();

      if (response.status === 200) {
        const gameState = responseJSON.gameState;

        setCurrentGame(gameState);
      } else {
        console.log(responseJSON.error);
      }

      return;
    } catch (err) {
      // this returns unhandled server errors
      console.log(err);
    }
  };

  useEffect(() => {
    socket.connect();

    fetchGameById(gameId);

    socket.on("gameUpdated", (gameState: CurrentGameState) => {
      setCurrentGame(gameState);
    });

    socket.on(
      "updatePlayerGuessResult",
      (player: User, isGuessCorrect: boolean) => {
        if (isGuessCorrect) {
          setCorrectUserGuess(player);
        } else {
          setIncorrectUserGuess(player);
        }

        setIsButtonDisabled(false);
      }
    );

    socket.on("leaveCurrentGameAndJoinPendingGame", (pendingGameId: string) => {
      setPendingGameId(pendingGameId);
      localStorage.removeItem("swfGameId");
      setGameId(null);
    });

    socket.on("socketError", (errorMessage: string) => {
      console.log(`socket error: ${errorMessage}`);
      setPlayerBuzzedIn(null);
    });
  }, []);

  useEffect(() => {
    if (currentGame) {
      socket.emit("createUser", currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && roomCode) {
      socket.emit("joinRoom", roomCode);
    }
  }, [currentUser, roomCode]);

  useEffect(() => {
    if (roomCode && gameId) {
      socket.emit("createGameData", {
        roomCode,
        gameId,
      });
    }
  }, [roomCode, gameId]);

  useEffect(() => {
    if (incorrectUserGuess) {
      setTimeout(() => {
        setIncorrectUserGuess(null);
      }, 2000);
    }
  }, [incorrectUserGuess]);

  useEffect(() => {
    if (currentGame) {
      const buzzedInUserScore = currentGame.userScores.find(
        (userScore) => userScore.buzzedInTimestamp
      );
      const updatedBuzzedInPlayer = buzzedInUserScore
        ? {
            id: buzzedInUserScore.userId,
            displayName: buzzedInUserScore.userName,
            isHost: buzzedInUserScore.isHost,
          }
        : null;
      setPlayerBuzzedIn(updatedBuzzedInPlayer);

      if (currentGame.isGameOver) {
        const sortedResults = currentGame.userScores.sort(
          (a, b) => b.totalScore - a.totalScore
        );
        setFinalGameResults(sortedResults);
      }

      const currentAudioSrc = currentGame.currentAudioSrc;
      setAudioSrc(currentAudioSrc);

      setRoundStatus(currentGame.currentRoundStatus);
    }
  }, [currentGame]);

  useEffect(() => {
    if (finalGameResults) {
      let result = "";

      if (
        finalGameResults.length === 1 ||
        finalGameResults[0].totalScore !== finalGameResults[1].totalScore
      ) {
        result = `${finalGameResults[0].userName} wins!`;
      } else {
        result = "It's a tie!";
      }

      setResultsString(result);
    }
  }, [finalGameResults]);

  useEffect(() => {
    if (audioSrc) {
      const audioElem = new Audio(audioSrc);
      audioElem.crossOrigin = "anoymous";

      setAudioElem(audioElem);
    } else {
      setAudioElem(null);
    }
  }, [audioSrc]);

  // const createAudioMotion = () => {
  //   if(ref && audioElem && !audioMotion) {
  //     const newAudioMotion = new AudioMotionAnalyzer(ref, {
  //       source: audioElem,
  //       ansiBands: false,
  //       showScaleX: false,
  //       radial: true,
  //       showPeaks: false,
  //       smoothing: 0.7,
  //       lumiBars: true,
  //       bgAlpha: 0,
  //       frequencyScale: "log",
  //       reflexRatio: 0.5,
  //       reflexAlpha: 1,
  //       reflexBright: 1,
  //       gradient: "prism"
  //     });

  //     console.log(audioMotion)
  //     setAudioMotion(newAudioMotion);
  //   }
  // };

  const triggerAudioElem = async (action: AudioElementActions) => {
    try {
      if (action === AudioElementActions.PLAY) {
        await audioElem?.play();
      }

      if (action === AudioElementActions.PAUSE) {
        await audioElem?.pause();
      }
    } catch (err) {
      setShowAutoPlayModal(true);
    }
  };

  useEffect(() => {
    if (roundStatus && audioElem) {
      if (roundStatus !== RoundStatus.ENDED) {
        setAnwersForRound(null);
      }

      if (roundStatus === RoundStatus.STARTED) {
        setCorrectUserGuess(null);
        triggerAudioElem(AudioElementActions.PLAY);
        // createAudioMotion();
      }

      if (roundStatus === RoundStatus.PAUSED) {
        triggerAudioElem(AudioElementActions.PAUSE);
      }

      if (roundStatus === RoundStatus.RESUMED) {
        audioElem.play();
        triggerAudioElem(AudioElementActions.PLAY);
      }

      if (
        roundStatus === RoundStatus.ENDED ||
        roundStatus === RoundStatus.WAITING_START
      ) {
        triggerAudioElem(AudioElementActions.PAUSE);
        // audioElem.currentTime = 0;
      }
    }
  }, [roundStatus, audioElem]);

  const fetchAnswersForRound = async () => {
    try {
      const response = await fetch(
        `${apiUrl}games/${currentGame?.gameId}/answers/${currentGame?.currentRound}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "GET",
        }
      );

      const responseJSON = await response.json();

      if (response.status === 200) {
        const newAnswersForRound = responseJSON;

        setAnwersForRound(newAnswersForRound);
      } else {
        console.log(responseJSON.error);
      }

      return;
    } catch (err) {
      // this returns unhandled server errors
      console.log(err);
    }
  };

  useEffect(() => {
    if (roundStatus === RoundStatus.ENDED && !answersForRound) {
      fetchAnswersForRound();
    }
  }, [roundStatus, answersForRound]);

  useEffect(() => {
    if (playerBuzzedIn && playerBuzzedIn.id === currentUser.id) {
      // mic should only be activated for the buzzed in client
      // TODO check socket user to protect against bad acting clients
      SpeechRecognition.startListening();
      setGuessSecondsRemaining(10);
    } else {
      SpeechRecognition.stopListening();
      resetTranscript();

      if (guessTimeout) {
        clearTimeout(guessTimeout);
        setGuessTimeout(null);
      }
    }
  }, [playerBuzzedIn]);

  useEffect(() => {
    if (guessSecondsRemaining) {
      const timeout = setTimeout(() => {
        if (guessSecondsRemaining > 0) {
          setGuessSecondsRemaining(guessSecondsRemaining - 1);
        }
      }, 1000);
      setGuessTimeout(timeout);
    }

    if (guessSecondsRemaining === 0) {
      if (currentGame) {
        socket.emit(
          "scoreGuess",
          currentGame.gameId,
          roomCode,
          playerBuzzedIn,
          ""
        );
      }
      if (guessTimeout) {
        clearTimeout(guessTimeout);
        setGuessTimeout(null);
      }
    }
  }, [guessSecondsRemaining]);

  useEffect(() => {
    if (currentGame && playerBuzzedIn && !listening) {
      if (transcript) {
        console.log(`your guess: ${transcript}`);

        socket.emit(
          "scoreGuess",
          currentGame.gameId,
          roomCode,
          playerBuzzedIn,
          transcript
        );
      }
    }
  }, [currentGame, transcript, playerBuzzedIn, listening]);

  const startRound = async() => {
    if (currentGame) {
      try {
        setIsLoading(true);

        await socket.emit(
          "clientUpdatedRoundStatus",
          currentGame.gameId,
          currentGame.roomCode,
          RoundStatus.STARTED
        );
      } catch(err) {
        console.log(err)
      } finally {
        setIsLoading(false);
      }
    }
  };

  const buzzIn = () => {
    if (currentGame) {
      setIsButtonDisabled(true);
      socket.emit(
        "playerBuzzedIn",
        currentGame.gameId,
        currentGame.roomCode,
        currentUser.id
      );
    }
  };

  const endRound = () => {
    if (currentGame) {
      socket.emit(
        "clientUpdatedRoundStatus",
        currentGame.gameId,
        currentGame.roomCode,
        RoundStatus.ENDED
      );
    }
  };

  const advanceRound = async() => {
    if (currentGame) {
      try {
        setIsLoading(true);

        await socket.emit("clientAdvancedRound", currentGame.gameId, roomCode);
      } catch(err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resumeAudioElementAction = () => {
    setShowAutoPlayModal(false);

    if (roundStatus && audioElem) {
      if (roundStatus !== RoundStatus.ENDED) {
        setAnwersForRound(null);
      }

      if (roundStatus === RoundStatus.STARTED) {
        triggerAudioElem(AudioElementActions.PLAY);
      }

      if (roundStatus === RoundStatus.PAUSED) {
        triggerAudioElem(AudioElementActions.PAUSE);
      }

      if (roundStatus === RoundStatus.RESUMED) {
        audioElem.play();
        triggerAudioElem(AudioElementActions.PLAY);
      }

      if (
        roundStatus === RoundStatus.ENDED ||
        roundStatus === RoundStatus.WAITING_START
      ) {
        triggerAudioElem(AudioElementActions.PAUSE);
      }
    }
  };

  const createPendingGame = async (hostPlayer: User) => {
    try {
      const formData = {
        hostPlayer,
        roomCode,
      };

      const response = await fetch(`${apiUrl}pending-games`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(formData),
      });

      const responseJSON = await response.json();

      if (response.status === 200) {
        const pendingGame = responseJSON.pendingGame;
        socket.emit("pendingGameCreated", roomCode, pendingGame.id);
      } else {
        console.log(responseJSON);
      }

      return;
    } catch (err) {
      // this returns unhandled server errors
      console.log(err);
    }
  };

  const playAgain = () => {
    if (currentUser.isHost && currentGame) {
      createPendingGame(currentUser);
    }
  };

  return (
    <div>
      {showAutoPlayModal && (
        <div className="auto-play-modal">
          <div className="flex items-center justify-center w-[90%] h-[100px] rounded-md bg-white">
            <div className="font-semibold text-lg">
              you were disconnected from the game. click{" "}
              <span
                className="cursor-pointer text-pastel-blue"
                onClick={() => resumeAudioElementAction()}
              >
                here
              </span>{" "}
              to rejoin
            </div>
          </div>
        </div>
      )}
      {currentGame && roundStatus ? (
        <div>
          <div className="flex py-[20px] gap-[10px]">
            {currentGame.userScores.map((userScore) => {
              return (
                <div
                  key={userScore.userId}
                  className={`flex w-[25%] h-[60px] justify-center items-center ${
                    userScore.buzzedInTimestamp
                      ? "animate-pulse-once bg-light-blue"
                      : ""
                  }`}
                >
                  {userScore.userName}: {userScore.totalScore}
                  {incorrectUserGuess?.id === userScore.userId && (
                    <FontAwesomeIcon
                      className="h-[40px] absolute animate-ping-once text-warning-red"
                      icon={faX}
                    />
                  )}
                  {correctUserGuess?.id === userScore.userId && (
                    <FontAwesomeIcon
                      className="h-[40px] pl-[5px] animate-ping-once text-success-green"
                      icon={faCheck}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex flex-col justify-between gap-[20px] items-center">
            <div className="text-center">
              <h1 className="font-bold text-2xl">
                {currentGame.isGameOver
                  ? "Game Over"
                  : `Round: ${currentGame.currentRound}`}
              </h1>
              <h2 className="text-xl">Category: {currentGame?.musicGenre}</h2>
            </div>
            {currentGame.isGameOver ? (
              <div className="flex flex-col gap-[20px] items-center justify-center">
                <div>{resultsString}</div>
                <div className="flex flex-col gap-[10px] w-[300px] py-[10px] rounded-md border border-solid border-cool-gray">
                  {finalGameResults &&
                    finalGameResults.map((result) => {
                      return (
                        <div
                          key={result.userId}
                          className="flex justify-between items-center px-[20px]"
                        >
                          <div>{result.userName}</div>
                          <div>{result.totalScore}</div>
                        </div>
                      );
                    })}
                </div>
                {currentUser.isHost && (
                  <button
                    className="bg-light-blue rounded-md p-2"
                    onClick={() => playAgain()}
                  >
                    PLAY AGAIN
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-[20px] items-center">
                <div className="w-[300px] rounded-md border border-solid border-cool-gray">
                  <div className="h-[300px]">
                    {roundStatus === RoundStatus.ENDED && (
                      <img
                        className="rounded-t-md"
                        src={answersForRound?.img}
                      />
                    )}
                    {roundStatus !== RoundStatus.ENDED && (
                      <div className="flex h-full bg-pastel-blue items-center justify-center">
                        <FontAwesomeIcon
                          className="h-[120px]"
                          icon={faQuestionCircle}
                        />
                      </div>
                    )}
                  </div>
                  {roundStatus === RoundStatus.ENDED && (
                    <div className="flex flex-col p-[5px]">
                      <div>
                        <span>{`Artist: ${answersForRound?.artistName}`}</span>
                      </div>
                      <div>
                        <span>{`Song: ${answersForRound?.name}`}</span>
                      </div>
                      <div>
                        <span>{`Album: ${answersForRound?.albumName}`}</span>
                      </div>
                      <div>
                        <span>{`Release: ${answersForRound?.releaseDate}`}</span>
                      </div>
                    </div>
                  )}
                </div>

                {roundStatus === RoundStatus.ENDED && (
                  <div>
                    {currentUser.isHost && (
                      <button
                        className="bg-light-blue rounded-md p-2"
                        onClick={() => advanceRound()}
                      >
                        NEXT ROUND
                      </button>
                    )}
                  </div>
                )}

                {roundStatus === RoundStatus.WAITING_START &&
                  currentUser.isHost && (
                    <button
                      className="bg-light-blue rounded-md p-2"
                      onClick={() => startRound()}
                    >
                      START ROUND
                    </button>
                  )}

                {!isMicrophoneBlocked && (roundStatus === RoundStatus.STARTED ||
                  roundStatus === RoundStatus.RESUMED) && (
                  <button
                    className="disabled:bg-cool-gray bg-light-blue rounded-md p-2"
                    onClick={() => buzzIn()}
                    disabled={isButtonDisabled}
                  >
                    BUZZ IN
                  </button>
                )}

                {currentUser.isHost &&
                  (roundStatus === RoundStatus.STARTED ||
                    roundStatus === RoundStatus.RESUMED) && (
                    <button
                      className="bg-light-blue rounded-md p-2"
                      onClick={() => endRound()}
                    >
                      SKIP QUESTION
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default GameRound;
