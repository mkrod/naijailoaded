import {
  useRef,
  useEffect,
  useState,
  type FC,
  type JSX,
  type KeyboardEvent,
  type ClipboardEvent,
  type ReactNode
} from "react";

import styles from "./css/input.module.css";
import type { Response } from "@/constants/types/global.types";
import { askAI } from "@/constants/controllers/global.controller";

import { BiSolidMagicWand } from "react-icons/bi";
import { FaBold, FaItalic, FaUnderline } from "react-icons/fa6";

import ActivityIndicator from "./activity.indicator";
import type { CSSProperties } from "@mui/material";
import { IoSend } from "react-icons/io5";

export type FontStyle = "bold" | "italic" | "underline";

interface EditableInputProps {
  value: string; // HTML
  onChange: (value: string) => void;
  error?: (value: string) => void;
  prompt?: string;
  CantUseCase?: string;
  placeholder?: string;
  onPaste?: (e: ClipboardEvent<HTMLDivElement>) => void;
  style?: CSSProperties;
  AIdisabled?: boolean;
  showProceedButton?: boolean;
  proceedButtonText?: string;
  proceeding?: string;
  onProceed?: () => void;
}

const FONT_FORMATS: { name: FontStyle; icon: ReactNode }[] = [
  { name: "bold", icon: <FaBold size={12} /> },
  { name: "italic", icon: <FaItalic size={12} /> },
  { name: "underline", icon: <FaUnderline size={12} /> }
];

const EditableInput: FC<EditableInputProps> = ({
  value,
  onChange,
  error,
  prompt,
  CantUseCase,
  placeholder,
  onPaste,
  style,
  AIdisabled = false,
  showProceedButton = false,
  proceedButtonText = "Proceed",
  proceeding = false,
  onProceed
}): JSX.Element => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [fontStyle, setFontStyle] = useState<FontStyle[]>([]);
  const [isAskingAi, setIsAskingAi] = useState(false);

  /* -----------------------------
   * Sync external HTML → DOM
   * ----------------------------- */
  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== (value ?? "")) {
      ref.current.innerHTML = value ?? "";
    }
  }, [value]);

  /* -----------------------------
   * Update toolbar active styles
   * ----------------------------- */
  const updateActiveStyles = () => {
    const active: FontStyle[] = [];
    FONT_FORMATS.forEach(({ name }) => {
      if (document.queryCommandState(name)) active.push(name);
    });
    setFontStyle(active);
  };

  /* -----------------------------
   * Toggle formatting
   * ----------------------------- */
  const toggleFormat = (style: FontStyle) => {
    ref.current?.focus();
    document.execCommand(style);
    updateActiveStyles();
  };

  /* -----------------------------
   * Handle input events
   * ----------------------------- */
  const handleInput = () => {
    if (!ref.current) return;
    onChange(ref.current.innerHTML);
    updateActiveStyles(); // only read state, do NOT force toggle
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertLineBreak");
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    onPaste?.(e);
  };

  /* -----------------------------
   * AI generation
   * ----------------------------- */
  const generateWithAI = async () => {
    if (!prompt?.trim() || prompt?.trim().length === 0) {
      error?.(CantUseCase || "");
      return;
    }

    setIsAskingAi(true);
    try {
      const res: Response = await askAI(prompt);
      if (res.status === 200) {
        onChange(res.data.response);
      } else {
        error?.("Something went wrong");
      }
    } catch {
      error?.("Something went wrong");
    } finally {
      setIsAskingAi(false);
    }
  };

  const getTextLength = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent?.trim().length ?? 0;
  };

  /* -----------------------------
   * Render
   * ----------------------------- */
  return (
    <div style={style} className={styles.description_container}>
      <div className={styles.tool_bar}>
        <div className={styles.text_format_container}>
          {FONT_FORMATS.map(({ name, icon }) => (
            <div
              key={name}
              onClick={() => toggleFormat(name)}
              className={`${styles.text_format} ${fontStyle.includes(name) ? styles.text_format_active : ""
                }`}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.description}>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          className={styles.in_chat_footer_input_field}
          data-placeholder={placeholder}
          onInput={handleInput}
          onKeyUp={updateActiveStyles}
          onMouseUp={updateActiveStyles}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />
      </div>

      <div className={styles.footer}>
        <div className={styles.text_count}>
          {`Text Count: ${getTextLength(value)}`}
        </div>

        {!AIdisabled && (
          <div className={styles.generate_container}>
            {isAskingAi ? (
              <ActivityIndicator size="small" style="typing" />
            ) : (
              <button
                className={styles.generate_button}
                onClick={generateWithAI}
              >
                <BiSolidMagicWand size={15} />
                Generate
              </button>
            )}
          </div>
        )}
        {showProceedButton && (
          <div className={styles.generate_container}>
            {proceeding ? (
              <ActivityIndicator size="small" style="spin" />
            ) : (
              <button
                className={styles.generate_button}
                onClick={onProceed}
              >
                <div className={styles.generate_button_icon}>
                  <IoSend size={15} />
                </div>
                <span className={styles.generate_button_text}>
                  {proceedButtonText}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableInput;
