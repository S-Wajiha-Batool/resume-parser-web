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
import '../UI/UploadCvsModal.css'
var FormData = require('form-data')

function UploadCvsModal({ jd, showModal, handleCloseModal, tableRef }) {
    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [allCvs, setAllCvs] = state.CVAPI.allCvs;
    const [callbackCv, setCallbackCv] = state.CVAPI.callbackCv;
    const [cvsPC, setCvsPC] = useState({ files: [] })
    const [cvsServer, setCvsServer] = useState([])
    const [isParsing, setIsParsing] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [loading, setIsLoading] = useState(true);
    const [callbackJdDetails, setCallbackJdDetails] = state.JDAPI.callbackJdDetails;
    const [parsedCvsFromAPI, setParsedCvsFromAPI] = useState([]);
    const [fileNamesPC, setFileNamesPC] = useState([]);
    const [scoresPC, setScoresPC] = useState([]);
    const [scoresServer, setScoresServer] = useState([]);
    const [matchingDonePC, setMatchingDonePC] = useState(false);
    const [matchingDoneServer, setMatchingDoneServer] = useState(false);
    const [fileLimit, setFileLimit] = useState(false);
    const inputRef = useRef();
    const { id } = useParams()
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    const path = require('path');
    const unoconv = require('awesome-unoconv');
    console.log('cvsserver', cvsServer)

    useEffect(() => {
        if (token) {
            const getAllCvs = async () => {
                getAllCvsAPI(token)
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

    }, [token, callbackCv]);

    // useEffect(() => {
    //     console.log('inuseeffect')
    //     try {
    //         setIsMatching(true)
    //         console.log(parsedCvsFromAPI)
    //         matchCvsAPI(jd, parsedCvsFromAPI, token)
    //             .then(res => {
    //                 console.log(res.data)
    //                 setIsMatching(false);
    //                 setScoresPC(res.data.data);
    //                 setCallbackJdDetails(!callbackJdDetails)
    //             })
    //             .catch(err => {
    //                 console.log(err.response.data.error.msg)
    //                 if (err.response.data.error.code == 500) {
    //                     showErrorToast("CV Matching failed")
    //                 }
    //             })
    //             .finally(() => {
    //                 setMatchingDonePC(true)
    //                 this.tableRef.current.onQueryChange();
    //             })
    //     } catch (err) {
    //         showErrorToast(err)
    //     };
    // },[parsedCvsFromAPI])

    const getPdf = (file_path) => {
        const mimetype = file_path.split(".")[1];
        // if(mimetype === 'pdf'){
        //     return require(`../../../../server/uploaded_CVs/${file_path.replace(/^.*[\\\/]/, '')}`)
        // }
        // else{

        // }

        const sourceFilePath = path.resolve('./word_file.docx');
        const outputFilePath = path.resolve('./myDoc.pdf');
        unoconv
            .convert(sourceFilePath, outputFilePath)
            .then(result => {
                console.log(result); // return outputFilePath
                return outputFilePath
            })
            .catch(err => {
                console.log(err);
            });
    }

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
                    //console.log(res.data.data.cvs)
                    //setParsedCvsFromAPI(res.data.data.cvs)
                    let cvss = res.data.data.cvs
                    setIsParsing(false);
                    setIsMatching(true)
                    matchCvsAPI(jd, cvss, token)
                        .then(res => {
                            console.log(res.data)
                            setIsMatching(false);
                            setMatchingDonePC(true)
                            setScoresPC(res.data.data)
                        })
                        .catch(err => {
                            console.log(err.response.data.error.msg)
                            if (err.response.data.error.code == 500) {
                                showErrorToast("CV Matching failed")
                            }
                            setIsMatching(false);
                            setMatchingDonePC(false)
                        })
                        .finally(() => {
                            setCallbackJdDetails(!callbackJdDetails)
                            showSuccessToast("CVs uploaded successfully")
                        })
                })
                .catch(err => {
                    console.log(err)
                    showErrorToast(err.response.data.error.msg)
                    setIsParsing(false);
                    setIsMatching(false);
                })
                .finally(() => {
                    setCallbackCv(!callbackCv);

                })
        } catch (err) {
            console.log(err)
            showErrorToast("Error in CV upload")
            setIsParsing(false);
            setIsMatching(false);
        }

    }

    const handleUploadServer = (e) => {
        e.preventDefault()
        try {
            setIsMatching(true)
            matchCvsAPI(jd, cvsServer, token)
                .then(res => {
                    console.log(res.data)
                    setScoresServer(res.data.data)
                    setCallbackJdDetails(!callbackJdDetails)
                    setMatchingDoneServer(true)
                })
                .catch(err => {
                    console.log(err)
                    showErrorToast(err.response.data.error.msg)
                    setIsMatching(false);
                })
                .finally(() => {
                    setCallbackCv(!callbackCv);
                    setIsMatching(false);
                    this.tableRef.current.onQueryChange();
                })
        } catch (err) {
            showErrorToast(err)
            setIsMatching(false);
        }
    }

    const onFileChangeFromServer = (option) => {
        setMatchingDoneServer(false)
        setCvsServer(option)
    }

    const handleDisplayFileDetails = (e) => {
        setMatchingDonePC(false)
        // const files = Array.prototype.slice.call(e.target.files)
        // const uploaded = [...cvsPC.files]
        // console.log(uploaded);
        // var MAX_COUNT = 5
        // let limitExceeded = false;
        // files.some((file) => {
        //     if (uploaded.findIndex((f) => f.name === file.name) === -1) {
        //         uploaded.push(file);
        //         if (uploaded.length === MAX_COUNT) setFileLimit(true);
        //         if (uploaded.length > MAX_COUNT) {
        //             showErrorToast(`You can only add a maximum of ${MAX_COUNT} files`);
        //             setFileLimit(false);
        //             limitExceeded = true;
        //             return true;
        //         }
        //     }
        // })
        // if (!limitExceeded){
        //     setCvsPC({ ...cvsPC, files: uploaded });
        // }

        // const input = document.getElementById('files')
        // input.value = cvsPC.files;
        // inputRef.current?.files &&
        //     setCvsPC({ ...cvsPC, files: e.target.files });

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

    const handleRemoveFilesFromServer = (file) => {
        setCvsServer(cvsPC => cvsPC.filter(item => item._id !== file._id))
    }


    const getFileNamesFromPC = () => {
        let rows = [];
        for (let i = 0; i < cvsPC.files.length; i++) {
            rows.push(<div className='file_row1'>
                <span>
                    {cvsPC.files[i].name}
                </span>
                {matchingDonePC && <span>
                    {scoresPC[i]}
                </span>}
                {!matchingDonePC && <span className='remove_action' onClick={() => handleRemoveFilesFromPC(i)}>
                    Remove
                </span>}
            </div>)
        }
        return <div className='filename-box'>{rows}</div>
    }

    const getFileNamesFromServer = () => {
        let rows = [];
        for (let i = 0; i < cvsServer.length; i++) {
            rows.push(<div className='file_row1'>
                <span>
                    {cvsServer[i].cv_original_name}
                </span>
                {matchingDoneServer && <span>
                    {scoresServer[i]}
                </span>}
                {!matchingDoneServer && <span className='remove_action' onClick={() => handleRemoveFilesFromServer(cvsServer[i])}>
                    Remove
                </span>}
            </div>)
        }
        return <div>{rows}</div>
    }

    const resetCvsPCOnClickingView = (option) => {
        //var contains = false;
        var contains = cvsServer.includes(option);
        console.log(contains)
        if (contains) {
            cvsServer.push(option)
        }
        else {
            console.log('inn', cvsServer)
            cvsServer.push(option)
            setCvsServer(cvsPC => cvsPC.filter(item => item._id !== option._id))

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
                    id="cv_tab"
                    className="mb-3"
                    justify
                >
                    <Tab eventKey="pc" title="From PC">
                        <Form>
                            <Form.Group as={Col} md="12" controlId="photo">
                                <input
                                    id='files'
                                    type="file"
                                    // ref={inputRef}
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
                                                <a className={`upload-cv-btn custom-btn-sec btn btn-primary ${!fileLimit ? '' : 'disabled'} `}>Upload Files</a>
                                                {/* <Button type="button">Upload File</Button> */}
                                            </label>
                                        </span>
                                    </div>
                                    {
                                        getFileNamesFromPC()
                                    }


                                </div>
                            </Form.Group>
                        </Form>
                        <Modal.Footer>
                            <Button className='custom-btn done-btn' variant='primary' type='submit' disabled={isParsing || isMatching || matchingDonePC || cvsPC.files.length == 0} onClick={!isParsing && !isMatching ? handleUploadPC : null}>
                                {isParsing && <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                }
                                {isMatching && <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                }
                                {isParsing ? " Parsing Cvs..." : isMatching ? " Scoring Cvs" : "Done"}
                            </Button>
                        </Modal.Footer>
                    </Tab>
                    <Tab eventKey="server" title="From Server">
                        <Row className='cv-dropdown'>
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
                                        <div className='file_row'>
                                           <span>{option.cv_original_name}</span>
                                        <span><a className="view-link" onClick={() => resetCvsPCOnClickingView(option)} href={require(`../../../../server/uploaded_CVs/${option.cv_path.replace(/^.*[\\\/]/, '')}`)} target="_blank"
                                            rel="noreferrer">View
                                        </a> </span>
                                        </div>
                                        
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
                        <Modal.Footer>
                            <Button className='custom-btn done-btn' variant='primary' type='submit' disabled={isMatching || matchingDoneServer || cvsServer.length==0} onClick={!isMatching ? handleUploadServer : null}>
                                {isMatching && <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                }
                                {isMatching ? " Scoring Cvs" : "Done"}
                            </Button>
                        </Modal.Footer>
                    </Tab>
                </Tabs>

            </Modal.Body>
        </Modal>
    )
}

export default UploadCvsModal