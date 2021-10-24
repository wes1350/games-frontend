import React from "react";
import { observer } from "mobx-react-lite";
import "./GameEventRenderer.css";
import { GameEvent } from "./interfaces/GameEvent";
import { GameEventType } from "../../../../../games-common/src/games/dominoes/enums/GameEventType";
import { GameViewState } from "../GameViewState";

interface IProps {
    gameViewState: GameViewState;
}

export const GameEventRenderer = observer((props: IProps) => {
    const getGameEventClass = (index: number) => {
        return index === null
            ? ""
            : index === 0
            ? " game-event-me"
            : ` game-event-opponent-${index}`;
    };

    const getGameEventText = (event: GameEvent) => {
        return event.type === GameEventType.SCORE
            ? `+ ${event.score}`
            : event.type === GameEventType.PASS
            ? "Pass"
            : event.type === GameEventType.BLOCKED
            ? "Board blocked"
            : event.type;
    };

    return (
        <div className="game-event-renderer">
            {props.gameViewState.Events.map((event, i) => (
                <div
                    key={i}
                    className={`game-event${getGameEventClass(event.index)}`}
                >
                    {getGameEventText(event)}
                </div>
            ))}
        </div>
    );
});
