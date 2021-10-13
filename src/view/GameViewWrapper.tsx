import { observer } from "mobx-react-lite";
import React from "react";
import _ from "lodash";
import { GameType } from "@games-common/enums/GameType";
import { GameView } from "games/dominoes/view/GameView";
import { GameState as DominoesGameState } from "@games-common/games/dominoes/interfaces/GameState";

interface IProps {
    gameType: GameType;
    gameState: any;
    respond: (type: any, value: any) => void;
    onEnterLobby: () => void;
}

type RoomParams = {
    roomId: string;
};

export const GameViewWrapper = observer((props: IProps) => {
    return (
        <div className="game-view-wrapper">
            {props.gameType === GameType.DOMINOES ? (
                <GameView
                    gameState={props.gameState as DominoesGameState}
                    respond={props.respond}
                    onEnterLobby={props.onEnterLobby}
                />
            ) : null}
        </div>
    );
});
