import { type FC, type JSX } from 'react'
import { TbMoodEmpty } from 'react-icons/tb';

interface Props {
    title: string;
    margin?: string;
}
const EmptyList: FC<Props> = ({ title, margin = "0" }): JSX.Element => {

    return (
        <div style={{
            margin,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1
        }}>
            <TbMoodEmpty size={45} />
            <span style={{
                fontFamily: "Quicksand, sanserif",
                fontWeight: "700",
                fontSize: "1rem"
            }}>
                {title}
            </span>

        </div>
    )
}

export default EmptyList