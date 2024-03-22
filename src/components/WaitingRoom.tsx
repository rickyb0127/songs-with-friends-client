import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { AvailableCategory, CurrentGameState, User } from "../types";

interface WaitingRoomProps {
  socket: Socket;
  setGameId: Function;
  pendingGameId: string | null;
  setPendingGameId: Function;
}

function WaitingRoom({
  socket,
  setGameId,
  pendingGameId,
  setPendingGameId,
}: WaitingRoomProps) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const availablePlaylistCategoriesString = import.meta.env.VITE_AVAILABLE_PLAYLIST_CATEGORIES;
  const availablePlaylistCategories: AvailableCategory[] = JSON.parse(availablePlaylistCategoriesString);
  const currentUser = localStorage.getItem("swfUser")
    ? JSON.parse(localStorage.getItem("swfUser")!)
    : null;
  const roomCode = localStorage.getItem("swfRoomCode")
    ? localStorage.getItem("swfRoomCode")!
    : null;
  const [usersInGame, setUsersInGame] = useState<User[]>([]);
  const [showSelectOptions, setShowSelectOptions] = useState(false);
  const [numberOfRounds, setNumberOfRounds] = useState<number>(1);
  const [maxNumRounds, setMaxNumRounds] = useState<number>(1);
  const [selectedPlaylistCategory, setSelectedPlaylistCategory] =
    useState<AvailableCategory | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const selectOptions = availablePlaylistCategories.map((option, index) => {
    return (
      <li
        key={index}
        className="pl-[25px] pb-[10px] cursor-pointer"
        onClick={() => setSelectedPlaylistCategory(option)}
        role="option"
      >
        {option.name}
      </li>
    );
  });

  useEffect(() => {
    socket.connect();

    socket.emit("joinRoom", roomCode);

    socket.on("userJoinedRoom", (users) => {
      setUsersInGame(users);
    });

    socket.on("pendingGameDeleted", () => {
      localStorage.removeItem("swfPendingGameId");
      setPendingGameId(null);
    });

    socket.on("gameCreated", (gameId) => {
      setGameId(gameId);
    });

    if (availablePlaylistCategories && availablePlaylistCategories.length > 0) {
      const defaultPlaylist = availablePlaylistCategories[0];
      setSelectedPlaylistCategory(defaultPlaylist);
    }
  }, []);

  useEffect(() => {
    if (selectedPlaylistCategory) {
      setMaxNumRounds(selectedPlaylistCategory.maxPlaylistLength);
      setNumberOfRounds(
        Math.min(numberOfRounds, selectedPlaylistCategory.maxPlaylistLength)
      );
    }
  }, [selectedPlaylistCategory]);

  const initializeNewGame = async () => {
    const formData = {
      genre: selectedPlaylistCategory?.name,
      numRounds: numberOfRounds,
      roomCode,
      usersInGame,
    };

    try {
      const response = await fetch(`${apiUrl}games`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(formData),
      });

      const responseJSON = await response.json();

      if (response.status === 200) {
        const gameState = responseJSON.gameState as CurrentGameState;
        socket.emit("hostDidCreateGame", roomCode, gameState.gameId);
      } else {
        console.log(responseJSON);
      }

      return;
    } catch (err) {
      // this returns unhandled server errors
      console.log(err);
    }
  };

  const deletePendingGame = async () => {
    try {
      const response = await fetch(`${apiUrl}pending-games/${pendingGameId}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });

      if (response.status === 200) {
        socket.emit("hostDidDeletePendingGame", roomCode);
      } else {
        console.log(response);
      }

      return;
    } catch (err) {
      // this returns unhandled server errors
      console.log(err);
    }
  };

  const validateForm = () => {
    if (!selectedPlaylistCategory) {
      setErrorMessage("Please select a category");
      return false;
    } else if (
      !numberOfRounds ||
      !Number.isInteger(numberOfRounds) ||
      numberOfRounds > maxNumRounds
    ) {
      setErrorMessage("Please enter a valid number of rounds");
      return false;
    }
    return true;
  };

  const startGame = async () => {
    if (validateForm()) {
      initializeNewGame();
      deletePendingGame();
    }
  };

  return (
    <div>
      <div className="flex py-[20px] gap-[10px]">
        {usersInGame.length > 0 &&
          usersInGame.map((user) => {
            return (
              <div
                key={user.id}
                className="flex w-[25%] h-[60px] justify-center items-center"
              >
                {user.displayName}
              </div>
            );
          })}
      </div>
      <div className="flex flex-col items-center gap-[20px]">
        <h1 className="font-bold text-2xl">
          {currentUser.isHost ? (
            <span>Select Options to Start Game</span>
          ) : (
            <span>Waiting for Game to Start</span>
          )}
        </h1>
        <div>ROOM CODE: {roomCode}</div>

        {currentUser.isHost && (
          <div className="flex flex-col gap-[20px] items-center">
            <div className="flex flex-col">
              <label className="text-center">Playlist Category</label>
              <div
                className="shadow-md shadow-light-gray rounded outline-none w-[200px] h-[50px]"
                onClick={() => {
                  setShowSelectOptions(!showSelectOptions);
                }}
              >
                <button
                  className="flex justify-between items-center w-full h-full"
                  onClick={() => {
                    setShowSelectOptions(!showSelectOptions);
                  }}
                >
                  <div className="flex pl-[25px]">
                    {selectedPlaylistCategory
                      ? selectedPlaylistCategory.name
                      : "Select a category"}
                  </div>
                </button>
                {showSelectOptions && (
                  <ul
                    className="relative w-[200px] pt-[15px] pb-[5px] mt-[10px] bg-white shadow-md shadow-light-gray z-[10000]"
                    id="select-dropdown"
                  >
                    {selectOptions}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex flex-row">
              <label className="text-center pr-[10px]">
                Select Number of Rounds
              </label>
              <input
                className="text-center w-[50px] rounded-md border-solid border"
                type="number"
                min={1}
                max={maxNumRounds}
                value={numberOfRounds}
                onChange={(e) => setNumberOfRounds(parseInt(e.target.value))}
              />
            </div>

            <div className="text-warning-red">{errorMessage}</div>

            <button
              className="bg-light-blue place-self-center rounded-md w-[200px] p-2"
              onClick={() => startGame()}
            >
              START GAME
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WaitingRoom;
