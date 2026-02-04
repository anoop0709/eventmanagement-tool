import { Link } from 'react-router-dom';
import './Button.css';

export function Button(props) {
  const { className, ...rest } = props;

  if (props.as === 'link') {
    const { href, ...linkProps } = rest;
    return <Link to={href} className={`button button-primary ${className || ''}`} {...linkProps} />;
  }

  const variant = rest['data-variant'] || 'default';
  const classes = variant === 'primary' ? 'button button-primary' : 'button';

  return <button className={`${classes} ${className || ''}`} {...rest} />;
}
