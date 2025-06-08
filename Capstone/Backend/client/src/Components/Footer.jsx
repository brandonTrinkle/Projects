import { Link } from 'react-router-dom';//Imports link file in order to navigate between pages
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import prop-types for props validation
import { useLocalStorage } from '../Components/useLocalStorage'; // Import the custom hook

//Creates the header for to use for navigation
export default function Footer() {
    const [dateTime, setDateTime] = useState(new Date());
    const [marketStatus, setMarketStatus] = useState('Closed');
    const [tradeHours] = useLocalStorage('tradeHours', { startTime: '09:30', endTime: '16:00' });
    const [holidays] = useLocalStorage('holidays', {});
  
    useEffect(() => {
      const timer = setInterval(() => {
        setDateTime(new Date());
      }, 1000);

      return () => clearInterval(timer); // Cleanup the interval on component unmount
    }, []);
  
    //Checks the market status and updates the status
    useEffect(() => {
      const checkMarketStatus = () => {
        const currentDay = dateTime.getDay();
        const currentTime = dateTime.toTimeString().slice(0, 5);
        const isHoliday = holidays && holidays[dateTime.toDateString()] !== undefined;
        const isWeekend = currentDay === 0 || currentDay === 6;
  
        if (isHoliday || isWeekend) {
          setMarketStatus('Closed');
        } else if (
          tradeHours &&
          tradeHours.startTime &&
          tradeHours.endTime &&
          currentTime >= tradeHours.startTime &&
          currentTime <= tradeHours.endTime
        ) {
          setMarketStatus('Open');
        } else {
          setMarketStatus('Closed');
        }
      };
  
      const statusTimer = setInterval(checkMarketStatus, 1000);
      
      return () => clearInterval(statusTimer); // Cleanup the interval on component unmount
    }, [dateTime, tradeHours, holidays]);



    //Displays the sign in button when there is no user present. When user logged in displays a person icon.
    return (
        <div className='bg-slate-300 w-full z-30 mt-auto fixed bottom-0 max-h-16'>
          <div className="flex justify-between items-center max-w-8xl mx-auto p-4">
            <Link to='/'>
              <h1 className='font-bold'>TTU Platform</h1>
            </Link>
            <p>@All rights reserved</p>
            <div className="flex justify-between items-center max-w-8xl mx-auto p-4">
              <p className="mr-4">{dateTime.toLocaleDateString()}</p>
              <p>{dateTime.toLocaleTimeString()}</p>
              <p className="mr-4 text-red-600 pl-10">Market is {marketStatus}</p>
            </div>
          </div>
        </div>
      );
    }

// Define prop types
Footer.propTypes = {
    tradeHours: PropTypes.shape({
      startTime: PropTypes.string,
      endTime: PropTypes.string,
    }).isRequired,
    holidays: PropTypes.objectOf(PropTypes.string).isRequired,
  };