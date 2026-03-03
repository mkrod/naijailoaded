import React, { useState, type CSSProperties, type HTMLInputTypeAttribute, type RefObject } from 'react'
import styles from "./css/input.field.static.module.css";
import { TbEye, TbEyeClosed } from 'react-icons/tb';


interface StaticInputFieldProps {
    ref?: RefObject<HTMLInputElement | null>;
    setValue: (value: string) => void;
    keyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    value: string | number;
    label?: string;
    type?: HTMLInputTypeAttribute; // Optional, default is "text"
    style?: CSSProperties;
    placeholder?: string;
    disabled?: boolean; // Optional, default is false
    autocomplete?: "on" | "off"; // Optional, default is "on"
    // Add any other props you need

    /**
     * whether the box is transparent to use its parent background
     */
    labelStyle?: CSSProperties;
}
const InputFieldStatic: React.FC<StaticInputFieldProps> = ({ ref, setValue, keyDown, value, label, type = "text", placeholder, style, disabled = false, autocomplete = 'on', labelStyle }): React.JSX.Element => {

    const [textType, setTextType] = useState<"password" | "text">(type === "password" ? "password" : "text" as "password" | "text");

    return (
        <div style={style} className={styles.input_box_container}>
            <label
                style={labelStyle}
                htmlFor="name"
                className={`
                    ${styles.input_label}
                    ${type === 'search' ? styles.input_label_icon_is_active : ""}
                 `}
            >
                {label}
            </label>
            <input
                ref={ref}
                disabled={disabled}
                type={type === "datetime-local" ? 'datetime-local' : textType}
                value={value}
                name="name"
                onChange={(e) => setValue(e.target.value)}
                className={styles.input_box}
                placeholder={placeholder}
                onKeyDown={keyDown}
                autoComplete={autocomplete}
                style={{ width: type === "password" ? "calc(100% - 2rem)" : "100%" }}
            />

            {type === "password" && (
                <div
                    onClick={() => setTextType((prev) => prev === "password" ? "text" : "password")}
                    className={styles.password_toogle}
                >
                    {textType === "password" && <TbEyeClosed />}
                    {textType === "text" && <TbEye />}
                </div>
            )
            }
        </div>
    )
}

export default InputFieldStatic