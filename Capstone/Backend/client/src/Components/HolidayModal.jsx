// components/HolidayModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import prop-types for props validation

const HolidayModal = ({ isOpen, onClose, onSave }) => {
    const [holiday, setHoliday] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(holiday);
        setHoliday('');
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded shadow-lg">
                <h2 className="text-xl mb-4">Add Holiday</h2>
                <input
                    type="text"
                    value={holiday}
                    onChange={(e) => setHoliday(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Holiday Name"
                />
                <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>
                    <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
                </div>
            </div>
        </div>
    );
};
// Define prop types
HolidayModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
};

export default HolidayModal;