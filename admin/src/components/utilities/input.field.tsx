import React, { useState, type CSSProperties, type HTMLInputTypeAttribute } from 'react'
import styles from "./css/input.field.module.css";
import { TbEye, TbEyeClosed } from 'react-icons/tb';
import { IoIosSearch } from 'react-icons/io';


interface AuthInputFieldProps {
    setValue: (value: string) => void;
    keyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    value: string | number;
    label: string;
    type?: HTMLInputTypeAttribute; // Optional, default is "text"
    style?: CSSProperties;
    disabled?: boolean; // Optional, default is false
    autocomplete?: "on" | "off"; // Optional, default is "on"
    // Add any other props you need

    /**
     * whether the box is transparent to use its parent background
     */
    labelStyle?: CSSProperties;
}
const InputField: React.FC<AuthInputFieldProps> = ({ setValue, keyDown, value, label, type = "text", style, disabled = false, autocomplete = 'on', labelStyle }): React.JSX.Element => {

    const [textType, setTextType] = useState<"password" | "text">(type === "password" ? "password" : "text" as "password" | "text");

    return (
        <div style={style} className={styles.input_box_container}>
            {type === "search" && (
                <div className={styles.label_icon}>
                    <IoIosSearch />
                </div>
            )}
            <input
                disabled={disabled}
                type={textType}
                value={value}
                name="name"
                onChange={(e) => setValue(e.target.value)}
                className={styles.input_box}
                placeholder=''
                onKeyDown={keyDown}
                autoComplete={autocomplete}
                style={{ width: type === "password" ? "calc(100% - 2rem)" : "100%" }}
            />
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

export default InputField