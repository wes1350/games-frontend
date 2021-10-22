import { DragItemTypes } from "games/dominoes/enums/DragItemTypes";
import { observer } from "mobx-react-lite";
import React from "react";
import { useDrop } from "react-dnd";
import { Direction } from "../../../../../games-common/src/games/dominoes/enums/Direction";

interface IProps {
    onDropDomino: (item: { index: number }, direction: Direction) => void;
}

export const InitialBoardDropArea = observer((props: IProps) => {
    const [, drop] = useDrop(() => ({
        accept: DragItemTypes.DOMINO,
        drop: (item: { index: number }, monitor) => {
            // if (props.board.Dominoes.length === 0) {
            props.onDropDomino(item, Direction.NONE);
        },
        collect: (monitor) => ({
            // isOver: !!monitor.isOver(),
            // canDrop: props.board.Dominoes.length === 0
            // isDragging: (monitor as any).internalMonitor.isDragging()
        })
    }));

    return <div className="initial-board-drop-area" ref={drop}></div>;
});
