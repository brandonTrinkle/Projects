import { useState } from 'react'//Imports state files to collect data from user
import { Link, useNavigate } from 'react-router-dom';//Imports files for navigating
import { signInStart, signInSuccess, signInFailure } from '../redux/User/UserSlice';//Imports files to sign in
import { useDispatch, useSelector } from 'react-redux';//Imports files for use in redux store
import '../Styling/SignIn.css';//Imports css file for styling
import logo from '../assets/TTULogo.png';
//Function to sign in to account
export default function SignIn() {
    const [formData, setFormData] = useState({});
    const { loading, error } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(signInStart());
            const res = await fetch('/backend/auth/SignIn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();


            if (!res.ok || data.success === false) {
                dispatch(signInFailure(data));
                return;
            }
            // Store user info in localStorage
            localStorage.setItem("currentUser", JSON.stringify(data));
    
            dispatch(signInSuccess(data)); // Update Redux store
            navigate('/Profile'); // Redirect after login
        } catch (error) {
            dispatch(signInFailure(error));
        }
    };

    return (
        <div className='sign-container'>
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <h1 className='test-3xl text-center font-semibold my-7'>Sign In To Your Account</h1>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <input type="text" placeholder='Username' id='username' className='bg-slate-200 p-3 rounded-lg' onChange={handleChange} />
                <input type="password" placeholder='Password' id='password' className='bg-slate-200 p-3 rounded-lg' onChange={handleChange} />
                <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
                    {loading ? 'Loading...' : 'Sign In'}
                </button>
            </form>
            <div className="">
                <p>Need an account?</p>
                <Link to='/NewAccount'>
                    <span className='text-blue-500'>Create New Account</span>
                </Link>
            </div>

            <p className='text-red-700 mt-5'>{error ? error.message || 'An Error has occured!' : ''} </p>
        </div>
    )
}