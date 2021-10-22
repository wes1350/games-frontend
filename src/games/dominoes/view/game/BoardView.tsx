import React from "react";
import "./BoardView.css";
import { BoardDominoView } from "./BoardDominoView";
import { observer } from "mobx-react-lite";
import _ from "lodash";
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
import { InitialBoardDropArea } from "./InitialBoardDropArea";

interface IProps {
    board: Board;
    width: number;
    height: number;
    onDropDomino: (item: { index: number }, direction: Direction) => void;
    dominoBeingDragged: Domino;
}

export const BoardView = observer((props: IProps) => {
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

    const isDroppable = (
        board: RenderedBoard,
        boardDomino: BoardDomino,
        droppedDomino: Domino
    ) => {
        if (!droppedDomino) {
            return false;
        }

        if (!boardDomino) {
            return false;
        }

        if (board.spinner) {
            if (Equals(boardDomino.domino, board.spinner.domino)) {
                if (HasFace(droppedDomino, board.spinner.domino.head)) {
                    if (board.eastArm.length === 0) {
                        return true;
                    } else if (board.westArm.length === 0) {
                        return true;
                    } else if (CanPlayVertically(board)) {
                        if (board.northArm.length === 0) {
                            return true;
                        } else if (board.southArm.length === 0) {
                            return true;
                        }
                    }
                }
            } else {
                if (
                    IsFurthestDominoInArm(board, boardDomino, Direction.EAST) &&
                    HasFace(droppedDomino, _.last(board.eastArm).domino.tail)
                ) {
                    return true;
                }
                if (
                    IsFurthestDominoInArm(board, boardDomino, Direction.WEST) &&
                    HasFace(droppedDomino, _.last(board.westArm).domino.tail)
                ) {
                    return true;
                }
                if (
                    CanPlayVertically(board) &&
                    IsFurthestDominoInArm(
                        board,
                        boardDomino,
                        Direction.NORTH
                    ) &&
                    HasFace(droppedDomino, _.last(board.northArm).domino.tail)
                ) {
                    return true;
                }
                if (
                    CanPlayVertically(board) &&
                    IsFurthestDominoInArm(
                        board,
                        boardDomino,
                        Direction.SOUTH
                    ) &&
                    HasFace(droppedDomino, _.last(board.southArm).domino.tail)
                ) {
                    return true;
                }
            }
        } else {
            if (
                IsFurthestDominoInInitialRow(
                    board,
                    boardDomino,
                    Direction.EAST
                ) &&
                HasFace(droppedDomino, _.last(board.initialRow).domino.tail)
            ) {
                return true;
            } else if (
                IsFurthestDominoInInitialRow(
                    board,
                    boardDomino,
                    Direction.WEST
                ) &&
                HasFace(droppedDomino, _.first(board.initialRow).domino.head)
            ) {
                return true;
            }
        }
        return false;
    };

    return (
        <div
            className="board"
            style={{
                width: props.width,
                height: props.height,
                gridTemplateRows: `repeat(${gridHeightInSquares}, ${gridSquarePixelSize}px)`,
                gridTemplateColumns: `repeat(${gridWidthInSquares}, ${gridSquarePixelSize}px)`
            }}
        >
            {BoardIsEmpty(props.board) && (
                <InitialBoardDropArea onDropDomino={props.onDropDomino} />
            )}
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
                        onDropDomino={props.onDropDomino}
                        board={finalBoard}
                        highlight={isDroppable(
                            finalBoard,
                            boardDomino,
                            props.dominoBeingDragged
                        )}
                    ></BoardDominoView>
                );
            })}
        </div>
    );
});
