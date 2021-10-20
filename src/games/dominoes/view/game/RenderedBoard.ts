import { BoardDomino } from "./BoardDomino";
import _ from "lodash";
import { BoundingBox } from "./interfaces/BoundingBox";
import {
    rotateDirectionClockwise,
    rotateDirectionCounterClockwise
} from "games/dominoes/utils";
import {
    Domino,
    Equals,
    IsDouble
} from "../../../../../games-common/src/games/dominoes/Domino";
import { Board } from "../../../../../games-common/src/games/dominoes/Board";
import { Direction } from "../../../../../games-common/src/games/dominoes/enums/Direction";

export interface RenderedBoard {
    spinner: BoardDomino | null;
    northArm: BoardDomino[]; // The arms will be empty before there is a spinner and filled in after
    eastArm: BoardDomino[];
    southArm: BoardDomino[];
    westArm: BoardDomino[];
    initialRow: BoardDomino[] | null; // This will be filled in before there is a spinner and null after
}

const getLengthDisplacementInArm = (arm: Domino[], index: number) => {
    return arm
        .slice(0, index)
        .map((domino) => (IsDouble(domino) ? 2 : 4))
        .reduce((a, b) => a + b, 0);
};

const getWidthDisplacementInArm = (domino: Domino) => {
    return IsDouble(domino) ? 2 : 1;
};

const getDominoWidth = (domino: Domino) => {
    return IsDouble(domino) ? 2 : 4;
};

export const GetRenderedRepresentation = (board: Board): RenderedBoard => {
    if (board.initialRow !== null) {
        return {
            spinner: null,
            northArm: [],
            eastArm: [],
            southArm: [],
            westArm: [],
            initialRow: board.initialRow.map((domino, i) => ({
                domino,
                direction: Direction.EAST,
                boundingBox: {
                    north: -1,
                    east: 4 * (i + 1),
                    south: 1,
                    west: 4 * i
                }
            }))
        };
    } else {
        const spinner = {
            domino: board.spinner,
            direction: Direction.SOUTH,
            boundingBox: {
                north: -2,
                east: 1,
                south: 2,
                west: -1
            }
        };
        return {
            spinner,
            northArm: board.northArm.map((domino, i) => ({
                domino,
                direction: IsDouble(domino) ? Direction.EAST : Direction.NORTH,
                boundingBox: {
                    north:
                        -2 -
                        getLengthDisplacementInArm(board.northArm, i) -
                        getDominoWidth(domino),
                    east: getWidthDisplacementInArm(domino),
                    south: -2 - getLengthDisplacementInArm(board.northArm, i),
                    west: -1 * getWidthDisplacementInArm(domino)
                }
            })),
            eastArm: board.eastArm.map((domino, i) => ({
                domino,
                direction: IsDouble(domino) ? Direction.SOUTH : Direction.EAST,
                boundingBox: {
                    north: -1 * getWidthDisplacementInArm(domino),
                    east:
                        1 +
                        getLengthDisplacementInArm(board.eastArm, i) +
                        getDominoWidth(domino),
                    south: getWidthDisplacementInArm(domino),
                    west: 1 + getLengthDisplacementInArm(board.eastArm, i)
                }
            })),
            southArm: board.southArm.map((domino, i) => ({
                domino,
                direction: IsDouble(domino) ? Direction.EAST : Direction.SOUTH,
                boundingBox: {
                    north: 2 + getLengthDisplacementInArm(board.southArm, i),
                    east: getWidthDisplacementInArm(domino),
                    south:
                        2 +
                        getLengthDisplacementInArm(board.southArm, i) +
                        getDominoWidth(domino),
                    west: -1 * getWidthDisplacementInArm(domino)
                }
            })),
            westArm: board.westArm.map((domino, i) => ({
                domino,
                direction: IsDouble(domino) ? Direction.SOUTH : Direction.WEST,
                boundingBox: {
                    north: -1 * getWidthDisplacementInArm(domino),
                    east: -1 - getLengthDisplacementInArm(board.westArm, i),
                    south: getWidthDisplacementInArm(domino),
                    west:
                        -1 -
                        getLengthDisplacementInArm(board.westArm, i) -
                        getDominoWidth(domino)
                }
            })),
            initialRow: null
        };
    }
};

