import { makeAutoObservable } from "mobx";
import { Domino } from "../../../../games-common/src/games/dominoes/Domino";
import { Direction } from "../../../../games-common/src/games/dominoes/enums/Direction";
import { GameMessageType } from "../../../../games-common/src/games/dominoes/enums/GameMessageType";
import { QueryType } from "../../../../games-common/src/games/dominoes/enums/QueryType";
import { BlockedMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/BlockedMessagePayload";
import { GameLogMessage } from "../../../../games-common/src/games/dominoes/interfaces/GameLogMessage";
import { MaskedGameState } from "../../../../games-common/src/games/dominoes/interfaces/GameState";
import { HandMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/HandMessagePayload";
import { NewRoundMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/NewRoundMessagePayload";
import { PullMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/PullMessagePayload";
import { ScoreMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/ScoreMessagePayload";
import { TurnMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/TurnMessagePayload";
import { GameEvent } from "./game/interfaces/GameEvent";

// const getIndexToViewPosition = (nPlayers: number, myIndex: number) => {
//     // maps opponent seat number to the display index
//     const playerIndices = new Map<number, number>();
//     playerIndices.set(myIndex, 0);
//     if (nPlayers === 2) {
//         playerIndices.set((myIndex + 1) % nPlayers, 1);
//     } else if (nPlayers === 3) {
//         playerIndices.set((myIndex + 1) % nPlayers, 2);
//         playerIndices.set((myIndex + 2) % nPlayers, 1);
//     } else if (nPlayers === 4) {
//         playerIndices.set((myIndex + 1) % nPlayers, 2);
//         playerIndices.set((myIndex + 2) % nPlayers, 1);
//         playerIndices.set((myIndex + 3) % nPlayers, 3);
//     }

//     return playerIndices;
// };

export class GameViewState {
    private gameState: MaskedGameState;
    private gameOver: boolean;
    private winner: string | null;
    private logs: string[];
    private events: GameEvent[];
    private currentQueryType: QueryType | null;
    private indexToViewPosition: Map<number, number>;
    private socket: any;

    constructor(gameState: MaskedGameState, socket: any) {
        this.gameState = gameState;
        this.gameOver = false;
        this.winner = null;
        this.logs = [];
        this.events = [];
        this.currentQueryType = null;
        // this.indexToViewPosition = getIndexToViewPosition(
        //     gameState.config.nPlayers,
        //     gameState.me.index
        // );
        this.socket = socket;
        this.AddGameplayListeners();
        makeAutoObservable(this);
    }

    public get GameState() {
        return this.gameState;
    }

    public get GameOver() {
        return this.gameOver;
    }

    public get Winner() {
        return this.winner;
    }

    public get Logs() {
        return this.logs;
    }

    public get Events() {
        return this.events;
    }

    public get CurrentQueryType() {
        return this.currentQueryType;
    }

    public get IndexToViewPosition() {
        // return this.indexToViewPosition;
        // maps opponent seat number to the display index
        const playerIndices = new Map<number, number>();
        if (!this.gameState) {
            return null;
        }

        const myIndex = this.gameState.me.index;
        const nPlayers = this.gameState.config.nPlayers;

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
    }

    public RemoveGameplayListeners = () => {
        this.socket.off(GameMessageType.GAME_LOG, this.onGameLog);
        this.socket.off(GameMessageType.TURN, this.onTurn);
        this.socket.off(GameMessageType.SCORE, this.onScore);
        this.socket.off(GameMessageType.HAND, this.onHand);
        // socket.off(GameMessageType.POSSIBLE_PLAYS, playableDominoesListener);
        //   socket.off(GameMessageType.DOMINO_PLAYED, dominoPlayedListener);
        //   socket.off(GameMessageType.CLEAR_BOARD, clearBoardListener);
        this.socket.off(GameMessageType.PULL, this.onPull);
        this.socket.off(GameMessageType.NEW_ROUND, this.onNewRound);
        this.socket.off(GameMessageType.GAME_OVER, this.onGameOver);
        this.socket.off(GameMessageType.GAME_BLOCKED, this.onGameBlocked);
        this.socket.off(QueryType.MOVE, this.onMoveQuery);
    };

    public AddGameplayListeners = () => {
        this.socket.on(GameMessageType.GAME_LOG, this.onGameLog);
        this.socket.on(GameMessageType.TURN, this.onTurn);
        this.socket.on(GameMessageType.SCORE, this.onScore);
        this.socket.on(GameMessageType.HAND, this.onHand);
        // socket.on(GameMessageType.POSSIBLE_PLAYS, playableDominoesListener);
        //   socket.on(GameMessageType.DOMINO_PLAYED, dominoPlayedListener);
        //   socket.on(GameMessageType.CLEAR_BOARD, clearBoardListener);
        this.socket.on(GameMessageType.PULL, this.onPull);
        this.socket.on(GameMessageType.NEW_ROUND, this.onNewRound);
        this.socket.on(GameMessageType.GAME_OVER, this.onGameOver);
        this.socket.on(GameMessageType.GAME_BLOCKED, this.onGameBlocked);
        this.socket.on(QueryType.MOVE, this.onMoveQuery);

        // when(() => localStore.gameState === null);
    };

    public AddLog = (log: string) => {
        this.logs.push(log);
    };

    public SetQueryType = (type: QueryType) => {
        this.currentQueryType = type;
    };

    public UpdateGameState = (gameState: MaskedGameState) => {
        this.gameState = gameState;
        // if (turnDescription.domino) {
        //     this.gameState = AddDominoToBoard()
        // }

        // gameState.CurrentPlayerIndex =
        //     (gameState.CurrentPlayerIndex + 1) % gameState.Config.N_PLAYERS;
    };

    private onGameLog = (logDetails: GameLogMessage) => {
        console.log(logDetails);
        this.AddLog(logDetails.message);
    };

    private onTurn = (
        // gameState: MaskedGameState,
        payload: TurnMessagePayload
    ) => {
        this.UpdateGameState(payload.gameState);

        // if (!domino) {
        //     gameViewState.AddEvent({
        //         Id: Math.floor(Math.random() * 10000000),
        //         Type: GameEventType.PASS,
        //         Duration: 1000,
        //         Seat: turnDescription.index
        //     });
        // }
    };

    private onScore = (
        // gameState: MaskedGameState,
        payload: ScoreMessagePayload
    ) => {
        this.UpdateGameState(payload.gameState);
        // gameViewState.AddEvent({
        //     Id: Math.floor(Math.random() * 10000000),
        //     Type: GameEventType.SCORE,
        //     Duration: 1000,
        //     Seat: payload.seat,
        //     Score: payload.score
        // });

        // gameViewState.ProcessScore(payload.seat, payload.score);
    };

    private onHand = (
        // gameState: MaskedGameState,
        payload: HandMessagePayload // { Face1: number; Face2: number }[]
    ) => {
        this.UpdateGameState(payload.gameState);
        // when(
        //     () => gameState.Events.length === 0,
        //     () => {
        //         gameState.Me.SetHand(payload as IDomino[]);
        //     }
        // );
    };

    private onPull = (
        // gameState: MaskedGameState,
        payload: PullMessagePayload
    ) => {
        // const player = gameState.PlayerAtSeat(payload.seat);
        // const player = gameState.players[payload.index]
        // if (player.index !== gameState.) {
        //     player.AddDomino(Domino.create({ Face1: -1, Face2: -1 }));
        // }
        this.UpdateGameState(payload.gameState);
    };

    private onNewRound = (
        // gameState: MaskedGameState,
        // payload: NewRoundMessage
        payload: NewRoundMessagePayload
    ) => {
        this.UpdateGameState(payload.gameState);
        // when(
        //     () => gameState.Events.length === 0,
        //     () => {
        //         gameState.SetCurrentPlayerIndex(payload.currentPlayer);
        //         gameState.InitializeOpponentHands();
        //     }
        // );
    };

    private onMoveQuery = () => {
        this.SetQueryType(QueryType.MOVE);
        // gameState.SetQueryType(QueryType.MOVE);
    };

    private onGameBlocked = (payload: BlockedMessagePayload) => {
        this.UpdateGameState(payload.gameState);
        // gameState.AddEvent({
        //     Id: generateId(),
        //     Type: GameEventType.BLOCKED,
        //     Duration: 2000
        // });
    };

    private onGameOver = (gameState: MaskedGameState, winner: string) => {
        this.UpdateGameState(gameState);
        this.RemoveGameplayListeners();
        // setTimeout(() => {
        //     gameState.Finish(winner);
        // }, 1000);
    };
}
