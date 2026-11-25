export const Card = ({ ref, children, className = '', ...props }) => {
  return (
    <div ref={ref} className={`editorial-card p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};
