import React from "react";

interface InfoBoxProps {
  roomname: string;
  players: string[];
  winner: string | null;
  myname: string;
  isLeader: boolean;
  status: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  roomname,
  players,
  winner,
  myname,
  isLeader,
  status,
}) => {
  let message = "";

  if (status === "waiting") {
    message = "They are playing. You should wait until it ends.";
  } else if (status === "ready") {
    if (isLeader) {
      message += "You can click button to start a game.";
    } else {
      message += " Please wait until the leader starts a game.";
    }
  } else if (status === "end-play") {
    if (winner === myname) message = "🎉🎊 Congrat! You did it! 🏆🎉 ";
    else message = "😅 Oops! Better luck next time! 🍀 ";
    if (isLeader) {
      message += "You can click button to start a game.";
    } else {
      message += " Please wait until the leader starts a game.";
    }
  } else if (status === "end-wait") {
    message = "Thanks for waiting! ";
    if (isLeader) {
      message += "You can click button to start a game.";
    } else {
      message += " Please wait until the leader starts a game.";
    }
  } else if (status === "waitServer") {
    message = "waiting for server ... refresh the page in a few second";
  } else if (status === "error") {
    message =
      "There is already a player with same name. Choose different name and try again.";
  }
  if (status !== "ready" && status !== "error" && message.length === 0)
    return null;
  return (
    <div className="info-wrapper">
      <div className="info-box">
        {status !== "playing" && status !== "error" && (
          <div className="info">
            <div>Room: {roomname}</div>
            <div>
              {players.length > 0 && (
                <>
                  <div>Players:</div>
                  {players.map((player, index) => (
                    <div key={index}>{player}</div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
        <div className="info">
          {winner && status !== "error" && <div>Winner : {winner}</div>}
          <div>{message}</div>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
