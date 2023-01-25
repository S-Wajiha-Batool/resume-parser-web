import { ToastContainer, toast } from 'react-toastify';
import React from 'react';

export const showSuccessToast = (msg) => {
        toast.success(msg, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            //pauseOnHover: true,
            //draggable: true,
            progress: undefined,
            })
    };

export const showErrorToast = (msg) => {
        toast.error(msg, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            //pauseOnHover: true,
            //draggable: true,
            progress: undefined,
            })
    };
