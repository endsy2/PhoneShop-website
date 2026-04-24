
import React, { useState } from 'react';
import { AiOutlineEyeInvisible, AiOutlineLock, AiOutlineLogout, AiOutlineMail, AiOutlineUser, AiOutlineEye } from 'react-icons/ai';
import Navbar from '../home/Navbar';
import { Spacer } from './SignUpScreen';
import { XTextfield } from '../../Conponents/Bath_Component';
import { XButton } from './SignUpScreen';
import { AUTHENDPOINT, NETWORK_CONFIG } from '../../network/Network_EndPoint';

import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
const Login = () => {
    const [passwordToggle, setPasswordToggle] = useState(false)
    const [passwordState, setPassword] = useState("")
    const [passwordStrength, setPasswordStrength] = useState("");
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    const toggleValidateIcon = () => {
        setPasswordToggle(!passwordToggle)
    }
    const handlePasswordLength = (value) => {
        setPassword(value)
        validatePasswordLength(value)
    }
    const validatePasswordLength = (passwordState) => {
        if (passwordState.length === 0) {
            setPasswordStrength("");
        } else if (passwordState.length < 8) {
            setPasswordStrength("Weak");
        } else {
            setPasswordStrength("Strong");
        }
    }
    const handleColorPasswordStrength = (passStrength) => {
        switch (passStrength) {
            case "Weak": return "red";
            case "Strong": return "green";
            default:
                return "gray";
        }
    }


    //function to login
    const login = async (e) => {
        console.log(email)
        setLoading(true)
        console.log(passwordState)
        await axios.post(`${NETWORK_CONFIG.apiBaseUrl}${AUTHENDPOINT.LOGIN}`, {
            email: email,
            password: passwordState,

        }, { withCredentials: true }).then(function (response) {
            const localToke = localStorage.getItem("authToken");
            if (response.status === 200) {
                setLoading(false)
                const token = response.data.token;
                if (!localToke) {
                    console.log("No token found in local storage. Saving new token...");
                    localStorage.setItem('authToken', token); // Save token to local storage
                    console.log('Token saved:', token);
                } else {
                    console.log("Token already exists in local storage.");
                }
                localStorage.setItem('authToken', token); // save token to local storage
                console.log('Token saved:', token);
                console.log(response.data)
                navigate('/', { replace: true })
            }
        }).catch(function (error) {
            console.log(error);
        }).finally(() => { setLoading(false) });
    }

    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center min-h-screen bg-gray-100">
                <div className="flex flex-col items-center w-full max-w-md bg-white p-6 rounded-lg shadow-md mt-6">

                    <h1 className="text-green-600 text-3xl font-bold mb-4 ">Sign In</h1>
                    <XTextfield
                        label="Email Address"
                        placeHolder="@gmail.com"
                        value={email}
                        onValueChange={(value) => setEmail(value)}
                        icon={<AiOutlineMail />}
                    />
                    <Spacer width={null} />
                    <XTextfield
                        label="Password"
                        placeHolder="password..."
                        value={passwordState}
                        icon={<AiOutlineLock />}
                        validation={validatePasswordLength}
                        onValueChange={handlePasswordLength}
                        suffixIcon={passwordToggle ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                        onClick={toggleValidateIcon}
                        inputType={
                            passwordToggle ? "text" : "password"
                        }
                    />
                    <Spacer width={null} height={5} />
                    {passwordState && (
                        <p
                            className={`text-${handleColorPasswordStrength(passwordStrength)
                                }-500 font-semibold mt-2`}
                        >
                            Password strength: {passwordStrength}
                        </p>
                    )}
                    <Spacer width={null} />
                    <XButton label="Sign In" icon={<AiOutlineLogout />} onClick={login} loading={loading} />

                    <Spacer width={null} />
                    <div className='flex items-center justify-center'>
                        <h2 className='font-semibold'>Don't have account yet?</h2>
                        <Spacer width={5} />
                        <Link to="/auth/Signup">
                            <h2 className='text-green-600  font-semibold' >Sign Up.</h2></Link>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Login