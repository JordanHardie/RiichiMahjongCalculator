import React from 'react';

const ConditionToggle = ({ label, value, onChange, disabled = false }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
        </label>
        <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-gray-300"
        />
    </div>
);

export default ConditionToggle;