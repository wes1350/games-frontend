import { Domino } from "../../../../../games-common/src/games/dominoes/Domino";
import { Direction } from "../../../../../games-common/src/games/dominoes/enums/Direction";
import { BoundingBox } from "./interfaces/BoundingBox";

export interface BoardDomino {
    domino: Domino;
    boundingBox: BoundingBox;
    direction: Direction;
}
