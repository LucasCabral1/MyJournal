import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success';

type ButtonProps = {
  children: React.ReactNode; 
  onClick?: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset'; 
};

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  icon, 
  type = 'button' 
}) => {
  

  const baseClasses = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  };

  const buttonClass = `${baseClasses} ${variantClasses[variant]}`;

  return (
    <button type={type} onClick={onClick} className={buttonClass}>
      {icon && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default Button;

