
// import React from 'react';

import React, { useEffect, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineLock, AiOutlineLogout, AiOutlineMail, AiOutlineUser } from 'react-icons/ai';
import Navbar from '../home/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { XTextfield } from '../../Conponents/Bath_Component';
import axios from 'axios';
import { AUTHENDPOINT, NETWORK_CONFIG } from '../../network/Network_EndPoint';
export const XButton = ({ label, icon, onClick, loading }) => {
    return (
        <div className='w-full'>
            <button
                className="flex items-center justify-center bg-green-600 text-white rounded font-semibold w-full py-2"
                onClick={onClick}
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center justify-center w-6 h-6">
                        <div className="spinner-border animate-spin inline-block w-6 h-6 border-4 rounded-full text-white" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {label}
                        {icon && <span>{icon}</span>}
                    </>
                )}
            </button>
        </div>
    );
};





const Signup = () => {
    const [toggleIconState, setIconToggle] = useState(false)
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [toggleIconConfirmState, setConfirmIconToggle] = useState(false)
    const [passwordState, setPassword] = useState("")
    const [passwordStrength, setPasswordStrength] = useState("");
    const [confirmPasswordState, setConfirmPassword] = useState("")
    const [passwordMatch, setPasswordMatch] = useState(false);
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();
    const toggleIcon = () => {
        setIconToggle(!toggleIconState)
    }

    const toggleConfirmIcon = () => {
        setConfirmIconToggle(!toggleIconConfirmState)
    }

    const validatePasswordLength = (password) => {
        if (password.length === 0) {
            setPasswordStrength("");
        } else if (password.length < 8) {
            setPasswordStrength("Weak");
        } else {
            setPasswordStrength("Strong");
        }
    }

    const validateConfirmPassword = (password) => {
        setPasswordMatch(password === passwordState)
    }

    const handlePasswordLength = (value) => {
        setPassword(value)
        validatePasswordLength(value)
    }
    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value);
        validateConfirmPassword(value);
    };
    const handleColorPasswordStrength = (passwordStrength) => {
        switch (passwordStrength) {
            case "Weak": return "red";
            case "Strong": return "green";
            default:
                return "gray";
        }
    }
    const onEmailChange = (value) => {
        setEmail(value)
    }
    const onUsernameChange = (value) => {
        setUsername(value)
    }
    const signUp = async (e) => {
        setLoading(true)
        var path = NETWORK_CONFIG.apiBaseUrl + AUTHENDPOINT.REGISTER;
        console.log("This is url " + path);
        const userBody = {
            username: username,
            email: email,
            password: passwordState,
        }

        await axios.post(path, userBody, { withCredentials: true })
            .then(function (response) {
                if (response.status === 201) {
                    console.log(response.data)
                    const token = response.data.token;
                    localStorage.setItem('authToken', token);
                    setLoading(false)
                    navigate('/', { replace: true })
                }
            },).catch(function (error) {
                console.log(error);
            }).finally(() => { setLoading(false) });
        ;
    };
    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center min-h-screen bg-gray-100">

                <div className="flex flex-col items-center w-full max-w-md bg-white p-6 rounded-lg shadow-md mt-6">
                    <h1 className="text-green-600 text-3xl font-bold mb-4 ">Sign Up</h1>

                    <XTextfield
                        label="Full Name"
                        placeHolder="YourName"
                        value={username}
                        onValueChange={onUsernameChange}
                        icon={<AiOutlineUser />}
                    />
                    <Spacer />
                    <XTextfield
                        label="Email Address"
                        placeHolder="@gmail.com"
                        value={email}
                        onValueChange={onEmailChange}
                        icon={<AiOutlineMail />}
                    />
                    <Spacer />
                    <XTextfield
                        label="Password"
                        placeHolder="X_AE_A13b"
                        icon={<AiOutlineLock />}
                        suffixIcon={toggleIconState ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                        validation={validatePasswordLength}
                        onValueChange={handlePasswordLength}
                        onClick={toggleIcon}
                        inputType={
                            toggleIconState ? "text" : "password"
                        }
                    />
                    <Spacer height={5} />
                    {passwordState && (
                        <p
                            className={`text-${handleColorPasswordStrength(passwordStrength)
                                }-500 font-semibold mt-2`}
                        >
                            Password strength: {passwordStrength}
                        </p>
                    )}
                    <Spacer />
                    <XTextfield
                        label="Confirm Password"
                        placeHolder="X_AE_A13b"
                        icon={<AiOutlineLock />}
                        suffixIcon={toggleIconConfirmState ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                        onClick={toggleConfirmIcon}
                        inputType={
                            toggleIconConfirmState ? "text" : "password"
                        }
                        onValueChange={handleConfirmPasswordChange}
                    />
                    <Spacer height={5} />
                    {confirmPasswordState && (
                        <p
                            className={`text-${passwordMatch ? "bg-green-400" : "bg-red-700"
                                }-500 font-semibold mt-2`}
                        >
                            {passwordMatch ? "Passwords match" : "Passwords do not match"}
                        </p>
                    )}
                    <Spacer />
                    <XButton label="Sign Up" icon={<AiOutlineLogout />} onClick={signUp} />
                    <Spacer />
                    <div className='flex items-center justify-center'>

                        <h2 className='font-semibold'>Already have an account?</h2>
                        <Spacer width={5} />
                        <Link to="/auth/Login">
                            <h2 className='text-green-600  font-semibold'>Sign In.</h2></Link>
                    </div>
                </div>
            </div>
        </div>

    )
}
export const Spacer = ({ height = 10, width = 10 }) => {
    return (
        <div style={{
            height: `${height}px`,
            width: `${width}px`
        }}></div>
    )
}
export default Signup;