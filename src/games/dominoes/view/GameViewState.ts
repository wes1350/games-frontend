import { QueryType } from "@games-common/games/dominoes/enums/QueryType";

export interface GameViewState {
    started: boolean;
    winner: string | null;
    gameOver: boolean;
    logs: string[];
    events: GameEvent[];
    currentQueryType: QueryType;
}
