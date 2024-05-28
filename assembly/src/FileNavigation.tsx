import React, { CSSProperties, FC } from 'react';
import { Breadcrumb, Typography } from 'antd';

const { Text } = Typography;
export declare type NavigationPath = {
  id: string
  title: string
}
export declare type FileItemProps = {
  paths: NavigationPath[]
  onSwitchPath?: (id: string, index: number) => Promise<void> | undefined
  style?: CSSProperties
};
const App: FC<FileItemProps> = (props) => {
  return <>
    <Breadcrumb style={{
      fontSize: 13,
      fontWeight: 'normal',
      marginLeft: 5,
      ...props?.style
    }} items={props?.paths?.map((it, index) => {
      return {
        ...it,
        title: <>
          {index === (props?.paths || []).length - 1 ? <Text style={{
            maxWidth: 80,
            fontSize: 13,
            fontWeight: 500
          }} ellipsis={true}>{it.title}</Text> : <a onClick={() => props?.onSwitchPath?.(it.id, index)}>
            <Text style={{
              maxWidth: 80,
              fontSize: 13,
              color: '#999'
            }} ellipsis={true}>{it.title}</Text>
          </a>}
        </>
      } as never;
    })}/>
  </>;
};
export default App;
