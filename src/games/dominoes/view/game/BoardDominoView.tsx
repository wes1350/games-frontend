import { DragItemTypes } from "games/dominoes/enums/DragItemTypes";
import { action, runInAction } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { Equals } from "../../../../../games-common/src/games/dominoes/Domino";
import { Direction } from "../../../../../games-common/src/games/dominoes/enums/Direction";
import { BoardDomino } from "./BoardDomino";
import { DominoView } from "./DominoView";
import "./DominoView.css";
import {
    CanPlayVertically,
    FlattenRenderedBoard,
    IsFurthestDominoInArm,
    IsFurthestDominoInInitialRow,
    RenderedBoard
} from "./RenderedBoard";

interface IProps {
    boardDomino: BoardDomino;
    board: RenderedBoard;
    gridSize: number;
    onDropDomino: (item: { index: number }, direction: Direction) => void;
    highlight?: boolean;
}

export const BoardDominoView = observer((props: IProps) => {
    const [, drop] = useDrop(
        () => ({
            accept: DragItemTypes.DOMINO,
            drop: (item: { index: number }, monitor) => {
                props.onDropDomino(
                    item,
                    getDropDirectionForDomino(props.board, props.boardDomino)
                );
            }
        }),
        [props.board]
    );

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

    const getDropDirectionForDomino = (
        board: RenderedBoard,
        boardDomino: BoardDomino
    ): Direction => {
        // Refactor, maybe combine with isDroppable?
        const mobxValue = FlattenRenderedBoard(board).length;

        // for some reason the board is outdated here, fix

        if (!boardDomino) {
            return Direction.NONE;
        }

        if (board.spinner) {
            if (Equals(boardDomino.domino, board.spinner.domino)) {
                console.log(board);
                if (board.eastArm.length === 0) {
                    return Direction.EAST;
                } else if (board.westArm.length === 0) {
                    return Direction.WEST;
                } else if (CanPlayVertically(board)) {
                    if (board.northArm.length === 0) {
                        return Direction.NORTH;
                    } else if (board.southArm.length === 0) {
                        return Direction.SOUTH;
                    }
                }
            } else {
                if (IsFurthestDominoInArm(board, boardDomino, Direction.EAST)) {
                    return Direction.EAST;
                }
                if (IsFurthestDominoInArm(board, boardDomino, Direction.WEST)) {
                    return Direction.WEST;
                }
                if (
                    CanPlayVertically(board) &&
                    IsFurthestDominoInArm(board, boardDomino, Direction.NORTH)
                ) {
                    return Direction.NORTH;
                }
                if (
                    CanPlayVertically(board) &&
                    IsFurthestDominoInArm(board, boardDomino, Direction.SOUTH)
                ) {
                    return Direction.SOUTH;
                }
            }
        } else {
            if (
                IsFurthestDominoInInitialRow(board, boardDomino, Direction.EAST)
            ) {
                return Direction.EAST;
            } else if (
                IsFurthestDominoInInitialRow(board, boardDomino, Direction.WEST)
            ) {
                return Direction.WEST;
            }
        }
        return null;
    };

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
