import React from "react";
import "./BoardView.css";
import { BoardDominoView } from "./BoardDominoView";
import { observer } from "mobx-react-lite";
import _ from "lodash";
import { useDrop } from "react-dnd";
import { DragItemTypes } from "games/dominoes/enums/DragItemTypes";
import {
    BendDominoesOutsideOfGrid,
    CanPlayVertically,
    CenterRenderedBoardOnGrid,
    FlattenRenderedBoard,
    GetEastBoundary,
    GetNorthBoundary,
    GetRenderedRepresentation,
    GetSouthBoundary,
    GetWestBoundary,
    IsFurthestDominoInArm,
    IsFurthestDominoInInitialRow,
    MaintainDominoesCloseToSpinnerWithinGrid,
    RenderedBoard,
    ShiftBoardDominoFunction,
    ShiftRenderedBoard
} from "./RenderedBoard";
import { BoardDomino } from "./BoardDomino";
import {
    Board,
    BoardIsEmpty
} from "../../../../../games-common/src/games/dominoes/Board";
import { Direction } from "../../../../../games-common/src/games/dominoes/enums/Direction";
import {
    Domino,
    Equals,
    HasFace
} from "../../../../../games-common/src/games/dominoes/Domino";

interface IProps {
    board: Board;
    width: number;
    height: number;
    onDropDomino: (item: { index: number }, direction: Direction) => void;
    dominoBeingDragged: Domino;
}

