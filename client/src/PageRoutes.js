import React, { useContext } from 'react';
import { GlobalState } from './GlobalState'
import { Routes, Route, Outlet } from 'react-router-dom';
import Login from './Components/mainpages/Login';
import HomePage from './Components/mainpages/HomePage';
import Header from './Components/header/Header';
import Footer from './Components/footer/Footer';
import JdDetails from './Components/mainpages/JdDetails';

const Layout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
  </>
);

function PageRoutes() {

  const state = useContext(GlobalState)

  const [isLogged, setIsLogged] = state.UserAPI.isLogged
  //const [isAdmin, setIsAdmin] = state.UserAPI.isAdmin

  return (
    <Routes>
      <Route path="/login" exact element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" exact element={<HomePage />} />
        <Route path="/jd/:id" exact element={<JdDetails />} />
      </Route>
    </Routes>
  )
}

export default PageRoutes