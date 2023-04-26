import React, { createContext, useEffect, useState } from "react";

const SocietyContext = createContext({
    selectedSociety: null,
    addSelectedSociety: () => { }
})

export const SocietyContextProvider = ({ children }) => {

    const [selectedSociety, setSelectedSociety] = useState(null);

    const addSelectedSociety = (society) => {
        localStorage.setItem("selectedSociety", JSON.stringify(society));
        setSelectedSociety(society);
    }

    const removeSelectedSociety = () => {
        localStorage.removeItem("selectedSociety");
        setSelectedSociety(null);
    }

    const context = {
        selectedSociety, addSelectedSociety, removeSelectedSociety
    }

    useEffect(() => {
        if (localStorage.getItem("selectedSociety")) {
            setSelectedSociety(JSON.parse(localStorage.getItem("selectedSociety")))
        }
    }, [])

    return (
        <SocietyContext.Provider value={context}>
            {children}
        </SocietyContext.Provider>
    )
}

export default SocietyContext;