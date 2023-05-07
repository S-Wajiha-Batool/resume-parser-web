import React, { useState, useEffect, useContext, createRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Title from '../utilities/Title';
import Edit from '@material-ui/icons/Edit';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import EditJdModal from '../utilities/EditJdModal';
import DeleteModal from '../utilities/DeleteModal';

function JdDetails() {
    var moment = require('moment')
    const navigate = useNavigate('');
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

    const [showEditModal, setShowEditModal] = useState(false);
    const handleCloseEditModal = () => setShowEditModal(false);
    const handleShowEditModal = () => setShowEditModal(true);

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);

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
    }, [token, callbackJdDetails, showEditModal])

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
                <div className='main-container'>
                    <div>
                        <UploadCvsModal jd={jd} showModal={showModal} handleCloseModal={handleCloseModal} tableRef={tableRef} />
                        <DeleteModal
                            showModal={showDeleteModal}
                            handleCloseModal={handleCloseDeleteModal}
                            data={jd}
                            target={"jd"}
                        />
                        <EditJdModal
                            showModal={showEditModal}
                            handleCloseModal={handleCloseEditModal}
                            oldJd={jd}
                        />

                        <div className='page-title'>
                            <Title title={`Job Details`} />
                            <div className='icons'>
                                        <Button className = "custom-btn jd-btn" onClick={handleShowEditModal}><span><Edit className="icon-btn-class"/></span> Edit</Button>
                                        <Button className = "custom-btn-sec jd-btn" onClick={handleShowDeleteModal}><span><DeleteOutline className="icon-btn-class"/></span> Delete</Button>
                                    </div>
                        </div>
                        
                        <Row>
                            <Col className='desc-container'>
                                <div className='heading'>
                                    <h4 style={{ fontWeight: 'bold', marginBottom:0 }}>{jd.position}</h4>
                                </div>
                                <hr className='line' />
                                <div className='details'>
                                    <div className='key'>Department: </div>
                                    <div className='value'>{jd.department}</div>
                                    <hr className='line2' />
                                    <div className='key'>Experience: </div>
                                    <div className='value'>{jd.experience}</div>
                                    <hr className='line2' />
                                    <div className='key'>Qualification: </div>
                                    <div className='value>'>
                                        {jd.qualification && Object.entries(jd.qualification).length > 0 ?
                                            <ul>{Object.entries(jd.qualification).map((option, index) => <li key={index}>{option[1] + " (" + option[0] + ")"}</li>)}</ul>
                                            :
                                            <div>-</div>}
                                    </div>
                                    <hr className='line2' />
                                    <div className='key'>Universities: </div>
                                    <div className='value'> {jd.universities && Object.entries(jd.universities).length > 0 ?
                                        <ul>{Object.entries(jd.universities).map((option, index) => <li key={index}>{option[1] + " (" + option[0] + ")"}</li>)}</ul>
                                        :
                                        <div>-</div>}</div>
                                    <hr className='line2' />
                                    <div className='key'>Skills: </div>
                                    <div className='value'>{getSkills(jd.skills).length > 0 ? <div id="tag-container">{getSkills(jd.skills).map((skill, index) => <span className="tag" key={index}>{skill}</span>)}</div> : <div> - </div>}</div>
                                    <hr className='line2' />
                                    <div className='key'>Posted By: </div>
                                    <div className='value'>{user.first_name + " " + user.last_name}</div>
                                    <hr className='line2' />
                                    <div className='key'>Posted On: </div>
                                    <div className='value'>{getDate(jd.createdAt)}</div>
                                </div>
                            </Col>
                            <Col className='table-container'>
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
                </div >
                : <div>Jd not found</div>
    )
}

export default JdDetails