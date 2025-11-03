import React from 'react';

// Tipos para as props do Botão
// Definimos as variantes de cor que o botão pode ter
type ButtonVariant = 'primary' | 'secondary' | 'success';

type ButtonProps = {
  children: React.ReactNode; // O texto ou ícones dentro do botão
  onClick?: () => void; // '?' torna a prop opcional
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset'; // Tipo do botão HTML
};

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', // Valor padrão
  icon, 
  type = 'button' // Valor padrão
}) => {
  
  // Mapeamento de variantes para classes Tailwind
  const baseClasses = "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Usamos um Record para mapear nossas variantes (primary, secondary) para as classes do Tailwind
  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  };

  const buttonClass = `${baseClasses} ${variantClasses[variant]}`;

  return (
    <button type={type} onClick={onClick} className={buttonClass}>
      {/* 'mr-2' = margin-right: 0.5rem (substitui o 'me-2' do Bootstrap) */}
      {icon && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default Button;

