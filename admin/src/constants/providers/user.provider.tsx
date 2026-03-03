import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import type { User } from '../types/user.types';
import { getUser } from '../controllers/user.controller';

interface UserContext {
    user: User | undefined;
}

const userContext = createContext<UserContext | null>(null);


export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | undefined>(undefined);
    const [fetchingUser, setFetchingUser] = useState<boolean>(true);

    useEffect(() => {
        if (!fetchingUser) return;

        getUser()
            .then((res) => {
                //console.log(res)
                setUser(res.data);
            })
            .catch(err => console.warn("error getting current user: ", err))
            .finally(() => setFetchingUser(false));
    }, [fetchingUser]);


    return (
        <userContext.Provider value={{
            user
        }}>
            {children}
        </userContext.Provider>
    )
}

export const useUserProvider = () => {
    const context = useContext(userContext);
    if (!context) throw Error("useUserProvider must be used within UserProvider");
    return context;
}