import React, { createContext, useContext, useState, ReactNode } from 'react';

type AuthView = 'login' | 'register';

interface AuthDrawerContextType {
    isOpen: boolean;
    view: AuthView;
    openAuth: (view?: AuthView) => void;
    closeAuth: () => void;
}

const AuthDrawerContext = createContext<AuthDrawerContextType | undefined>(undefined);

export const AuthDrawerProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<AuthView>('login');

    const openAuth = (initialView: AuthView = 'login') => {
        setView(initialView);
        setIsOpen(true);
    };

    const closeAuth = () => {
        setIsOpen(false);
    };

    return (
        <AuthDrawerContext.Provider value={{ isOpen, view, openAuth, closeAuth }}>
            {children}
        </AuthDrawerContext.Provider>
    );
};

export const useAuthDrawer = () => {
    const context = useContext(AuthDrawerContext);
    if (context === undefined) {
        throw new Error('useAuthDrawer must be used within an AuthDrawerProvider');
    }
    return context;
};
