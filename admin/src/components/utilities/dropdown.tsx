import { type FC, useEffect, useRef, useState, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import styles from "./css/dropdown.module.css";
import type { CSSProperties } from "@mui/material";

export interface DropdownOption {
    label?: string;
    value?: string;
    name?: string;
    id?: string;
}

interface DropdownProps {
    options: DropdownOption[];
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    searchPlaceholder?: string; // New: custom placeholder for search
    onChange?: (value: string) => void;
    disabled?: boolean;
    fit?: boolean;
    height?: string | number;
    width?: string | number;
    openDirection?: "top" | "bottom";
    isSearchable?: boolean; // New: Toggle search feature
    wrapperStyles?: CSSProperties;
    triggerStyles?: CSSProperties;
}

const Dropdown: FC<DropdownProps> = ({
    options, value, defaultValue, placeholder = "Select",
    searchPlaceholder = "Search...", onChange, disabled = false,
    fit, height, width, openDirection, isSearchable = true, wrapperStyles, triggerStyles
}) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [internalValue, setInternalValue] = useState(defaultValue);

    const ref = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, direction: "bottom" });

    // 1. Filtered Options Logic
    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        return options.filter(opt => {
            const label = (opt.label ?? opt.name ?? "").toLowerCase();
            return label.includes(searchTerm.toLowerCase());
        });
    }, [options, searchTerm]);

    const isControlled = value !== undefined;
    const selectedValue = isControlled ? value : internalValue;
    const selectedOption = options.find(
        o => (o.value ?? String(o.id)) === selectedValue
    );

    const updatePosition = () => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const menuMaxHeight = 320;

            let direction = openDirection;
            if (!direction) {
                direction = spaceBelow < menuMaxHeight && rect.top > menuMaxHeight ? "top" : "bottom";
            }

            setCoords({
                top: direction === "bottom" ? rect.bottom + window.scrollY : rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                direction
            });
        }
    };

    // Auto-focus search input when dropdown opens
    useEffect(() => {
        if (open && isSearchable) {
            searchRef.current?.focus();
        } else {
            setSearchTerm(""); // Reset search when closed
        }
    }, [open, isSearchable]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const menuEl = document.getElementById("dropdown-portal-menu");
            if (!ref.current?.contains(e.target as Node) && !menuEl?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useLayoutEffect(() => {
        if (open) {
            updatePosition();
            window.addEventListener("resize", updatePosition);
            window.addEventListener("scroll", updatePosition);
        }
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition);
        };
    }, [open]);

    const toggle = () => {
        if (disabled) return;
        if (!open) updatePosition();
        setOpen(!open);
    };

    const select = (val: string) => {
        if (!isControlled) setInternalValue(val);
        onChange?.(val);
        setOpen(false);
    };

    return (
        <div
            ref={ref}
            style={{ width: fit ? "100%" : width, height: fit ? "100%" : height, ...wrapperStyles }}
            className={`${styles.wrapper} ${disabled ? styles.disabled : ""} ${open ? styles.isOpen : ""}`}
        >
            <div className={styles.trigger} style={triggerStyles} onClick={toggle}>
                {isSearchable && open ? (
                    <input
                        ref={searchRef}
                        type="text"
                        className={styles.searchInput}
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the input
                    />
                ) : (
                    <span className={styles.label}>
                        {selectedOption?.label ?? selectedOption?.name?.replace(/-/g, " ") ?? placeholder}
                    </span>
                )}
                <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>▾</span>
            </div>

            {open &&
                createPortal(
                    <div
                        id="dropdown-portal-menu"
                        className={styles.menu}
                        style={{
                            position: "absolute",
                            top: coords.top,
                            left: coords.left,
                            width: coords.width,
                            transform: coords.direction === "top" ? "translateY(-100%)" : "none",
                            maxHeight: "20rem",
                            height: "fit-content",
                            overflowY: "auto",
                            zIndex: 9999,
                        }}
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => {
                                const optVal = String(opt.value ?? opt.id ?? "");
                                return (
                                    <button
                                        key={optVal}
                                        type="button"
                                        className={`${styles.option} ${optVal === selectedValue ? styles.active : ""}`}
                                        onClick={() => select(optVal)}
                                    >
                                        {opt.label ?? opt.name?.replace(/-/g, " ")}
                                    </button>
                                );
                            })
                        ) : (
                            <div className={styles.noResults}>No options found</div>
                        )}
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default Dropdown;