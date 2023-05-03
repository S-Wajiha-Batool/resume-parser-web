import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom'
import { GlobalState } from '../../GlobalState';
import { getCvAPI } from '../../API/CVAPI'
import { getUserAPI } from '../../API/UserAPI';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Container, Row, Col, Button, Spinner, Card } from 'react-bootstrap';
import LoadingSpinner from '../utilities/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import '../UI/CvDetails.css'

function CvDetails() {
    var moment = require('moment')
    const state = useContext(GlobalState);
    const navigate = useNavigate();
    const [token] = state.UserAPI.token;
    const [cv, setCv] = useState([]);
    const [jds, setJds] = useState([]);
    const [user, setUser] = useState([]);
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
                            const user = res.data.data.cv.uploaded_by;
                            try {
                                getUserAPI(user, token)
                                    .then(res => {
                                        console.log(res.data)
                                        setUser(res.data.data)
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
                            //setSuccess(true);
                        })
                        .catch(err => {
                            console.log(err.response.data)
                            showErrorToast(err.response.data.error.msg)
                        })
                } catch (err) {
                    showErrorToast(err)
                }
            }
            getCV()
        }
    }, [token])

    const getDate = (d) => {
        return moment(d).format("Do MMMM YYYY")
    }
return (
    isLoading ?
        <LoadingSpinner /> :
        success ?
            <>
                <Container>
                    <div>
                        <>
                            <Row>
                                <Col>
                                    <iframe src={require(`../../../../server/uploaded_CVs/${cv.cv_path.replace(/^.*[\\\/]/, '')}`)} width="100%" height="100%" />
                                </Col>
                                <Col>
                                    <Card
                                        bg='light'
                                        text='dark'
                                        style={{ width: '18rem' }}
                                        className="mb-2"
                                    >
                                        <Card.Body>
                                            <Card.Subtitle>Emails</Card.Subtitle>
                                            <Card.Text className="Text1">
                                                <ul>
                                                    {cv.emails.map((email, index) => (
                                                        <li key={index}>{email}</li>
                                                    ))}
                                                </ul>
                                            </Card.Text>

                                            <Card.Subtitle>Contact #</Card.Subtitle>
                                            <Card.Text className="Text1">{cv.phone_number}</Card.Text>

                                            <Card.Subtitle>Experience</Card.Subtitle>
                                            <Card.Text className="Text1">
                                                <ul>
                                                    {cv.experience_by_job ? (
                                                        Object.entries(cv.experience_by_job).map(([key, value]) => (
                                                            <li key={key}>
                                                                {key}: {value} 
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li>-</li>
                                                    )}
                                                    {cv.total_experience ? (
                                                        <li>Total: {cv.total_experience}</li>
                                                    ) : null}
                                                </ul>
                                            </Card.Text>

                                            <Card.Subtitle>Skills</Card.Subtitle>
                                                <Card.Text className="Text1">
                                                    <ul style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    {cv.skills.length !== 0 ? (
                                                    cv.skills.map((name, index) => (
                                                        <li key={index}>{name}</li>
                                                     ))
                                                     ) : (
                                                    <li>None</li>
                                                        )}
                                                     </ul>
                                            </Card.Text>

                                            <Card.Subtitle>Links</Card.Subtitle>
                                            <Card.Text>
                                                <ul>
                                                    {cv.links.length !== 0 ? (
                                                        cv.links.map((link, index) => (
                                                            <li key={index}>
                                                                <a href={link}>{link}</a>
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li>None</li>
                                                    )}
                                                </ul>
                                            </Card.Text>

                                            <Card.Subtitle>Posted By</Card.Subtitle>
                                            <Card.Text className="Text1">
                                                {user.first_name} {user.last_name}
                                            </Card.Text>

                                            <Card.Subtitle>Posted On</Card.Subtitle>
                                            <Card.Text className="Text1">
                                                {getDate(cv.createdAt)}
                                            </Card.Text>

                                            {jds.length !== 0 && (
                                                <>
                                                    <Card.Subtitle>Uploaded For:</Card.Subtitle>
                                                    <Card.Text className="Text1">
                                                        {jds.map((jd) => {
                                                            return (
                                                                <div key={jd.JD_ID}>
                                                                    <span onClick={() => navigate(`/jd/${jd.JD_ID}`)}>
                                                                        {jd.position} - 
                                                                    </span>
                                                                    <span>{jd.weighted_percentage} </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </Card.Text>
                                                </>
                                            )}
                                        </Card.Body>
                                    </Card>
                                    
                                <button className='button1'>delete</button>
                            <button className='button1'>Edit</button>
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