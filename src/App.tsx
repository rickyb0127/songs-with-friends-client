import { useEffect, useState } from 'react'
import { socket } from './socket.ts';
import { User } from './types.ts';
import NavBar from './components/NavBar.tsx';
import JoinRoom from './components/JoinRoom.tsx';
import WaitingRoom from './components/WaitingRoom.tsx';
import GameRound from './components/GameRound.tsx';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import Loading from './components/Loading.tsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [isNewGame, setIsNewGame] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string>(localStorage.getItem("swfRoomCode") ? localStorage.getItem("swfRoomCode")! : "");
  const [currentUser, setCurrentUser] = useState<User | null>(localStorage.getItem("swfUser") ? JSON.parse(localStorage.getItem("swfUser")!) : null);
  const [pendingGameId, setPendingGameId] = useState<string | null>(localStorage.getItem("swfPendingGameId") ? localStorage.getItem("swfPendingGameId")! : null);
  const [gameId, setGameId] = useState<string | null>(localStorage.getItem("swfGameId") ? localStorage.getItem("swfGameId")! : null);
  const [isPartOfPendingGame, setIsPartOfPendingGame] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMicrophoneBlocked, setIsMicrophoneBlocked] = useState(false);

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

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      stream.getTracks().forEach(function(track) {
        track.stop();
      });

      setIsMicrophoneBlocked(false);
    } catch(err) {
      setIsMicrophoneBlocked(true);
    }
  };

  useEffect(() => {
    socket.connect();

    checkMicrophonePermission();
  }, []);

  const checkPendingGameStatus = async() => {
    try {
      setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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
          isLoading ?
          <Loading /> :
          <>
          {isMicrophoneBlocked && 
            <div className="flex px-2 justify-center">
              <div className="flex gap-[5px] items-center justify-center text-warning-red">
                <FontAwesomeIcon icon={faCircleExclamation} />
                <div>In order to participate in a game, you need to allow microphone permission.</div>
              </div>
            </div>
          }
          {
            gameId ? 
            <GameRound socket={socket} roomCode={roomCode} currentUser={currentUser!} setGameId={setGameId} gameId={gameId} setPendingGameId={setPendingGameId} setIsLoading={setIsLoading} isMicrophoneBlocked={isMicrophoneBlocked} /> :
            <div>
              {
                isPartOfPendingGame ?
                <div>
                  <WaitingRoom socket={socket} setGameId={setGameId} pendingGameId={pendingGameId} setPendingGameId={setPendingGameId} setIsLoading={setIsLoading} />
                </div> :
                <div className="pt-[40px]">
                  {isNewGame ? 
                    <div className="flex flex-col items-center">
                      <JoinRoom roomCode={roomCode} setRoomCode={setRoomCode} isNewGame={isNewGame} setCurrentUser={setCurrentUser} setPendingGameId={setPendingGameId} setIsLoading={setIsLoading} />
                    </div> :
                    <div className='flex flex-col items-center gap-[20px]'>
                      <JoinRoom roomCode={roomCode} setRoomCode={setRoomCode} isNewGame={isNewGame} setCurrentUser={setCurrentUser} setPendingGameId={setPendingGameId} setIsLoading={setIsLoading} />
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
          </>
        }
      </div>
    </>
  )
}

export default App;
library.add(fas);