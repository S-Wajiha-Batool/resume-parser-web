import React, { useContext, useEffect, useState } from 'react';
import {useLocation} from 'react-router-dom';
import '../UI/Sidebar.css';
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
import home_icon from '../images/home.png'
import JD_icon from '../images/job-description.png'
import CV_icon from '../images/cv.png'
import logout_icon from '../images/logout.png'
import menu_icon from '../images/menu.png'

const Sidebar = () => {
    const location = window.location.pathname;
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
            <div id="header">
                {/* collapsed props to change menu size using menucollapse state */}
                <ProSidebar collapsed={menuCollapse}>
                    <SidebarHeader>
                        {menuCollapse ?
                        <div className='heading' onClick={menuIconClick}>
                        <img className='menu-icon' src={menu_icon} alt='MENU'/>
                        </div> : 
                        <>
                        <div onClick={menuIconClick}></div>
                         <div className="logotext">
                            <p className='logotext'>Resume Parser</p>
                        </div>
                        </>}
                    </SidebarHeader>
                    <SidebarContent color='blue'>
                        <Menu>
                            <MenuItem className={location === '/' ? 'active' : ''} onClick={() => setMenuCollapse(true)} > 
                            <Link to='/'>
                                <img className='home-icon' src={home_icon} alt='Dashboard'/> 
                                <p className='text'>Dashboard</p>
                                </Link>
                            </MenuItem>
                            <MenuItem className={location.startsWith('/jd') ? 'active' : ''} onClick={() => setMenuCollapse(true)} >
                                <Link to='/jds'>
                            <img className='JD-icon' src={JD_icon} alt='JD'/>
                                <p className='text'>JDs</p>
                                </Link>
                                </MenuItem>
                            <MenuItem className={location.startsWith('/cv') ? 'active' : ''} onClick={() => setMenuCollapse(true)}>
                                <Link to='/cvs'>
                            <img className='CV-icon' src={CV_icon} alt='JD'/>
                                <p className='text'>CVs</p>
                                </Link>
                                </MenuItem>
                        </Menu>
                    </SidebarContent>
                    <SidebarFooter>
                        <Menu>
                            <MenuItem onClick={logoutUser}>
                            <img className='logout-icon' src={logout_icon} alt='JD'/>
                                <p className='text'>Logout</p>
                                </MenuItem>
                        </Menu>
                    </SidebarFooter>
                </ProSidebar>
            </div>
        
    );
};

export default Sidebar