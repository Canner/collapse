/* eslint-disable no-console */
import '@canner/rc-collapse/assets/index.less';
import 'string.prototype.repeat';
import Collapse, { Panel } from '@canner/rc-collapse';
import React from 'react';
import ReactDOM from 'react-dom';

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

function random() {
  return parseInt(Math.random() * 10, 10) + 1;
}

const Test = React.createClass({
  getInitialState() {
    return {
      time: random(),
      accordion: false,
      activeKey: ['4'],
    };
  },

  onChange(activeKey) {
    this.setState({
      activeKey,
    });
  },

  onDrag(e, data) {
    console.log(data, 'dragging');
  },

  getItems() {
    const items = [];
    for (let i = 0, len = 3; i < len; i++) {
      const key = i + 1;
      items.push(
        <Panel header={`This is panel header ${key}`} key={key}>
          <p>{text.repeat(this.state.time)}</p>
        </Panel>
      );
    }
    items.push(
      <Panel header={`This is panel header 4`} key="4">
        <Collapse defaultActiveKey="1" drag>
          <Panel header={`This is panel nest panel 1`} key="1">
            <p>{text}</p>
          </Panel>
          <Panel header={`This is panel nest panel 2`} key="2">
            <p>{text}</p>
          </Panel>
          <Panel header={`This is panel nest panel 3`} key="3">
            <p>{text}</p>
          </Panel>
        </Collapse>
      </Panel>
    );

    return items;
  },

  setActivityKey() {
    this.setState({
      activeKey: ['2'],
    });
  },

  reRender() {
    this.setState({
      time: random(),
    });
  },

  toggle() {
    this.setState({
      accordion: !this.state.accordion,
    });
  },

  dragStart(e, data) {
    console.log(data, 'start');
  },

  dragStop(e, data) {
    console.log(data, 'stop');
  },

  render() {
    const accordion = this.state.accordion;
    const btn = accordion ? 'accordion' : 'collapse';
    const activeKey = this.state.activeKey;
    return (<div style={{ margin: 20, width: 400 }}>
      <button onClick={this.reRender}>reRender</button>
      <button onClick={this.toggle}>{btn}</button>
      <br/><br/>
      <button onClick={this.setActivityKey}>active header 2</button>
      <br/><br/>
      <Collapse
        drag
        time={this.state.time}
        dragStart={this.dragStart}
        onDrag={this.onDrag}
        dragStop={this.dragStop}
        accordion={accordion}
        onChange={this.onChange}
        activeKey={activeKey}
      >
        {this.getItems()}
      </Collapse>
    </div>);
  },
});

ReactDOM.render(<Test/>, document.getElementById('__react-content'));
