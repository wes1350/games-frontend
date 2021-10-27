import React from "react";
import { observer } from "mobx-react-lite";
import { action } from "mobx";
import "./Checkbox.scss";

interface IProps {
    label: string;
    checked: boolean;
    onCheck: (value: boolean) => void;
}

export const Checkbox = observer((props: IProps) => {
    return (
        <div className="checkbox">
            <span className="checkbox-label">{props.label}</span>
            <input
                // name={props.label}
                type="checkbox"
                checked={props.checked}
                onChange={action((e) => {
                    props.onCheck(!props.checked);
                })}
            />
        </div>
    );
});
