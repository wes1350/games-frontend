import { observer } from "mobx-react-lite";
import React from "react";
import _ from "lodash";
import { GameType } from "@games-common/enums/GameType";
// import { GameView } from "games/dominoes/view/GameView";
import { GameView } from "games/dominoes/view/game/GameView";
import { GameViewState } from "games/dominoes/view/GameViewState";
import { MaskedGameState } from "@games-common/games/dominoes/interfaces/GameState";
// import { InitializeGameViewState } from "games/dominoes/view/GameViewState";

interface IProps {
    gameType: GameType;
    gameViewState: GameViewState;
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
                <GameView
                    gameViewState={props.gameViewState}
                    respond={props.respond}
                    onEnterLobby={props.onEnterLobby}
                />
            ) : null}
        </div>
    );
});
