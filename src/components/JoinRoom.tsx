import { User } from "../types.ts";
import { useState } from "react";

interface JoinRoomProps {
  roomCode: string;
  setRoomCode: Function;
  isNewGame: boolean;
  setCurrentUser: Function;
  setPendingGameId: Function;
  setIsLoading: Function;
}

function JoinRoom({
  roomCode,
  setRoomCode,
  isNewGame,
  setCurrentUser,
  setPendingGameId,
  setIsLoading
}: JoinRoomProps) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [displayName, setDisplayName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const validateForm = () => {
    if (!roomCode) {
      return false;
    } else if (!displayName) {
      return false;
    }

    return true;
  };

  const validateRoomCode = () => {
    // TODO validate room code exists

    return true;
  };

  const getRandomString = () => {
    const chars = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const codeLength = 4;
    let result = "";
    for (let i = 0; i < codeLength; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }

    return result;
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
        setPendingGameId(pendingGame.id);
      } else {
        console.log(responseJSON);
      }

      return;
    } catch (err) {
      // this returns unhandled server errors
      console.log(err);
    }
  };

  const joinPendingGame = async (player: User) => {
    try {
      const formData = {
        player,
        roomCode,
      };

      const response = await fetch(`${apiUrl}pending-games`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify(formData),
      });

      const responseJSON = await response.json();

      if (response.status === 200) {
        const pendingGame = responseJSON.pendingGame;

        if (pendingGame && pendingGame.id) {
          setPendingGameId(pendingGame.id);
        } else {
          setErrorMessage("Game not found. Make sure room code is correct");
        }
      } else {
        console.log(responseJSON);
      }

      return;
    } catch (err) {
      // this returns unhandled server errors
      console.log(err);
    }
  };

  const joinExistingGame = async () => {
    if (validateForm() && validateRoomCode()) {
      try {
        setIsLoading(true);

        const swfUser = {
          id: getRandomString(),
          displayName,
          isHost: isNewGame,
        };

        if (isNewGame) {
          await createPendingGame(swfUser);
        } else {
          await joinPendingGame(swfUser);
        }

        setCurrentUser(swfUser);
        setRoomCode(roomCode);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col justify-between gap-[10px] items-center">
      <div className="flex flex-col gap-[5px]">
        <label className="pl-[5px]">ROOM CODE</label>
        {isNewGame ? (
          <div className="text-center rounded-md w-[280px] h-[36px] border-solid border leading-[2]">
            {roomCode}
          </div>
        ) : (
          <input
            className="text-center rounded-md w-[280px] h-[36px] border-solid border"
            type="text"
            placeholder="Enter Room Code"
            maxLength={4}
            onChange={(e) => setRoomCode(e.target.value)}
          />
        )}
        <label className="pl-[5px]">NAME</label>
        <input
          className="text-center rounded-md w-[280px] h-[36px] border-solid border"
          type="text"
          placeholder="Enter Your Name"
          maxLength={12}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <button
        className="bg-light-blue place-self-center rounded-md w-[200px] p-2"
        onClick={() => joinExistingGame()}
      >
        PLAY
      </button>
      <div className="text-warning-red">{errorMessage}</div>
    </div>
  );
}

export default JoinRoom;
