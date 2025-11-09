
interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  spinnerText?: string;
}


export default function Loader({
  size = 'md',
  className = '',
  spinnerText = 'Carregando...',
}: LoaderProps) {
  
 
  const sizeClasses = {
    sm: 'h-6 w-6 border-2', 
    md: 'h-10 w-10 border-4', 
    lg: 'h-16 w-16 border-4', 
  };

  return (
    <div
      role="status"
      className={`
        animate-spin 
        rounded-full 
        border-solid 
        border-gray-200 
        border-t-cyan-600 
        ${sizeClasses[size]} 
        ${className}
      `}
      aria-live="polite"
    >
      <span className="sr-only">{spinnerText}</span>
    </div>
  );
}