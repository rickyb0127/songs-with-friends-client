import { useEffect, useState } from 'react'
import { socket } from './socket.ts';
import { User } from './types.ts';
import NavBar from './components/NavBar.tsx';
import JoinRoom from './components/JoinRoom.tsx';
import WaitingRoom from './components/WaitingRoom.tsx';
import GameRound from './components/GameRound.tsx';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [isNewGame, setIsNewGame] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>(localStorage.getItem("swfRoomCode") ? localStorage.getItem("swfRoomCode")! : "");
  const [currentUser, setCurrentUser] = useState<User | null>(localStorage.getItem("swfUser") ? JSON.parse(localStorage.getItem("swfUser")!) : null);
  const [pendingGameId, setPendingGameId] = useState<string | null>(localStorage.getItem("swfPendingGameId") ? localStorage.getItem("swfPendingGameId")! : null);
  const [gameId, setGameId] = useState<string | null>(localStorage.getItem("swfGameId") ? localStorage.getItem("swfGameId")! : null);
  const [isPartOfPendingGame, setIsPartOfPendingGame] = useState<boolean>(false);

  const getRandomString = () => {
    const chars = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const codeLength = 4;
    let result = '';
    for(let i = 0; i < codeLength; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    };
  
    return result;
  };

  const createRoom = () => {
    const newRoomCode = getRandomString();
    socket.emit('createRoom', newRoomCode);

    setRoomCode(newRoomCode);
    setIsNewGame(true);
  };

  useEffect(() => {
    if(currentUser) {
      localStorage.setItem("swfUser", JSON.stringify(currentUser));
      socket.emit('createUser', currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    if(roomCode) {
      localStorage.setItem("swfRoomCode", roomCode);
    }
  }, [roomCode]);

  useEffect(() => {
    if(pendingGameId) {
      localStorage.setItem("swfPendingGameId", pendingGameId);
    }
  }, [pendingGameId]);

  useEffect(() => {
    if(gameId) {
      localStorage.setItem("swfGameId", gameId);
    }
  }, [gameId]);

  useEffect(() => {
    socket.connect();
  }, []);

  const checkPendingGameStatus = async() => {
    try {
      const response = await fetch(
        `${apiUrl}pending-games/${pendingGameId}/${currentUser?.id}/${roomCode}`, 
        {
          headers: {
            "Content-Type": "application/json"
          },
          method: "GET"
        }
      );

      if(response.status === 200) {
        setIsPartOfPendingGame(true);
        socket.emit('joinRoom', roomCode);
      } else {
        setIsPartOfPendingGame(false);
      }

      return;
    } catch(err) {
      console.log(err)
    }
  };

  useEffect(() => {
    if(pendingGameId && currentUser && roomCode) {
      // check for active existing pending game and make sure they are part of it
      // this will return false for games already in progress
      checkPendingGameStatus();
    }
  }, [pendingGameId, currentUser, roomCode]);

  return (
    <>
      <NavBar />
      <div className="mobile:max-w-full tablet:max-w-[800px] desktop:max-w-[800px] mx-auto">
        {
          gameId ? 
          <GameRound socket={socket} roomCode={roomCode} currentUser={currentUser!} setGameId={setGameId} gameId={gameId} setPendingGameId={setPendingGameId} /> :
          <div>
            {
              isPartOfPendingGame ?
              <div>
                <WaitingRoom socket={socket} setGameId={setGameId} pendingGameId={pendingGameId} setPendingGameId={setPendingGameId} />
              </div> :
              <div className="pt-[40px]">
                {isNewGame ? 
                  <div className="flex flex-col items-center">
                    <JoinRoom socket={socket} roomCode={roomCode} setRoomCode={setRoomCode} isNewGame={isNewGame} setCurrentUser={setCurrentUser} setPendingGameId={setPendingGameId} />
                  </div> :
                  <div className='flex flex-col items-center gap-[20px]'>
                    <JoinRoom socket={socket} roomCode={roomCode} setRoomCode={setRoomCode} isNewGame={isNewGame} setCurrentUser={setCurrentUser} setPendingGameId={setPendingGameId} />
                    <div>OR</div>
                    <button
                      className='bg-light-blue rounded-md w-[200px] p-2'
                      onClick={() => createRoom()}
                    >
                      CREATE NEW GAME
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </>
  )
}

export default App;
library.add(fas);