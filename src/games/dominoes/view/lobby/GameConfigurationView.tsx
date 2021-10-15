import React, { useContext } from "react";
import "./RoomLobbyView.css";
import { observer, useLocalObservable } from "mobx-react-lite";
import { SocketContext } from "context/SocketContext";
import { action } from "mobx";
import { GameMessageType } from "@games-common/games/dominoes/enums/GameMessageType";
import { GameType } from "@games-common/enums/GameType";
import { Config } from "@games-common/games/dominoes/Config";

interface IProps {
    roomId: string;
}

export const GameConfigurationView = observer((props: IProps) => {
    const socket = useContext(SocketContext)?.socket;

    const localStore = useLocalObservable(() => ({
        handSize: "7",
        check5Doubles: "Yes",
        winThreshold: "150"
    }));

    const onSubmit = (e: any) => {
        e.preventDefault();
        const config = {
            gameType: GameType.DOMINOES,
            handSize: parseInt(localStore.handSize),
            winThreshold: parseInt(localStore.winThreshold),
            check5Doubles: localStore.check5Doubles === "Yes"
        } as Config;
        console.log(config);
        socket.emit(GameMessageType.GAME_START, props.roomId, config);
    };

    const onChangeHandSize = action((e: any) => {
        localStore.handSize = e.currentTarget.value;
    });

    const onChangeWinThreshold = action((e: any) => {
        localStore.winThreshold = e.target.value;
    });

    const onChange5DoublesSetting = action((e: any) => {
        localStore.check5Doubles = e.currentTarget.checked;
    });

    return (
        <div className={"game-start-form"}>
            <form onSubmit={onSubmit}>
                <div className={"game-config-dropdown-container"}>
                    <label>
                        Hand size:
                        <select
                            value={localStore.handSize}
                            onChange={onChangeHandSize}
                        >
                            <option value="5">5</option>
                            <option value="7">7</option>
                            <option value="9">9</option>
                        </select>
                    </label>
                </div>
                <div className={"game-config-dropdown-container"}>
                    <label>
                        Win threshold:
                        <select
                            value={localStore.winThreshold}
                            onChange={onChangeWinThreshold}
                        >
                            <option value="5">5</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="150">150</option>
                            <option value="200">200</option>
                            <option value="250">250</option>
                        </select>
                    </label>
                </div>
                <div className={"game-config-dropdown-container"}>
                    <label>
                        Disallow 5 doubles:
                        <select
                            value={localStore.check5Doubles}
                            onChange={onChange5DoublesSetting}
                        >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </label>
                </div>
                <div className={"game-config-submit-button"}>
                    <button type="submit">Start Game</button>
                </div>
            </form>
        </div>
    );
});
