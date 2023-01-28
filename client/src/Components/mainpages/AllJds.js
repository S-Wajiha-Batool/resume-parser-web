import React, { useState, useContext, useEffect, useRef } from 'react';
import ReusableTable from '../utilities/ReuseableTable';
import '../UI/AllJds.css';
import { useNavigate } from 'react-router-dom';
import { GlobalState } from '../../GlobalState';
import { getAllJdsAPI, addJdAPI} from '../../API/JDAPI'
import LoadingSpinner from '../utilities/LoadingSpinner';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Container, Row, Col, Modal, Button, Form } from 'react-bootstrap';
import UploadJdModal from '../utilities/UploadJdModal';
const FormData = require('form-data');

function AllJds() {

    const state = useContext(GlobalState);
    const [allJDs, setAllJDs] = state.JDAPI.allJDs;
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
    console.log(jd)
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

    }, [token])

    return (
        isLoading ? <LoadingSpinner /> :
            success ?
                <> <Container>
                    <Row>
                        <Col><h1 className='heading-h1'>Job Descriptions</h1></Col>
                        <Col><Button onClick={handleShowModal}>Add JD</Button></Col>
                    </Row>
                    <div>
                        {allJDs.length !== 0 &&
                            <ReusableTable
                                className='table'
                                data={allJDs}
                            />}

                        {allJDs.length === 0 &&
                            <div>No JDs found</div>}
                    </div>
                </Container>
                <UploadJdModal showModal={showModal} handleCloseModal={handleCloseModal}/>
                    {/* <Modal show={show} onHide={handleClose}>
                        <Form onSubmit={handleSubmit}>
                            <Modal.Header closeButton>
                                <Modal.Title>Add Job Description</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Form.Group >
                                    <Form.Label>Position</Form.Label>
                                    <Form.Control type='text'
                                        name='position'
                                        placeholder='Position'
                                        value={jd.position}
                                        required
                                        onChange={onChangeInput} />
                                </Form.Group>
                                <br />
                                <Form.Group>
                                    <Form.Label>
                                        Department</Form.Label>
                                    <select className="form-control"
                                        name='department'
                                        value={jd.department}
                                        onChange={onChangeInput}>
                                        {departments.map((d, key) => {
                                            return <option className='option' key={key} value={d}>{d}</option>;
                                        })}
                                    </select>
                                </Form.Group>

                                <br />
                                <Form.Group>
                                    // <label className='mainLabel'> File</label>
                                //<div className=''>FileName</div>
                                //<input className='file_up' type='file' name='file' required accept='image/*' onChange={onFileChange("file")}></input> 
                                    <input
                                        ref={inputRef}
                                        required
                                        onChange={handleDisplayFileDetails}
                                        className="d-none"
                                        type="file"
                                        accept="application/msword, application/pdf"
                                    />
                                    <Button
                                        name='file'
                                        onClick={onFileChange}
                                        variant={`outline-${uploadedFileName ? "success" : "primary"
                                            }`}
                                    >
                                        {uploadedFileName ? uploadedFileName : "Upload"}
                                    </Button>
                                </Form.Group>

                                <Form.Group as={Col} md="12" controlId="photo">
                                    <input
                                        type="file"
                                        ref={inputRef}
                                        name="file"
                                        style={{ display: "none" }}
                                        onChange={handleDisplayFileDetails}
                                        accept="application/msword, application/pdf"
                                    />
                                    <div className="file-box">
                                        <Button type="button" onClick={onFileChange}>
                                            Upload File
                                        </Button>
                                        <span style={{ paddingLeft: "10px", marginTop: "5px" }}>
                                            {uploadedFileName}
                                        </span>
                                    </div>
                                </Form.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button className='primary-button' type='submit' onClick={handleSubmit}>
                                    DONE
                                </Button>
                            </Modal.Footer>
                        </Form>

                    </Modal> */}
                </>
                : "No Jds found"
    )
}

export default AllJds;
