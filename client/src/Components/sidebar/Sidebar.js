import React, { useContext, useEffect, useState } from 'react';
import '../UI/Sidebar.css'
import { HiMenuAlt3 } from "react-icons/hi";
import {IoIosMenu} from "react-icons/io";
import { MdOutlineDashboard } from "react-icons/md";
import { RiSettings4Line } from "react-icons/ri";
import { TbReportAnalytics } from "react-icons/tb";
import { AiOutlineUser, AiOutlineHeart } from "react-icons/ai";
import { FiMessageSquare, FiFolder, FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarContent, SidebarFooter, SidebarHeader } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { FaList, FaRegHeart } from "react-icons/fa";
import { FiHome, FiLogOut, FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";

const Sidebar = () => {
    const [menuCollapse, setMenuCollapse] = useState(true);
    const menuIconClick = () => {
        //condition checking to change state from true to false and vice versa
        menuCollapse ? setMenuCollapse(false) : setMenuCollapse(true);
    };

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
                            <MenuItem icon={<FiLogOut />}>Logout</MenuItem>
                        </Menu>
                    </SidebarFooter>
                </ProSidebar>
            </div>
        </>
    );
};

export default Sidebar