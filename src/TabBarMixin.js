import React from 'react';
import classnames from 'classnames';
import warning from 'warning';

const tabBarExtraContentStyle = {
  float: 'right',
};

export default {
  getDefaultProps() {
    return {
      styles: {},
    };
  },
  onTabClick(key) {
    this.props.onTabClick(key);
  },
  getTabs() {
    const props = this.props;
    const children = props.panels;
    const rst = [];
    const prefixCls = props.prefixCls;

    React.Children.forEach(children, (child) => {
      if (!child) {
        return;
      }
      const key = child.key;
      let cls = this.props.activeKey === key ? `${prefixCls}-tab-active` : '';
      cls += ` ${prefixCls}-tab`;
      let events = {};
      if (child.props.disabled) {
        cls += ` ${prefixCls}-tab-disabled`;
      } else {
        events = {
          onClick: this.onTabClick.bind(this, key),
        };
      }
      warning('tab' in child.props, 'There must be `tab` property on children of Tabs.');
      rst.push(<div
        role="tab"
        aria-disabled={child.props.disabled ? 'true' : 'false'}
        aria-selected={this.props.activeKey === key ? 'true' : 'false'}
        {...events}
        className={cls}
        key={key}
        ref={(tab) => {
          if (this.props.activeKey === key) {
            this.activeTab = tab;
          }
        }}
      >
        {child.props.tab}
      </div>);
    });

    return rst;
  },
  getRootNode(contents) {
    const { prefixCls, onKeyDown, className, extraContent, style } = this.props;
    const cls = classnames({
      [`${prefixCls}-bar`]: 1,
      [className]: !!className,
    });
    return (
      <div
        role="tablist"
        className={cls}
        tabIndex="0"
        ref="root"
        onKeyDown={onKeyDown}
        style={style}
      >
        {extraContent ?
          (<div
            style={tabBarExtraContentStyle}
            key="extra"
          >
            {extraContent}
          </div>) : null}
        {contents}
      </div>);
  },
};
