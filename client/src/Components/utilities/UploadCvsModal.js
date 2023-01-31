import React, { useState, useContext, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'
import { Modal, Tabs, Tab, Button, Spinner, Form, Col, Row } from 'react-bootstrap'
import { GlobalState } from '../../GlobalState';
import { parseCvsAPI } from '../../API/CVAPI';
import { showErrorToast } from './Toasts';
import '../UI/UploadCvsModal.css'
var FormData = require('form-data')

function UploadCvsModal({ showModal, handleCloseModal }) {

    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [cvs, setCvs] = useState({ files: [] })
    const [isParsing, setIsParsing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isUploadingCvs, setIsUploadingCvs] = useState(false);
    const inputRef = useRef();
    const { id } = useParams()


    const handleSubmit = (e) => {
        e.preventDefault()
        let formdata = new FormData();
        for (let i = 0; i < cvs.files.length; i++) {
            formdata.append(`files`, cvs.files[i])
        }
        try {
            setIsParsing(true)
            parseCvsAPI(formdata, token)
                .then(res => {
                    console.log(res.data)
                    //setJd(res.data.data.jd)
                    //console.log(jd)
                    //setSuccess(true);
                })
                .catch(err => {
                    console.log(err)
                    showErrorToast(err.response.data.error.msg)
                })
                .finally(() => {
                    setIsParsing(false);
                })
        } catch (err) {
            showErrorToast(err)
        }
    }

    const onFileChange = (e) => {
        console.log("upload")
        inputRef.current.click();
    };


    const handleDisplayFileDetails = (e) => {
        inputRef.current?.files &&
            setCvs({ ...cvs, files: e.target.files });
    };

    const handleRemoveFiles = (index) => {
        console.log('in')

        const dt = new DataTransfer()
        const input = document.getElementById('files')
        const { files } = input
        console.log('in files', files)

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            if (index !== i)
                dt.items.add(file) // here you exclude the file. thus removing it.
        }
        input.files = dt.files
        console.log(input.files)
        setCvs({ ...cvs, files: input.files });

    }

    const getFileNames = () => {
        let rows = [];
        for (let i = 0; i < cvs.files.length; i++) {
            rows.push(<div className='file_row'>
                <span>
                    {cvs.files[i].name}
                </span>
                <span className='remove_action' onClick={() => handleRemoveFiles(i)}>
                    Remove
                </span>
            </div>)
        }
        return <div>{rows}</div>
    }
    return (
        <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
                <Modal.Title>Upload CVs</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs
                    defaultActiveKey="pc"
                    id="justify-tab-example"
                    className="mb-3"
                    justify
                >
                    <Tab eventKey="pc" title="From PC">
                        <Form>
                            <Form.Group as={Col} md="12" controlId="photo">
                                <input
                                    id='files'
                                    type="file"
                                    ref={inputRef}
                                    multiple
                                    name="file"
                                    style={{ display: "none" }}
                                    onChange={handleDisplayFileDetails}
                                    accept="application/msword, application/pdf"
                                />
                                <div className="file-box">
                                    <Button type="button" onClick={onFileChange}>
                                        Upload File
                                    </Button>
                                    {
                                        getFileNames()
                                    }

                                    {/* {
                                            cvs.files.length !==0 && cvs.files.map((file, index) => {
                                                <div style={{ paddingLeft: "10px", marginTop: "5px" }}>
                                            {file.name}
                                        </div>
                                            })
                                        } */}

                                </div>
                            </Form.Group>
                        </Form>
                    </Tab>
                    <Tab eventKey="server" title="From Server">
                        hh
                    </Tab>

                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='primary' type='submit' disabled={isParsing} onClick={!isParsing ? handleSubmit : null}>
                    {isParsing && <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />}
                    {isParsing ? " Parsing Cvs..." : "Done"}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default UploadCvsModal