import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon } from 'lucide-react';
import './CustomDatePicker.css';

interface CustomDatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholderText?: string;
    dateFormat?: string;
    className?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    selected,
    onChange,
    placeholderText = "Select Date",
    dateFormat = "MMMM d, yyyy",
    className = ""
}) => {
    return (
        <div className={`flex-none min-w-[200px] group ${className}`}>
            <div className="relative flex items-center h-10 w-full bg-gray-50 border border-gray-400 rounded-lg pl-10 pr-4 py-2 text-sm focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all">
                <CalendarIcon className="absolute left-3 w-4 h-4 text-teal-600 group-focus-within:text-teal-500 transition-colors" />
                <DatePicker
                    selected={selected}
                    onChange={onChange}
                    dateFormat={dateFormat}
                    className="bg-transparent border-none p-0 focus:outline-none text-sm w-full cursor-pointer placeholder:text-[#9CA3AF]"
                    placeholderText={placeholderText}
                />
            </div>
        </div>
    );
};

export default CustomDatePicker;
