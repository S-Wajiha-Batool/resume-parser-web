import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom'
import { GlobalState } from '../../GlobalState';
import { getCvAPI } from '../../API/CVAPI'
import { getUserAPI } from '../../API/UserAPI';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Container, Row, Col, Button, Spinner, Card } from 'react-bootstrap';
import LoadingSpinner from '../utilities/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import Title from '../utilities/Title';
import '../UI/CvDetails.css'
import Edit from '@material-ui/icons/Edit';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import DeleteModal from '../utilities/DeleteModal';

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
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);

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
                <div className='main-container'>
                    <DeleteModal
                        showModal={showDeleteModal}
                        handleCloseModal={handleCloseDeleteModal}
                        data={cv}
                        target={"cv"}
                    />
                    <div className='page-title'>
                        <Title title={`CV Details`} />
                        <div className='icons'>
                            <Button className="custom-btn-sec jd-btn" onClick={handleShowDeleteModal}><span><DeleteOutline className="icon-btn-class" /></span> Delete</Button>
                        </div>

                    </div>

                    <Row>
                        <Col className='description-container'>
                            <div className='heading'>
                                <h4 style={{ fontWeight: 'bold', marginBottom:0 }}>{cv.cv_original_name}</h4>
                            </div>
                            <hr className='line' />
                            <div className='details'>
                            <div className='key'>Emails</div>
                            <div className="value">
                                {cv.emails.length > 0 ? <ul>{cv.emails.map((email, index) =>
                                    <li key={index}>{email}</li>)}</ul> : <div>-</div>
                                }
                            </div>
                            <hr className='line2' />

                            <div className='key'>Contact #</div>
                            <div className="value">{cv.phone_number}</div>
                            <hr className='line2' />

                            <div className='key'>Experience</div>
                            <div className="value">
                                {Object.keys(cv.experience_by_job).length !== 0 ? (
                                    <ul>{Object.entries(cv.experience_by_job).map(([key, value]) => (
                                        <li key={key}>
                                            {key}: {value}
                                        </li>
                                    ))}</ul>
                                ) : (
                                    null
                                )}
                                {cv.total_experience ? (
                                    <div>Total: {cv.total_experience}</div>
                                ) : null}

                            </div>
                            <hr className='line2' />

                            <div className="key">Skills</div>
                            <div className="value">
                                {cv.skills.length !== 0 ? (
                                    <div id="tag-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {cv.skills.map((name, index) => (
                                            <span className="tag" key={index}>{name}</span>
                                        ))}</div>
                                ) : (
                                    <div>-</div>)}
                            </div>
                            <hr className='line2' />

                            <div className="key">Links</div>
                            <div className="value">
                                <ul>
                                    {cv.links.length !== 0 ? (
                                        cv.links.map((link, index) => (
                                            <li key={index}>
                                                <a href={link}>{link}</a>
                                            </li>
                                        ))
                                    ) : (
                                        <div>-</div>
                                    )}
                                </ul>
                            </div>
                            <hr className='line2' />

                            <div className="key">Posted By</div>
                            <div className="value">
                                {user.first_name} {user.last_name}
                            </div>
                            <hr className='line2' />

                            <div className="key">Posted On</div>
                            <div className="value">
                                {getDate(cv.createdAt)}
                            </div>
                            <hr className='line2' />

                            {jds.length !== 0 && (
                                <>
                                    <div className="key">Uploaded For:</div>
                                    <div className="value">
                                        {jds.map((jd) => {
                                            return (
                                                <div key={jd.JD_ID} className='jd-row'>
                                                    <span onClick={() => navigate(`/jd/${jd.JD_ID}`)}>
                                                        <i>{jd.position}</i>
                                                    </span>
                                                    <hr className='middle-line'/>
                                                    <span>{jd.weighted_percentage} </span> 
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>

                            )}
                                </div>

                        </Col>
                        <Col className='pdf-container'>
                            <iframe id='pdf-frame' src={require(`../../../../server/uploaded_CVs/${cv.cv_path.replace(/^.*[\\\/]/, '')}#toolbar=0`)} width="100%" overflowY="auto" height="100%"/>
                        </Col>
                    </Row>

                </div>
                : <div>Cv not found</div>
    )

}

export default CvDetails