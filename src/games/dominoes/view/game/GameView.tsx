import React from "react";
import "./GameView.css";
import { BoardView } from "./BoardView";
import { MyPlayerView } from "./MyPlayerView";
import { OpponentPlayerView } from "./OpponentPlayerView";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { observer, useLocalObservable } from "mobx-react-lite";
import { action, runInAction } from "mobx";
// import { GameEventRenderer } from "./GameEventRenderer";
import { GameOverDialog } from "./GameOverDialog";
import { GameViewState } from "../GameViewState";
import { QueryType } from "../../../../../games-common/src/games/dominoes/enums/QueryType";
import {
    Opponent,
    Player
} from "../../../../../games-common/src/games/dominoes/Player";
import { Direction } from "../../../../../games-common/src/games/dominoes/enums/Direction";

interface IProps {
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

    const gameState = props.gameViewState.GameState;
    const me = gameState.me;

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
                        board={gameState.board}
                        width={localStore.windowWidth * 0.7}
                        height={localStore.windowHeight * 0.7 - 40} // 40 is from header height
                        onDropDomino={(
                            item: { index: number },
                            direction: Direction
                        ) => {
                            props.respond(
                                props.gameViewState.CurrentQueryType,
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
                    {gameState.opponents.map((player: Opponent, i: number) => {
                        return (
                            <OpponentPlayerView
                                key={i}
                                index={props.gameViewState.IndexToViewPosition.get(
                                    player.index
                                )}
                                player={player}
                                current={
                                    gameState.currentPlayerIndex ===
                                    player.index
                                }
                                windowWidth={localStore.windowWidth}
                                windowHeight={localStore.windowHeight}
                            />
                        );
                    })}
                    <MyPlayerView
                        player={me}
                        current={gameState.currentPlayerIndex === me.index}
                        onStartDrag={(index: number) => {
                            runInAction(() => {
                                localStore.dominoBeingDragged = me.hand[index];
                            });
                        }}
                        onStopDrag={() => {
                            runInAction(() => {
                                localStore.dominoBeingDragged = null;
                            });
                        }}
                    />
                </div>
                {/* <GameEventRenderer
                    event={gameState.CurrentEvent}
                    index={
                        gameState.SeatToPositionMapping.get(
                            gameState.CurrentEvent?.index
                        ) ?? null
                    }
                    clearEvent={action(() => {
                        gameState.ClearEvent();
                    })}
                /> */}
                {props.gameViewState.GameOver && (
                    <GameOverDialog
                        winner={props.gameViewState.Winner}
                        onEnterLobby={props.onEnterLobby}
                    />
                )}
            </div>
        </DndProvider>
    );
});
