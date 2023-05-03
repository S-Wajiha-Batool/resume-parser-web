import React, { useState, useEffect, useContext, createRef } from 'react';
import { useParams } from 'react-router-dom'
import { GlobalState } from '../../GlobalState';
import { getJdAPI } from '../../API/JDAPI'
import { getUserAPI } from '../../API/UserAPI';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Container, Row, Col, Button, Spinner, Card } from 'react-bootstrap';
import '../UI/JdDetails.css'
import LoadingSpinner from '../utilities/LoadingSpinner';
import UploadCvsModal from '../utilities/UploadCvsModal';
import CvTable from '../utilities/CvsAgainstJdTable';

function JdDetails() {
    var moment = require('moment')
    const state = useContext(GlobalState);
    const [showModal, setShowModal] = useState(false);
    const handleCloseModal = () => setShowModal(false);
    const handleShowModal = () => setShowModal(true);
    const [token] = state.UserAPI.token;
    const [jd, setJd] = useState([]);
    const [user, setUser] = useState(null);
    const [allCvs, setAllCvs] = state.CVAPI.allCvs;
    const [cvs, setCvs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [callbackJdDetails, setCallbackJdDetails] = state.JDAPI.callbackJdDetails;
    const { id } = useParams()
    const tableRef = createRef();
    const [cvAgainstJdTableData, setCvAgainstJdTableData] = state.CVAPI.cvAgainstJdTableData


    useEffect(() => {
        if (token) {
            const getJd = async () => {
                try {
                    getJdAPI(id, token)
                        .then(res => {
                            console.log(res.data)
                            setJd(res.data.data.jd)
                            setCvs(res.data.data.cvs)
                            setCvAgainstJdTableData(res.data.data.cvs)
                            console.log(jd)
                            const user = res.data.data.jd.uploaded_by;
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
                        })
                        .catch(err => {
                            console.log(err.response.data)
                            showErrorToast(err.response.data.error.msg)
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
                <Container>
                    <div>
                        <Row>
                            <Col>
                                <h4 style={{color: 'Black', marginTop: '50px', style: 'bold'}}>Job Description</h4>
                            
                                <UploadCvsModal jd={jd} showModal={showModal} handleCloseModal={handleCloseModal} tableRef={tableRef}/>
                                <ul style={{listStyleType: 'none', marginTop: '20px', color: 'black'}}>
                                    <li><b>Position: </b>{jd.position}</li>
                                    <li><b>Department: </b>{jd.department}</li>
                                    <li><b>Experience: </b>{jd.experience}</li>
                                    <li><b>Qualification: </b>{jd.qualification && Object.entries(jd.qualification).length > 0 ?
                                        Object.entries(jd.qualification).map((option, index) => <span key={index}>{option[1] + " (" + option[0] + ")"}</span>)
                                        :
                                        <span>-</span>}</li>
                                    <li><b>Universities: </b>{jd.universities && Object.entries(jd.universities).length > 0 ?
                                        Object.entries(jd.universities).map((option, index) => <span key={index}>{option[1] + " (" + option[0] + ")"}</span>)
                                        :
                                        <span>-</span>}</li>
                                    <li><b>Skills: </b>{getSkills(jd.skills).length > 0 ? getSkills(jd.skills).map((skill, index) => <span key={index}>{skill}, </span>) : <span>-</span>}</li>
                                    <li><b>Posted By: </b>{user.first_name + " " + user.last_name}</li>
                                    <li><b>Posted On: </b>{getDate(jd.createdAt)}</li>
                                </ul>
                                <Button className='button1' onClick={handleShowModal}>Delete </Button>
                                <Button  className='button1' onClick={handleShowModal}>Edit</Button>

                            </Col>
                            <Col>
                                <div>
                                    <CvTable
                                        className='table'
                                        data={cvs}
                                        handleShowModal={handleShowModal}
                                        tableRef={tableRef}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Container>
                : <div>Jd not found</div>
    )    
}

export default JdDetails