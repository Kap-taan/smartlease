import { createContext, useState, useEffect } from "react";
import app from '../data/firebase';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext({
    user: null,
    login: () => { },
    signup: () => { },
    logout: () => { }
});

export const AuthContextProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [additionalInfo, setAdditionalInfo] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    const auth = getAuth(app);

    const signup = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    }

    const addAdditionalInfo = (info) => {
        localStorage.setItem("additionalInfo", JSON.stringify(info));
        setAdditionalInfo(info);
    }

    const logout = () => {
        localStorage.removeItem(user.uid);
        localStorage.removeItem("additionalInfo");
        setAdditionalInfo(null);
        return signOut(auth);
    }

    useEffect(() => {
        if (localStorage.getItem('additionalInfo')) {
            setAdditionalInfo(JSON.parse(localStorage.getItem('additionalInfo')))
        }
    }, [])

    const context = {
        user,
        login,
        signup,
        logout,
        authReady,
        addAdditionalInfo,
        additionalInfo
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            setUser(user);
            setAuthReady(true);
        })

        return unsubscribe;

    }, [auth])

    return (
        <AuthContext.Provider value={context}>
            {authReady && children}
        </AuthContext.Provider>
    )
}

export default AuthContext;