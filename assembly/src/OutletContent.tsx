import React, { FC } from 'react';
import { Outlet, useOutlet } from 'react-router-dom';

export declare type OutletContentProps = {
  children: React.ReactNode;
}
const App: FC<OutletContentProps> = (props) => {
  const outlet = useOutlet();
  return <>
    <div style={{ display: outlet == null ? 'block' : 'none' }}>
      {props.children}
    </div>
    {outlet == null ? undefined : <div className="outlet-content">
      <Outlet/>
    </div>}
  </>;
};
export default App;
