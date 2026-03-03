import React, { FC, ReactNode } from 'react'
import { MdCheckCircle, MdError } from 'react-icons/md'
import styles from "./css/alert.module.css";
import { Note } from '@/constants/types/global.types';

interface Props {
    note: Note | undefined;
}
const AlertBar: FC<Props> = ({ note }): ReactNode => {

    return (
        <div className={`${styles.alert_container} ${note ? styles.alert_container_active : ""}`}>
            <div className={styles.alert_type_icon}>
                {(note?.type === "error" || note?.type === "warning") && (
                    <MdError size={15} color={note.type === "error" ? "red" : "yellow"} />
                )}
                {note?.type === "success" && (
                    <MdCheckCircle size={15} color="green" />
                )}
            </div>
            <div className={styles.alert_text_container}>
                <span className={styles.alert_title}>{note?.title}</span>
                {note?.body && <span className={styles.alert_desc}>{note.body}</span>}
            </div>
        </div>
    )
}

export default AlertBar