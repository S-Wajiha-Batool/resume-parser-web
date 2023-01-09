import React, { useContext } from 'react';
import { GlobalState } from './GlobalState'
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/mainpages/Login';
import HomePage from './Components/mainpages/HomePage';

function PageRoutes() {

  const state = useContext(GlobalState)

  const [isLogged, setIsLogged] = state.UserAPI.isLogged
  //const [isAdmin, setIsAdmin] = state.UserAPI.isAdmin

  return (
    <Routes>
      <Route path="/login" exact element={<Login />} />
      <Route path="/" exact element={<HomePage />} />
    </Routes>
  )
}

export default PageRoutes