import { Link } from 'react-router-dom';//Imports link file in order to navigate between pages
import { useSelector } from 'react-redux';//Imports files to check if user logged in
import '../Styling/Header.css';//Imports css file for styling
import logo from '../assets/TTULogo.png';
import personIcon from '../assets/PersonIcon.png';

//Creates the header for to use for navigation
export default function Header() {

    const { currentUser } = useSelector(state => state.user) //Creates a constant to define user state if logged in

    //Displays the sign in button when there is no user present. When user logged in displays a person icon.
    return (
     <div className="navi">
        
            <Link to='/'>
                    <div className="logo">
                        <img src={logo} alt="Logo" />
                    </div>
            </Link>
            <ul>
                <Link to='/'>
                    <li>Home</li>
                </Link>
                <Link to='/About'>
                    <li>About</li>
                </Link>
                    <Link to='/NewAccount'>
                        {currentUser ? (
                            <p></p>
                        ) : (
                            <li>Create New Account</li>
                        )}
                    </Link>
                <Link to='/Profile'> 
                   {currentUser ? (
                        <img src={personIcon} alt="Profile" className='h-20 w-20 rounded-full object-cover'/>
                    ):(
                      <li>Sign In</li>
                   )}
                 </Link>
  
            </ul>  
     </div>
    )
}