export const GetNorthBoundary = (board: RenderedBoard) => {
    return Math.min(
        ...FlattenRenderedBoard(board).map(
            (boardDomino) => boardDomino.boundingBox.north
        )
    );
};

export const GetEastBoundary = (board: RenderedBoard) => {
    return Math.max(
        ...FlattenRenderedBoard(board).map(
            (boardDomino) => boardDomino.boundingBox.east
        )
    );
};

export const GetSouthBoundary = (board: RenderedBoard) => {
    return Math.max(
        ...FlattenRenderedBoard(board).map(
            (boardDomino) => boardDomino.boundingBox.south
        )
    );
};

export const GetWestBoundary = (board: RenderedBoard) => {
    return Math.min(
        ...FlattenRenderedBoard(board).map(
            (boardDomino) => boardDomino.boundingBox.west
        )
    );
};

export const IsFurthestNorthDomino = (
    board: RenderedBoard,
    boardDomino: BoardDomino
) => {
    return !!board.spinner
        ? Equals(boardDomino.domino, _.last(board.northArm)?.domino)
        : true;
};

export const IsFurthestEastDomino = (
    board: RenderedBoard,
    boardDomino: BoardDomino
) => {
    return !!board.spinner
        ? Equals(boardDomino.domino, _.last(board.eastArm)?.domino)
        : Equals(boardDomino.domino, _.last(board.initialRow).domino);
};

export const IsFurthestSouthDomino = (
    board: RenderedBoard,
    boardDomino: BoardDomino
) => {
    return !!board.spinner
        ? Equals(boardDomino.domino, _.last(board.southArm)?.domino)
        : true;
};

export const IsFurthestWestDomino = (
    board: RenderedBoard,
    boardDomino: BoardDomino
) => {
    return !!board.spinner
        ? Equals(boardDomino.domino, _.last(board.westArm)?.domino)
        : Equals(boardDomino.domino, _.first(board.initialRow).domino);
};

export const ShiftRenderedBoard = (
    board: RenderedBoard,
    shiftDomino: (domino: BoardDomino) => BoardDomino
) => {
    if (board.initialRow !== null) {
        return {
            ...board,
            initialRow: board.initialRow.map(shiftDomino)
        };
    } else {
        return {
            spinner: shiftDomino(board.spinner),
            northArm: board.northArm.map(shiftDomino),
            eastArm: board.eastArm.map(shiftDomino),
            southArm: board.southArm.map(shiftDomino),
            westArm: board.westArm.map(shiftDomino),
            initialRow: null
        };
    }
};

const shiftBoundingBox = (
    box: BoundingBox,
    x: number,
    y: number
): BoundingBox => ({
    north: box.north + y,
    east: box.east + x,
    south: box.south + y,
    west: box.west + x
});

export const ShiftBoardDominoFunction = (
    x: number,
    y: number
): ((boardDomino: BoardDomino) => BoardDomino) => {
    return (boardDomino: BoardDomino) => ({
        ...boardDomino,
        boundingBox: shiftBoundingBox(boardDomino.boundingBox, x, y)
    });
};

