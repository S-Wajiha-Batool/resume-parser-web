import React, { useState, useContext, useEffect, useRef } from 'react';
import { GlobalState } from '../../GlobalState';
import { Container, Row, Col, Modal, Button, Form, FormLabel, Spinner } from 'react-bootstrap';
import { Checkbox, TextField, Autocomplete } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { StyledEngineProvider } from '@mui/material/styles';
import LoadingSpinner from '../utilities/LoadingSpinner';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { addJdAPI } from '../../API/JDAPI'
import arrow from '../../Icons/down_arrow.svg'
import '../UI/UploadJdModal.css'
import { skills, departments, experience, qualification, universities } from '../../constants'

function UploadJdModal({ showModal, handleCloseModal }) {
    const [jd, setJd] = useState({ position: "", department: "HR", skills: [], experience: "None", qualification: '', universities: [] })
    console.log(jd)

    useEffect(() => {
            if (!showModal){
                setValidated(false)
            }   
    }, [showModal])

    const [isUploadingJd, setIsUploadingJd] = useState(false)

    const map = () => {
        var a = [];
        jd.skills.map(s => {
            a.push(s.skill_name)
        })
        console.log(a)
    }

    const top100Films = [
        { title: 'The Shawshank Redemption', year: 1994 },
        { title: 'The Godfather', year: 1972 },
        { title: 'The Godfather: Part II', year: 1974 },
        { title: 'The Dark Knight', year: 2008 },
        { title: '12 Angry Men', year: 1957 },
        { title: "Schindler's List", year: 1993 },
        { title: 'Pulp Fiction', year: 1994 },
        {
            title: 'The Lord of the Rings: The Return of the King',
            year: 2003,
        },
        { title: 'The Good, the Bad and the Ugly', year: 1966 },
        { title: 'Fight Club', year: 1999 },
        {
            title: 'The Lord of the Rings: The Fellowship of the Ring',
            year: 2001,
        },
        {
            title: 'Star Wars: Episode V - The Empire Strikes Back',
            year: 1980,
        },
        { title: 'Forrest Gump', year: 1994 },
        { title: 'Inception', year: 2010 },
        {
            title: 'The Lord of the Rings: The Two Towers',
            year: 2002,
        },
        { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
        { title: 'Goodfellas', year: 1990 },
        { title: 'The Matrix', year: 1999 },
        { title: 'Seven Samurai', year: 1954 },
        {
            title: 'Star Wars: Episode IV - A New Hope',
            year: 1977,
        },
        { title: 'City of God', year: 2002 },
        { title: 'Se7en', year: 1995 },
        { title: 'The Silence of the Lambs', year: 1991 },
        { title: "It's a Wonderful Life", year: 1946 },
        { title: 'Life Is Beautiful', year: 1997 },
        { title: 'The Usual Suspects', year: 1995 },
        { title: 'Léon: The Professional', year: 1994 },
        { title: 'Spirited Away', year: 2001 },
        { title: 'Saving Private Ryan', year: 1998 },
        { title: 'Once Upon a Time in the West', year: 1968 },
        { title: 'American History X', year: 1998 },
        { title: 'Interstellar', year: 2014 },
    ];

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
        setJd({ ...jd, 'universities': value })
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
                setJd({ position: "", department: "HR", skills: [], experience: "None", qualification: '', universities: []})
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
                            defaultValue={departments[0]}
                            onChange={onChangeInput}>
                            {departments.map((d, key) => {
                                return <option className='option' key={key} value={d}>{d}</option>;
                            })}
                        </Form.Select>
                    </Form.Group>
                    <br />
                    <Row>
                        <Col>
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
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label>Min. Qualification</Form.Label>
                                <Form.Select
                                    name='qualification'
                                    value={jd.qualification}
                                    onChange={onChangeInput}>
                                    {qualification.map((d, key) => {
                                        return <option className='option' key={key} value={d}>{d}</option>;
                                    })}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Form.Label>Skills</Form.Label>
                        <StyledEngineProvider injectFirst>
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
                                    <li {...props}>
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
                        </StyledEngineProvider>
                    </Row>
                    <br />
                    <Row>
                        <Form.Label>Universities</Form.Label>
                        <StyledEngineProvider injectFirst>
                            <Autocomplete
                                isOptionEqualToValue={(option, value) => option === value}
                                multiple
                                id="checkboxes-tags-demo"
                                size="small"
                                options={universities}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option}
                                onChange={onChangeUniversities}
                                renderOption={(props, option, { selected }) => (
                                    <li {...props}>
                                        <Checkbox
                                            icon={icon}
                                            checkedIcon={checkedIcon}
                                            style={{ marginRight: 8 }}
                                            checked={selected}
                                        />
                                        {option}
                                    </li>
                                )}
                                style={{ width: 500 }}
                                renderInput={(params) => (
                                    <TextField required {...params} placeholder="Universities" />
                                )}
                            />
                        </StyledEngineProvider>
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