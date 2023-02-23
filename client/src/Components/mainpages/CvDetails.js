import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom'
import { GlobalState } from '../../GlobalState';
import { getCvAPI } from '../../API/CVAPI'
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Container, Row, Col, Button, Spinner, Card } from 'react-bootstrap';
import LoadingSpinner from '../utilities/LoadingSpinner';
import CvTable from '../utilities/CvTable';

function CvDetails() {
    var moment = require('moment')
    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [cv, setCv] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const { id } = useParams()

    useEffect(() => {
        if (token) {
            const getJd = async () => {
                try {
                    getCvAPI(id, token)
                        .then(res => {
                            console.log(res.data)
                            setCv(res.data.data.cv)
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
    }, [token, callbackCvDetails])

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
                            <Row>
                                <Col>
                                    display cv
                                </Col>
                                <Col>
                                    <Card
                                        bg='light'
                                        text='dark'
                                        style={{ width: '18rem' }}
                                        className="mb-2"
                                    >
                                        <Card.Header>{jd.full_name}</Card.Header>
                                        <Card.Body>
                                            <Card.Title>{cv.score}</Card.Title>
                                            <Card.Subtitle>Contact #</Card.Subtitle>
                                            <Card.Text>{cv.phone_number}</Card.Text>

                                            <Card.Subtitle>Experience</Card.Subtitle>
                                            <Card.Text>{cv.experience}</Card.Text>

                                            <Card.Subtitle>Qualification</Card.Subtitle>
                                            <Card.Text>{cv.qualification}</Card.Text>

                                            <Card.Subtitle>Universities</Card.Subtitle>
                                            <Card.Text>{jd.universities.map(name => <li>{name}</li>)}</Card.Text>

                                            <Card.Subtitle>Skills</Card.Subtitle>
                                            <Card.Text>{getSkills(cv.skills).map(name => <li key="{name}">{name}</li>)}</Card.Text>

                                            <Card.Subtitle>Status</Card.Subtitle>
                                            <Card.Text>{jd.status}</Card.Text>

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

export default CvDetails