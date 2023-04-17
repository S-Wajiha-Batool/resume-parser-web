import React, { useState, useContext, useEffect, useRef } from 'react';
import { GlobalState } from '../../GlobalState';
import { Row, Modal, Button, Form, Spinner } from 'react-bootstrap';
import { Checkbox, TextField, Autocomplete } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { updateJdAPI } from '../../API/JDAPI'
import { rescoreCvsAPI } from '../../API/CVAPI'
import { skills, departments, experience, qualification, universities, unis, quals } from '../../constants'
import _ from 'lodash';

function EditJdModal({ showModal, handleCloseModal, oldJd }) {
    const [jd, setJd] = useState({ position: oldJd.position, department: oldJd.department, skills: oldJd.skills, experience: oldJd.experience, qualification: oldJd.qualification, universities: oldJd.universities })
    const [jdChanged, setJdChanged] = useState(false);
    const [enableEdit, setEnableEdit] = useState(false);
    const [isUpdatingJd, setIsUpdatingJd] = useState(false)
    const [isRescoringCvs, setIsRescoringCvs] = useState(false);

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [callbackJd, setCallbackJd] = state.JDAPI.callbackJd;

    useEffect(() => {
        setJd({ ...jd, position: oldJd.position, department: oldJd.department, skills: oldJd.skills, experience: oldJd.experience, qualification: oldJd.qualification, universities: oldJd.universities });
    }, [])

    useEffect(() => {
        if (oldJd.position !== jd.position || oldJd.department !== jd.department || oldJd.experience !== jd.experience || !_.isEqual(_.sortBy(oldJd.skills, "skill_name"), _.sortBy(jd.skills, "skill_name")) || !(JSON.stringify(Object.entries(oldJd.qualification || {})) === JSON.stringify(Object.entries(jd.qualification || {}))) || JSON.stringify(Object.entries(oldJd.universities || {})) !== JSON.stringify(Object.entries(jd.universities || {}))) {
            setEnableEdit(true)
        }
        else {
            setEnableEdit(false)
        }
    }, [jdChanged])

    const onChangeInput = e => {
        const { name, value } = e.target;
        setJd({ ...jd, [name]: value })
        setJdChanged(!jdChanged)
    }

    const onChangeSkills = (e, value) => {
        setJd({ ...jd, 'skills': value })
        setJdChanged(!jdChanged)
    }

    const onChangeUniversities = (e, value) => {
        setJd({ ...jd, 'universities': Object.fromEntries(value) })
        setJdChanged(!jdChanged)
    }

    const onChangeQualification = (e, value) => {
        setJd({ ...jd, 'qualification': Object.fromEntries(value) })
        setJdChanged(!jdChanged)
    }

    const handleSubmit = (e) => {
        console.log('in submit')
        e.preventDefault()
        try {
            if (jd.position === "") {
                showErrorToast("Position cannot be empty");
            }
            else if(jd.position !== ""){
                setIsUpdatingJd(true);
                updateJdAPI(oldJd._id, jd, token)
                    .then(res => {
                        console.log(res.data)
                        showSuccessToast(res.data.data.msg);
                        setCallbackJd(!callbackJd)
                        setEnableEdit(false)
                    })
                    .catch(err => {
                        console.log(err.response.data.error.msg)
                        if (err.response.data.error.code == 500) {
                            showErrorToast("JD Update failed")
                            setEnableEdit(true)
                        }
                    })
                    .finally(() => {
                        setIsUpdatingJd(false)
                    })
            }

            if (oldJd.experience !== jd.experience || !_.isEqual(_.sortBy(oldJd.skills, "skill_name"), _.sortBy(jd.skills, "skill_name")) || !(JSON.stringify(Object.entries(oldJd.qualification || {})) === JSON.stringify(Object.entries(jd.qualification || {}))) || JSON.stringify(Object.entries(oldJd.universities || {})) !== JSON.stringify(Object.entries(jd.universities || {}))){
                setIsRescoringCvs(true);
                rescoreCvsAPI(oldJd._id, token)
                    .then(res => {
                        console.log(res.data)
                        showSuccessToast(res.data.data.msg);
                        setCallbackJd(!callbackJd)
                    })
                    .catch(err => {
                        console.log(err.response.data.error.msg)
                        if (err.response.data.error.code == 500) {
                            showErrorToast("CV rescoring failed")
                        }
                    })
                    .finally(() => {
                        setIsRescoringCvs(false)
                        setEnableEdit(false)
                    })
            }
        }
        catch (err) {
            console.log(err)
            showErrorToast("Error in CV update")
            setIsUpdatingJd(false)
        }

    }

    return (
        <Modal show={showModal} onHide={handleCloseModal}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Job Description</Modal.Title>
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
                            defaultValue={Object.entries(oldJd.qualification || {})}
                            isOptionEqualToValue={(option, value) => option[0] === value[0]}
                            multiple
                            id="checkboxes-tags-demo"
                            size="small"
                            options={Object.entries(quals)}
                            disableCloseOnSelect
                            getOptionLabel={(option) => option[1] + " (" + option[0] + ")"}
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
                            defaultValue={oldJd.skills}
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
                            defaultValue={Object.entries(jd.universities || {})}
                            isOptionEqualToValue={(option, value) => option[0] === value[0]}
                            multiple
                            id="checkboxes-tags-demo"
                            size="small"
                            options={Object.entries(unis)}
                            disableCloseOnSelect
                            getOptionLabel={(option) => option[1] + " (" + option[0] + ")"}
                            onChange={onChangeUniversities}
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
                                <TextField required {...params} placeholder="Universities" />
                            )}
                        />
                        {/* </StyledEngineProvider> */}
                    </Row>
                    <br />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='primary' type='submit' disabled={!enableEdit} onClick={!(isUpdatingJd || isRescoringCvs) ? handleSubmit : null}>
                        {(isUpdatingJd || isRescoringCvs) && <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />}
                        {isUpdatingJd ? " Updating Jd..." : isRescoringCvs ? " Rescoring Cvs..." : "Done"}
                    </Button>
                </Modal.Footer>
            </Form>

        </Modal>
    )

}

export default EditJdModal