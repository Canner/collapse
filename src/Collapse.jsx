import React, { PropTypes, Children }from 'react';
import CollapsePanel from './Panel';
import openAnimationFactory from './openAnimationFactory';
import classNames from 'classnames';
import shallowEqual from 'shallowequal';
import { childrenEqual } from './utils';

function toArray(activeKey) {
  let currentActiveKey = activeKey;
  if (!Array.isArray(currentActiveKey)) {
    currentActiveKey = currentActiveKey ? [currentActiveKey] : [];
  }
  return currentActiveKey;
}

const Collapse = React.createClass({
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
    if ('activeKey' in nextProps) {
      this.setState({
        activeKey: toArray(nextProps.activeKey),
      });
    }
    if ('openAnimation' in nextProps) {
      this.setState({
        openAnimation: nextProps.openAnimation,
      });
    }
  },

  componentWillUpdate(nextProps, nextState) {
    if (
      !shallowEqual(nextProps, this.props)
      || !shallowEqual(nextState.activeKey, this.state.activeKey)
      || !shallowEqual(nextState.openAnimation, this.state.openAnimation)
      || !childrenEqual(this.props.children, nextProps.children)
    ) {
      this.setState({
        children: this.getItems(nextState.activeKey, nextState.openAnimation),
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

  getItems(activeKey, openAnimation) {
    const { prefixCls, children, accordion, drag, onDrag, dragStart, dragStop } = this.props;
    const newChildren = [];

    Children.forEach(this.state && this.state.children || children, (child, index) => {
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
    if (!('activeKey' in this.props)) {
      this.setState({ activeKey });
    }
    this.props.onChange(this.props.accordion ? activeKey[0] : activeKey);
  },

  swapPanel(fromKey, toKey) {
    const { children } = this.state;
    // create new array for children.
    const newChildren = children.slice();

    if (fromKey && toKey) {
      const fromIndex = children.findIndex((child) => child.props.dataKey === fromKey);
      const toIndex = children.findIndex((child) => child.props.dataKey === toKey);
      const tmp = newChildren[fromIndex];
      newChildren[fromIndex] = newChildren[toIndex];
      newChildren[toIndex] = tmp;
      this.props.onSwap(fromIndex, toIndex);
    }

    this.setState({
      children: newChildren,
    });
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
