import { type FC, type ReactNode } from "react";
import styles from "./css/date.time.selector.module.css";
import { FaXmark } from "react-icons/fa6";
import {
    DatePicker,
    LocalizationProvider,
    TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import type { Schedule } from "@/pages/post.create";

interface DateTime extends Schedule { }

interface Props {
    close: () => void;
    data: DateTime;
    dataSetter: (payload: DateTime) => void;
    /**
     * Ability to select past date/time
     */
    past?: boolean;
}

const DateTimeSelector: FC<Props> = ({
    past = true,
    close,
    data,
    dataSetter,
}): ReactNode => {
    const now = dayjs();

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className={styles.container}>
                <div className={styles.content_container}>
                    <div className={styles.header}>
                        <span className={styles.header_text}>
                            Select Dates Range
                        </span>
                        <div onClick={close} className={styles.header_icon}>
                            <FaXmark size={18} />
                        </div>
                    </div>

                    <div className={styles.contents}>
                        {/* DATE */}
                        <div className={styles.date_selector_section}>
                            <DatePicker
                                className={styles.date_picker}
                                label="Select Date"
                                value={data.date ? dayjs(data.date) : null}
                                disablePast={!past}
                                format="DD/MM/YYYY"
                                onChange={(date) => {
                                    dataSetter({
                                        ...data,
                                        date: date ? date.toDate() : null,
                                        time: null, // ✅ reset time
                                    });
                                }}
                            />
                        </div>

                        {/* TIME */}
                        <div className={styles.date_selector_section}>
                            <TimePicker
                                className={styles.date_picker}
                                label="Select Time"
                                value={data.time ? dayjs(data.time) : null}
                                format="HH:mm"
                                minTime={
                                    !past &&
                                        data.date &&
                                        dayjs(data.date).isSame(now, "day")
                                        ? now
                                        : undefined
                                }
                                onChange={(time) =>
                                    dataSetter({
                                        ...data,
                                        time: time
                                            ? time.valueOf()
                                            : null,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className={styles.clear_selections}>
                        <button
                            onClick={() => dataSetter({ date: null, time: null })}
                            className={styles.reset_button}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default DateTimeSelector;