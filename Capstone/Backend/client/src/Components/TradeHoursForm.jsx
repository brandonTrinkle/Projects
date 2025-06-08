import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import prop-types for props validation

const TradeHoursForm = ({ tradeHours, onSave }) => {
    const [startTime, setStartTime] = useState(tradeHours.startTime || '');
    const [endTime, setEndTime] = useState(tradeHours.endTime || '');

    const handleSave = () => {
        onSave({ startTime, endTime });
    };

    return (
        <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xl mb-4">Set Trade Hours</h2>
            <div className="mb-4">
                <label className="block mb-2">Start Time</label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="mb-4">
                <label className="block mb-2">End Time</label>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div className="flex justify-end mt-4">
                <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
            </div>
        </div>
    );
};
// Define prop types
TradeHoursForm.propTypes = {
    tradeHours: PropTypes.shape({
        startTime: PropTypes.string,
        endTime: PropTypes.string
    }).isRequired,
    onSave: PropTypes.func.isRequired
};

export default TradeHoursForm;