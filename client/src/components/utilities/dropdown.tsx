import { type FC, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./css/dropdown.module.css";

export interface DropdownOption {
    label?: string;//1
    value?: string;//2
    //or
    name?: string; //1 as label
    id?: string;//2 as value
}

interface DropdownProps {
    options: DropdownOption[];
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    fit?: boolean
}

const Dropdown: FC<DropdownProps> = ({
    options,
    value,
    defaultValue,
    placeholder = "Select",
    onChange,
    disabled = false,
    fit
}) => {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const ref = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

    const isControlled = value !== undefined;
    const selectedValue = isControlled ? value : internalValue;
    const selectedOption = value ? options.find(
        o => (o.value ?? String(o.id)) === selectedValue
    ) : undefined;

    const close = () => setOpen(false);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            // check both wrapper AND portal menu
            const menuEl = document.getElementById("dropdown-portal-menu");
            if (!ref.current?.contains(target) && !(menuEl?.contains(target))) {
                close();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);


    const toggle = () => {
        if (disabled) return;
        if (!open && ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
        }
        setOpen(o => !o);
    };

    const select = (val: string) => {
        if (!isControlled) setInternalValue(val);
        onChange?.(val);
        close();
    };

    return (
        <div ref={ref} style={{ width: fit ? "100%" : undefined, height: fit ? "100%" : undefined }} className={`${styles.wrapper} ${disabled ? styles.disabled : ""}`}>
            <button type="button" className={styles.trigger} onClick={toggle}>
                <span>{selectedOption?.label ?? selectedOption?.name?.replace("-", " ") ?? placeholder}</span>
                <span className={styles.chevron}>▾</span>
            </button>

            {open &&
                createPortal(
                    <div
                        id="dropdown-portal-menu" // add this
                        className={styles.menu}
                        style={{
                            position: "absolute",
                            top: menuPosition.top,
                            left: menuPosition.left,
                            width: menuPosition.width,
                            height: "fit-content",
                            maxHeight: "20rem",
                            overflowY: "auto",
                            zIndex: 9999,
                        }}
                    >
                        {options.map(opt => (
                            <button
                                key={opt.value ?? opt.id}
                                type="button"
                                className={`${styles.option} ${(String(opt.value ?? opt.id)) === selectedValue ? styles.active : ""}`}
                                onClick={() => select(opt.value ?? opt.id ?? "")}
                            >
                                {opt.label ?? opt.name?.replace("-", " ")}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}

        </div>
    );
};

export default Dropdown;
