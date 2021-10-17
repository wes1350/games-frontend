// import { MessageType } from "enums/MessageType";
// import { QueryType } from "enums/QueryType";
// import { GameStartMessage } from "interfaces/Messages";
import { action, runInAction, when } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
// import { Board } from "model/BoardModel";
// import { GameConfig } from "model/GameConfigModel";
// import { GameState } from "model/GameStateModel";
// import { Player } from "model/PlayerModel";
import React, { useContext } from "react";
import {
    Redirect,
    Route,
    Switch,
    useHistory,
    useParams,
    useRouteMatch
} from "react-router-dom";
import { RoomLobbyView } from "./RoomLobbyView";
// import { GameView } from "./GameView";
import _ from "lodash";
import { UserDataContext } from "context/UserDataContext";
import { SocketContext } from "context/SocketContext";
import { GameConfigurationView } from "games/dominoes/view/lobby/GameConfigurationView";
import { RoomMessageType } from "@games-common/enums/RoomMessageType";
import { GameMessageType } from "@games-common/games/dominoes/enums/GameMessageType";
import { GameStartMessage } from "@games-common/games/dominoes/interfaces/GameStartMessage";
import { GameType } from "@games-common/enums/GameType";
import { GameViewWrapper } from "./GameViewWrapper";
import { GameViewState } from "games/dominoes/view/GameViewState";
import { MaskedGameState } from "@games-common/games/dominoes/interfaces/GameState";

interface IProps {}

type RoomParams = {
    roomId: string;
};

export const RoomView = observer((props: IProps) => {
    const playerDataContext = useContext(UserDataContext);
    const playerName = playerDataContext.name;

    const socketContext = useContext(SocketContext);
    const socket = socketContext?.socket;

    const { roomId } = useParams<RoomParams>();

    const localStore = useLocalObservable(() => ({
        gameType: null,
        // gameState: null, // no need to store gamestate here, refactor
        gameViewState: null,
        // gameActive: false,
        roomDetails: null
    }));

    const match = useRouteMatch();
    const history = useHistory();

    React.useEffect(() => {
        if (socket && playerName) {
            initializeLobby();
        }
    }, [socketContext, playerDataContext]);

    const joinRoom = () => {
        socket.emit(RoomMessageType.JOIN_ROOM, roomId);
    };

    const initializeLobby = () => {
        joinRoom();
        setUpSocketForLobby();
    };

    const roomDetailsListener = action((roomDetails: { name: string }[]) => {
        localStore.roomDetails = roomDetails;
    });

    const setUpSocketForLobby = () => {
        socket.on(RoomMessageType.ROOM_DETAILS, roomDetailsListener);

        // Might need to add some sort of socket.offAll() in case of reconnects
        socket.once(
            GameMessageType.GAME_START,
            // (gameType: GameType, gameDetails: GameStartMessage) => {
            (gameType: GameType, gameState: MaskedGameState) => {
                // console.log(
                //     `starting game of type ${gameType}, details: ${JSON.stringify(
                //         gameDetails
                //     )}`
                // );
                runInAction(() => {
                    localStore.gameType = gameType;

                    localStore.gameViewState = new GameViewState(
                        // props.gameState
                        gameState,
                        socket
                    );
                    // localStore.gameActive = true;
                    // localStore.gameState = initializeGameState(
                    //     gameType,
                    //     gameDetails
                    // );
                });
                // addGameplayListeners();
                history.push(`/room/${roomId}/game`);

                socket.off(RoomMessageType.ROOM_DETAILS, roomDetailsListener);
            }
        );
    };

    // const initializeGameState = (
    //     gameType: GameType,
    //     gameDetails: GameStartMessage
    // ) => {
    //     if (gameType === GameType.DOMINOES) {
    //         // const initializationResult = initializeDominoesGameState(
    //         //     socket,
    //         //     gameDetails
    //         // );
    //         const initializationResult =

    //         // when(
    //         //     () => localStore.gameState === null,
    //         //     () => initializationResult.removeGameplayListeners(socket)
    //         // );
    //     }
    // };

    // const initializeGameState = (gameDetails: GameStartMessage) => {
    //     const gameConfig = GameConfig.create({
    //         HAND_SIZE: gameDetails.config.n_dominoes,
    //         N_PLAYERS: gameDetails.players.length
    //     });
    //     const newGameState = GameState.create({
    //         Config: gameConfig,
    //         Board: Board.create({})
    //     });

    //     gameDetails.players.forEach((player) => {
    //         newGameState.AddPlayer(
    //             Player.create({
    //                 Name: player.name,
    //                 SeatNumber: player.seatNumber,
    //                 IsMe: player.isMe
    //             })
    //         );
    //     });

    //     newGameState.Start();
    //     return newGameState;
    // };

    const onReenterLobby = action(() => {
        // localStore.gameState = null;
        // localStore.gameActive = false;
        localStore.gameViewState = null;
        localStore.roomDetails = null;
        initializeLobby();
    });

    const respondToQuery = (type: any, value: any) => {
        socket.emit(type, value);
    };

    if (!socket) {
        return null;
    }

    const lobbyURL = `${match.url}/lobby`;
    const gameURL = `${match.url}/game`;

    return (
        <div className="room-view">
            <Switch>
                <Route path={lobbyURL}>
                    <RoomLobbyView
                        roomId={roomId}
                        roomDetails={localStore.roomDetails}
                    >
                        <GameConfigurationView roomId={roomId} />
                    </RoomLobbyView>
                </Route>
                {/* {localStore.gameState && ( */}
                {/* {localStore.gameActive && ( */}
                {localStore.gameViewState && (
                    <Route path={gameURL}>
                        <GameViewWrapper
                            gameType={localStore.gameType}
                            // gameState={localStore.gameState}
                            gameViewState={localStore.gameViewState}
                            respond={respondToQuery}
                            onEnterLobby={onReenterLobby}
                        ></GameViewWrapper>
                    </Route>
                )}
                <Redirect from="*" to={lobbyURL} />
            </Switch>
        </div>
    );
});
