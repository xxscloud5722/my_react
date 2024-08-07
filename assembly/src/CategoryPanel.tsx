import React, { CSSProperties, FC, ReactNode, useEffect, useState } from 'react';
import { App, ConfigProvider, Dropdown, Select, Skeleton, theme, Tree } from 'antd';
import { css } from '@emotion/css';
import { CaretDownOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import type { ItemType } from 'antd/es/menu/interface';
import Flux from './Flux';

export declare type AppModule = {
  code: string
  name: string
};
export declare type AppModuleItem = {
  code?: string | undefined
  name?: string | ReactNode | undefined
  children?: AppModuleItem[] | undefined
};
export declare type CategoryPanelProps = {
  width?: number | undefined
  fontSize?: number | undefined
  style?: CSSProperties | undefined
  appTitle?: string | undefined
  appList?: AppModule[] | undefined
  appItems?: AppModuleItem[] | undefined
  onCreate?: () => void | undefined
  onAppChange?: (app: AppModule | undefined) => Promise<void> | undefined
  onAppItemChange?: (code: string) => Promise<void> | undefined
  directoryMenus?: ItemType[] | undefined
  itemMenus?: ItemType[] | undefined
  isAllowCreate?: boolean | undefined
};
export const Component: FC<CategoryPanelProps> = (props) => {
  const { token } = theme.useToken();

  const [appList, setAppList] = useState<AppModule[]>([]);
  const [app, setApp] = useState<string>('');
  const [appModuleLoading, setAppModuleLoading] = useState(false);
  const [appModuleItems, setAppModuleItems] = useState<AppModuleItem[]>([]);

  const TreeTitle = (titleProps: { children?: ReactNode | undefined }) => {
    return <Flux className={css`
        & .menus {
            display: none;
        }

        &:hover {
            .menus {
                display: flex;
            }
        }
    `}>
      {titleProps.children}
      {props?.directoryMenus === undefined || props?.directoryMenus.length <= 0 ? undefined : <Dropdown menu={{
        items: props?.directoryMenus
      }} trigger={['click']}>
        <div className="menus" style={{
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: 0,
          right: 4,
          bottom: 0,
          width: 30
        }} onClick={(e) => {
          e.stopPropagation();
        }}>
          <div style={{
            width: 24,
            maxWidth: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14
          }}>
            <MenuOutlined style={{ display: 'block' }}/>
          </div>
        </div>
      </Dropdown>}
    </Flux>;
  };
  const TreeLabel = (labelProps: { children?: ReactNode | undefined }) => {
    return <Flux style={{
      marginLeft: 18,
      overflow: 'hidden',
      position: 'relative'
    }} className={css`
        & .menus {
            display: none;
        }

        &:hover {
            .menus {
                display: flex;
            }
        }
    `}>
      {labelProps.children}
      {props?.itemMenus === undefined || props?.itemMenus.length <= 0 ? undefined : <Dropdown menu={{
        items: props?.itemMenus
      }} trigger={['click']}>
        <div className="menus" style={{
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: 30
        }}>
          <div style={{
            width: 24,
            maxWidth: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14
          }}>
            <MenuOutlined style={{ display: 'block' }}/>
          </div>
        </div>
      </Dropdown>}
    </Flux>;
  };

  const onConfirmApp = (code: string) => {
    setApp(code);
  };
  const onSelectItem = (itemCode: string) => {
    props?.onAppItemChange?.(itemCode);
  };

  useEffect(() => {
    if (app === undefined || app === '') {
      return;
    }
    setAppModuleLoading(true);
    const change = props?.onAppChange;
    if (change === undefined) {
      setAppModuleLoading(false);
      return;
    }
    change(appList.find(it => it.code === app))
      ?.then(() => setAppModuleLoading(false));
  }, [app]);
  useEffect(() => {
    setAppList(props.appList || []);
    const code = props?.appList?.[0]?.code;
    if (code !== undefined) {
      setApp(code);
    }
  }, [props.appList]);
  useEffect(() => {
    setAppModuleItems(props?.appItems?.map((it: any) => {
      it.title = <TreeTitle>{it.name}</TreeTitle>;
      it.key = it.code;
      it.children = it?.children?.map((c: any) => {
        return {
          ...c,
          key: c.code,
          title: <TreeLabel>{c.name}</TreeLabel>
        };
      });
      return it;
    }) || []);
  }, [props.appItems]);
  return <App style={{
    width: props.width || 320,
    minWidth: props.width || 320,
    maxWidth: props.width || 320,
    height: '100%',
    background: '#fff',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    ...(props.style || {})
  }}>
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
            titleHeight: 32,
            padding: 0
          }
        }
      }}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid #eee',
        fontSize: 15,
        fontWeight: 500
      }}>
        <Flux style={{
          height: 32
        }} size={10}>
          {props?.appTitle === undefined || props?.appTitle === '' ? <Select
            variant="filled"
            placeholder="选择模块"
            className={css`
                flex: 1;

                .ant-select-selection-item {
                    font-size: 14px;
                    font-weight: 500;
                }`}
            value={app}
            onChange={(e) => onConfirmApp(e)}
            options={appList.map(it => {
              return {
                value: it.code,
                label: it.name
              };
            })}
          /> : <div className={css`flex: 1;`}>{props?.appTitle}</div>}
          {props?.isAllowCreate ? <a className={css`
              background: rgba(0, 0, 0, 0.04);
              width: 30px;
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #333;
              border-radius: ${token.borderRadius}px;
              overflow: hidden;
              font-size: 16px;

              &:hover {
                  color: #333;
                  background: rgba(0, 0, 0, 0.08);
              }
          `} onClick={() => props?.onCreate?.()}>
            <PlusOutlined/>
          </a> : undefined}
        </Flux>
      </div>
      {appModuleLoading ? <Skeleton style={{
        minHeight: 400,
        padding: '5px 16px'
      }} active/> : <div style={{
        flexGrow: 1,
        overflowX: 'hidden',
        overflowY: 'auto'
      }}>
        <Tree.DirectoryTree
          className={css`
              & .ant-tree-treenode {
                  &:before {
                      bottom: 0 !important;
                  }

                  padding: 0 !important;
              }

              & .ant-tree-switcher {
                  &:hover {
                      background: none !important;
                  }

                  width: 18px !important;
                  margin-left: 8px !important;
              }

              & .ant-tree-switcher-noop {
                  width: 0 !important;
              }

              & .ant-tree-indent {
                  width: 0 !important;
              }
          `}
          style={{
            background: '#fff'
          }}
          treeData={appModuleItems as never}
          icon={false}
          showIcon={false}
          blockNode={true}
          switcherIcon={<CaretDownOutlined style={{
            fontSize: 12
          }}/>}
          onSelect={(e) => {
            onSelectItem(e.toString());
          }}
        />
      </div>}
    </ConfigProvider>
  </App>;
};

export default Component;
