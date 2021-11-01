import React, { useContext } from "react";
import { observer } from "mobx-react-lite";
// import { GameConfigDescription } from "interfaces/GameConfigDescription";
// import { MessageType } from "enums/MessageType";
import "./RoomLobbyView.css";
import { SocketContext } from "context/SocketContext";
import { RoomMessageType } from "../../games-common/src/enums/RoomMessageType";
import { Checkbox } from "./components/Checkbox";
import { RoomDetails } from "../../games-common/src/interfaces/RoomDetails";

interface IProps {
    roomId: string;
    roomDetails: RoomDetails;
    children: any; // type later
    onLeaveRoom: () => void;
}

export const RoomLobbyView = observer((props: IProps) => {
    //   const localStore = useLocalObservable(() => ({
    //     handSize: "7",
    //     check5Doubles: "Yes",
    //     winThreshold: "150",
    //   }));

    const socket = useContext(SocketContext)?.socket;

    //   const onSubmit = (e: any) => {
    //     e.preventDefault();
    //     const config = {
    //       HandSize: parseInt(localStore.handSize),
    //       WinThreshold: parseInt(localStore.winThreshold),
    //       Check_5_Doubles: localStore.check5Doubles === "Yes",
    //     } as GameConfigDescription;
    //     console.log(config);
    //     socket.emit(MessageType.GAME_START, props.roomId, config);
    //   };

    //   const onChangeHandSize = action((e: any) => {
    //     localStore.handSize = e.currentTarget.value;
    //   });

    //   const onChangeWinThreshold = action((e: any) => {
    //     localStore.winThreshold = e.target.value;
    //   });

    //   const onChange5DoublesSetting = action((e: any) => {
    //     localStore.check5Doubles = e.currentTarget.checked;
    //   });

    const onToggleVisibility = (value: boolean) => {
        socket.emit(RoomMessageType.CHANGE_VISIBILITY, props.roomId, value);
    };

    const onToggleReadyStatus = (value: boolean) => {
        socket.emit(RoomMessageType.SET_READY_STATUS, props.roomId, value);
    };

    if (!socket) {
        return null;
    }

    // From https://stackoverflow.com/a/52033479
    const copyRoomURL = () => {
        navigator.clipboard.writeText(window.location.href);
    };

    const kickPlayer = (id: string) => {
        socket.emit(RoomMessageType.KICK_PLAYER, props.roomId, id);
    };

    const isOwner = props.roomDetails.owner === socket.id;

    return (
        <div className="room-lobby">
            <div className="leave-room-button-container">
                <button onClick={props.onLeaveRoom}>Leave Room</button>
            </div>
            {isOwner && (
                <div className="visibility-setting">
                    <Checkbox
                        label="public"
                        checked={!props.roomDetails.private}
                        onCheck={() =>
                            onToggleVisibility(!props.roomDetails.private)
                        }
                    />
                </div>
            )}
            <div className="ready-setting">
                <Checkbox
                    label="ready"
                    checked={
                        props.roomDetails.players.find(
                            (player) => player.id === socket.id
                        ).ready
                    }
                    onCheck={() =>
                        onToggleReadyStatus(
                            !props.roomDetails.players.find(
                                (player) => player.id === socket.id
                            ).ready
                        )
                    }
                />
            </div>
            <div className="share-link">
                <input readOnly={true} value={window.location.href} />
                <button onClick={copyRoomURL}>Copy URL</button>
            </div>
            <div className="players-in-lobby-container">
                <div className="players-in-lobby-container-label">
                    Players in room:
                </div>
                <>
                    {props.roomDetails?.players.map((playerDetails, i) => (
                        <div key={i} className="players-in-lobby-item">
                            <span>{playerDetails.name}</span>
                            {isOwner && socket.id !== playerDetails.id && (
                                <button
                                    onClick={() => kickPlayer(playerDetails.id)}
                                >
                                    Kick player
                                </button>
                            )}
                        </div>
                    ))}
                </>
            </div>
            <div className="game-configuration">{props.children}</div>
            {/* <div className={"game-start-form"}>
        <form onSubmit={onSubmit}>
          <div className={"game-config-dropdown-container"}>
            <label>
              Hand size:
              <select value={localStore.handSize} onChange={onChangeHandSize}>
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
      </div> */}
        </div>
    );
});
