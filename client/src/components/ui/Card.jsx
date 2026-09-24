export const Card = ({ children, className = '', onClick, hoverable = false }) => {
  const baseClasses = 'bg-heritage-surface border border-heritage-border rounded-xl shadow-sm transition-all duration-200';
  const hoverClasses = hoverable || onClick ? 'hover:shadow-md hover:border-heritage-accent cursor-pointer' : '';
  
  const isClickable = Boolean(onClick);
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
    >
      {children}
    </div>
  );
};
