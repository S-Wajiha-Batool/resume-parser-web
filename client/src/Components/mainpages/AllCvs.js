import React, { useState, useContext, useEffect, useRef, createRef } from 'react';
import CvTable from '../utilities/CvTable';
import '../UI/allCvs.css';
import { GlobalState } from '../../GlobalState';
import { getAllCvsAPI } from '../../API/CVAPI'
import LoadingSpinner from '../utilities/LoadingSpinner';
import ParseCvsModal from '../utilities/ParseCvsModal';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import Title from '../utilities/Title';

function AllCvs() {
    const state = useContext(GlobalState);
    const [allCvs, setAllCvs] = state.CVAPI.allCvs;
    const [tableData, setTableData] = state.CVAPI.tableData;
    const [token] = state.UserAPI.token;
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [callbackCv, setCallbackCv] = state.CVAPI.callbackCv;
    const [showAddModal, setShowAddModal] = useState(false);
    const handleCloseAddModal = () => setShowAddModal(false);
    const handleShowAddModal = () => setShowAddModal(true);

    useEffect(() => {
        if (token) {
            const getallCVs = async () => {
                getAllCvsAPI(token)
                    .then(res => {
                        console.log(res.data)
                        setAllCvs(res.data.data.all_cvs)
                        console.log(allCvs)
                        setSuccess(true);
                        setTableData(res.data.data.all_cvs)
                    })
                    .catch(err => {
                        console.log(err.response.data.error.msg)
                        if (err.response.data.error.code == 500) {
                            showErrorToast("CV fetching failed")
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    })
            }
            getallCVs()
        }

    }, [token, callbackCv])

    return (
        isLoading ?
            <LoadingSpinner /> :
            success ?
                 <div className='cv-container'>
                    <div className='page-title'><Title title={"Resumes"} /></div>
                    <CvTable className='table' handleShowAddModal={handleShowAddModal}/>
                    <ParseCvsModal showAddModal={showAddModal} handleCloseAddModal={handleCloseAddModal} />
                </div>
                : "No Cvs found"
    )
}

export default AllCvs;
