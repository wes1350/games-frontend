// import { Direction } from "enums/Direction";
import { Direction } from "@games-common/games/dominoes/enums/Direction";
import { Player } from "@games-common/games/dominoes/Player";
import { action, runInAction } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
// import { IPlayer } from "model/PlayerModel";
import React, { useRef } from "react";
import { DominoView } from "./DominoView";
import { MyHandDominoView } from "./MyHandDominoView";
import "./PlayerView.css";

interface IProps {
    player: Player;
    current: boolean;
    onStartDrag: (index: number) => void;
    onStopDrag: () => void;
}

export const MyPlayerView = observer((props: IProps) => {
    const handRef = useRef<HTMLDivElement>(null);

    const localStore = useLocalObservable(() => ({
        handHeight: window.innerHeight * 0.15
    }));

    React.useEffect(() => {
        const handHeight = handRef?.current?.clientHeight;

        if (!localStore.handHeight) {
            runInAction(() => {
                localStore.handHeight = handHeight;
            });
        }

        const handleWindowResizeForDomino = action(() => {
            localStore.handHeight = handRef?.current?.clientHeight;
        });

        window.addEventListener("resize", handleWindowResizeForDomino);
    });

    return (
        <div
            className={`player-view player-view-horizontal my-player ${
                props.current ? " current" : ""
            }`}
            style={{ borderBottom: "0px" }}
        >
            <div
                ref={handRef}
                className={"hand-container hand-container-horizontal"}
            >
                <div className="hand-wrapper">
                    {props.player.hand.map((domino, i) => {
                        return (
                            <MyHandDominoView
                                key={i}
                                index={i}
                                face1={domino.head}
                                face2={domino.tail}
                                // playable={props.player.PlayableDominoes?.includes(
                                //     i
                                // )}
                                playable={false}
                                height={localStore.handHeight}
                                onStartDrag={() => props.onStartDrag(i)}
                                onStopDrag={props.onStopDrag}
                            >
                                <DominoView
                                    domino={domino}
                                    height={localStore.handHeight}
                                    width={0.5 * localStore.handHeight}
                                    direction={Direction.SOUTH}
                                />
                            </MyHandDominoView>
                        );
                    })}
                </div>
            </div>
            <div
                className={
                    "player-details player-details-horizontal player-details-me"
                }
            >
                <div className={"player-name player-name-me"}>
                    {props.player.name}
                </div>
                <div className={"player-score player-score-me"}>
                    Score: {props.player.score}
                </div>
            </div>
        </div>
    );
});
