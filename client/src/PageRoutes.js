import React, { useContext, useEffect } from 'react';
import { GlobalState } from './GlobalState'
import { Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import Login from './Components/mainpages/Login';
import ResetPassword from './Components/mainpages/ResetPassword';
import AllJds from './Components/mainpages/AllJds';
import AllCvs from './Components/mainpages/AllCvs';
import Header from './Components/header/Header';
import Footer from './Components/footer/Footer';
import JdDetails from './Components/mainpages/JdDetails';
import CvDetails from './Components/mainpages/CvDetails';
import Dashboard from './Components/mainpages/Dashboard';
import Sidebar from './Components/sidebar/Sidebar'

const Layout = () => (
  <div style={({ height: "100vh", position: 'inherit'})}>
    <Sidebar />
    <div style={{
      marginLeft: "100px"
    }}><Outlet /></div>

  </div>
);

function PageRoutes() {
  const state = useContext(GlobalState)
  //const [isLogged, setIsLogged] = state.UserAPI.isLogged
  const isLogged = localStorage.getItem('firstLogin')
  console.log(isLogged)
  //const [isAdmin, setIsAdmin] = state.UserAPI.isAdmin
  const navigate = useNavigate()

  return (
    <Routes>
      <Route path="/login" exact element={isLogged ? <Navigate to="/" /> : <Login />} />
      <Route path="/reset-password" exact element={isLogged ? <Navigate to="/"/> : <ResetPassword />} />
      <Route element={<Layout />}>
        <Route path="/" exact element={isLogged ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/jds" exact element={isLogged ? <AllJds /> : <Navigate to="/login" />} />
        <Route path="/cvs" exact element={isLogged ? <AllCvs /> : <Navigate to="/login" />} />
        <Route path="/jd/:id" exact element={isLogged ? <JdDetails /> : <Navigate to="/login" />} />
        <Route path="/cv/:id" exact element={isLogged ? <CvDetails /> : <Navigate to="/login" />} />
      </Route>
    </Routes>
  )
}

export default PageRoutes