import React, { createContext, useState, useEffect } from 'react'
import UserAPI from './API/UserAPI'
import JDAPI from './API/JDAPI'
import CVAPI from './API/CVAPI'

export const GlobalState = createContext()

export const DataProvider = ({ children }) => {

    const state = {
        UserAPI: UserAPI(),
        JDAPI: JDAPI(),
        CVAPI: CVAPI()
    }
    return (
        <GlobalState.Provider value={state}>
            {children}
        </GlobalState.Provider>
    )
}