export const CenterRenderedBoardOnGrid = (
    board: RenderedBoard,
    gridWidthInSquares: number,
    gridHeightInSquares: number
): RenderedBoard => {
    // Grid starts at (0, 0), shift by (1, 1) to conform to CSS-grid outside of this function
    const gridSquareHorizontalCenter = Math.floor(gridWidthInSquares / 2);
    const gridSquareVerticalCenter = Math.floor(gridHeightInSquares / 2);

    const baseDominoLayoutHorizontalCenter =
        (GetEastBoundary(board) + GetWestBoundary(board)) / 2;
    const baseDominoLayoutVerticalCenter =
        (GetNorthBoundary(board) + GetSouthBoundary(board)) / 2;

    const horizontalShift =
        gridSquareHorizontalCenter - baseDominoLayoutHorizontalCenter;
    const verticalShift =
        gridSquareVerticalCenter - baseDominoLayoutVerticalCenter;

    const shiftDomino = ShiftBoardDominoFunction(
        horizontalShift,
        verticalShift
    );
    return ShiftRenderedBoard(board, shiftDomino);
};

export const FlattenRenderedBoard = (board: RenderedBoard): BoardDomino[] => {
    if (board.initialRow !== null) {
        return board.initialRow;
    }
    return _.flatten([
        board.spinner,
        board.northArm,
        board.eastArm,
        board.southArm,
        board.westArm
    ]);
};

const boundingBoxesAreClose = (
    box1: BoundingBox,
    box2: BoundingBox,
    distance: number
): boolean => {
    if (box1.north >= box2.south && box1.north - distance <= box2.south) {
        return true;
    }
    if (box1.south <= box2.north && box1.south + distance >= box2.north) {
        return true;
    }
    if (box1.west >= box2.east && box1.west - distance <= box2.east) {
        return true;
    }
    if (box1.east <= box2.west && box1.east + distance >= box2.west) {
        return true;
    }
    return false;
};

const boundingBoxFitsInGrid = (
    boundingBox: BoundingBox,
    gridWidth: number,
    gridHeight: number
): boolean => {
    return (
        boundingBox.north >= 0 &&
        boundingBox.west >= 0 &&
        boundingBox.east <= gridWidth &&
        boundingBox.south <= gridHeight
    );
};

export const MaintainDominoesCloseToSpinnerWithinGrid = (
    board: RenderedBoard,
    gridWidthInSquares: number,
    gridHeightInSquares: number,
    distanceFromSpinner: number = 6
): RenderedBoard => {
    if (board.spinner) {
        // Check if the spinner and adjacent (within specified distance) dominoes
        // are within the non-bending area

        const closeBoundingBoxes = FlattenRenderedBoard(board)
            .filter((boardDomino) =>
                boundingBoxesAreClose(
                    board.spinner.boundingBox,
                    boardDomino.boundingBox,
                    distanceFromSpinner
                )
            )
            .map((boardDomino) => boardDomino.boundingBox);

        const closeDominoesFitWithoutBending = _.every(
            closeBoundingBoxes.map((box) =>
                boundingBoxFitsInGrid(
                    box,
                    gridWidthInSquares,
                    gridHeightInSquares
                )
            )
        );

        if (!closeDominoesFitWithoutBending) {
            // translate bounding boxes the minimum necessary to give the spinner
            // and adjacent dominoes enough margin
            const closeBoundingBoxNorthLimit = Math.min(
                ...closeBoundingBoxes.map((box) => box.north)
            );
            const closeBoundingBoxEastLimit = Math.max(
                ...closeBoundingBoxes.map((box) => box.east)
            );
            const closeBoundingBoxSouthLimit = Math.max(
                ...closeBoundingBoxes.map((box) => box.south)
            );
            const closeBoundingBoxWestLimit = Math.min(
                ...closeBoundingBoxes.map((box) => box.west)
            );

            // At most two of the following four conditions (one N/S, one E/W) can hold
            // since with a closeness distance of 6, the max space that can be occupied
            // by "close" dominoes is 22x24, while the minimum grid dimension is 24
            const verticalShift =
                closeBoundingBoxNorthLimit < 0
                    ? -1 * closeBoundingBoxNorthLimit
                    : closeBoundingBoxSouthLimit > gridHeightInSquares
                    ? gridHeightInSquares - closeBoundingBoxSouthLimit
                    : 0;

            const horizontalShift =
                closeBoundingBoxWestLimit < 0
                    ? -1 * closeBoundingBoxWestLimit
                    : closeBoundingBoxEastLimit > gridWidthInSquares
                    ? gridWidthInSquares - closeBoundingBoxEastLimit
                    : 0;

            return ShiftRenderedBoard(
                board,
                ShiftBoardDominoFunction(horizontalShift, verticalShift)
            );
        }
    }
    return board;
};

