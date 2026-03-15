export interface Thumbnail {
    id: string;
    url: string;
}
export interface Content {
    id: string;
    title?: string;
    artist?: Post['artist'];
    /*
    * whether post contains embeddable media content
    * 1 or 0 tinytint use Boolean() to convert to js boolean
    */
    is_embeded?: number;// parse as Boolean()
    url: string;
}

export interface Artist {
    user_id?: string;
    name?: {
        first?: string;
        last?: string;
    }
    displayName?: string;
}

export interface PostOtherMetaData {
    genre?: string;
    producer?: string;
    socialHandles?: Record<string, string>;
}

export interface PostSQLResult {
    id: number; //db auto inc
    /**
    * unique identifier
    */
    post_id: string;
    /**
    * post slug unique also
    */
    slug: string;
    /**
    *id of who posted it
    */
    author_id: string;
    /**
    *id of who created the contnet
    */
    artist_id?: string;

    /**
    * Post title
    */
    title: string;
    /**
    * Post description 
    */
    description: string;
    /**
    * clasification e.g trending, dj-mix, etc
    */
    category_id: string | null;
    /**
     * actual url of the content media null if not a media post
    */
    content: string;//Content[];//string | null; //JSON stringified
    /**
    * cover image link for the post
    */
    content_thumbnail: string;//Thumbnail[];
    /**
     * Content type
     * 'image' | 'video' | 'music' | 'news' | 'advert' | 'others';
     */
    content_type: 'video' | 'music' | 'news' | 'others';

    status: "active" | "inactive" | "disabled" | "draft";
    /**
    * whether post comment section is open
    * 1  or 0 tinytint use Boolean() to convert to js boolean
    */
    comment_enabled: number;
    /*
    * whether post contains embeddable media content
    * 1 or 0 tinytint use Boolean() to convert to js boolean
    */
    //is_embeded: number;

    /**
     * is the post a trending content
    */
    is_trending: number;

    /**
    * if post is music of the week
    * contains the start date of from when it was!
    * became invalid if start date >= 8 days
    * meaning it is no longer music of the week
    */
    post_of_the_week?: Date | null;

    /**
     * the parent_id if post is track of an album
     */
    parent_id: string;
    /**
    * is content an album
    */
    is_album: number;

    /**
    * other metadata
    */
    others?: string;//PostOtherMetaData;
    /**
    * ISOString of creation date
    */
    created_at: string;
    /**
    * ISOString of last modified date
    */
    updated_at: string;

}

export interface Post extends PostSQLResult {
    author: {
        user_id: string;
        username: string;
    }
    artist?: string;
}


export interface PostFilter {
    limit: number;
    title?: string;
    category_id?: string;
    content_type?: string;
    status?: string;
    author_id?: string;
    comment_enabled?: boolean;
    is_external?: boolean;
    is_trending?: boolean;
    /**
    * send today's date here
    * so that we will check for 
    * post.music_of_the_week that has its value < 8 not >= filter.music_of_the_week =>
    * (which is todays date)
    */
    post_of_the_week?: boolean;
    cursorCreatedAt?: string;
    cursorId?: string;
    order?: "newest" | "oldest";
}