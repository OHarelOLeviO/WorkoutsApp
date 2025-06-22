import { createContext, useContext, useState, useCallback } from 'react';

const RefreshContext = createContext();

export const useRefresh = () => useContext(RefreshContext);

export function RefreshProvider({ children }) {
    const [refreshFlag, setRefreshFlag] = useState(false);

    const triggerRefresh = useCallback(() => {
        setRefreshFlag(prev => !prev);
    }, []);

    return (
        <RefreshContext.Provider value={{ refreshFlag, triggerRefresh }}>
            {children}
        </RefreshContext.Provider>
    );
}