const getLastDominoInArmWithinGrid = (
    arm: BoardDomino[],
    gridWidth: number,
    gridHeight: number
): BoardDomino | null => {
    if (arm.length === 0) {
        return null;
    }

    const firstOutsideIndex = arm.findIndex(
        (boardDomino) =>
            !boundingBoxFitsInGrid(
                boardDomino.boundingBox,
                gridWidth,
                gridHeight
            )
    );
    if (firstOutsideIndex < 1) {
        return null;
    }

    return arm[firstOutsideIndex - 1];
};

const bendBoundingBoxAroundPoint = (
    box: BoundingBox,
    x: number,
    y: number,
    direction: Direction,
    aroundDouble: boolean
): BoundingBox => {
    // When bending a non-double around a double, cannot just reflect around the same point, needs some shifting
    const parallelAxisAdjustmentForDoubles = aroundDouble ? -1 : 0;
    const perpendicularAxisAdjustmentForDoubles = aroundDouble ? 2 : 0;

    if (direction === Direction.NORTH) {
        return {
            north: y - (box.east - x) - parallelAxisAdjustmentForDoubles,
            east: x - (box.north - y) + perpendicularAxisAdjustmentForDoubles,
            south: y - (box.west - x) - parallelAxisAdjustmentForDoubles,
            west: x - (box.south - y) + perpendicularAxisAdjustmentForDoubles
        };
    } else if (direction === Direction.SOUTH) {
        return {
            north: y - (box.east - x) + parallelAxisAdjustmentForDoubles,
            east: x - (box.north - y) - perpendicularAxisAdjustmentForDoubles,
            south: y - (box.west - x) + parallelAxisAdjustmentForDoubles,
            west: x - (box.south - y) - perpendicularAxisAdjustmentForDoubles
        };
        // Need to ensure we do this only if the spinner has been encountered here
    } else if (direction === Direction.EAST) {
        return {
            north: y + (box.west - x) + perpendicularAxisAdjustmentForDoubles,
            east: x + (box.south - y) + parallelAxisAdjustmentForDoubles,
            south: y + (box.east - x) + perpendicularAxisAdjustmentForDoubles,
            west: x + (box.north - y) + parallelAxisAdjustmentForDoubles
        };
    } else if (direction === Direction.WEST) {
        return {
            north: y + (box.west - x) - perpendicularAxisAdjustmentForDoubles,
            east: x + (box.south - y) - parallelAxisAdjustmentForDoubles,
            south: y + (box.east - x) - perpendicularAxisAdjustmentForDoubles,
            west: x + (box.north - y) - parallelAxisAdjustmentForDoubles
        };
    }
};

const getCoordinatesToBendAround = (
    boundingBox: BoundingBox,
    direction: Direction
): { x: number; y: number } => {
    return direction === Direction.NORTH
        ? { x: boundingBox.west, y: boundingBox.north + 2 }
        : direction === Direction.EAST
        ? { x: boundingBox.east - 2, y: boundingBox.north }
        : direction === Direction.SOUTH
        ? { x: boundingBox.east, y: boundingBox.south - 2 }
        : { x: boundingBox.west + 2, y: boundingBox.south };
};

