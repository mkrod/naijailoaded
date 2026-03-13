import { useGlobalProvider } from "@/constants/providers/global.provider";
import styles from "./css/library.module.css";
import { useEffect, useRef, useState, type FC, type ReactNode, type RefObject } from 'react';
//import { LuDot } from "react-icons/lu";
import { Checkbox, Pagination } from "@mui/material";
import Dropdown from "@/components/utilities/dropdown";
import { useMediaLibraryProvider } from "@/constants/providers/media.library.provider";
import type { LibraryOrder, LibraryTypes, MediaLibrary } from "@/constants/types/media.library.types";
import InputField from "@/components/utilities/input.field";
import useClickOutside from "@/constants/utilities/useOutsideClick";
import GridAssetCard from "@/components/utilities/grid.assets.card";
import EmptyList from "@/components/utilities/empty.list";
import ActivityIndicator from "@/components/utilities/activity.indicator";
import LibraryCreator from "@/components/utilities/library.creator";



const MediaLibrary: FC = (): ReactNode => {

    const { isMobile, setNote } = useGlobalProvider();
    const mobileClass = isMobile ? "mobile_" : "";
    const { library, mediaLibraryFilter, mediaLibraryRes, fetchingLibrary, setFetchingLibrary, setMediaLibraryFilter } = useMediaLibraryProvider();
    const { page, perPage, totalResult } = mediaLibraryRes;

    const triggerFetch = () => {
        setFetchingLibrary(true);
    };

    const updateFilter = (payload: Partial<typeof mediaLibraryFilter>) => {
        if (!payload.page) {
            payload["page"] = 1
        } //reset page to 1 if we are sending new filter, so it tsart from the top of the result and not admist
        setMediaLibraryFilter(prev => ({ ...prev, ...payload }));
        triggerFetch();
    };

    /* ===================================================== */
    const limitRef = useRef<HTMLDivElement | null>(null);
    const [showLimitOptions, setShowLimitOptions] = useState<boolean>(false);
    const closeLimitOptions = () => {
        if (showLimitOptions) setShowLimitOptions(false);
    }
    useClickOutside(limitRef as RefObject<Element>, closeLimitOptions);


    const [activeView, _] = useState<"grid" | "list">("grid");
    const views = {
        grid: (key: string, props: any) => (
            <GridAssetCard
                key={key}
                {...props}
            />
        ),
        list: (key: string, props: any) => (
            <GridAssetCard
                key={key}
                {...props}
            />
        ),
    }

    const [openCreator, setOpenCreator] = useState<boolean>(false);

    /*=======================================*/
    const [selectedMediaId, setSelectedMediaId] = useState<string[]>([]);
    const [allIds, setAllIds] = useState<string[]>([])
    useEffect(() => {
        const ids = library.map((p) => p.library_id);
        setAllIds(ids)   //will reset per page/result /*intentional*/
    }, [library])

    useEffect(() => {
        if (!selectedMediaId.length || !totalResult || !library) return;
        const message = `Selected ${selectedMediaId.length} Media(s)`;
        setNote({ type: "warning", title: message });
    }, [selectedMediaId]);

    return (
        <div className={styles[`${mobileClass}container`]}>
            <div className={styles[`${mobileClass}header_container`]}>
                <div className={styles.header_left}>
                    <span className={styles.header_title}>
                        Media Library
                    </span>
                    <span className={styles.header_sub_title}>
                        {/*8 folders
                        <LuDot />*/}
                        {totalResult} assets
                    </span>
                </div>
                <div className={styles[`${mobileClass}header_right`]}>
                    {/*<button className={`${styles.action_button} ${styles.action_button_new_folder}`}>Add new folder</button>*/}
                    <button
                        onClick={() => setOpenCreator(true)}
                        className={`${styles.action_button} ${styles.action_button_new_asset}`}
                    >
                        Add new assets
                    </button>
                </div>
            </div>
            <div className={styles[`${mobileClass}filter_container`]}>
                <div className={styles.checkbox_container}>
                    <Checkbox
                        checked={!!allIds.length && allIds.every(id => selectedMediaId.includes(id))}
                        onChange={(_, value) => {
                            if (value) {
                                setSelectedMediaId(prev =>
                                    Array.from(new Set([...prev, ...allIds]))
                                );
                            } else {
                                setSelectedMediaId(prev =>
                                    prev.filter(id => !allIds.includes(id))
                                );
                            }
                        }}
                    />
                </div>
                <div className={styles[`${mobileClass}filters`]}>
                    <div className={styles.sort_container}>
                        <Dropdown
                            placeholder="Filter by type"
                            options={[{ id: "", name: "Filter by type" }, { id: "image", name: "Image" }, { id: "video", name: "Video" }, { id: "music", name: "Music" }]}
                            value={mediaLibraryFilter.library_type}
                            height="1.5rem"
                            wrapperStyles={{ backgroundColor: "var(--background)" }}
                            triggerStyles={{ borderWidth: 0 }}
                            isSearchable={false}
                            onChange={(v) => updateFilter({ library_type: v as LibraryTypes })}
                        />

                    </div>
                    <div className={styles.sort_container}>
                        <Dropdown
                            placeholder="Sort"
                            options={[{ id: "desc", name: "Newest" }, { id: "asc", name: "Oldest" }]}
                            value={mediaLibraryFilter.order}
                            height="1.5rem"
                            wrapperStyles={{ backgroundColor: "var(--background)" }}
                            triggerStyles={{ borderWidth: 0 }}
                            isSearchable={false}
                            onChange={(v) => updateFilter({ order: v as LibraryOrder })}
                        />
                    </div>
                </div>
                <div className={styles[`${mobileClass}search_container`]}>
                    <InputField
                        style={{ height: "2rem", width: "100%" }}
                        autocomplete="off"
                        label="Search"
                        type="text"
                        labelStyle={{ background: "transparent" }}
                        value={mediaLibraryFilter.name ?? ""}
                        setValue={(name) => updateFilter({ name })}
                    />
                </div>
            </div>
            <div className={styles[`${mobileClass}main_container`]}>
                <div className={styles[`${mobileClass}inner_scroll_container`]}>
                    {!fetchingLibrary ? library.map((library) => {
                        const isSelected = selectedMediaId.includes(library.library_id);
                        const props = {
                            isSelected,
                            library,
                            selectedMediaIdLength: selectedMediaId.length,
                            onSelected: ({ id, value }: { id: string, value: boolean }) => {
                                if (value) {
                                    setSelectedMediaId((prev) => ([...prev, id]))
                                } else {
                                    setSelectedMediaId((prev) => {
                                        const filter = prev.filter((p) => p !== id);
                                        return filter;
                                    })
                                }
                            }
                        }

                        return views[activeView](library.library_id, props);
                    }) : null}
                    {!fetchingLibrary && library.length === 0 ? (
                        <div className={styles.empty_container}>
                            <EmptyList title="No Result at this time" />
                        </div>
                    ) : null}
                    {fetchingLibrary ? (
                        <div className={styles.empty_container}>
                            <ActivityIndicator style="spin" size="big" />
                        </div>
                    ) : null}
                </div>
            </div>
            <footer className={styles[`${mobileClass}footer_container`]}>
                <section className={styles.limit_container}>
                    <span className={styles.limit_label}>
                        Rows Per Result:
                    </span>
                    <div ref={limitRef} className={styles.limit_drop_down}>
                        <button onClick={() => setShowLimitOptions((prev) => !prev)} className={styles.limit_value}>
                            {mediaLibraryFilter.limit}
                        </button>
                        {showLimitOptions && (
                            <div className={styles.limit_options}>
                                {[12, 36, 72, 108, 144, 226].map((n) => (
                                    <span
                                        key={n}
                                        className={styles.limit_option}
                                        onClick={() => {
                                            updateFilter({ limit: n });
                                            setShowLimitOptions(false);
                                        }}
                                    >
                                        {n}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
                <section className={styles[`${mobileClass}pagination_container`]}>
                    <Pagination
                        shape="rounded"
                        variant='outlined'
                        page={page}
                        count={Math.ceil(Number(totalResult) / Number(perPage))}
                        onChange={(_, page) => updateFilter({ page })}
                    />
                </section>
            </footer>
            {openCreator && (
                <LibraryCreator
                    close={() => setOpenCreator(false)}
                />
            )}
        </div>
    )
}

export default MediaLibrary