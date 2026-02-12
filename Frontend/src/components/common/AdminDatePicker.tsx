import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon } from 'lucide-react';
import './AdminDatePicker.css';

interface AdminDatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholderText?: string;
    dateFormat?: string;
    className?: string;
}

export const AdminDatePicker: React.FC<AdminDatePickerProps> = ({
    selected,
    onChange,
    placeholderText = "Select Date",
    dateFormat = "MMMM d, yyyy",
    className = ""
}) => {
    return (
        <div className={`flex-none min-w-[200px] group ${className}`}>
            <div className="relative flex items-center h-10 w-full bg-white border border-gray-400 rounded-lg pl-10 pr-4 py-2 text-sm focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-600 transition-all">
                <CalendarIcon className="absolute left-3 w-4 h-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <DatePicker
                    selected={selected}
                    onChange={onChange}
                    dateFormat={dateFormat}
                    className="bg-transparent border-none p-0 focus:outline-none text-sm w-full cursor-pointer placeholder:text-gray-400 font-bold text-gray-900"
                    placeholderText={placeholderText}
                />
            </div>
        </div>
    );
};

export default AdminDatePicker;
