import React, { CSSProperties, FC, ReactNode, useEffect } from 'react';
import { css } from '@emotion/css';

export declare type DataViewProps = {
  children?: ReactNode
  style?: CSSProperties | undefined
  labelWidth?: number | undefined
};
const App: FC<DataViewProps> = (props) => {
  useEffect(() => {
  }, []);
  return <div style={props.style} className={css`
  `}>
    {React.Children.map(props.children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { labelWidth: props.labelWidth } as never);
      }
      return child;
    })}
  </div>;
};

export declare type DataItemProps = {
  label?: string | ReactNode | undefined
  value?: string | ReactNode | undefined
  labelWidth?: number | undefined
  external?: string | ReactNode | undefined
};
export const DataItem: FC<DataItemProps> = (props) => {
  useEffect(() => {
  }, []);
  return <>
    <div style={{
      fontSize: 14,
      display: 'flex',
      padding: '3px 0',
      alignItems: 'center'
    }}>
      <div style={{
        fontWeight: 500,
        minWidth: props.labelWidth || 90
      }}>
        {props.label}：
      </div>
      <div style={{
        display: 'flex',
        width: '100%'
      }}>
        <div style={{
          width: '100%',
          flex: '1'
        }}>{props.value}</div>
        <div className="external">{props.external}</div>
      </div>
    </div>
  </>;
};

export default App;
