import TabContent from './TabContent';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import Hammer from 'rc-hammerjs';
import ReactDOM from 'react-dom';
import {
  isVertical,
  getActiveIndex,
  getTransformByIndex,
  setTransform,
  getActiveKey,
  toArray,
  setTransition,
} from './utils';

const RESISTANCE_COEF = 0.6;

function computeIndex({
  maxIndex,
  startIndex,
  delta,
  viewSize,
}) {
  let index = startIndex + -delta / viewSize;
  if (index < 0) {
    index = Math.exp(index * RESISTANCE_COEF) - 1;
  } else if (index > maxIndex) {
    index = maxIndex + 1 - Math.exp((maxIndex - index) * RESISTANCE_COEF);
  }
  return index;
}



export default class SwipeableTabContent extends Component {

  static propTypes =  {
    tabBarPosition: PropTypes.string,
    onChange: PropTypes.func,
    children: PropTypes.any,
    hammerOptions: PropTypes.any,
    animated: PropTypes.bool,
    activeKey: PropTypes.string,
  };

  static defaultProps = {
    animated: true,
  };

  componentDidMount() {
    this.rootNode = ReactDOM.findDOMNode(this);
  }

  handleStart = () => {
    const { tabBarPosition, children, activeKey, animated } = this.props;
    const startIndex = this.startIndex = getActiveIndex(children, activeKey);
    if (startIndex === -1) {
      return;
    }
    if (animated) {
      setTransition(this.rootNode.style, 'none');
    }
    this.startDrag = true;
    this.children = toArray(children);
    this.maxIndex = this.children.length - 1;
    this.viewSize = isVertical(tabBarPosition) ?
      this.rootNode.offsetHeight :
      this.rootNode.offsetWidth;
  }
  handleMove = (e) => {
    const { tabBarPosition } = this.props;
    if (!this.startDrag) {
      return;
    }
    const currentIndex = this.getIndexByDelta(e);
    console.log("move index: ", currentIndex);
    if (currentIndex !== undefined) {
      setTransform(this.rootNode.style, getTransformByIndex(currentIndex, tabBarPosition));
    }
  }
  handleEnd = (e) => {
    if (!this.startDrag) {
      return;
    }
    this.end(e);
  }


  getIndexByDelta = (e) => {
    const { tabBarPosition } = this.props;
    if (!e || !e.touches || !e.touches[0]) {
      return;
    }
    const { clientX, clientY } = e.touches[0];
    const nowClientPos = isVertical(tabBarPosition) ? clientY : clientX;
    if (!this.preClientPos) {
      this.delta = 0;
      this.preClientPos = nowClientPos;
    } else {
      this.delta = nowClientPos - this.preClientPos;
      this.preClientPos = nowClientPos;
    }
    console.log('delta: ', this.delta);
    const currentIndex = computeIndex({
      maxIndex: this.maxIndex,
      viewSize: this.viewSize,
      startIndex: this.startIndex,
      delta: this.delta,
    });
    let showIndex = this.delta < 0 ? Math.floor(currentIndex + 1) : Math.floor(currentIndex);
    if (showIndex < 0) {
      showIndex = 0;
    } else if (showIndex > this.maxIndex) {
      showIndex = this.maxIndex;
    }
    if (this.children[showIndex].props.disabled) {
      return undefined;
    }
    return currentIndex;
  }
  end = (e, swipe) => {
    const { tabBarPosition, animated } = this.props;
    this.startDrag = false;
    if (animated) {
      setTransition(this.rootNode.style, '');
    }
    const currentIndex = this.getIndexByDelta(e);
    console.log('end currentIndex:', currentIndex);
    let finalIndex = this.startIndex;
    if (currentIndex !== undefined) {
      if (currentIndex < 0) {
        finalIndex = 0;
      } else if (currentIndex > this.maxIndex) {
        finalIndex = this.maxIndex;
      } else if (swipe) {
        const delta = isVertical(tabBarPosition) ? e.deltaY : e.deltaX;
        finalIndex = delta < 0 ? Math.ceil(currentIndex) : Math.floor(currentIndex);
      } else {
        const floorIndex = Math.floor(currentIndex);
        if (currentIndex - floorIndex > 0.6) {
          finalIndex = floorIndex + 1;
        } else {
          finalIndex = floorIndex;
        }
      }
    }
    if (this.children[finalIndex].props.disabled) {
      return;
    }
    if (this.startIndex === finalIndex) {
      if (animated) {
        setTransform(this.rootNode.style,
          getTransformByIndex(finalIndex, this.props.tabBarPosition));
      }
    } else {
      this.props.onChange(getActiveKey(this.props.children, finalIndex));
    }
  }
  render() {
    return (
      <div
        onTouchStart={this.handleStart}
        onTouchMove={this.handleMove}
        onTouchEnd={this.handleEnd}
      >
        <TabContent {...this.props}/>
      </div>
    );
  }
}
