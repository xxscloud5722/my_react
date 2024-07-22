import { Empty, Space, Spin } from 'antd';
import React, { CSSProperties, FC, ReactNode, useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { sql } from '@codemirror/lang-sql';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@emotion/css';
import emptyIcon from '@assets/empty.svg';

export declare type UniversalCodeEditorProps = {
  lang?: 'sql' | 'xml' | 'javascript' | 'json' | undefined
  style?: CSSProperties | undefined
  title?: string | undefined
  empty?: string | ReactNode | undefined
  titleExternal?: ReactNode | undefined
  headerMenus?: ReactNode | undefined
  value?: string | undefined
  loading?: boolean | undefined
  onChange?: (value: string) => void | undefined
};
export const Component: FC<UniversalCodeEditorProps> = (props) => {
  const divRef = useRef(null);
  const [size, setSize] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const element: any | null = divRef.current;
    if (!element) {
      return;
    }
    setSize({
      width: element.clientWidth,
      height: element.clientHeight
    });
  }, []);
  return <div style={{
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid #eee',
    ...(props.style || {})
  }}>
    <div style={{
      height: 53,
      background: '#fff',
      boxSizing: 'border-box',
      display: 'flex',
      padding: '10px 16px',
      borderBottom: '1px solid #eee',
      justifyContent: 'space-between'
    }}>
      <Space>
        <span className={css`
            font-weight: 500;
            font-size: 15px;
        `}>
          {props?.title}
        </span>
      </Space>
      {(props?.title || '') === '' ? undefined : <Space size={12}>
        {props?.titleExternal}
      </Space>}
    </div>
    <div style={{
      flexGrow: 1
    }} ref={divRef}>
      {(props?.title || '') === '' ? <Empty
        style={{
          padding: '60px 0'
        }}
        image={emptyIcon}
        imageStyle={{ height: 80 }}
        description={<div style={{
          padding: '10px 0',
          fontSize: 13
        }}>{props?.empty || '没有可显示的数据，请先选择左侧的内容。'}</div>}
      /> : <>
        <Spin spinning={props?.loading === true}>
          <CodeMirror
            value={props?.value || ''}
            width={size.width + 'px'}
            height={size.height + 'px'}
            extensions={[
              props?.lang === 'sql' ? sql() : undefined,
              props?.lang === 'xml' ? xml() : undefined,
              props?.lang === 'javascript' ? javascript({ jsx: true }) : undefined,
              props?.lang === 'json' ? json() : undefined
            ].filter(it => it !== undefined)}
            onChange={(e) => props?.onChange?.(e)}
          />
        </Spin>
      </>}
    </div>
  </div>;
};

export default Component;
