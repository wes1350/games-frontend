import { Direction } from "../../../games-common/src/games/dominoes/enums/Direction";

export const rotateDirectionClockwise = (direction: Direction) => {
    return direction === Direction.NORTH
        ? Direction.EAST
        : direction === Direction.EAST
        ? Direction.SOUTH
        : direction === Direction.SOUTH
        ? Direction.WEST
        : Direction.NORTH;
};