const bendDominoAroundDomino = (
    dominoToBend: BoardDomino,
    dominoToBendAround: BoardDomino,
    direction: Direction
): BoardDomino => {
    const coordinatesToBendAround = getCoordinatesToBendAround(
        dominoToBendAround.boundingBox,
        direction
    );
    return {
        ...dominoToBend,
        direction: rotateDirectionCounterClockwise(direction),
        boundingBox: bendBoundingBoxAroundPoint(
            dominoToBend.boundingBox,
            coordinatesToBendAround.x,
            coordinatesToBendAround.y,
            direction,
            IsDouble(dominoToBend.domino)
        )
    };
};

const bendArmAroundDomino = (
    arm: BoardDomino[],
    dominoToBendAround: BoardDomino,
    direction: Direction,
    gridWidthInSquares: number,
    gridHeightInSquares: number
): BoardDomino[] => {
    return arm.map((boardDomino) =>
        boundingBoxFitsInGrid(
            boardDomino.boundingBox,
            gridWidthInSquares,
            gridHeightInSquares
        )
            ? boardDomino
            : bendDominoAroundDomino(boardDomino, dominoToBendAround, direction)
    );
};

export const BendDominoesOutsideOfGrid = (
    board: RenderedBoard,
    gridWidthInSquares: number,
    gridHeightInSquares: number
): RenderedBoard => {
    if (board.initialRow !== null) {
        const furthestWestInsideGrid = board.initialRow.find((boardDomino) =>
            boundingBoxFitsInGrid(
                boardDomino.boundingBox,
                gridWidthInSquares,
                gridHeightInSquares
            )
        );
        const furthestEastInsideGrid = board.initialRow
            .map((_d, i) => board.initialRow[board.initialRow.length - i - 1])
            .find((boardDomino) =>
                boundingBoxFitsInGrid(
                    boardDomino.boundingBox,
                    gridWidthInSquares,
                    gridHeightInSquares
                )
            );

        return {
            ...board,
            initialRow: board.initialRow.map((boardDomino) => {
                if (boardDomino.boundingBox.west < 0) {
                    return bendDominoAroundDomino(
                        boardDomino,
                        furthestWestInsideGrid,
                        Direction.WEST
                    );
                } else if (boardDomino.boundingBox.east > gridWidthInSquares) {
                    return bendDominoAroundDomino(
                        boardDomino,
                        furthestEastInsideGrid,
                        Direction.EAST
                    );
                } else {
                    return boardDomino;
                }
            })
        };
    } else {
        const furthestNorthInsideGrid = getLastDominoInArmWithinGrid(
            board.northArm,
            gridWidthInSquares,
            gridHeightInSquares
        );
        const furthestEastInsideGrid = getLastDominoInArmWithinGrid(
            board.eastArm,
            gridWidthInSquares,
            gridHeightInSquares
        );
        const furthestSouthInsideGrid = getLastDominoInArmWithinGrid(
            board.southArm,
            gridWidthInSquares,
            gridHeightInSquares
        );
        const furthestWestInsideGrid = getLastDominoInArmWithinGrid(
            board.westArm,
            gridWidthInSquares,
            gridHeightInSquares
        );

        return {
            ...board,
            northArm: bendArmAroundDomino(
                board.northArm,
                furthestNorthInsideGrid,
                Direction.NORTH,
                gridWidthInSquares,
                gridHeightInSquares
            ),
            eastArm: bendArmAroundDomino(
                board.eastArm,
                furthestEastInsideGrid,
                Direction.EAST,
                gridWidthInSquares,
                gridHeightInSquares
            ),
            southArm: bendArmAroundDomino(
                board.southArm,
                furthestSouthInsideGrid,
                Direction.SOUTH,
                gridWidthInSquares,
                gridHeightInSquares
            ),
            westArm: bendArmAroundDomino(
                board.westArm,
                furthestWestInsideGrid,
                Direction.WEST,
                gridWidthInSquares,
                gridHeightInSquares
            )
        };
    }
};

export const CanPlayVertically = (board: Board | RenderedBoard) => {
    return (
        !!board.spinner && board.eastArm.length > 0 && board.westArm.length > 0
    );
};
