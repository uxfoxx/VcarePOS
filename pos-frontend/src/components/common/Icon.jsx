
export function Icon({ name, className = '', size = 'text-base', ...props }) {
  return (
    <span
      className={`material-icons ${size} ${className}`}
      {...props}
    >
      {name}
    </span>
  );
}

// Predefined icon sizes
Icon.Small = ({ name, className = '', ...props }) => (
  <Icon name={name} size="text-sm" className={className} {...props} />
);
Icon.Small.displayName = 'Icon.Small';

Icon.Medium = ({ name, className = '', ...props }) => (
  <Icon name={name} size="text-base" className={className} {...props} />
);
Icon.Medium.displayName = 'Icon.Medium';

Icon.Large = ({ name, className = '', ...props }) => (
  <Icon name={name} size="text-lg" className={className} {...props} />
);
Icon.Large.displayName = 'Icon.Large';

Icon.XLarge = ({ name, className = '', ...props }) => (
  <Icon name={name} size="text-xl" className={className} {...props} />
);
Icon.XLarge.displayName = 'Icon.XLarge';