import React, { FC, ReactNode, useEffect, useState } from 'react';

export declare type PermissionPanelProps = {
  request?: () => Promise<boolean> | undefined
  children?: Element | ReactNode
};
const App: FC<PermissionPanelProps> = (props) => {
  const [status, setStatus] = useState(false);
  useEffect(() => {
    props?.request?.()
      ?.then(result => {
        setStatus(result);
      });
  }, []);
  return <>
    {status ? props.children : undefined}
  </>;
};
export default App;
