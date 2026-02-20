import { Button } from 'antd';
import { Icon } from './Icon';

export function ActionButton({
  icon,
  children,
  iconPosition = 'left',
  ...props
}) {
  const iconElement = icon && <Icon name={icon} />;

  return (
    <Button
      icon={iconPosition === 'left' ? iconElement : undefined}
      {...props}
    >
      {children}
      {iconPosition === 'right' && iconElement}
    </Button>
  );
}

// Predefined button variants
ActionButton.Primary = (props) => <ActionButton type="primary" {...props} />;
ActionButton.Primary.displayName = 'ActionButton.Primary';

ActionButton.Secondary = (props) => <ActionButton {...props} />;
ActionButton.Secondary.displayName = 'ActionButton.Secondary';

ActionButton.Text = (props) => <ActionButton type="text" {...props} />;
ActionButton.Text.displayName = 'ActionButton.Text';

ActionButton.Link = (props) => <ActionButton type="link" {...props} />;
ActionButton.Link.displayName = 'ActionButton.Link';

ActionButton.Danger = (props) => <ActionButton danger {...props} />;
ActionButton.Danger.displayName = 'ActionButton.Danger';