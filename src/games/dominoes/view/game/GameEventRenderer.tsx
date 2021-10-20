import React from "react";
import { observer } from "mobx-react-lite";
import "./GameEventRenderer.css";
import { GameEvent } from "./interfaces/GameEvent";
import { GameEventType } from "../../../../../games-common/src/games/dominoes/enums/GameEventType";

interface IProps {
    event?: GameEvent;
    index?: number;
    clearEvent: () => void;
}

export const GameEventRenderer = observer((props: IProps) => {
    React.useEffect(() => {
        if (props.event) {
            setTimeout(() => {
                props.clearEvent();
            }, props.event.duration);
        }
    }, [props.event?.id]);

    const gameEventClass =
        props.index === null
            ? ""
            : props.index === 0
            ? " game-event-me"
            : ` game-event-opponent-${props.index}`;

    const eventType = props.event?.type;

    const gameEventText =
        eventType === GameEventType.SCORE
            ? `+ ${props.event.score}`
            : eventType === GameEventType.PASS
            ? "Pass"
            : eventType === GameEventType.BLOCKED
            ? "Board blocked"
            : props.event?.type;

    return (
        <div className="game-event-renderer">
            {!!props.event && (
                <div className={`game-event${gameEventClass}`}>
                    {gameEventText}
                </div>
            )}
        </div>
    );
});
