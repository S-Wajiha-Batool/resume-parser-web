import React, { useContext, useEffect, useState } from 'react';
import '../UI/Sidebar.css'
import { logoutAPI } from '../../API/UserAPI';
import { GlobalState } from '../../GlobalState';
import {IoIosMenu} from "react-icons/io";
import { Link } from "react-router-dom";
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarContent, SidebarFooter, SidebarHeader } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { FaList, FaRegHeart } from "react-icons/fa";
import { FiHome, FiLogOut, FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import { showErrorToast, showSuccessToast } from '../utilities/Toasts';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const [menuCollapse, setMenuCollapse] = useState(true);
    const menuIconClick = () => {
        //condition checking to change state from true to false and vice versa
        menuCollapse ? setMenuCollapse(false) : setMenuCollapse(true);
    };
    const state = useContext(GlobalState);
    const [isLogged, setIsLogged] = state.UserAPI.isLogged;
    const [token, setToken] = state.UserAPI.token;
    const navigate = useNavigate();


    const logoutUser = (e) => {
        e.preventDefault()
        logoutAPI(token)
            .then(res => {
                console.log(res.data)
                setIsLogged(false);
                setToken(false);
                localStorage.removeItem('firstLogin');
                navigate('/login');
                showSuccessToast("Logged out successfully")
            })
            .catch(err => {
                console.log(err.response.data.error.msg)
                if (err.response.data.error.code == 500) {
                    showErrorToast("Logout Failed")
                }
            })
      }

    return (
        <>
            <div id="header">
                {/* collapsed props to change menu size using menucollapse state */}
                <ProSidebar collapsed={menuCollapse}>
                    <SidebarHeader>
                        {menuCollapse ? <div className='heading' onClick={menuIconClick}><IoIosMenu /></div> : 
                        <>
                        <div onClick={menuIconClick}><IoIosMenu /></div>
                         <div className="logotext">
                            <p>Resume Parser</p>
                        </div>
                        </>}
                    </SidebarHeader>
                    <SidebarContent>
                        <Menu iconShape="square">
                            <MenuItem onClick={() => setMenuCollapse(true)} icon={<FiHome />}>
                                <Link to="/" />
                                Dashboard
                            </MenuItem>
                            <MenuItem onClick={() => setMenuCollapse(true)} icon={<FaList />}>Jds
                                <Link to="/jds" /></MenuItem>
                            <MenuItem onClick={() => setMenuCollapse(true)} icon={<FaRegHeart />}>Cvs
                                <Link to="/cvs" /></MenuItem>
                        </Menu>
                    </SidebarContent>
                    <SidebarFooter>
                        <Menu iconShape="square">
                            <MenuItem icon={<FiLogOut />} onClick={logoutUser}>Logout</MenuItem>
                        </Menu>
                    </SidebarFooter>
                </ProSidebar>
            </div>
        </>
    );
};

export default Sidebar