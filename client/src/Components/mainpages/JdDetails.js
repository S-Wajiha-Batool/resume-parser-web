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
    }, [token])



    return (
        isLoading ?
            <LoadingSpinner /> :
            success ?
                <> <Container>
                    <div>
                        <>
                            <Row>
                                {/* <Col><h4>Job Description</h4></Col>
                                <Col className='uploadCv_btn'>
                                    <Button onClick={handleShowModal}>Add CV</Button>
                                </Col> */}
                                <UploadCvsModal jd = {jd} showModal={showModal} handleCloseModal={handleCloseModal} />
                            </Row>
                            <Row>
                                <Col>
                                    <Card
                                        bg='light'
                                        text='dark'
                                        style={{ width: '18rem' }}
                                        className="mb-2"
                                    >
                                        <Card.Header>Job Description Details</Card.Header>
                                        <Card.Body>
                                            <Card.Title> {jd.position} </Card.Title>
                                            <Card.Text>
                                                Some quick example text to build on the card title and make up the
                                                bulk of the card's content.
                                            </Card.Text>
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