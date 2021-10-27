import { action, runInAction } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
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
import { UserDataContext } from "context/UserDataContext";
import { SocketContext } from "context/SocketContext";
import { GameConfigurationView } from "games/dominoes/view/lobby/GameConfigurationView";
import { GameViewWrapper } from "./GameViewWrapper";
import { GameViewState as DominoesGameViewState } from "games/dominoes/view/GameViewState";
import { RoomMessageType } from "../../games-common/src/enums/RoomMessageType";
import { GameMessageType } from "../../games-common/src/games/dominoes/enums/GameMessageType";
import { GameType } from "../../games-common/src/enums/GameType";
import { GameStartMessagePayload } from "../../games-common/src/games/dominoes/interfaces/GameStartMessagePayload";
import { RoomDetails } from "../../games-common/src/interfaces/RoomDetails";

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
        gameViewState: null,
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
        setUpSocketForLobby();
        joinRoom();
    };

    const roomDetailsListener = action((roomDetails: RoomDetails) => {
        localStore.roomDetails = roomDetails;
    });

    const setUpSocketForLobby = () => {
        socket.on(RoomMessageType.ROOM_DETAILS, roomDetailsListener);

        // Might need to add some sort of socket.offAll() in case of reconnects
        socket.once(
            GameMessageType.GAME_START,
            (payload: GameStartMessagePayload) => {
                // console.log(
                //     `starting game of type ${gameType}, details: ${JSON.stringify(
                //         gameDetails
                //     )}`
                // );
                socket.off(RoomMessageType.ROOM_DETAILS, roomDetailsListener);

                runInAction(() => {
                    localStore.gameType = payload.gameType;

                    if (localStore.gameType === GameType.DOMINOES) {
                        localStore.gameViewState = new DominoesGameViewState(
                            null,
                            socket
                        );
                    } else {
                        throw new Error(
                            `Invalid game type: ${localStore.gameType}`
                        );
                    }
                });
                history.push(`/room/${roomId}/game`);
            }
        );
    };

    const onReenterLobby = action(() => {
        localStore.gameType = null;
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

    if (!localStore.roomDetails) {
        // TODO: style this
        return <div>loading room...</div>;
    } else {
        console.log(localStore.roomDetails);
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
                {localStore.gameViewState && (
                    <Route path={gameURL}>
                        <GameViewWrapper
                            gameType={localStore.gameType}
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
