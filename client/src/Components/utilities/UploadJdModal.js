import React, { useState, useContext, useEffect, useRef } from 'react';
import { GlobalState } from '../../GlobalState';
import { Container, Row, Col, Modal, Button, Form, FormLabel, Spinner } from 'react-bootstrap';
import { Checkbox, TextField, Autocomplete, ListboxComponentPropType } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import LoadingSpinner from '../utilities/LoadingSpinner';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { addJdAPI } from '../../API/JDAPI'
import arrow from '../../Icons/down_arrow.svg'
import '../UI/UploadJdModal.css'
import { skills, departments, experience, qualification, universities, unis, quals } from '../../constants'
import { List } from "react-virtualized";
import { FixedSizeList } from 'react-window';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';


function UploadJdModal({ showModal, handleCloseModal }) {
    const [jd, setJd] = useState({ position: "", department: "HR", skills: [], experience: "None", qualification: {}, universities: {} })
    console.log(jd)

    useEffect(() => {
        if (!showModal) {
            setValidated(false)
        }
    }, [showModal])

    const [isUploadingJd, setIsUploadingJd] = useState(false)

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [callbackJd, setCallbackJd] = state.JDAPI.callbackJd;

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


    function useForkRef(refA, refB) {
        return React.useMemo(() => {
            if (refA == null && refB == null) {
                return null;
            }
            return (refValue) => {
                if (refA) {
                    if (typeof refA === 'function') {
                        refA(refValue);
                    } else {
                        refA.current = refValue;
                    }
                }
                if (refB) {
                    if (typeof refB === 'function') {
                        refB(refValue);
                    } else {
                        refB.current = refValue;
                    }
                }
            };
        }, [refA, refB]);
    }


    const useStyles = makeStyles({
        listbox: {
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '-ms-overflow-style': 'none',
          scrollbarWidth: 'none',
        },
      });
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
            <div style={{ ...style, display: 'flex', alignItems: 'center' }}key={index} aria-selected={false} role="option">
            {children[index]}
          </div>
          )}
        </FixedSizeList>
      </div>
    </div>
  );
});

      



    return (
        <Modal show={showModal} onHide={handleCloseModal}>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Job Description</Modal.Title>
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
                    <br />
                    <Row>
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
                        <Form.Label className='form-label'>Qualification</Form.Label>
                        {/* <StyledEngineProvider injectFirst> */}
                        <Autocomplete
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
                                <TextField required {...params} placeholder="Qualification"
                                />
                            )}
                        />
                        {/* </StyledEngineProvider> */}
                    </Row>
                    <br />

                    <Row>
                        <Form.Label className='form-label'>Skills</Form.Label>
                        {/* <StyledEngineProvider injectFirst> */}
                        <Autocomplete
                            classes={classes}

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
                                        style={{ marginRight: 5 }}
                                        checked={selected}
                                    />
                                    {option.skill_name}
                                </li>
                            )}
                            style={{ width: 500 }}
                            ListboxComponent={ListboxComponent}
                            renderInput={(params) => (
                                <TextField required {...params} placeholder="Skills" />
                            )}
                        />
                        {/* </StyledEngineProvider> */}
                    </Row>
                    <br />
                    <Row>
                        <Form.Label className='form-label'>Universities</Form.Label>
                        {/* <StyledEngineProvider injectFirst> */}
                        <Autocomplete
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