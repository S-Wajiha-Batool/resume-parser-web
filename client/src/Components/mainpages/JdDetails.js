import React, {useState, useEffect, useContext} from 'react';
import {useParams} from 'react-router-dom'
import { GlobalState } from '../../GlobalState';
import { getJdAPI } from '../../API/JDAPI'
import {showSuccessToast, showErrorToast} from '../utilities/Toasts';

function JdDetails() {
    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [jd, setJd] = useState([]);
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
                    showErrorToast(err.response.data.error.msg)
                }
            }
            getJd()
        }
    }, [token])

    return (
        <div class="container text-center">
            <div class="row justify-content-between">
                <div class="col-4">
                    <p class="fw-bold fs-4 text-start">Job Description #: {id}</p>
                </div>
                <div class="col-4 ">
                    <button type='button'
                        className='btn btn-primary'
                        value='Submit'
                        position='center'>ADD CV
                    </button>
                </div>
            </div>
            <div class="row align-items-start">
                <div class="col border border-secondary rounded">
                    <p class="fw-bold fs-6 text-start">Title</p>
                    <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">HR Manager</p>
                    <p class="fw-bold fs-6 text-start">Department</p>
                    <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">HR</p>
                    <p class="fw-bold fs-6 text-start">Skills</p>
                    <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">Lorem ipsum</p>
                    <p class="fw-bold fs-6 text-start">Department</p>
                    <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">Lorem ipsum</p>
                    <p class="fw-bold fs-6 text-start">Qualification</p>
                    <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">Lorem ipsum</p>
                    <p class="fw-bold fs-6 text-start">Upload date</p>
                    <p class="fs-7 text-start border border-secondary rounded border-opacity-50 text-wrap">Lorem ipsum</p>
                </div>
                <div class="col">
                    CV table
                </div>
            </div>
        </div>
    )

}

export default JdDetails