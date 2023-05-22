import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalState } from '../../GlobalState';
import 'bootstrap/dist/css/bootstrap.min.css';
import { sendEmailAPI, changePasswordAPI } from '../../API/UserAPI';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import picture from '../images/login-page.png'
import '../UI/resetpassword.css'

function ResetPassword() {

    const navigate = useNavigate();
    const state = useContext(GlobalState)
    const [isLoading, setIsLoading] = useState(false);
    const [otpForm, setOtpForm] = useState(true)
    const [email, setEmail] = useState('')
    const [user, setUser] = useState({
        user_email: '', user_otp: '', user_password: '', user_cpassword: ''
    })
    const onChangeEmail = e => {
        console.log(email)
        setEmail(e.target.value);
        setUser(prevUser => ({ ...prevUser, user_email: e.target.value }))
    }

    const onChangeInput = e => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value })
    }

    const SendOTPSubmit = async e => {
        e.preventDefault()
        sendEmailAPI({ email })
            .then(res => {
                showSuccessToast("OTP has been sent to the email successfully.");
                setOtpForm(false)
            })
            .catch(err => {
                console.log(err.response.data.error.msg)
                if (err.response.data.error.code == 500) {
                    showErrorToast("OTP sending failed. Please try again")
                }
                else {
                    showErrorToast(err.response.data.error.msg);
                }
            })
    }

    const ChangePasswordSubmit = async e => {
        e.preventDefault()

        if (user.user_otp === '' || user.user_password === '' || user.user_cpassword === '') {
            showErrorToast("Please fill in all fields");
        }
        else if (user.user_password.length < 8) {
            showErrorToast("Password should be atleast 8 characters long");
        }
        else if (user.user_password !== user.user_cpassword) {
            showErrorToast("Passwords do not match");
        }
        else {
            changePasswordAPI({ ...user })
                .then(res => {
                    showSuccessToast("Password has been changed successfully");
                    navigate('/login')
                })
                .catch(err => {
                    console.log(err.response.data.error.msg)
                    if (err.response.data.error.code == 500) {
                        showErrorToast("Password change failed. Please try again")
                    }
                    else {
                        showErrorToast(err.response.data.error.msg);
                    }
                })
        }
    }
    
    return (
        <div className='ResetPassword-page' style={{ background: 'linear-gradient(to bottom right, #e6f7ff, #dfecf8, #e5f9cd, #f5eef8, #f9ece3)' }}>
          <div className='ResetPassword-form-container'>
            <div className='ResetPassword-card' style={{ width: '400px', height: '320px' }}>
              <div className="ResetPassword-header">
                <h2 className='text1'>Reset Password</h2>
              </div>
              <div className='ResetPassword-form'>
                {otpForm ? (
                  <form>
                    <div>
                      <label className='label'>
                        <p className='text1'>Email</p>
                      </label>
                      <input
                        type='text'
                        name='email'
                        value={email}
                        required
                        onChange={onChangeEmail}
                        className='input'
                      />
                    </div>
                    <div className='button-group'>
                      <button
                        type='submit'
                        onClick={SendOTPSubmit}
                        className='custom-btn login-btn'
                        value='Submit'
                        position='center'
                      >
                        Send OTP
                      </button>
                      <button onClick={() => navigate('/login')} position='center' 
                className='custom-btn login-btn'>
                        Back
                      </button>
                    </div>
                  </form>
                ) : (
                  <form>
                    <div>
                      <label className='label'>
                        <p className='text1'>OTP</p>
                      </label>
                      <input
                        type='text'
                        name='user_otp'
                        value={user.user_otp}
                        required
                        onChange={onChangeInput}
                        className='input'
                      />
                    </div>
                    <div>
                      <label className='label'>
                        <p className='text1'>Password</p>
                      </label>
                      <input
                        type='password'
                        name='user_password'
                        value={user.user_password}
                        required
                        onChange={onChangeInput}
                        className='input'
                      />
                    </div>
                    <div>
                      <label className='label'>
                        <p className='text1'>Confirm Password</p>
                      </label>
                      <input
                        type='password'
                        name='user_cpassword'
                        value={user.user_cpassword}
                        required
                        onChange={onChangeInput}
                        className='input'
                      />
                    </div>
                    <div className='button-group'>
                      <button
                        type='submit'
                        onClick={ChangePasswordSubmit}
                        className='custom-btn login-btn'
                        value='Submit'
                        position='center'
                      >
                        Change Password
                      </button>
                      <button onClick={() => navigate('/login')} position='center'>
                        Back
                      </button>
                    </div>
                  </form>
                )}
                <ToastContainer />
              </div>
            </div>
          </div>
        </div>
      );
}

export default ResetPassword