import React, { forwardRef, useImperativeHandle, useState } from "react";
import { OtherBoard } from "./OtherBoard";
import "../styles/OtherBoard.css";

interface OtherBoardsContainerProps {
  players: string[];
  myname: string;
  gamestatus: string;
}
const OtherBoardsContainer = forwardRef(
  ({ players, myname, gamestatus }: OtherBoardsContainerProps, ref) => {
    const [boards, setBoards] = useState<{ [key: string]: number[][] }>({});
    const [boardStatus, setBoardStatus] = useState<{ [key: string]: string }>(
      {},
    );

    const updateBoard = (newBoard: number[][], playername: string) => {
      for (let col = 0; col < 20; col++) {
        for (let row = 0; row < 10; row++) {
          if (newBoard[col][row]) {
            for (let target_col = col; target_col < 20; target_col++) {
              newBoard[target_col][row] = 1;
            }
          }
        }
      }
      setBoards((prevBoards) => ({
        ...prevBoards,
        [playername]: newBoard,
      }));
    };

    const updateBoardStatus = (newStatus: string, playername: string) => {
      setBoardStatus((prevBoards) => ({
        ...prevBoards,
        [playername]: newStatus,
      }));
    };
    useImperativeHandle(ref, () => ({
      updateBoard,
      updateBoardStatus,
    }));
    if (
      gamestatus !== "waiting" &&
      gamestatus !== "end-wait" &&
      players.length < 2
    )
      return null;
    else
      return (
        <div className="otherboard-container">
          {players
            .filter((player) => player !== myname)
            .map((player) => (
              <OtherBoard
                key={player}
                playername={player}
                board={boards[player]}
                status={boardStatus[player]}
              />
            ))}
        </div>
      );
  },
);

OtherBoardsContainer.displayName = "OtherBoardsContainer";

export default OtherBoardsContainer;
