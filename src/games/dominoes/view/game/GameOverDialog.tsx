import React from "react";
import "./GameOverDialog.css";
import { observer } from "mobx-react-lite";
import { GameViewState } from "../GameViewState";

interface IProps {
    gameViewState: GameViewState;
    onEnterLobby: () => void;
}

export const GameOverDialog = observer((props: IProps) => {
    const winnerName = [
        props.gameViewState.GameState.me,
        ...props.gameViewState.GameState.opponents
    ].find((player) => player.id === props.gameViewState.Winner).name;
    return (
        <div className="game-over-dialog">
            <div className="winner-name">{winnerName} wins!</div>
            <div className="back-to-lobby-button-container">
                <button
                    className="back-to-lobby-button"
                    onClick={props.onEnterLobby}
                >
                    Back to room lobby
                </button>
            </div>
        </div>
    );
});
