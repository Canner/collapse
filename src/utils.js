import React, { Children } from 'react';
import isEqual from 'lodash.isequal';
import browserPrefix from './getPrefix';

function kebabToTitleCase(str) {
  let out = '';
  let shouldCapitalize = true;
  for (let i = 0; i < str.length; i++) {
    if (shouldCapitalize) {
      out += str[i].toUpperCase();
      shouldCapitalize = false;
    } else if (str[i] === '-') {
      shouldCapitalize = true;
    } else {
      out += str[i];
    }
  }
  return out;
}

export function browserPrefixToKey(prop, prefix) {
  return prefix ? `${prefix}${kebabToTitleCase(prop)}` : prop;
}

export function createCSSTransform({ x, y }) {
  // Replace unitless items with px
  return { [browserPrefixToKey('transform', browserPrefix)]: `translate(${x}px,${y}px)` };
}

/**
 * Comparing React `children` is a bit difficult. This is a good way to compare them.
 * This will catch differences in keys, order, and length.
 */
export function childrenEqual(prevChild, nextChild) {
  return isEqual(React.Children.map(prevChild, child => child.key),
    Children.map(nextChild, child => child.key));
}
