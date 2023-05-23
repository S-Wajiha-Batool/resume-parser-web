import { ToastContainer, toast } from 'react-toastify';
import React from 'react';

export const showSuccessToast = (msg) => {
        toast.success(msg, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            progress: undefined,
            })
    };

export const showErrorToast = (msg) => {
        toast.error(msg, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            progress: undefined,
            })
    };
