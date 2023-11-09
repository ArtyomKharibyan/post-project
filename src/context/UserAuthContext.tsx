import React, {createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState} from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  UserCredential
} from "firebase/auth";
import {auth} from "../firebase/firebase";

interface UserAuthContextProviderProps {
	children: ReactNode;
}

interface UserAuthContextValue {
	createUser: (email: string, password: string) => Promise<UserCredential>;
	logOut: () => Promise<void>;
	user: User | null;
	signIn: (email: string, password: string) => Promise<UserCredential>;
	googleSignIn: () => Promise<UserCredential>;
	isAuth: boolean;
	setIsAuth: Dispatch<SetStateAction<boolean>>;
	profileData: UserProfile | null
	setProfileData: Dispatch<SetStateAction<UserProfile | null>>;
	profileId: number | undefined
	setProfileId: Dispatch<SetStateAction<number | undefined>>;
}

export const UserContext = createContext<UserAuthContextValue | undefined>(
  undefined
);

interface UserProfile {
	id: number;
	email: string;
	profileId: number;
	name: string;
	surname: string;
	avatarUrl: string;
	displayName: string
}

export const UserAuthContextProvider: React.FC<UserAuthContextProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth") === "true");
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [profileId, setProfileId] = useState<number | undefined>(profileData?.id);

  const googleSignIn = async (): Promise<UserCredential> => {
    const provider = new GoogleAuthProvider();
    setIsAuth(true);
    localStorage.setItem("isAuth", "true");

    try {
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const createUser = async (email: string, password: string) => {
    setIsAuth(true)
    localStorage.setItem("isAuth", "true");
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const signIn = async (email: string, password: string) => {
    setIsAuth(true)
    localStorage.setItem("isAuth", "true");
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logOut = () => {
    setIsAuth(false)
    localStorage.setItem("isAuth", "false");
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (profileData) {
      setProfileId(profileData.id);
    } else {
      setProfileId(undefined);
    }
  }, [profileData]);

  const contextValue: UserAuthContextValue = {
    createUser,
    logOut,
    user,
    signIn,
    googleSignIn,
    isAuth,
    setIsAuth,
    profileData,
    setProfileData,
    profileId,
    setProfileId,
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
