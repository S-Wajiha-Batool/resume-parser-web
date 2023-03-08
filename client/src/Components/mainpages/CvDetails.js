import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom'
import { GlobalState } from '../../GlobalState';
import { getCvAPI } from '../../API/CVAPI'
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Container, Row, Col, Button, Spinner, Card } from 'react-bootstrap';
import LoadingSpinner from '../utilities/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import CvTable from '../utilities/CvsAgainstJdTable';

function CvDetails() {
    var moment = require('moment')
    const state = useContext(GlobalState);
    const navigate = useNavigate();
    const [token] = state.UserAPI.token;
    const [cv, setCv] = useState([]);
    const [jds, setJds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const { id } = useParams()

    useEffect(() => {
        if (token) {
            const getCV = async () => {
                try {
                    getCvAPI(id, token)
                        .then(res => {
                            console.log(res.data)
                            setCv(res.data.data.cv)
                            setJds(res.data.data.jds)
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
            getCV()
        }
    }, [token])

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
                            <Row>
                                <Col>
                                <iframe src={require(`../../../../server/uploaded_CVs/${cv.cv_path.replace(/^.*[\\\/]/, '')}`)} width="600" height="780"/>
                                </Col>
                                <Col>
                                    <Card
                                        bg='light'
                                        text='dark'
                                        style={{ width: '18rem' }}
                                        className="mb-2"
                                    >
                                        <Card.Header>{cv.full_name}</Card.Header>
                                        <Card.Body>

                                            <Card.Subtitle>Emails</Card.Subtitle>
                                            <Card.Text>{cv.emails.map((email,index) => <li key={index}>{email}</li>)}</Card.Text>

                                            <Card.Subtitle>Contact #</Card.Subtitle>
                                            <Card.Text>{cv.phone_number}</Card.Text>

                                            <Card.Subtitle>Experience</Card.Subtitle>
                                            <Card.Text>{cv.experience}</Card.Text>

                                            {/* <Card.Subtitle>Qualification</Card.Subtitle>
                                            <Card.Text>{cv.qualification}</Card.Text>

                                            <Card.Subtitle>Universities</Card.Subtitle>
                                            <Card.Text>{cv.universities.map(name => <li>{name}</li>)}</Card.Text> */}

                                            <Card.Subtitle>Skills</Card.Subtitle>
                                            <Card.Text>{getSkills(cv.skills).map(name => <li key="{name}">{name}</li>)}</Card.Text>
                                            
                                            <Card.Subtitle>Links</Card.Subtitle>
                                            <Card.Text>{cv.links.map((name,index) => <li key={index}><a href={name}>{name}</a></li>)}</Card.Text>

                                            <Card.Subtitle>Posted By</Card.Subtitle>
                                            <Card.Text>{cv.uploaded_by}</Card.Text>

                                            <Card.Subtitle>Posted On</Card.Subtitle>
                                            <Card.Text>{getDate(cv.createdAt)}</Card.Text>
                                            
                                            {jds.length !== 0 && <><Card.Subtitle>Uploaded For: </Card.Subtitle>
                                            <Card.Text>{jds.map((jd) => {
                                                return(<div>
                                                <span  onClick={navigate(`/jd/${jd._id}`)}>{jd.position} - </span>
                                                <span>{jd.weighted_percentage} - </span>
                                                </div>)
                                            })}</Card.Text></>}
                                            
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </>
                    </div>
                </Container>
                </>
                : <div>Cv not found</div>
    )

}

export default CvDetails