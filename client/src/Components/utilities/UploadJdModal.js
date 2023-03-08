import React, { useState, useContext, useEffect, useRef } from 'react';
import { GlobalState } from '../../GlobalState';
import { Container, Row, Col, Modal, Button, Form, FormLabel, Spinner } from 'react-bootstrap';
import { Checkbox, TextField, Autocomplete } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import LoadingSpinner from '../utilities/LoadingSpinner';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { addJdAPI } from '../../API/JDAPI'
import arrow from '../../Icons/down_arrow.svg'
import '../UI/UploadJdModal.css'
import { skills, departments, experience, qualification, universities, unis, quals } from '../../constants'

function UploadJdModal({ showModal, handleCloseModal}) {
    const [jd, setJd] = useState({ position: "", department: "HR", skills: [], experience: "None", qualification: {}, universities: {} })
    console.log(jd)

    useEffect(() => {
            if (!showModal){
                setValidated(false)
            }   
    }, [showModal])

    const [isUploadingJd, setIsUploadingJd] = useState(false)

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [callback, setCallback] = state.JDAPI.callback;

    const onChangeInput = e => {
        const { name, value } = e.target;
        setJd({ ...jd, [name]: value })
    }

    const onChangeSkills = (e, value) => {
        setJd({ ...jd, 'skills': value })
    }

    const onChangeUniversities = (e, value) => {
        setJd({ ...jd, 'universities': Object.fromEntries(value) })
    }

    const onChangeQualification = (e, value) => {
        setJd({ ...jd, 'qualification': Object.fromEntries(value) })
    }

    const [validated, setValidated] = useState(false);

    const handleSubmit = (e) => {
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }
        setValidated(true);
        console.log('in submit')
        e.preventDefault()
        setIsUploadingJd(true);
        addJdAPI(jd, token)
            .then(res => {
                console.log(res.data)
                showSuccessToast(res.data.data.msg);
                setCallback(!callback)
                handleCloseModal()
                setJd({ position: "", department: "HR", skills: [], experience: "None", qualification: {}, universities: {}})
            })
            .catch(err => {
                showErrorToast(err.response.data.error.msg)
            })
            .finally(() => {
                setIsUploadingJd(false)
            })
    }

    return (
        <Modal show={showModal} onHide={handleCloseModal}>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
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
                        <Form.Select
                            name='department'
                            value={jd.department}
                            onChange={onChangeInput}>
                            {departments.map((d, key) => {
                                return <option className='option' key={key} value={d}>{d}</option>;
                            })}
                        </Form.Select>
                    </Form.Group>
                    <br />
                    <Row>
                            <Form.Group>
                                <Form.Label>Experience</Form.Label>
                                <Form.Select
                                    name='experience'
                                    value={jd.experience}
                                    onChange={onChangeInput}>
                                    {experience.map((d, key) => {
                                        return <option className='option' key={key} value={d}>{d}</option>;
                                    })}
                                </Form.Select>
                            </Form.Group>
                        </Row>
                        {/* <Col>
                            <Form.Group>
                                <Form.Label>Qualification</Form.Label>
                                <Form.Select
                                    name='qualification'
                                    value={jd.qualification}
                                    onChange={onChangeInput}>
                                    {qualification.map((d, key) => {
                                        return <option className='option' key={key} value={d}>{d}</option>;
                                    })}
                                </Form.Select>
                            </Form.Group>
                        </Col> */}
                        <br />
                        <Row>
                        <Form.Label>Qualification</Form.Label>
                        {/* <StyledEngineProvider injectFirst> */}
                            <Autocomplete
                                isOptionEqualToValue={(option, value) => option[0] === value[0]}
                                multiple
                                id="checkboxes-tags-demo"
                                size="small"
                                options={Object.entries(quals)}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option[1]  + " (" + option[0] + ")"}
                                onChange={onChangeQualification}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props} key={option[0]}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option[1] + " (" + option[0] + ")"}
                                    </li>
                                )}
                                style={{ width: 500 }}
                                renderInput={(params) => (
                                    <TextField required {...params} placeholder="Qualification" />
                                )}
                            />
                        {/* </StyledEngineProvider> */}
                    </Row>
                    <br />
                    
                    <Row>
                        <Form.Label>Skills</Form.Label>
                        {/* <StyledEngineProvider injectFirst> */}
                            <Autocomplete
                                isOptionEqualToValue={(option, value) => option.skill_name === value.skill_name}
                                multiple
                                id="checkboxes-tags-demo"
                                size="small"
                                options={Object.values(Object.values(skills[0]))}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.skill_name}
                                onChange={onChangeSkills}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props} key={option.skill_name}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option.skill_name}
                                    </li>
                                )}
                                style={{ width: 500 }}

                                renderInput={(params) => (
                                    <TextField required {...params} placeholder="Skills" />
                                )}
                            />
                        {/* </StyledEngineProvider> */}
                    </Row>
                    <br />
                    <Row>
                        <Form.Label>Universities</Form.Label>
                        {/* <StyledEngineProvider injectFirst> */}
                            <Autocomplete
                                isOptionEqualToValue={(option, value) => option[0] === value[0]}
                                multiple
                                id="checkboxes-tags-demo"
                                size="small"
                                options={Object.entries(unis)}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option[1]  + " (" + option[0] + ")"}
                                onChange={onChangeUniversities}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props} key = {option[0]}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option[1]  + " (" + option[0] + ")"}
                                    </li>
                                )}
                                style={{ width: 500 }}
                                renderInput={(params) => (
                                    <TextField required {...params} placeholder="Universities" />
                                )}
                            />
                        {/* </StyledEngineProvider> */}
                    </Row>
                    <br />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='primary' type='submit' disabled={isUploadingJd} onClick={!isUploadingJd ? handleSubmit : null}>
                        {isUploadingJd && <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />}
                        {isUploadingJd ? " Uploading Jd..." : "Done"}
                    </Button>
                </Modal.Footer>
            </Form>

        </Modal>
    )

}

export default UploadJdModal