import { observer } from "mobx-react-lite";
import React from "react";
import { GameView as DominoesGameView } from "games/dominoes/view/game/GameView";
import { GameViewState as DominoesGameViewState } from "games/dominoes/view/GameViewState";
import { GameType } from "../../games-common/src/enums/GameType";

interface IProps {
    gameType: GameType;
    gameViewState: any; // Some sort of GameState dependent on gameType
    // gameState: MaskedGameState;
    respond: (type: any, value: any) => void;
    onEnterLobby: () => void;
}

type RoomParams = {
    roomId: string;
};

export const GameViewWrapper = observer((props: IProps) => {
    // Will need to handle reconnects and reinitialization
    // const gameViewState = InitializeGameViewState(props.gameState);
    // const gameViewState = new GameViewState(props.gameState);
    return (
        <div className="game-view-wrapper">
            {props.gameType === GameType.DOMINOES ? (
                <DominoesGameView
                    gameViewState={props.gameViewState}
                    respond={props.respond}
                    onEnterLobby={props.onEnterLobby}
                />
            ) : (
                <div>invalid game type {props.gameType}</div>
            )}
        </div>
    );
});
