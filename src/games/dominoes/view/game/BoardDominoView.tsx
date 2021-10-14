import { DragItemTypes } from "games/dominoes/enums/DragItemTypes";
import { action, runInAction } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { BoardDomino } from "./BoardDomino";
import { DominoView } from "./DominoView";
import "./DominoView.css";

interface IProps {
    boardDomino: BoardDomino;
    highlight?: boolean;
    gridSize: number;
    onDropDomino: (item: { index: number }) => void;
}

export const BoardDominoView = observer((props: IProps) => {
    const [, drop] = useDrop(() => ({
        accept: DragItemTypes.DOMINO,
        drop: (item: { index: number }, monitor) => {
            props.onDropDomino(item);
        }
    }));

    const boardDominoRef = useRef<HTMLDivElement>(null);

    const localStore = useLocalObservable(() => ({
        width: null,
        height: null
    }));

    React.useEffect(() => {
        const containerWidth = boardDominoRef?.current?.clientWidth;
        const containerHeight = boardDominoRef?.current?.clientHeight;

        runInAction(() => {
            localStore.width = containerWidth;
            localStore.height = containerHeight;
        });

        const handleWindowResizeForContainer = action(() => {
            localStore.width = boardDominoRef?.current?.clientWidth;
            localStore.height = boardDominoRef?.current?.clientHeight;
        });

        window.addEventListener("resize", handleWindowResizeForContainer);
    });

    const box = props.boardDomino.boundingBox;

    return (
        <div
            className="board-domino-view"
            ref={drop}
            style={{
                gridArea: `${box.north} / ${box.west} / ${box.south} / ${box.east}`
            }}
        >
            <div ref={boardDominoRef} className="board-domino-wrapper">
                <DominoView
                    domino={props.boardDomino.domino}
                    direction={props.boardDomino.direction}
                    highlight={props.highlight}
                    width={localStore.width}
                    height={localStore.height}
                />
            </div>
        </div>
    );
});
