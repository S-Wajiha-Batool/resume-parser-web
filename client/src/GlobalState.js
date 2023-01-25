import React, { createContext, useState, useEffect } from 'react'
import UserAPI from './API/UserAPI'
import JDAPI from './API/JDAPI'

export const GlobalState = createContext()

export const DataProvider = ({ children }) => {

    const state = {
        UserAPI: UserAPI(),
        JDAPI: JDAPI()
    }
    return (
        <GlobalState.Provider value={state}>
            {children}
        </GlobalState.Provider>
    )
}
