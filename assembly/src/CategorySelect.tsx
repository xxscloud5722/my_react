import React, { FC, Key, ReactNode, useEffect, useState } from 'react';
import { App, ConfigProvider, Tree } from 'antd';
import { DownOutlined } from '@ant-design/icons';

// eslint-disable-next-line max-len
const IconSelect = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgdmlld0JveD0iMCAwIDE4IDE4IiB4PSI1NiIgeT0iMjE1IiBkYXRhLW5hbWU9Im9wZXJhdGlvbi1zdWNjZXNzIiBkYXRhLXN2Zy1pZD0iNzU4MGMzYjcxZCI+CiAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik0wIDljMCA0Ljk2OCA0LjAzMiA5IDkgOXM5LTQuMDMyIDktOS00LjAzMi05LTktOS05IDQuMDMyLTkgOXoiIGZpbGw9IiMyOUQyMjEiLz4KICAgICAgICA8cGF0aCBkPSJNMTIuMjEgNS43NTRhLjg3NS44NzUgMCAwIDEgMS4zMTIgMS4xNTNsLS4wNzkuMDktNS4yOTIgNS4yNWEuODc1Ljg3NSAwIDAgMS0xLjE0OS4wNzJsLS4wODktLjA3OC0yLjY2LTIuNjg4YS44NzUuODc1IDAgMCAxIDEuMTU1LTEuMzFsLjA4OS4wNzkgMi4wNDMgMi4wNjQgNC42Ny00LjYzMnoiIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIvPgogICAgPC9nPgo8L3N2Zz4K';

const { DirectoryTree } = Tree;
export declare type Category = {
  key: Key
  icon?: ReactNode | undefined
  name?: string | undefined
  title?: ReactNode | undefined
  children?: Category[] | undefined
  active?: boolean | undefined
}
export declare type CategorySelectProps = {
  style?: React.CSSProperties
  data?: Category[] | undefined
  fontSize?: number | undefined
  select?: 'ALL' | 'ITEM'
  onChange?: (value?: Category) => void
};
const Component: FC<CategorySelectProps> = (props) => {
  const [expandedKeys, setExpandedKeys] = useState([] as Key[]);
  const [categoryData, setCategoryData] = useState([] as Category[]);
  const Select = () => {
    return <div style={{
      width: 12,
      height: 12,
      marginInlineStart: 10,
      marginBlockStart: 2,
      backgroundImage: `url(${IconSelect})`,
      backgroundSize: '100% 100%',
      backgroundRepeat: 'no-repeat'
    }}/>;
  };
  const Title = (titleProps: { item: Category }) => {
    return <>
      <div style={{
        display: 'flex',
        alignItems: 'center'
      }}>
        {titleProps?.item.icon === undefined ? undefined : titleProps?.item.icon}
        <span>{titleProps?.item?.name}</span>
        {titleProps?.item.active === true ? <Select/> : undefined}
      </div>
    </>;
  };
  const recursionTreeData = (items: Category[] | undefined): Category[] | undefined => {
    return items?.map((item) => {
      return {
        ...item,
        icon: undefined,
        children: recursionTreeData(item.children)
      } as Category;
    });
  };
  const recursion = (items: Category[] | undefined, selectKey?: Key | undefined): Category[] | undefined => {
    return items?.map((item) => {
      if (item.key === selectKey) {
        item.active = !item.active;
      }
      return {
        ...item,
        title: <Title item={item}/>,
        children: recursion(item.children, selectKey)
      } as Category;
    });
  };

  useEffect(() => {
    setCategoryData(recursion(props.data) || []);
  }, [props.data]);
  return <App>
    <ConfigProvider
      theme={{
        token: {
          fontSize: props?.fontSize || 13
        },
        components: {
          Tree: {
            motion: false,
            directoryNodeSelectedBg: '#eee',
            directoryNodeSelectedColor: '#333',
            titleHeight: 26
          }
        }
      }}>
      <DirectoryTree
        style={{
          margin: '100px 40px',
          background: '#fff'
        }}
        defaultExpandAll
        treeData={recursionTreeData(categoryData)}
        showLine
        icon={false}
        expandedKeys={expandedKeys}
        onExpand={(expandedKeys, {
          node,
          nativeEvent
        }) => {
          const collapse = (nativeEvent.target as Element | undefined)?.closest('span.ant-tree-switcher') || undefined;
          if (collapse !== undefined) {
            setExpandedKeys(expandedKeys);
          } else if ((props?.select || 'ITEM') === 'ITEM' && (node.children || []).length > 0) {
            setExpandedKeys(expandedKeys);
          } else {
            setCategoryData(recursion(categoryData, node.key) || []);
            props?.onChange?.(node);
          }
        }}
        switcherIcon={<DownOutlined/>}
      />
    </ConfigProvider>
  </App>;
};
export default Component;
