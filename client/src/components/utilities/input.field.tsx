import React, {
    useState,
    type CSSProperties,
    type HTMLInputTypeAttribute,
} from "react";
import styles from "./css/input.field.module.css";
import { TbEye, TbEyeClosed } from "react-icons/tb";
import { IoIosSearch } from "react-icons/io";

interface AuthInputFieldProps {
    id: string; // ✅ required unique id
    setValue: (value: string) => void;
    keyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    value: string | number;
    label: string;
    type?: HTMLInputTypeAttribute;
    style?: CSSProperties;
    disabled?: boolean;
    autocomplete?: "on" | "off";
    labelStyle?: CSSProperties;
}

const InputField: React.FC<AuthInputFieldProps> = ({
    id,
    setValue,
    keyDown,
    value,
    label,
    type = "text",
    style,
    disabled = false,
    autocomplete = "on",
    labelStyle,
}): React.JSX.Element => {
    const [textType, setTextType] = useState<"password" | "text">(
        type === "password" ? "password" : "text"
    );

    return (
        <div style={style} className={styles.input_box_container}>
            {type === "search" && (
                <div className={styles.label_icon}>
                    <IoIosSearch />
                </div>
            )}

            <input
                id={id} // ✅ proper binding
                name={id}
                disabled={disabled}
                type={type === "password" ? textType : type}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={keyDown}
                autoComplete={autocomplete}
                className={styles.input_box}
                placeholder=""
                style={{
                    width: type === "password" ? "calc(100% - 2rem)" : "100%",
                }}
            />

            <label
                htmlFor={id} // ✅ now correctly linked
                style={labelStyle}
                className={`
          ${styles.input_label}
          ${type === "search" ? styles.input_label_icon_is_active : ""}
        `}
            >
                {label}
            </label>

            {type === "password" && (
                <div
                    onClick={() =>
                        setTextType((prev) =>
                            prev === "password" ? "text" : "password"
                        )
                    }
                    className={styles.password_toogle}
                >
                    {textType === "password" ? <TbEyeClosed /> : <TbEye />}
                </div>
            )}
        </div>
    );
};

export default InputField;