import React, { useState, useContext, useEffect, useRef, createRef } from 'react';
import JdTable from '../utilities/JdTable';
import '../UI/AllJds.css';
import { GlobalState } from '../../GlobalState';
import { getAllJdsAPI, addJdAPI } from '../../API/JDAPI'
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
    const [callback, setCallback] = state.JDAPI.callback;

    const [jd, setJd] = useState({ position: "", department: "HR", file: null })
    const [uploadedFileName, setUploadedFileName] = useState(null);

    const departments = ["HR", "IT", "Finance", "Marketing", "Software Engineering"]

    const onFileChange = (e) => {
        console.log("upload")
        inputRef.current.click();
    };

    const onChangeInput = e => {
        const { name, value } = e.target;
        setJd({ ...jd, [name]: value })
    }

    const handleDisplayFileDetails = (e) => {
        inputRef.current?.files &&
            setUploadedFileName(inputRef.current.files[0].name);
        setJd({ ...jd, file: e.target.files });
    };

    const handleSubmit = (e) => {
        console.log('in submit')
        e.preventDefault()
        let formData = new FormData();
        formData.append('position', jd.position);
        formData.append('department', jd.department);
        formData.append('file', jd.file[0]);

        addJdAPI(formData, token)
            .then(res => {
                console.log(res.data)
                showSuccessToast(res.data.data.msg);
                setCallback(!callback)
                setShowModal(false)
            })
            .catch(err => {
                //console.log(err.response.data)
                //alert(err.response.data.error.msg)
                showErrorToast(err.response.data.error.msg)
            })

    }

    //------
    useEffect(() => {
        if (token) {
            const getAllJds = async () => {
                getAllJdsAPI(token)
                    .then(res => {
                        console.log(res.data)
                        setAllJDs(res.data.data.all_jds)
                        console.log(allJDs)
                        setSuccess(true);
                        setTableData(res.data.data.all_jds)
                    })
                    .catch(err => {
                        console.log(err.response.data)
                        showErrorToast(err.response.data.error.msg)
                    })
                    .finally(() => {
                        setIsLoading(false);
                    })
            }
            getAllJds()
        }

    }, [token, callback])

    return (
        isLoading ?
            <LoadingSpinner /> :
            success ?
                <> <Container>
                    <Row >
                        {/* <Col><h3>Job Descriptions</h3></Col>
                        <Col className='uploadJd_btn'><Button onClick={handleShowModal}>Add JD</Button></Col> */}
                    </Row>
                    <div>
                            <JdTable
                                className='table'
                                data={allJDs}
                                handleShowModal={handleShowModal}
                            />
                    </div>
                </Container>
                    <UploadJdModal showModal={showModal} handleCloseModal={handleCloseModal} />
                </>
                : "No Jds found"
    )
}

export default AllJds;
