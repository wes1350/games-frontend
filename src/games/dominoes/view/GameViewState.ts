import { QueryType } from "@games-common/games/dominoes/enums/QueryType";
import { MaskedGameState } from "@games-common/games/dominoes/interfaces/GameState";
import { GameEvent } from "./game/interfaces/GameEvent";

export interface GameViewState {
    gameState: MaskedGameState;
    started: boolean;
    winner: string | null;
    gameOver: boolean;
    logs: string[];
    events: GameEvent[];
    currentQueryType: QueryType | null;
    indexToViewPosition: Map<number, number>;
}

export const InitializeGameViewState = (
    gameState: MaskedGameState
): GameViewState => ({
    gameState: gameState,
    started: false,
    winner: null,
    gameOver: false,
    logs: [],
    events: [],
    currentQueryType: null,
    indexToViewPosition: getIndexToViewPosition(
        gameState.config.nPlayers,
        gameState.myIndex
    )
});

// TODO: memoize this or store it somewhere,
const getIndexToViewPosition = (nPlayers: number, myIndex: number) => {
    // maps opponent seat number to the display index
    const playerIndices = new Map<number, number>();
    playerIndices.set(myIndex, 0);
    if (nPlayers === 2) {
        playerIndices.set((myIndex + 1) % nPlayers, 1);
    } else if (nPlayers === 3) {
        playerIndices.set((myIndex + 1) % nPlayers, 2);
        playerIndices.set((myIndex + 2) % nPlayers, 1);
    } else if (nPlayers === 4) {
        playerIndices.set((myIndex + 1) % nPlayers, 2);
        playerIndices.set((myIndex + 2) % nPlayers, 1);
        playerIndices.set((myIndex + 3) % nPlayers, 3);
    }

    return playerIndices;
};
