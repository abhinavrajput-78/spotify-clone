const IconField = ({ icon: Icon, children, className = "", multiline = false }) => (
  <div className={`relative ${className}`}>
    <Icon
      aria-hidden="true"
      className={`pointer-events-none absolute left-3.5 text-lg text-gray-400 ${
        multiline ? "top-4" : "top-1/2 -translate-y-1/2"
      }`}
    />
    {children}
  </div>
);

export default IconField;