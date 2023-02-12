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
//import samplePDF1 from '../../../../server/uploaded_CVs/1675098578460.pdf'
var FormData = require('form-data')

function UploadCvsModal({ showModal, handleCloseModal }) {

    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [allCvs, setAllCvs] = state.CVAPI.allCvs;
    const [callback, setCallback] = state.CVAPI.callback;
    const [cvs, setCvs] = useState({ files: [] })
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
        return  '../../../../server/uploaded_CVs/' + option.cv_path.replace(/^.*[\\\/]/, '')
    };

    useEffect (() => {
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

                        {!loading && <Autocomplete
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            multiple
                            id="checkboxes-tags-demo"
                            size="small"
                            options={allCvs}
                            disableCloseOnSelect
                            getOptionLabel={(option) => option._id}
                            //onChange={onChangeUniversities}
                            //id="disable-clearable"
                            disableClearable
                            
                            renderTags={() => null}
                            onChange={(event, newValue) => {
                                console.log(newValue)
                            }}
                            renderOption={(props, option, { selected }) => (
                                <li {...props}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}                                        
                                    />
                                    {console.log(props)}
                                    <div>{option.cv_original_name}
                                    </div>
                                    <a href={require(`../../../../server/uploaded_CVs/${option.cv_path.replace(/^.*[\\\/]/, '')}`)} target="_blank"
                                        rel="noreferrer">View    
                                    </a>
                                </li>
                            )}
                            style={{ width: 500 }}
                            renderInput={(params) => (
                                <TextField required {...params} placeholder="Universities" />
                            )}
                        />}
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