import React, { useState, useContext, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'
import { Modal, Tabs, Tab, Button, Spinner, Form, Col, Row } from 'react-bootstrap'
import { Checkbox, TextField, Autocomplete } from '@mui/material';
import { GlobalState } from '../../GlobalState';
import { parseCvsAPI } from '../../API/CVAPI';
import { getCvsAPI } from '../../API/CVAPI';
import { showErrorToast } from './Toasts';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import '../UI/UploadCvsModal.css'
var FormData = require('form-data')

function UploadCvsModal({ showModal, handleCloseModal }) {

    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [allCvs, setAllCvs] = state.CVAPI.allCvs;
    const [callback, setCallback] = state.CVAPI.callback;
    const [cvs, setCvs] = useState({ files: [] })
    const [cvsServer, setCvsServer] = useState([])
    const [isParsing, setIsParsing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loading, setIsLoading] = useState(true);
    const [isUploadingCvs, setIsUploadingCvs] = useState(false);
    const inputRef = useRef();
    const { id } = useParams()
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    console.log(Object.values(Object.values(allCvs)))
    var selectedOld = [];
    const getFileName = async (option) => {
        //console.log('../../../../server/uploaded_CVs/' + option.cv_path.replace(/^.*[\\\/]/, ''));
        return '../../../../server/uploaded_CVs/' + option.cv_path.replace(/^.*[\\\/]/, '')
    };

    useEffect(() => {
        if (token) {
            const getAllCvs = async () => {
                getCvsAPI(token)
                    .then(res => {
                        console.log(res.data)
                        setAllCvs(res.data.data.all_cvs)
                    })
                    .catch(err => {
                        console.log(err)
                        showErrorToast(err.response.data.error.msg)
                    })
                    .finally(() => {
                        setIsLoading(false);
                    })
            }
            getAllCvs()
        }

    }, [token, callback]);

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
                    setCallback(!callback);
                })
        } catch (err) {
            showErrorToast(err)
        }
    }

    const onFileChangeFromPC = (e) => {
        inputRef.current.click();
    };

    const onFileChangeFromServer = (option) => {
        console.log('in', option);
        setCvsServer(option)
    }

    const handleDisplayFileDetails = (e) => {
        inputRef.current?.files &&
            setCvs({ ...cvs, files: e.target.files });
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
        setCvs({ ...cvs, files: input.files });

    }

    const handleRemoveFilesFromServer = (file) => {
        setCvsServer(cvs => cvs.filter(item => item._id !== file._id))
    }

    const getFileNamesFromPC = () => {
        let rows = [];
        for (let i = 0; i < cvs.files.length; i++) {
            rows.push(<div className='file_row'>
                <span>
                    {cvs.files[i].name}
                </span>
                <span className='remove_action' onClick={() => handleRemoveFilesFromPC(i)}>
                    Remove
                </span>
            </div>)
        }
        return <div>{rows}</div>
    }

    const getFileNamesFromServer = () => {
        let rows = [];
        for (let i = 0; i < cvsServer.length; i++) {
            rows.push(<div className='file_row'>
                <span>
                    {cvsServer[i].cv_original_name}
                </span>
                <span className='remove_action' onClick={() => handleRemoveFilesFromServer(cvsServer[i])}>
                    Remove
                </span>
            </div>)
        }
        return <div>{rows}</div>
    }

    const resetCvsOnClickingView = (option) => {
        //var contains = false;
        var contains = cvsServer.includes(option);
        console.log(contains)
        if (contains) {
            cvsServer.push(option)
        }
        else {
            console.log('inn', cvsServer)
            cvsServer.push(option)
            setCvsServer(cvs => cvs.filter(item => item._id !== option._id))

        }
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
                                    <div className="file_row">
                                        <span>
                                            {cvs.files.length == 0 && 'No files chosen'}
                                            {cvs.files.length != 0 && `${cvs.files.length} files chosen`}
                                        </span>
                                        <span><Button type="button" onClick={onFileChangeFromPC}>
                                            Upload File
                                        </Button>
                                        </span>
                                    </div>
                                    {
                                        getFileNamesFromPC()
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
                        <Row>
                          
                        {!loading && <Autocomplete
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            multiple
                            id="checkboxes-tags-demo"
                            size="small"
                            value={cvsServer || null}
                            options={allCvs}
                            disableCloseOnSelect
                            getOptionLabel={(option) => option._id}
                            //onChange={onChangeUniversities}
                            //id="disable-clearable"
                            disableClearable
                            renderTags={() => null}
                            onChange={(event, newValue) => {
                                console.log(newValue)
                                onFileChangeFromServer(newValue)
                            }}
                            renderOption={(props, option, { selected }) => (
                                <li {...props}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {console.log(selected)}
                                    <div>{option.cv_original_name}
                                    </div>
                                    <a onClick={() => resetCvsOnClickingView(option)} href={require(`../../../../server/uploaded_CVs/${option.cv_path.replace(/^.*[\\\/]/, '')}`)} target="_blank"
                                        rel="noreferrer">View
                                    </a>
                                </li>
                            )}
                            style={{ width: 500 }}
                            renderInput={(params) => (
                                <TextField required {...params} placeholder="Cvs" />
                            )}
                        />}
                          </Row>
                        {
                            getFileNamesFromServer()
                        }
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