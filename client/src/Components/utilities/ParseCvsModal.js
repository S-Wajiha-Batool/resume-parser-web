import React, { useState, useContext, useEffect, useRef } from 'react';
import * as fs from "fs";
import { useParams } from 'react-router-dom'
import { Modal, Tabs, Tab, Button, Spinner, Form, Col, Row } from 'react-bootstrap'
import { Checkbox, TextField, Autocomplete } from '@mui/material';
import { GlobalState } from '../../GlobalState';
import { parseCvsAPI } from '../../API/CVAPI';
import { getAllCvsAPI, matchCvsAPI } from '../../API/CVAPI';
import { showErrorToast, showSuccessToast } from './Toasts';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import '../UI/ParseCvsModal.css'
var FormData = require('form-data')

function ParseCvsModal({ showAddModal, handleCloseAddModal }) {
    console.log('here')
    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [allCvs, setAllCvs] = state.CVAPI.allCvs;
    const [callbackCv, setCallbackCv] = state.CVAPI.callbackCv;
    const [cvsPC, setCvsPC] = useState({ files: [] })
    const [cvsServer, setCvsServer] = useState([])
    const [isParsing, setIsParsing] = useState(false);
    const [loading, setIsLoading] = useState(true);
    const [callbackJdDetails, setCallbackJdDetails] = state.JDAPI.callbackJdDetails;
    const [parsedCvsFromAPI, setParsedCvsFromAPI] = useState([]);
    const [fileNamesPC, setFileNamesPC] = useState([]);
    const [scoresPC, setScoresPC] = useState([]);
    const [scoresServer, setScoresServer] = useState([]);
    const [parsingDonePC, setParsingDonePC] = useState(false);

    useEffect(() => {
        if (token) {
            const getAllCvs = async () => {
                getAllCvsAPI(token)
                    .then(res => {
                        console.log(res.data)
                        setAllCvs(res.data.data.all_cvs)
                    })
                    .catch(err => {
                        console.log(err.response.data.err.msg)
                        showErrorToast("Failed to fetch CVs. Please try again")
                    })
                    .finally(() => {
                        setIsLoading(false);
                    })
            }
            getAllCvs()
        }

    }, [token, callbackCv]);

    const handleUploadPC = async (e) => {
        e.preventDefault()
        let formdata = new FormData();
        for (let i = 0; i < cvsPC.files.length; i++) {
            formdata.append(`files`, cvsPC.files[i])
        }
        try {
            setIsParsing(true)
            await parseCvsAPI(formdata, token)
                .then(res => {
                    let cvss = res.data.data.cvs
                    setIsParsing(false);
                    setParsingDonePC(true);
                })
                .catch(err => {
                    console.log(err)
                    showErrorToast("Error in CV upload")
                    console.log(err.response.data.error.msg)
                    setIsParsing(false);
                })
                .finally(() => {
                    setCallbackCv(!callbackCv);
                })
        } catch (err) {
            console.log(err)
            showErrorToast("Error in CV upload")
            setIsParsing(false);
        }

    }

    const handleDisplayFileDetails = (e) => {
        setParsingDonePC(false)
        setCvsPC({ ...cvsPC, files: e.target.files });
    };

    const handleRemoveFilesFromPC = (index) => {
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
        setCvsPC({ ...cvsPC, files: input.files });
    }

    const getFileNamesFromPC = () => {
        let rows = [];
        for (let i = 0; i < cvsPC.files.length; i++) {
            rows.push(<div>
                <hr className='hori-line'/>
                <div className='file_row1'>
                <span>
                    {cvsPC.files[i].name}
                </span>
                {parsingDonePC && <span>
                    <DoneOutlinedIcon fontSize='small' />
                </span>}
                {!parsingDonePC && <span className='remove_action' onClick={() => handleRemoveFilesFromPC(i)}>
                    Remove
                </span>}
            </div>
            </div>)
        }
        return <div className='filename-box'>{rows}</div>
    }

    return (
        <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
            <Modal.Header>
                <Modal.Title>Upload CVs</Modal.Title>
                <button type="button" class="btn-close btn-close-white" aria-label="Close" onClick={handleCloseAddModal}></button>
            </Modal.Header>
            <Modal.Body className='body-modal'>
                <Form>
                    <Form.Group as={Col} md="12" controlId="photo">
                        <input
                            id='files'
                            type="file"
                            multiple
                            name="file"
                            style={{ display: "none" }}
                            onChange={handleDisplayFileDetails}
                            accept="application/pdf"
                        />
                        <div className="file-box">
                            <div className="file_row">
                                <span className='file-count'>
                                    {cvsPC.files.length == 0 && 'No files chosen'}
                                    {cvsPC.files.length == 1 && `1 file chosen`}
                                    {(cvsPC.files.length != 0 && cvsPC.files.length != 1) && `${cvsPC.files.length} files chosen`}

                                </span>
                                <span>
                                    <label htmlFor='files'>
                                        <a className={`upload-cv-btn custom-btn-sec btn btn-primary`}>Upload Files</a>
                                    </label>
                                </span>
                            </div>
                            {
                                getFileNamesFromPC()
                            }
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className='custom-btn done-btn' variant='primary' type='submit' disabled={parsingDonePC || isParsing || cvsPC.files.length == 0} onClick={!isParsing ? handleUploadPC : null}>
                    {isParsing && <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                    }
                    {isParsing ? " Parsing Cvs..." : "Done"}
                </Button>
            </Modal.Footer>

        </Modal>
    )
}

export default ParseCvsModal