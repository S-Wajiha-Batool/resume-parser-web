import React, { useState, useContext, useEffect, useRef, createRef } from 'react';
import CvTable from '../utilities/CvTable';
import '../UI/allCvs.css';
import { GlobalState } from '../../GlobalState';
import { getAllCvsAPI } from '../../API/CVAPI'
import LoadingSpinner from '../utilities/LoadingSpinner';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Container, Row, Col, Modal, Button } from 'react-bootstrap';

function AllCvs() {
    const state = useContext(GlobalState);
    const [allCvs, setAllCvs] = state.CVAPI.allCvs;
    const [tableData, setTableData] = state.CVAPI.tableData;
    const [token] = state.UserAPI.token;
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [callbackCv, setCallbackCv] = state.CVAPI.callbackCv;

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
                <> <Container>
                    <div className='text4'>
                            <CvTable
                                className='table'
                            />
                    </div>
                </Container>
                </>
                : "No Jds found"
    )
}

export default AllCvs;
