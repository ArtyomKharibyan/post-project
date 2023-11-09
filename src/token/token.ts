import {UserCredential} from "firebase/auth";

export const storeTokenInLocalStorage = async (userCredential: UserCredential) => {
  try {
    const idToken = await userCredential?.user.getIdToken(true);
    localStorage.setItem("token", idToken);
    return idToken;
  } catch (error) {
    console.error('Error storing token in localStorage:', error);
  }
};
