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
                                    <Col><h4>Job Description</h4></Col>
                                    <Col className='uploadCv_btn'>
                                        <Button onClick={handleShowModal}>Add CV</Button>
                                    </Col>
                                    <UploadCvsModal showModal={showModal} handleCloseModal={handleCloseModal} />
                                </Row>
                                <Row>
                                    <Col>
                                    <Card
          bg='light'
          text='dark'
          style={{ width: '18rem' }}
          className="mb-2"
        >
          <Card.Header>Header</Card.Header>
          <Card.Body>
            <Card.Title> Details </Card.Title>
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

        // <div class="container text-center">
        //     <div class="row justify-content-between">
        //         <div class="col-4">
        //             <p class="fw-bold fs-4 text-start">Job Description #: {id}</p>
        //         </div>
        //         <div class="col-4 ">
        //             <button type='button'
        //                 className='btn btn-primary'
        //                 value='Submit'
        //                 position='center'>ADD CV
        //             </button>
        //         </div>
        //     </div>
        //     <div class="row align-items-start">
        //         <div class="col border border-secondary rounded">
        //             <p class="fw-bold fs-6 text-start">Title</p>
        //             <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">HR Manager</p>
        //             <p class="fw-bold fs-6 text-start">Department</p>
        //             <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">HR</p>
        //             <p class="fw-bold fs-6 text-start">Skills</p>
        //             <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">Lorem ipsum</p>
        //             <p class="fw-bold fs-6 text-start">Department</p>
        //             <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">Lorem ipsum</p>
        //             <p class="fw-bold fs-6 text-start">Qualification</p>
        //             <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">Lorem ipsum</p>
        //             <p class="fw-bold fs-6 text-start">Upload date</p>
        //             <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">Lorem ipsum</p>
        //         </div>
        //         <div class="col">
        //             CV table
        //         </div>
        //     </div>
        // </div>
    )

}

export default JdDetails