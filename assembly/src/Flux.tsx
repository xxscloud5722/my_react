import React, { CSSProperties, FC, ReactNode } from 'react';

export declare type FluxProps = {
  style?: CSSProperties | undefined
  children?: ReactNode
  size?: number | undefined
  className?: string | undefined
};
export const Component: FC<FluxProps> = (props) => {
  return <div style={{
    ...(props.style || {}),
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    gap: props.size || 5
  }} className={props?.className}>
    {props?.children}
  </div>;
};

export default Component;
