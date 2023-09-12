import React, {createContext, useContext, ReactNode, useState, useEffect} from "react";
import {
    createUserWithEmailAndPassword,
    UserCredential,
    onAuthStateChanged,
    User,
    signOut,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import {auth} from "../firebase/Firebase";

interface UserAuthContextProviderProps {
    children: ReactNode;
}

interface UserAuthContextValue {
    createUser: (email: string, password: string) => Promise<UserCredential>;
    logOut: () => Promise<void>;
    user: User | null;
    signIn: (email: string, password: string) => Promise<UserCredential>;
    googleSignIn: () => void;
}

const UserContext = createContext<UserAuthContextValue | undefined>(undefined);

export const UserAuthContextProvider: React.FC<UserAuthContextProviderProps> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider()
        signInWithPopup(auth, provider)
    }

    const createUser = async (email: string, password: string) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const signIn = async (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password)
    }

    const logOut = () => {
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log(currentUser);
            console.log(user);
            setUser(currentUser);
        });

        return () => {
            unsubscribe();
        }
    }, [user]);

    const contextValue: UserAuthContextValue = {
        createUser,
        logOut,
        user,
        signIn,
        googleSignIn,
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )
}

export const UserAuth = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("UserAuth must be used within a UserAuthContextProvider");
    }
    return context;
}
