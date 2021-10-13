import { GameEventType } from "@games-common/games/dominoes/enums/GameEventType";
import { GameMessageType } from "@games-common/games/dominoes/enums/GameMessageType";
import { QueryType } from "@games-common/games/dominoes/enums/QueryType";
import { GameLogMessage } from "@games-common/games/dominoes/interfaces/GameLogMessage";
import { GameStartMessage } from "@games-common/games/dominoes/interfaces/GameStartMessage";
import { GameState } from "@games-common/games/dominoes/interfaces/GameState";
import _ from "lodash";
import { when } from "mobx";
import { generateId } from "utils/utils";

const gameLogListener = (gameState: GameState, logDetails: GameLogMessage) => {
    console.log(logDetails);
    gameState.AddLog(logDetails.message);
};

const turnListener = (
    gameState: GameState,
    turnDescription: {
        seat: number;
        domino: SnapshotIn<IDomino>;
        direction: Direction;
        coordinate: Coordinate;
    }
) => {
    const domino = turnDescription.domino
        ? Domino.create(turnDescription.domino)
        : null;

    gameState.ProcessTurn(
        domino,
        turnDescription.direction,
        turnDescription.coordinate
    );
    gameState.Me.SetPlayableDominoes(null);

    if (!domino) {
        gameState.AddEvent({
            Id: Math.floor(Math.random() * 10000000),
            Type: GameEventType.PASS,
            Duration: 1000,
            Seat: turnDescription.seat
        });
    }
};

const scoreListener = (
    gameState: GameState,
    payload: { seat: number; score: number }
) => {
    gameState.AddEvent({
        Id: Math.floor(Math.random() * 10000000),
        Type: GameEventType.SCORE,
        Duration: 1000,
        Seat: payload.seat,
        Score: payload.score
    });

    gameState.ProcessScore(payload.seat, payload.score);
};

const handListener = (
    gameState: GameState,
    payload: { Face1: number; Face2: number }[]
) => {
    when(
        () => gameState.Events.length === 0,
        () => {
            gameState.Me.SetHand(payload as IDomino[]);
        }
    );
};

const playableDominoesListener = (
    gameState: GameState,
    payload: PossiblePlaysMessage
) => {
    gameState.Me.SetPlayableDominoes(
        _.uniq(payload.plays.map((play) => play.domino))
    );
};

// const dominoPlayedListener = (payload: { seat: number }) => {
//   const player = localStore.gameState.PlayerAtSeat(payload.seat);
//   if (!player.IsMe) {
//     player.RemoveDomino();
//   }
// };

// const clearBoardListener = () => {
//   when(
//     () => localStore.gameState.Events.length === 0,
//     () => {
//       localStore.gameState.ClearBoard();
//     }
//   );
// };

const pullListener = (gameState: GameState, payload: { seat: number }) => {
    const player = gameState.PlayerAtSeat(payload.seat);
    if (!player.IsMe) {
        player.AddDomino(Domino.create({ Face1: -1, Face2: -1 }));
    }
};

const newRoundListener = (gameState: GameState, payload: NewRoundMessage) => {
    when(
        () => gameState.Events.length === 0,
        () => {
            gameState.SetCurrentPlayerIndex(payload.currentPlayer);
            gameState.InitializeOpponentHands();
        }
    );
};

const moveListener = (gameState: GameState, message: string) => {
    gameState.SetQueryType(QueryType.MOVE);
};

const gameBlockedListener = (gameState: GameState) => {
    gameState.AddEvent({
        Id: generateId(),
        Type: GameEventType.BLOCKED,
        Duration: 2000
    });
};

const gameOverListener = (gameState: GameState, winner: string) => {
    setTimeout(() => {
        gameState.Finish(winner);
    }, 1000);
};

const removeGameplayListeners = (socket: any) => {
    socket.off(GameMessageType.GAME_LOG, gameLogListener);
    socket.off(GameMessageType.TURN, turnListener);
    socket.off(GameMessageType.SCORE, scoreListener);
    socket.off(GameMessageType.HAND, handListener);
    socket.off(GameMessageType.POSSIBLE_PLAYS, playableDominoesListener);
    //   socket.off(GameMessageType.DOMINO_PLAYED, dominoPlayedListener);
    //   socket.off(GameMessageType.CLEAR_BOARD, clearBoardListener);
    socket.off(GameMessageType.PULL, pullListener);
    socket.off(GameMessageType.NEW_ROUND, newRoundListener);
    socket.off(GameMessageType.GAME_OVER, gameOverListener);
    socket.off(GameMessageType.GAME_BLOCKED, gameBlockedListener);
    socket.off(QueryType.MOVE, moveListener);
};

const addGameplayListeners = (socket: any) => {
    socket.on(GameMessageType.GAME_LOG, gameLogListener);
    socket.on(GameMessageType.TURN, turnListener);
    socket.on(GameMessageType.SCORE, scoreListener);
    socket.on(GameMessageType.HAND, handListener);
    socket.on(GameMessageType.POSSIBLE_PLAYS, playableDominoesListener);
    //   socket.on(GameMessageType.DOMINO_PLAYED, dominoPlayedListener);
    //   socket.on(GameMessageType.CLEAR_BOARD, clearBoardListener);
    socket.on(GameMessageType.PULL, pullListener);
    socket.on(GameMessageType.NEW_ROUND, newRoundListener);
    socket.on(GameMessageType.GAME_OVER, gameOverListener);
    socket.on(GameMessageType.GAME_BLOCKED, gameBlockedListener);
    socket.on(QueryType.MOVE, moveListener);

    // when(() => localStore.gameState === null);
};

export const initializeDominoesGameState = (
    socket: any,
    gameDetails: GameStartMessage
) => {
    const gameConfig = GameConfig.create({
        HAND_SIZE: gameDetails.config.n_dominoes,
        N_PLAYERS: gameDetails.players.length
    });
    const gameState = GameState.create({
        Config: gameConfig,
        Board: Board.create({})
    });

    gameDetails.players.forEach((player) => {
        gameState.AddPlayer(
            Player.create({
                Name: player.name,
                SeatNumber: player.seatNumber,
                IsMe: player.isMe
            })
        );
    });

    gameState.Start();

    addGameplayListeners(socket);
    return {
        gameState,
        removeGameplayListeners
    };
};
