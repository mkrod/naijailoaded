import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type FC, type ReactNode, type SetStateAction } from "react"
import type { PostFilter, Post } from "../types/post.type";
import { defaultPostsFilter, defaultPostsRes } from "../variables/posts.vars";
import { getPosts } from "../controllers/posts.controller";

interface DefaultRes {
    hasNext: boolean;
    nextCursor: { createdAt: string, id: string } | undefined;
    perPage: number | undefined;
    results: Post[];
    page: number;
    totalResult?: number;
}

interface PostsContexts {
    posts: Post[];
    postsResponse: DefaultRes;
    fetchingPosts: boolean;
    postFilter: PostFilter;
    setPostFilter: Dispatch<SetStateAction<PostFilter>>;
    setFetchingPosts: Dispatch<SetStateAction<boolean>>;
}

export const PostsContext = createContext<PostsContexts | null>(null);



export const PostsProvider: FC<{ children: ReactNode }> = ({ children }): ReactNode => {

    const [postsResponse, setPostsResponse] = useState<DefaultRes>(defaultPostsRes);
    const [posts, setPosts] = useState<Post[]>([]);
    const [fetchingPosts, setFetchingPosts] = useState<boolean>(true);

    const [postFilter, setPostFilter] = useState<PostFilter>(defaultPostsFilter as PostFilter);

    useEffect(() => {
        if (!fetchingPosts) return;

        getPosts(postFilter)
            .then((res) => {
                setPostsResponse(res?.data ?? defaultPostsRes);
                setPosts(res?.data?.results ?? []);
            })
            .catch((err) => {
                console.error("Error fetching posts: ", err);
            })
            .finally(() => {
                setFetchingPosts(false);
            })
    }, [fetchingPosts]);



    const memoisedValues = useMemo(() => ({
        posts,
        postsResponse,
        fetchingPosts,
        postFilter,
        setPostFilter,
        setFetchingPosts
    }), [posts, postsResponse, fetchingPosts, postFilter]);

    return (
        <PostsContext.Provider value={memoisedValues}>
            {children}
        </PostsContext.Provider>
    )
}

export const usePostProvider = () => {
    const context = useContext(PostsContext);
    if (!context) {
        throw new Error("usePostProvider must be used within a PostsProvider");
    }
    return context;
}