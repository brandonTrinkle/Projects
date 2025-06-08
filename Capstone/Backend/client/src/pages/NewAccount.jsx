//Create new user page
import { Link, useNavigate } from 'react-router-dom';//Import Link for navigation between pages
import { useState } from 'react';//Import usestate in order to collect data from form
import '../Styling/NewAccount.css';//Import css file for styling'
import logo from '../assets/TTULogo.png';

//New account function
export default function NewAccount() {
    const [formData, setFormData] = useState({});//Creates an object with from form information
    const [error, setError] = useState(false);//Error handing
    const [loading, setLoading] = useState(false);//Loading handling during information upload
    const navigate = useNavigate();//Navigation handler
    const handleChange = (e) => {//Sets the form information into an array based on the id and value of the form items
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    //Submits data to database 
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(false);
            const res = await fetch('backend/auth/SignUp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
        //If information did not load properly
        setLoading(false);
            if (data.success === false) {
                setError(true);
                return;
            }
            navigate('/SignIn');//After submitting data navigate to sign in page
        }
    //Displays error message if failed to send information
        catch (error) {
            setLoading(false);
            setError(true);
        }

        
    };
    //HTML code for the New Account page
    return (
        <div className="auth-container">
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
            <div className='p-3 max-w-lg mx-auto'>
                <h1 className='test-3xl text-center font-semibold my-7'>Create New Account</h1>
                <div className="divider"></div>
            <form onSubmit={handleSubmit} className="">
                <input type="text" placeholder='Username' id='username' className='bg-slate-200 p-3 rounded-lg' onChange={handleChange} />
                <input type="text" placeholder='First Name' id='firstname' className='bg-slate-200 p-3 rounded-lg' onChange={handleChange} />
                <input type="text" placeholder='Last Name' id='lastname' className='bg-slate-200 p-3 rounded-lg' onChange={handleChange} />
                <input type="email" placeholder='Email' id='email' className='bg-slate-200 p-3 rounded-lg' onChange={handleChange} />
                <input type="password" placeholder='Password' id='password' className='bg-slate-200 p-3 rounded-lg' onChange={handleChange} />
                <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
                    {loading? 'Loading...' : 'Create' }
                </button>
        </form>
        <div className="">
            <p>Already have an account?</p>
            <Link to='/SignIn'>
                <span className= 'text-blue-500'>Sign In</span>
            </Link>
         </div>
       <p className='text-red-700 mt-5'>{error && 'An Error has occured!'} </p>
            </div>
     </div>
    )
}