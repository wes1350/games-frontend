import _ from "lodash";
import { action, makeAutoObservable, runInAction } from "mobx";
import { GameEventType } from "../../../../games-common/src/games/dominoes/enums/GameEventType";
import { GameMessageType } from "../../../../games-common/src/games/dominoes/enums/GameMessageType";
import { QueryType } from "../../../../games-common/src/games/dominoes/enums/QueryType";
import { BlockedMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/BlockedMessagePayload";
import { GameLogMessage } from "../../../../games-common/src/games/dominoes/interfaces/GameLogMessage";
import { GameOverPayload } from "../../../../games-common/src/games/dominoes/interfaces/GameOverPayload";
import { MaskedGameState } from "../../../../games-common/src/games/dominoes/interfaces/GameState";
import { HandMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/HandMessagePayload";
import { NewRoundMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/NewRoundMessagePayload";
import { PullMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/PullMessagePayload";
import { ScoreMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/ScoreMessagePayload";
import { TurnMessagePayload } from "../../../../games-common/src/games/dominoes/interfaces/TurnMessagePayload";
import { GameEvent } from "./game/interfaces/GameEvent";

export class GameViewState {
    private gameState: MaskedGameState;
    private gameOver: boolean;
    private winnerId: string | null;
    private logs: string[];
    private events: GameEvent[];
    private currentQueryType: QueryType | null;
    private socket: any;

    constructor(gameState: MaskedGameState, socket: any) {
        this.gameState = gameState;
        this.gameOver = false;
        this.winnerId = null;
        this.logs = [];
        this.events = [];
        this.currentQueryType = null;
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
        return this.winnerId;
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
        this.socket.on(GameMessageType.PULL, this.onPull);
        this.socket.on(GameMessageType.NEW_ROUND, this.onNewRound);
        this.socket.on(GameMessageType.GAME_OVER, this.onGameOver);
        this.socket.on(GameMessageType.GAME_BLOCKED, this.onGameBlocked);
        this.socket.on(QueryType.MOVE, this.onMoveQuery);
    };

    public AddLog = (log: string) => {
        this.logs.push(log);
    };

    public AddEvent = (event: GameEvent) => {
        this.events.push(event);
        setTimeout(
            action(() => {
                this.events = this.events.filter((e) => e.id !== event.id);
            }),
            event.duration
        );
    };

    public ClearEvent = () => {
        this.logs.shift();
    };

    public SetQueryType = (type: QueryType) => {
        this.currentQueryType = type;
    };

    public UpdateGameState = (gameState: MaskedGameState) => {
        this.gameState = gameState;
    };

    private onGameLog = (logDetails: GameLogMessage) => {
        console.log(logDetails);
        this.AddLog(logDetails.message);
    };

    private onTurn = (payload: TurnMessagePayload) => {
        this.UpdateGameState(payload.gameState);

        if (!payload.domino) {
            this.AddEvent({
                id: _.random(0, 1000000), // TODO: DO something better here
                type: GameEventType.PASS,
                duration: 1000,
                index: payload.index
            });
        }
    };

    private onScore = (payload: ScoreMessagePayload) => {
        this.UpdateGameState(payload.gameState);
        this.AddEvent({
            id: _.random(0, 1000000), // TODO: DO something better here
            type: GameEventType.SCORE,
            duration: 1000,
            index: payload.index,
            score: payload.score
        });
    };

    private onHand = (
        payload: HandMessagePayload // { Face1: number; Face2: number }[]
    ) => {
        this.UpdateGameState(payload.gameState);
    };

    private onPull = (payload: PullMessagePayload) => {
        this.UpdateGameState(payload.gameState);
    };

    private onNewRound = (payload: NewRoundMessagePayload) => {
        this.UpdateGameState(payload.gameState);
    };

    private onMoveQuery = () => {
        this.SetQueryType(QueryType.MOVE);
    };

    private onGameBlocked = (payload: BlockedMessagePayload) => {
        this.UpdateGameState(payload.gameState);
        this.AddEvent({
            id: _.random(0, 1000000), // TODO: DO something better here
            type: GameEventType.BLOCKED,
            duration: 2000
        });
    };

    private onGameOver = (payload: GameOverPayload) => {
        this.RemoveGameplayListeners();
        runInAction(() => {
            this.winnerId = payload.winnerId;
            this.gameOver = true;
        });
    };
}
