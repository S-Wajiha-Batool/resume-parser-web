import React, { useState, useContext, useRef } from 'react';
import { GlobalState } from '../../GlobalState';
import { Row, Col, Modal, Button, Form, Spinner } from 'react-bootstrap';
import { Checkbox, TextField, Autocomplete } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { addJdAPI } from '../../API/JDAPI';
import '../UI/UploadJdModal.css';
import { skills, departments, experience, unis, quals } from '../../constants';
import { FixedSizeList } from 'react-window';
import { makeStyles } from '@material-ui/core/styles';


function UploadJdModal({ showModal, handleCloseModal }) {
    const [jd, setJd] = useState({ position: "", department: "HR", skills: [], experience: "None", qualification: {}, universities: {} })
    console.log(jd)

    const [isUploadingJd, setIsUploadingJd] = useState(false)

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    const [inputValue, setInputValue] = useState('');

    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [callbackJd, setCallbackJd] = state.JDAPI.callbackJd;
    const inputRef = useRef(null);
    const onChangeInput = e => {
        const { name, value } = e.target;
        setJd({ ...jd, [name]: value })
    }

    const onChangeSkills = (e, values) => {
        console.log(values);
        // Handle the selected options
        //setJd({ ...jd, skills: value });
        let newSkills = values.map((value) => {
            if (typeof value === 'string') {
                // Value is a user-typed string, convert it to an object
                return { skill_name: value };
            }
            return value;
        });

        setJd({ ...jd, skills: newSkills });

        console.log('jd', jd)
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();

            const value = event.target.value.trim();
            if (value !== '') {
                onChangeSkills(null, [...jd.skills, value]);
                setInputValue('');
            }
        }
    };

    const onChangeUniversities = (e, values) => {
        setJd({ ...jd, 'universities': Object.fromEntries(values) })
    }

    const onChangeQualification = (e, value) => {
        console.log(value)
        setJd({ ...jd, 'qualification': Object.fromEntries(value) })
    }


    const handleSubmit = (e) => {
        const form = e.currentTarget;

        e.preventDefault()
        if (jd.position === "") {
            showErrorToast("Position cannot be empty");
        }
        else {
            try {
                setIsUploadingJd(true);
                addJdAPI(jd, token)
                    .then(res => {
                        console.log(res.data)
                        showSuccessToast(res.data.data.msg);
                        setCallbackJd(!callbackJd)
                        handleCloseModal()
                        setJd({ position: "", department: "HR", skills: [], experience: "None", qualification: {}, universities: {} })
                    })
                    .catch(err => {
                        console.log(err.response.data.error.msg)
                        if (err.response.data.error.code == 500) {
                            showErrorToast("JD Upload failed")
                        }
                    })
                    .finally(() => {
                        setIsUploadingJd(false)
                    })
            }
            catch (err) {
                console.log(err)
                showErrorToast("Error in CV upload")
                setIsUploadingJd(false)
            }
        }


    }

    const useStyles = makeStyles((theme) => ({
        listbox: {
            '&::-webkit-scrollbar': {
                display: 'none',
            },
            '-ms-overflow-style': 'none',
            scrollbarWidth: 'none',
        },
    }));

    const classes = useStyles();


    const ListboxComponent = React.forwardRef(function ListboxComponent(props, ref) {
        const { children, ...other } = props;
        const itemCount = Array.isArray(children) ? children.length : 0;
        const itemSize = 48;
        const height = Math.min(8, itemCount) * itemSize;

        const getItem = (index) => children[index] || null;

        return (
            <div ref={ref}  >
                <div {...other}>
                    <FixedSizeList height={height} itemCount={itemCount} itemSize={itemSize}>
                        {({ index, style }) => (
                            <div style={{ ...style, display: 'flex', alignItems: 'center' }} key={index} aria-selected={false} role="option">
                                <div style={{ width: "100%" }}>{getItem(index)}</div>
                            </div>
                        )}
                    </FixedSizeList>
                </div>
            </div>
        );
    });

    return (
        <Modal show={showModal} onHide={handleCloseModal} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header>
                    <Modal.Title>Add Job Description</Modal.Title>
                    <button type="button" class="btn-close btn-close-white" aria-label="Close" onClick={handleCloseModal}></button>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group >
                        <Form.Label className='form-label'>Position</Form.Label>
                        <Form.Control type='text'
                            name='position'
                            placeholder='Position'
                            value={jd.position}
                            required
                            onChange={onChangeInput} />
                    </Form.Group>
                    <br />

                    <Row>
                        <Col>
                            <Form.Group>
                                <Form.Label className='form-label'>
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
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label className='form-label'>Experience</Form.Label>
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

                    </Row>
                    <br />
                    <Row>
                        <Form.Label className='form-label'>Skills</Form.Label>
                        <Autocomplete
                            classes={classes}
                            isOptionEqualToValue={(option, value) => option.skill_name === value.skill_name}
                            multiple
                            freeSolo
                            id="checkboxes-tags-demo"
                            size="small"
                            options={Object.values(skills[0])}
                            disableCloseOnSelect
                            inputValue={inputValue}
                            onInputChange={(event, newInputValue) => {
                                setInputValue(newInputValue);
                            }}
                            getOptionLabel={(option) => option.skill_name || option}
                            onChange={onChangeSkills}
                            renderOption={(props, option, { selected }) => (
                                <li {...props} key={option.skill_name}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 5 }}
                                        checked={selected}
                                    />
                                    {option.skill_name}
                                </li>
                            )}

                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Skills"
                                    onKeyDown={handleKeyDown}
                                />
                            )}
                            value={jd.skills}
                            ListboxComponent={ListboxComponent}
                        />
                    </Row>
                    <br />
                    <Row>
                        <Form.Label className='form-label'>Qualification</Form.Label>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option[0] === value[0]}
                            multiple
                            popupIcon={""}
                            id="checkboxes-tags-demo"
                            size="small"
                            options={Object.entries(quals)}
                            disableCloseOnSelect
                            getOptionLabel={(option) =>
                                option[0] 
                            }
                            onChange={onChangeQualification}
                            renderOption={(props, option, { selected }) => (
                                <li {...props} key={option[0]}>
                                    <Checkbox
                                        icon={icon}
                                        checkedIcon={checkedIcon}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {option[0]}
                                </li>
                            )}
                            style={{ width: 500 }}
                            renderInput={(params) => (
                                <TextField required {...params} placeholder="Qualification"
                                />
                            )}
                        />
                    </Row>
                    <br />
                    <Row>
                        <Form.Label className='form-label'>Universities</Form.Label>
                        <Autocomplete
                        popupIcon={""}
                            isOptionEqualToValue={(option, value) => option[0] === value[0]}
                            multiple
                            id="checkboxes-tags-demo"
                            size="small"
                            options={Object.entries(unis)}
                            disableCloseOnSelect
                            getOptionLabel={(option) => 
                                 option[1] + " (" + option[0] + ")"
                            }
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
                                <TextField required {...params} placeholder="Universities"
                                 />
                            )}
                        />
                        {/* </StyledEngineProvider> */}
                    </Row>
                    <br />
                </Modal.Body>
                <Modal.Footer>
                    <Button className="custom-btn done-btn-footer" variant='primary' type='submit' disabled={isUploadingJd} onClick={!isUploadingJd ? handleSubmit : null}>
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
