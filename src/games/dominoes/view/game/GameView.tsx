import React from "react";
import "./GameView.css";
import { BoardView } from "./BoardView";
import { MyPlayerView } from "./MyPlayerView";
import { OpponentPlayerView } from "./OpponentPlayerView";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { observer, useLocalObservable } from "mobx-react-lite";
import { action, runInAction } from "mobx";
import { GameEventRenderer } from "./GameEventRenderer";
import { GameOverDialog } from "./GameOverDialog";
import { QueryType } from "@games-common/games/dominoes/enums/QueryType";
import {
    MaskedGameState,
    MaskedGameStatePlayer
} from "@games-common/games/dominoes/interfaces/GameState";
import { Direction } from "@games-common/games/dominoes/enums/Direction";
import { GameViewState } from "../GameViewState";

interface IProps {
    gameState: MaskedGameState;
    gameViewState: GameViewState;
    respond: (type: QueryType, value: any) => void;
    onEnterLobby: () => void;
}

export const GameView = observer((props: IProps) => {
    const localStore = useLocalObservable(() => ({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        dominoBeingDragged: null
    }));

    React.useEffect(() => {
        const handleWindowResizeForBoard = action(() => {
            localStore.windowWidth = window.innerWidth;
            localStore.windowHeight = window.innerHeight;
        });

        window.addEventListener("resize", handleWindowResizeForBoard);
    });

    const me = props.gameState.players[props.gameState.myIndex];
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="game-view">
                <div
                    className={"board-container"}
                    style={{
                        top: localStore.windowHeight * 0.125 + 40, // 40 is from header height
                        left: localStore.windowWidth * 0.15
                    }}
                >
                    <BoardView
                        board={props.gameState.board}
                        width={localStore.windowWidth * 0.7}
                        height={localStore.windowHeight * 0.7 - 40} // 40 is from header height
                        onDropDomino={(
                            item: { index: number },
                            direction: Direction
                        ) => {
                            props.respond(
                                props.gameViewState.currentQueryType,
                                {
                                    domino: item.index,
                                    direction: direction
                                }
                            );
                        }}
                        dominoBeingDragged={localStore.dominoBeingDragged}
                    />
                </div>
                <div className={"player-container"}>
                    {props.gameState.players
                        .filter((player: MaskedGameStatePlayer) => {
                            return player.index !== props.gameState.myIndex;
                        })
                        .map((player: MaskedGameStatePlayer, i: number) => {
                            return (
                                <OpponentPlayerView
                                    key={i}
                                    index={props.gameState.SeatToPositionMapping.get(
                                        player.index
                                    )}
                                    player={player}
                                    current={
                                        props.gameState.currentPlayerIndex ===
                                        player.index
                                    }
                                    windowWidth={localStore.windowWidth}
                                    windowHeight={localStore.windowHeight}
                                />
                            );
                        })}
                    <MyPlayerView
                        player={me}
                        current={
                            props.gameState.currentPlayerIndex === me.index
                        }
                        onStartDrag={(index: number) => {
                            runInAction(() => {
                                localStore.dominoBeingDragged =
                                    props.gameState.players[
                                        props.gameState.currentPlayerIndex
                                    ].hand[index];
                            });
                        }}
                        onStopDrag={() => {
                            runInAction(() => {
                                localStore.dominoBeingDragged = null;
                            });
                        }}
                    />
                </div>
                <GameEventRenderer
                    event={props.gameState.CurrentEvent}
                    index={
                        props.gameState.SeatToPositionMapping.get(
                            props.gameState.CurrentEvent?.index
                        ) ?? null
                    }
                    clearEvent={action(() => {
                        props.gameState.ClearEvent();
                    })}
                />
                {props.gameViewState.gameOver && (
                    <GameOverDialog
                        winner={props.gameViewState.winner}
                        onEnterLobby={props.onEnterLobby}
                    />
                )}
            </div>
        </DndProvider>
    );
});
