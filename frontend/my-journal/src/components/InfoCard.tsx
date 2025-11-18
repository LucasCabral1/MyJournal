import React from 'react';

export interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
}



interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  isEditing: boolean;
  
  displayValue: React.ReactNode; 

  type?: 'text' | 'email' | 'checkbox' | 'static';
  name?: string;
  value?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean; 
}

export const InfoCard: React.FC<ProfileFieldProps> = ({
  icon,
  label,
  isEditing,
  displayValue,
  type = 'static', 
  name,
  value,
  checked,
  onChange,
  disabled = false, 
}) => {
  
  if (!isEditing || type === 'static') {
    return (
      <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-cyan-600 mt-2 mr-3 flex-shrink-0">{icon}</div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{label}</h3>
          <p className="text-md font-semibold text-gray-900 break-words">
            {displayValue}
          </p>
        </div>
      </div>
    );
  }

  if (type === 'checkbox') {
    return (
      <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-cyan-500 border-dashed">
        <div className="text-cyan-600 mr-3 flex-shrink-0">{icon}</div>
        <div className="flex items-center justify-between w-full">
          <label
            htmlFor={name}
            className="text-md font-semibold text-gray-900 cursor-pointer"
          >
            {label}
          </label>
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={checked}
            onChange={onChange}
            className="h-5 w-5 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-cyan-500 border-dashed">
      <div className="text-cyan-500 mt-2 mr-3 flex-shrink-0">{icon}</div>
      <div className="w-full">
        <label htmlFor={name} className="block text-sm font-medium text-gray-500">
          {label}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="block w-full text-md font-semibold text-gray-900 bg-transparent border-0 p-0 
                     focus:ring-0 focus:border-cyan-500
                     disabled:text-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};


export default InfoCard;

