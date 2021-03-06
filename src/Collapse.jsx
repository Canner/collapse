
import React, { Children }from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import CollapsePanel from './Panel';
import openAnimationFactory from './openAnimationFactory';
import classNames from 'classnames';
import shallowEqual from 'shallowequal';
import deepEqual from 'deep-equal';
import { childrenEqual } from './utils';

function toArray(activeKey) {
  let currentActiveKey = activeKey;
  if (!Array.isArray(currentActiveKey)) {
    currentActiveKey = currentActiveKey ? [currentActiveKey] : [];
  }
  return currentActiveKey;
}

const Collapse = createReactClass({
  propTypes: {
    drag: PropTypes.bool,
    dragStart: PropTypes.func,
    onDrag: PropTypes.func,
    dragStop: PropTypes.func,
    children: PropTypes.any,
    prefixCls: PropTypes.string,
    activeKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    defaultActiveKey: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    openAnimation: PropTypes.object,
    onChange: PropTypes.func,
    accordion: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
    onSwap: PropTypes.func,
    value: PropTypes.object,
  },

  statics: {
    Panel: CollapsePanel,
  },

  getDefaultProps() {
    return {
      prefixCls: 'rc-collapse',
      onChange() {
      },
      accordion: false,
      dragStop: arg => arg,
      dragStart: arg => arg,
      onDrag: arg => arg,
      onSwap: arg => arg,
    };
  },

  getInitialState() {
    let { activeKey } = this.props;
    const { defaultActiveKey } = this.props;
    let currentActiveKey = defaultActiveKey;
    if ('activeKey' in this.props) {
      currentActiveKey = activeKey;
    }

    activeKey = toArray(currentActiveKey);
    const openAnimation = this.props.openAnimation || openAnimationFactory(this.props.prefixCls);
    return {
      openAnimation,
      activeKey,
      children: this.getItems(activeKey, openAnimation),
    };
  },

  componentWillReceiveProps(nextProps) {
    if (!shallowEqual(nextProps.activeKey, this.props.activeKey)) {
      this.setState({
        activeKey: toArray(nextProps.activeKey),
      });
    }
    if (!shallowEqual(nextProps.openAnimation, this.props.openAnimation)) {
      this.setState({
        openAnimation: nextProps.openAnimation,
      });
    }
  },

  componentWillUpdate(nextProps, nextState) {
    if (
      !shallowEqual(nextState.activeKey, this.state.activeKey)
      || !childrenEqual(this.props.children, nextProps.children)
      || !deepEqual(nextProps.value, this.props.value)
    ) {
      this.setState({
        children: this.getItems(nextState.activeKey, nextState.openAnimation, nextProps.children),
      });
    }
  },

  onClickItem(key) {
    return () => {
      let activeKey = this.state.activeKey;
      if (this.props.accordion) {
        activeKey = activeKey[0] === key ? [] : [key];
      } else {
        activeKey = [...activeKey];
        const index = activeKey.indexOf(key);
        const isActive = index > -1;
        if (isActive) {
          // remove active state
          activeKey.splice(index, 1);
        } else {
          activeKey.push(key);
        }
      }
      this.setActiveKey(activeKey);
    };
  },

  getItems(activeKey, openAnimation, children) {
    const { prefixCls, accordion, drag, onDrag, dragStart, dragStop } = this.props;
    const newChildren = [];

    Children.forEach(children || (this.state && this.state.children) || this.props.children, (child, index) => { // eslint-disable-line max-len
      if (!child) return;
      // If there is no key provide, use the panel order as default key
      const key = child.key || String(index);
      const header = child.props.header;
      let isActive = false;
      if (accordion) {
        isActive = activeKey[0] === key;
      } else {
        isActive = activeKey.indexOf(key) > -1;
      }

      const props = {
        key,
        header,
        isActive,
        prefixCls,
        drag,
        onDrag,
        dragStop,
        dragStart,
        openAnimation,
        activeKey,
        dataKey: key,
        setActiveKey: this.setActiveKey,
        swapPanel: this.swapPanel,
        children: child.props.children,
        onItemClick: this.onClickItem(key).bind(this),
      };

      newChildren.push(React.cloneElement(child, props));
    });

    return newChildren;
  },

  setActiveKey(activeKey) {
    this.setState({ activeKey });
    this.props.onChange(this.props.accordion ? activeKey[0] : activeKey);
  },

  swapPanel(fromKey, toKey) {
    if (fromKey && toKey) {
      const { children } = this.state;
      // create new array for children.
      const newChildren = children.slice();

      const fromIndex = children.findIndex((child) => child.props.dataKey === fromKey);
      const toIndex = children.findIndex((child) => child.props.dataKey === toKey);
      const tmp = newChildren[fromIndex];
      newChildren[fromIndex] = newChildren[toIndex];
      newChildren[toIndex] = tmp;
      this.props.onSwap(fromIndex, toIndex);
      this.setState({
        children: newChildren,
        activeKey: [],
      });
    }
  },

  render() {
    const { prefixCls, className, style } = this.props;
    const collapseClassName = classNames({
      [prefixCls]: true,
      [className]: !!className,
    });

    return (
      <div className={collapseClassName} style={style}>
        {this.state.children}
      </div>
    );
  },
});

export default Collapse;
