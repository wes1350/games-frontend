import { GameEventType } from "@games-common/games/dominoes/enums/GameEventType";

export interface GameEvent {
    id: number;
    type: GameEventType;
    duration: number;
    index?: number;
    score?: number;
}
