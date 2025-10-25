import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}> = ({ 
  children, 
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`p-6 border-b border-gray-200 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardContent: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}> = ({ 
  children, 
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};