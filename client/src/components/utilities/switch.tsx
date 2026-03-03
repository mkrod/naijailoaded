import React, { type ReactNode } from "react";

type SwitchSize = "small" | "medium" | "big";

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    color?: string; // defaults to var(--accent)
    size?: SwitchSize;
    rounded?: boolean;
    disabled?: boolean;
    onIcon?: ReactNode;
    offIcon?: ReactNode;
}

const sizeMap = {
    small: { width: 34, height: 18, knob: 14 },
    medium: { width: 44, height: 24, knob: 20 },
    big: { width: 56, height: 30, knob: 26 },
};

const Switch: React.FC<SwitchProps> = ({
    checked,
    onChange,
    color = "var(--accent)",
    size = "medium",
    rounded = true,
    disabled = false,
    onIcon,
    offIcon
}) => {
    const { width, height, knob } = sizeMap[size];

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            style={{
                width,
                height,
                padding: 2,
                backgroundColor: checked ? color : "#ccc",
                borderRadius: rounded ? height : 4,
                border: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "background-color 0.2s ease",
                position: "relative",
            }}
        >
            <span
                style={{
                    width: knob,
                    height: knob,
                    backgroundColor: "#fff",
                    borderRadius: rounded ? "50%" : 4,
                    position: "absolute",
                    top: "50%",
                    left: checked ? width - knob - 2 : 2,
                    transform: "translateY(-50%)",
                    transition: "left 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >{checked ? offIcon : onIcon}</span>
        </button>
    );
};

export default Switch;
