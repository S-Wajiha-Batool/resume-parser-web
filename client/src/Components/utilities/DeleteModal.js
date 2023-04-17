import React, { useState, useContext } from 'react';
import { GlobalState } from '../../GlobalState';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { showSuccessToast, showErrorToast } from './Toasts';
import { deleteJdAPI } from '../../API/JDAPI';
import { deleteCVAPI } from '../../API/CVAPI';
import { deleteCvAgainstJdAPI } from '../../API/CVAPI';

function DeleteModal({showModal, handleCloseModal, data, target}){

    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [callbackJd, setCallbackJd] = state.JDAPI.callbackJd;
    const [callbackCv, setCallbackCv] = state.CVAPI.callbackCv;
    const [callbackJdDetails, setCallbackJdDetails] = state.JDAPI.callbackJdDetails;
    const [isDeleting, setIsDeleting] = useState(false)

    const onConfirmDeleteJd = (e) => {
        try {
            setIsDeleting(true)
            deleteJdAPI(data._id, { is_active: false }, token)
                .then(res => {
                    showSuccessToast(`${data.position} deleted successfully`)
                    handleCloseModal()
                    setCallbackJd(!callbackJd)
                })
                .catch(err => {
                    console.log(err.response.data.error.msg)
                    if (err.response.data.error.code == 500) {
                        showErrorToast("Deletion failed")
                    }
                })
                .finally(() => {
                    setIsDeleting(false)
                })
        }
        catch (err) {
            console.log(err)
            showErrorToast("Error in JD deletion")
            setIsDeleting(false)
        }

    }

    const onConfirmDeleteCv = (e) => {
        try {
            setIsDeleting(true)
            deleteCVAPI(data._id, { is_active: false }, token)
                .then(res => {
                    showSuccessToast(`${data.cv_original_name} deleted successfully`)
                    handleCloseModal()
                    setCallbackCv(!callbackCv)
                })
                .catch(err => {
                    console.log(err.response.data.error.msg)
                    if (err.response.data.error.code == 500) {
                        showErrorToast("Deletion failed")
                    }
                })
                .finally(() => {
                    setIsDeleting(false)
                })
        }
        catch (err) {
            console.log(err)
            showErrorToast("Error in CV deletion")
            setIsDeleting(false)
        }
    }

    const onConfirmDeleteCvAgainstJd = (e) => {
        setIsDeleting(true)
        deleteCvAgainstJdAPI(data._id, { is_active_cv_jd: false }, token)
            .then(res => {
                showSuccessToast(`${data.cv_original_name} deleted successfully`)
                handleCloseModal()
                setCallbackJdDetails(!callbackJdDetails)
            })
            .catch(err => {
                console.log(err.response.data.error.msg)
                if (err.response.data.error.code == 500) {
                    showErrorToast("Deletion failed")
                }
            })
            .finally(() => {
                setIsDeleting(false)
            })
    }

    return(
        <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header >
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {target=="jd" && `Are you sure you want to delete ${data.position}?`}
                    {target!="jd" && `Are you sure you want to delete ${data.cv_original_name}?`}
                </Modal.Body>
                <Modal.Footer>
                    {!isDeleting && <Button variant="secondary" onClick={handleCloseModal}>No</Button>}
                    <Button variant="danger" disabled={isDeleting} onClick={() => target=="jd" ? onConfirmDeleteJd() : target=="cv" ? onConfirmDeleteCv() : onConfirmDeleteCvAgainstJd()}>
                        {isDeleting && <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />}
                        {isDeleting ? " Deleting..." : "Yes"}</Button>

                </Modal.Footer>
            </Modal>
    )
}

export default DeleteModal