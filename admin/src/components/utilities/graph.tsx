import type { FC, ReactNode } from "react"
import styles from "./css/graph.module.css";
import { RxDotFilled } from "react-icons/rx";
import type { CSSProperties } from "react";
import { LineChart } from '@mui/x-charts/LineChart';
import { formatNumberString } from "@/constants/variables/global.vars";





interface Props {
    /**Pass String or container with icon + string with your class */
    title?: ReactNode;

    /**
     * what do you call the data being display 
     **/
    dataLabel?: string;

    /**
     * @param colors.primary is to indicate previous data
     * @param colors.secondary is to indiate current data
     */
    colors?: {
        primary: CSSProperties['background'],
        secondary: CSSProperties['background']
    },
    xAxisValueKey?: string;
    yAxisValueKey?: string;
    dataKey?: string;
    dataset?: any[];

}

const GraphChart: FC<Props> = ({ title, dataLabel, dataset, xAxisValueKey, dataKey, colors = { primary: "red", secondary: "blue" } }): ReactNode => {

    return (
        <div className={styles.container}>
            <div className={styles.header_container}>
                {title && (
                    <div className={styles.header_label}>
                        {title}
                    </div>
                )}

                <div className={styles.current_prev_indicator}>
                    {/*<div title="Color representation for the previous corresponding period" className={styles.c_p_ind}>
                        <RxDotFilled color={colors.secondary as string} size={20} />
                        <span>Previous</span>
                    </div>*/}

                    <div title="Color representation for the current selected period" className={styles.c_p_ind}>
                        <RxDotFilled color={colors.primary as string} size={20} />
                        <span>{dataLabel ?? dataKey}</span>
                    </div>
                </div>

                <div className={styles.header_right}>
                    {/**content for top-right here */}
                </div>
            </div>
            <div className={styles.content_container}>
                {/*<LineChart
                    style={{ height: "100%" }}
                    xAxis={[
                        { data: [1, 2, 3, 4, 5, 6] },
                        { data: [1, 2, 3, 4, 5, 6] }
                    ]}
                    series={[
                        { data: [120, 180, 250, 400, 300, 450], color: colors.primary as string },
                        { data: [110, 280, 350, 500, 300, 400], color: colors.secondary as string }
                    ]}

                />*/}
                <LineChart
                    style={{ height: "100%" }}
                    dataset={dataset}
                    xAxis={[
                        {
                            scaleType: 'point', // Essential for string data
                            dataKey: xAxisValueKey, // The key in the dataset that holds the strings
                        },
                    ]}
                    yAxis={[
                        {
                            valueFormatter: (value: number) => formatNumberString(value),
                            min: 0
                        },
                    ]}
                    series={[
                        {
                            color: colors.primary as string,
                            dataKey: dataKey,
                        },
                    ]}
                    // The 'sx' prop targets the SVG elements
                    sx={{
                        // 1. Change Axis Line Color (the main line)
                        "& .MuiChartsAxis-line": {
                            stroke: "var(--border-normal) !important",
                            strokeWidth: "1.5 !important",
                        },
                        // 2. Change Tick Color (the small dashes)
                        "& .MuiChartsAxis-tick": {
                            stroke: "var(--border-fade) !important",
                        },
                        // 3. Change Tick Label Styles (the text)
                        "& .MuiChartsAxis-tickLabel": {
                            fill: "var(--color) !important", // Text color
                            fontSize: "var(--xs-font) !important", // Font size
                            fontFamily: "var(--font-global) !important", // Font family
                            fontWeight: "600 !important",
                        },
                        // 4. Change Axis Label Style (if you provide a label prop)
                        "& .MuiChartsAxis-label": {
                            fill: "var(--color) !important",
                            fontSize: "var(--sm-font) !important",
                        },
                    }}
                />
            </div>
        </div>
    )
}

export default GraphChart;

{/**
                        { data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
                        { data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] }, */}