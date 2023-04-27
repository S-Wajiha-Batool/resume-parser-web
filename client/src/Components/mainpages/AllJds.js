import React, { useState, useContext, useEffect, useRef, createRef } from 'react';
import JdTable from '../utilities/JdTable';
import '../UI/AllJds.css';
import { GlobalState } from '../../GlobalState';
import { getAllJdsAPI } from '../../API/JDAPI'
import LoadingSpinner from '../utilities/LoadingSpinner';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import UploadJdModal from '../utilities/UploadJdModal';
const FormData = require('form-data');


function AllJds() {
    const state = useContext(GlobalState);
    const [allJDs, setAllJDs] = state.JDAPI.allJDs;
    const [tableData, setTableData] = state.JDAPI.tableData
    const [token] = state.UserAPI.token;
    console.log(allJDs)
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    console.log('loading: ' + isLoading);
    console.log('success: ' + success);
    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);
    
    // for upload jd ----
    const inputRef = useRef();
    const [callbackJd, setCallbackJd] = state.JDAPI.callbackJd;

    const [jd, setJd] = useState({ position: "", department: "HR", file: null })
    const [uploadedFileName, setUploadedFileName] = useState(null);

    useEffect(() => {
        if (token) {
            const getAllJds = async () => {
                try{
                    getAllJdsAPI(token)
                    .then(res => {
                        console.log(res.data)
                        setAllJDs(res.data.data.all_jds)
                        console.log(allJDs)
                        setSuccess(true);
                        setTableData(res.data.data.all_jds)
                    })
                    .catch(err => {
                        console.log(err.response.data.error.msg)
                        if (err.response.data.error.code == 500) {
                        showErrorToast("JD fetching failed")
                    }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    })
                }
                catch(err){
                    console.log(err)
                    showErrorToast("JD fetching failed")
                }
                
            }
            getAllJds()
        }

    }, [token, callbackJd])

    return (
        isLoading ?
          <LoadingSpinner /> :
          success ?
            <div className="jd-list-container">
              <div className="jd-list-header">
                <h1 className="jd-list-title">Job Descriptions</h1>
                <Button className="jd-list-upload-btn" onClick={handleShowModal}>Add JD</Button>
              </div>
              <JdTable className="jd-list-table" data={allJDs} handleShowModal={handleShowModal} />
              <UploadJdModal className="jd-list-upload-modal" showModal={showModal} handleCloseModal={handleCloseModal} />
            </div>
            : "No Jds found"
      )
    }

export default AllJds;
