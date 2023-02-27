import React, { useContext,useEffect } from 'react';
import { GlobalState } from './GlobalState'
import { Routes, Route, Outlet, Navigate , useNavigate} from 'react-router-dom';
import Login from './Components/mainpages/Login';
import AllJds from './Components/mainpages/AllJds';
import Header from './Components/header/Header';
import Footer from './Components/footer/Footer';
import JdDetails from './Components/mainpages/JdDetails';
import CvDetails from './Components/mainpages/CvDetails';

const Layout = () => (
  <>
    <Header />
    <Outlet/>
    <Footer />
  </>
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
      <Route element={<Layout />}>
        <Route path="/" exact element={isLogged ? <AllJds /> : <Navigate to="/login" />} />
        <Route path="/jd/:id" exact element={isLogged ? <JdDetails /> : <Navigate to="/login" />} />
        <Route path="/cv/:id" exact element={isLogged ? <CvDetails /> : <Navigate to="/login" />} />
      </Route>
    </Routes>
  )
  
}

export default PageRoutes