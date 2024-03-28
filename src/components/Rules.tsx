function Rules() {
  return (
    <>
      <div className="flex flex-col gap-[10px]">
        <div>
          <h1 className="text-2xl font-bold underline">Songs with Friends</h1>
          <p>
            <div>Songs with Friends is a music quiz game that can be played with friends or solo.</div>
            <div>Each round, players will be given a sample of a song based on the playlist selected and then try to guess the song title and artist by buzzing in and speaking into their device.</div>
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold underline">How to Play</h2>
          <p>
            <div>No signup or account is needed to play.</div>
            <div>In order to participate in the game, you will need to allow microphone persmission.</div>
            <div>If it's your first time visiting the site, the application will prompt you for microphone permission.</div>
            <div>If you had previously declined microphone access, you will need to allow for microphone access manually.</div>
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold underline">Creating a Game</h3>
          <p>
            <div>Click the CREATE NEW GAME button to create a new room to host a game.</div>
            <div>Select a your NAME for the game.</div>
            <div>As a game host you can select the playlist and number of rounds for your game session.</div>
            <div>The displayed ROOM CODE can be shared for others to join your game.</div>
            <div>When you are ready, click the START GAME button to begin playing.</div>
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold underline">Joining a Game</h3>
          <p>
            <div>You can join someone's created game session by entering the ROOM CODE and your NAME in the provided form and then clicking PLAY.</div>
            <div>If the game is found, you will be placed in the game's waiting room until the host starts the game.</div>
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold underline">Playing</h3>
          <p>
            <div>Players can BUZZ IN whenever they think they know both the song and artist.</div>
            <div>After a player buzzes in, their name will be highlighted in the scoreboard at the top of the screen to indicate that they are currently guessing.</div>
            <div>The guessing player will have 10 seconds to begin dictating both the song title and artist.</div>
            <div>They can be said in any order and can also include filler words such as "by".</div>
            <div>For example, if the correct answer is "Spice Up Your Life by the Spice Girls", both the guesses for "spice girls spice up your life" or "spice up your life by the spice girls" would be correct.</div>
            <div>If the player guesses incorrectly or the time expires, an indicator for a wrong guess will appear on the scoreboard section.</div>
            <div>If the player guesses correctly, an indicator for a correct guess will appear on the scoreboard section and that player will recieve 1 point.</div>
            <div>Players can BUZZ IN multiple times without penalty.</div>
            <div>Once a correct guess is registered or the host decides to skip the question, the game will display the correct answer.</div>
          </p>
        </div>
        <div>
          <h3 className="text-xl font-bold underline">End of the Game</h3>
          <p>
            <div>Once the final round has finished, the game will end and the standing will be displayed.</div>
            <div>From here, the host can choose to start a new game by clicking the PLAY AGAIN button.</div>
            <div>This will create a new game session with the current players in the game.</div>
            <div>The host can select a new playlist and number of rounds.</div>
          </p>
        </div>
      </div>
    </>
  )
}

export default Rules;