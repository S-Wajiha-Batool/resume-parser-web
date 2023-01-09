import React, { createContext, useState, useEffect } from 'react'
import UserAPI from './API/UserAPI'

export const GlobalState = createContext()

export const DataProvider = ({ children }) => {

    const state = {
        UserAPI: UserAPI(),
    }
    return (
        <GlobalState.Provider value={state}>
            {children}
        </GlobalState.Provider>
    )
}
