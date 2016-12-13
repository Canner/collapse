import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { DraggableCore } from 'react-draggable';
import PanelContent from './PanelContent';
import { createCSSTransform } from './utils';
import Animate from 'rc-animate';
import SwapVertical from 'react-icons/lib/md/swap-vert';

const CollapsePanel = React.createClass({
  propTypes: {
    dataKey: PropTypes.string,
    drag: PropTypes.bool,
    dragStart: PropTypes.func,
    onDrag: PropTypes.func,
    dragStop: PropTypes.func,
    swapPanel: PropTypes.func,
    className: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]),
    children: PropTypes.any,
    openAnimation: PropTypes.object,
    prefixCls: PropTypes.string,
    header: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.node,
    ]),
    isActive: PropTypes.bool,
    setActiveKey: PropTypes.func,
    activeKey: PropTypes.array,
    onItemClick: PropTypes.func,
  },

  getDefaultProps() {
    return {
      isActive: false,
      onItemClick() {
      },
    };
  },

  getInitialState() {
    return {
      dragging: false,
      dragTransform: createCSSTransform({ x: 0, y: 0 }),
    };
  },

  handleItemClick() {
    this.props.onItemClick();
  },

  handleStart(e, data) {
    // handle drag start
    e.preventDefault();
    e.stopPropagation();
    const { setActiveKey, activeKey } = this.props;

    if (activeKey.length > 0) {
      setActiveKey([]);
      return false;
    }

    this.translateY = 0;
    this.setState({
      dragging: true,
    });
    this.props.dragStart(e, data);
  },

  handleDrag(e, data) {
    // handle dragging
    const { swapPanel } = this.props;
    const { deltaY } = data;
    const parentNode = data.node.parentNode;
    const nextPanel = parentNode.nextSibling;
    const prevPanel = parentNode.previousSibling;

    const parentNodeHeight = parentNode ? parentNode.clientHeight : null;
    const prevPanelHeight = prevPanel ? prevPanel.clientHeight : null;
    const fromKey = parentNode.getAttribute('data-panel-key');
    this.translateY += deltaY;

    if (nextPanel && parentNodeHeight && this.translateY > parentNodeHeight) {
      // swap place with the next panel
      this.translateY = 0;
      const nextKey = nextPanel.getAttribute('data-panel-key');
      swapPanel(fromKey, nextKey);
    } else if (prevPanel && prevPanelHeight && this.translateY < -prevPanelHeight) {
      // swap place with the previous panel
      this.translateY = 0;
      const prevKey = prevPanel.getAttribute('data-panel-key');
      swapPanel(fromKey, prevKey);
    }

    this.setState({
      dragTransform: createCSSTransform({ x: 0, y: this.translateY }),
    });

    this.props.onDrag(e, data);
  },

  handleStop(e, data) {
    // handle stop dragging
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      dragging: false,
      dragTransform: createCSSTransform({ x: 0, y: 0 }),
    });
    this.props.dragStop(e, data);
  },

  render() {
    const { className, prefixCls, header, children, isActive, drag, dataKey } = this.props;
    const headerCls = `${prefixCls}-header`;
    const itemCls = classNames({
      [`${prefixCls}-item`]: true,
      [`${prefixCls}-item-active`]: isActive,
      [className]: className,
    });
    return (
      <div
        className={itemCls}
        data-panel-key={dataKey.toString()}
      >
        {this.state.dragging ? (
            <div
              style={{ position: 'absolute' }}
              className={headerCls}
              onClick={this.handleItemClick}
              role="tab"
              aria-expanded={isActive}
            >
              <i className="arrow"></i>
              {header}
            </div>
          ) : null
        }
        {drag ? (
            <DraggableCore
              handle=".swap"
              zIndex={100}
              onStart={this.handleStart}
              onDrag={this.handleDrag}
              onStop={this.handleStop}
            >
              <div
                className={headerCls}
                style={this.state.dragTransform}
                onClick={this.handleItemClick}
                role="tab"
                aria-expanded={isActive}
              >
                <i className="arrow"></i>
                {header}
                <SwapVertical className="swap"/>
              </div>
            </DraggableCore>
          ) : (
            <div
              className={headerCls}
              onClick={this.handleItemClick}
              role="tab"
              aria-expanded={isActive}
            >
              <i className="arrow"></i>
              {header}
            </div>
          )
        }
        <Animate
          showProp="isActive"
          exclusive
          component=""
          animation={this.props.openAnimation}
        >
          <PanelContent prefixCls={prefixCls} isActive={isActive}>
            {children}
          </PanelContent>
        </Animate>
      </div>
    );
  },
});

export default CollapsePanel;