export const BoardView = observer((props: IProps) => {
    const [, drop] = useDrop(() => ({
        accept: DragItemTypes.DOMINO,
        drop: (item: { index: number }, monitor) => {
            // if (props.board.Dominoes.length === 0) {
            if (BoardIsEmpty(props.board)) {
                props.onDropDomino(item, Direction.NONE);
            }
        },
        collect: (monitor) => ({
            // isOver: !!monitor.isOver(),
            // canDrop: props.board.Dominoes.length === 0
            // isDragging: (monitor as any).internalMonitor.isDragging()
        })
    }));

    if (!props.width || !props.height) {
        return null;
    }

    // Have some condition to not render the board or something if the screen is too small
    // Can we just arbitrarily scale everything though?

    const layoutDominoes = (
        gridWidthInPixels: number,
        gridHeightInPixels: number,
        baseBoard: Board
    ): {
        gridWidthInSquares: number;
        gridHeightInSquares: number;
        gridSquarePixelSize: number;
        board: RenderedBoard;
    } => {
        const uncenteredBoard = GetRenderedRepresentation(baseBoard);
        const baseDominoLayoutHorizontalSpan =
            GetEastBoundary(uncenteredBoard) - GetWestBoundary(uncenteredBoard);
        const baseDominoLayoutVerticalSpan =
            GetSouthBoundary(uncenteredBoard) -
            GetNorthBoundary(uncenteredBoard);

        // i = number of resizings so far
        for (let i = 0; i < 10; i++) {
            const F = 1 / (6 * i + 24);

            const minimumDimension = Math.min(
                gridWidthInPixels,
                gridHeightInPixels
            );
            const gridSquarePixelSize = F * minimumDimension;
            const gridWidthInSquares = Math.floor(
                gridWidthInPixels / gridSquarePixelSize
            );
            const gridHeightInSquares = Math.floor(
                gridHeightInPixels / gridSquarePixelSize
            );

            const centeredBoard = CenterRenderedBoardOnGrid(
                uncenteredBoard,
                gridWidthInSquares,
                gridHeightInSquares
            );

            if (i === 0) {
                // Check if the board fits at the base size, without bending
                if (
                    baseDominoLayoutVerticalSpan <= gridHeightInSquares &&
                    baseDominoLayoutHorizontalSpan <= gridWidthInSquares
                ) {
                    return {
                        gridWidthInSquares,
                        gridHeightInSquares,
                        gridSquarePixelSize,
                        board: centeredBoard
                    };
                }
            }

            // Board does not fit at original size, need to bend and possibly shrink it

            // Ensure any dominoes close to the spinner are within the grid
            // so that they don't bend, which would result in weird board shapes
            const fullyTranslatedBoard =
                MaintainDominoesCloseToSpinnerWithinGrid(
                    centeredBoard,
                    gridWidthInSquares,
                    gridHeightInSquares
                );

            // Bend any dominoes which still remain outside of the grid
            const bentBoard = BendDominoesOutsideOfGrid(
                fullyTranslatedBoard,
                gridWidthInSquares,
                gridHeightInSquares
            );

            // Check to see if bending is sufficient to get the dominoes to fit the grid
            const northBoundary = GetNorthBoundary(bentBoard);
            const eastBoundary = GetEastBoundary(bentBoard);
            const southBoundary = GetSouthBoundary(bentBoard);
            const westBoundary = GetWestBoundary(bentBoard);

            const bentLayoutVerticalSpan = southBoundary - northBoundary;
            const bentLayoutHorizontalSpan = eastBoundary - westBoundary;

            if (
                bentLayoutVerticalSpan <= gridHeightInSquares &&
                bentLayoutHorizontalSpan <= gridWidthInSquares
            ) {
                // Sometimes, even if the bent dominoes fit, they still need to be translated to fit the grid perfectly
                // This happens when there is no margin on an edge, and a bent double goes over the edge of the grid
                // A small (1 square) translation should fix things

                const verticalShift =
                    northBoundary < 0
                        ? -1 * northBoundary
                        : southBoundary > gridHeightInSquares
                        ? gridHeightInSquares - southBoundary
                        : 0;
                const horizontalShift =
                    westBoundary < 0
                        ? -1 * westBoundary
                        : eastBoundary > gridWidthInSquares
                        ? gridWidthInSquares - eastBoundary
                        : 0;

                return {
                    gridWidthInSquares,
                    gridHeightInSquares,
                    gridSquarePixelSize,
                    board: ShiftRenderedBoard(
                        bentBoard,
                        ShiftBoardDominoFunction(horizontalShift, verticalShift)
                    )
                };
            }

            // If we get here, we need to shrink the grid square size again to get things to fit
        }

        // Did not return in for loop, passed max iterations to find a valid grid size. Return an error
        throw new Error("Could not resolve grid layout, fatal error");
    };

    const gridDescription = layoutDominoes(
        props.width,
        props.height,
        props.board
    );
    const gridHeightInSquares = gridDescription.gridHeightInSquares;
    const gridWidthInSquares = gridDescription.gridWidthInSquares;
    const gridSquarePixelSize = gridDescription.gridSquarePixelSize;
    const finalBoard = gridDescription.board;
    const boardDominoes = FlattenRenderedBoard(finalBoard);

    const isDroppable = (board: RenderedBoard, domino: BoardDomino) => {
        if (!props.dominoBeingDragged) {
            return false;
        }

        if (board.spinner) {
            if (Equals(domino.domino, board.spinner.domino)) {
                return HasFace(
                    props.dominoBeingDragged,
                    board.spinner.domino.head
                );
            } else {
                if (
                    IsFurthestDominoInArm(board, domino, Direction.EAST) &&
                    HasFace(
                        props.dominoBeingDragged,
                        _.last(board.eastArm).domino.tail
                    )
                ) {
                    return true;
                }
                if (
                    IsFurthestDominoInArm(board, domino, Direction.WEST) &&
                    HasFace(
                        props.dominoBeingDragged,
                        _.last(board.westArm).domino.tail
                    )
                ) {
                    return true;
                }
                if (
                    CanPlayVertically(board) &&
                    IsFurthestDominoInArm(board, domino, Direction.NORTH) &&
                    HasFace(
                        props.dominoBeingDragged,
                        _.last(board.northArm).domino.tail
                    )
                ) {
                    return true;
                }
                if (
                    CanPlayVertically(board) &&
                    IsFurthestDominoInArm(board, domino, Direction.SOUTH) &&
                    HasFace(
                        props.dominoBeingDragged,
                        _.last(board.southArm).domino.tail
                    )
                ) {
                    return true;
                }
                return false;
            }
        } else {
            return (
                (IsFurthestDominoInInitialRow(board, domino, Direction.EAST) &&
                    HasFace(
                        props.dominoBeingDragged,
                        _.last(board.eastArm).domino.tail
                    )) ||
                (IsFurthestDominoInInitialRow(board, domino, Direction.WEST) &&
                    HasFace(
                        props.dominoBeingDragged,
                        _.last(board.westArm).domino.head
                    ))
            );
        }
    };

    const determineDropDirectionForDomino = (
        board: RenderedBoard,
        domino: BoardDomino
    ) => {
        return GetNorthBoundary(board) === domino.boundingBox.north &&
            CanPlayVertically(board)
            ? Direction.NORTH
            : GetSouthBoundary(board) === domino.boundingBox.south &&
              CanPlayVertically(board)
            ? Direction.SOUTH
            : GetEastBoundary(board) === domino.boundingBox.east
            ? Direction.EAST
            : GetWestBoundary(board) === domino.boundingBox.west
            ? Direction.WEST
            : null;
    };

    return (
        <div
            className="board"
            ref={drop}
            style={{
                width: props.width,
                height: props.height,
                gridTemplateRows: `repeat(${gridHeightInSquares}, ${gridSquarePixelSize}px)`,
                gridTemplateColumns: `repeat(${gridWidthInSquares}, ${gridSquarePixelSize}px)`
            }}
        >
            {boardDominoes.map((boardDomino, i) => {
                return (
                    <BoardDominoView
                        key={i}
                        // Add 1 to convert to CSS-grid convention where top-left is (1, 1)
                        boardDomino={ShiftBoardDominoFunction(
                            1,
                            1
                        )(boardDomino)}
                        gridSize={gridSquarePixelSize}
                        onDropDomino={(item: { index: number }) => {
                            props.onDropDomino(
                                item,
                                determineDropDirectionForDomino(
                                    finalBoard,
                                    boardDomino
                                )
                            );
                        }}
                        highlight={isDroppable(finalBoard, boardDomino)}
                    ></BoardDominoView>
                );
            })}
        </div>
    );
});
