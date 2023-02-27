import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom'
import { GlobalState } from '../../GlobalState';
import { getJdAPI } from '../../API/JDAPI'
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Container, Row, Col, Button, Spinner, Card } from 'react-bootstrap';
import '../UI/JdDetails.css'
import LoadingSpinner from '../utilities/LoadingSpinner';
import UploadCvsModal from '../utilities/UploadCvsModal';
import CvTable from '../utilities/CvTable';

function JdDetails() {
    var moment = require('moment')
    const state = useContext(GlobalState);
    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);
    const [token] = state.UserAPI.token;
    const [jd, setJd] = useState([]);
    const [allCvs, setAllCvs] = state.CVAPI.allCvs;
    const [cvs, setCvs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [callbackJdDetails, setCallbackJdDetails] = state.JDAPI.callbackJdDetails;
    const { id } = useParams()

    useEffect(() => {
        if (token) {
            const getJd = async () => {
                try {
                    getJdAPI(id, token)
                        .then(res => {
                            console.log(res.data)
                            setJd(res.data.data.jd)
                            setCvs(res.data.data.cvs)
                            console.log(jd)
                            setSuccess(true);
                        })
                        .catch(err => {
                            console.log(err.response.data)
                            showErrorToast(err.response.data.error.msg)
                        })
                        .finally(() => {
                            setIsLoading(false);
                        })
                } catch (err) {
                    showErrorToast(err)
                }
            }
            getJd()
        }
    }, [token, callbackJdDetails])

    const getSkills = (skills) => {
        console.log(skills)
        var a = [];
        skills.map(s => {
            a.push(s.skill_name)
        })
        return a;
    }

    const getDate = (d) => {
        return moment(d).format("Do MMMM YYYY")
    }

    return (
        isLoading ?
            <LoadingSpinner /> :
            success ?
                <> <Container>
                    <div>
                        <>
                                {/* <Col><h4>Job Description</h4></Col>
                                <Col className='uploadCv_btn'>
                                    <Button onClick={handleShowModal}>Add CV</Button>
                                </Col> */}
                                <UploadCvsModal jd = {jd} showModal={showModal} handleCloseModal={handleCloseModal} />
                            <Row>
                                <Col>
                                    <Card
                                        bg='light'
                                        text='dark'
                                        style={{ width: '18rem' }}
                                        className="mb-2"
                                    >
                                        <Card.Header>{jd.position}</Card.Header>
                                        <Card.Body>
                                            <Card.Title>  </Card.Title>
                                            <Card.Subtitle>Department</Card.Subtitle>
                                            <Card.Text>{jd.department}</Card.Text>

                                            <Card.Subtitle>Experience</Card.Subtitle>
                                            <Card.Text>{jd.experience}</Card.Text>

                                            <Card.Subtitle>Qualification</Card.Subtitle>
                                            <Card.Text>{jd.qualification}</Card.Text>

                                            <Card.Subtitle>Universities</Card.Subtitle>
                                            <Card.Text>{jd.universities.map(name => <li>{name}</li>)}</Card.Text>

                                            <Card.Subtitle>Skills</Card.Subtitle>
                                            <Card.Text>{getSkills(jd.skills).map(name => <li key="{name}">{name}</li>)}</Card.Text>

                                            <Card.Subtitle>Posted By</Card.Subtitle>
                                            <Card.Text>{jd.uploaded_by}</Card.Text>

                                            <Card.Subtitle>Posted On</Card.Subtitle>
                                            <Card.Text>{getDate(jd.createdAt)}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col>
                                    <div>
                                        {cvs.length !== 0 &&
                                            <CvTable
                                                className='table'
                                                data={cvs}
                                                handleShowModal={handleShowModal}
                                            />}

                                        {cvs.length === 0 &&
                                            <div>No JDs found</div>}
                                    </div>
                                </Col>
                            </Row>
                        </>
                    </div>
                </Container>
                </>
                : <div>Jd not found</div>
    )

}

export default JdDetails