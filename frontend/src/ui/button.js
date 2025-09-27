import React, { forwardRef } from 'react';

/**
 * Utility function to combine class names.
 * @param {...(string|Object|null|undefined)} classes
 * @returns {string}
 */
function cn() {
  var classes = [];
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (arg) {
      // Check if argument is truthy
      var argType = typeof arg;
      if (argType === 'string' || argType === 'number') {
        classes.push(arg);
      } else if (Object.prototype.toString.call(arg) === '[object Object]') {
        for (var key in arg) {
          if (arg.hasOwnProperty(key) && arg[key]) {
            classes.push(key);
          }
        }
      }
    }
  }
  return classes.join(' ');
}

const Button = forwardRef((props, ref) => {
  const {
    variant = 'default',
    size = 'default',
    className,
    asChild = false,
    ...otherProps
  } = props;

  const Comp = asChild ? 'button' : 'button';
  const baseClasses = cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    {
      'bg-primary text-primary-foreground hover:bg-primary/90':
        variant === 'default',
      'bg-secondary text-secondary-foreground hover:bg-secondary/80':
        variant === 'secondary',
      'bg-destructive text-destructive-foreground hover:bg-destructive/90':
        variant === 'destructive',
      'outline-none border border-input text-foreground hover:bg-accent hover:text-accent-foreground':
        variant === 'outline',
      'text-primary hover:underline': variant === 'link',
      'bg-transparent hover:bg-accent hover:text-accent-foreground':
        variant === 'ghost',
      'px-4 py-2': size === 'default',
      'px-3 py-1.5': size === 'sm',
      'px-5 py-3': size === 'lg',
      'p-2': size === 'icon',
    },
    className,
  );

  if (asChild) {
    return <Comp ref={ref} {...otherProps} className={baseClasses} />;
  }

  return <Comp ref={ref} {...otherProps} className={baseClasses} />;
});
Button.displayName = 'Button';

export { Button };
