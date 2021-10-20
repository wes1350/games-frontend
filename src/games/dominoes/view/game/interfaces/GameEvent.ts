import { GameEventType } from "../../../../../../games-common/src/games/dominoes/enums/GameEventType";

export interface GameEvent {
    id: number;
    type: GameEventType;
    duration: number;
    index?: number;
    score?: number;
}
