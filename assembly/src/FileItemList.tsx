import React, { FC } from 'react';
import { css } from '@emotion/css';
import { App, ConfigProvider, Table, Typography } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import MIME from './mime';

export declare type FileItem = {
  id: string
  icon?: string | undefined
  name: string
  size: string
  type: 'FILE' | 'DIRECTORY',
  typeName?: string | undefined
  createTime?: string | undefined
  updateTime?: string | undefined
}
export declare type FileItemProps = {
  style?: React.CSSProperties
  data?: FileItem[] | undefined
};

const { Text } = Typography;
const Component: FC<FileItemProps> = (props) => {
  const columns = [
    {
      title: '文件名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (_: any, record: any) => (
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          <div style={{
            minWidth: 18,
            minHeight: 18,
            marginRight: 8,
            overflow: 'hidden',
            backgroundImage: `url(${record.icon})`,
            backgroundSize: record.type === 'FILE' ? '22px 22px' : '100% 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}/>
          <Text style={{
            fontSize: 13
          }} ellipsis={{ tooltip: <span style={{ fontSize: 13 }}>{record.name}</span> }}>
            {record.name}
          </Text>
        </div>
      )
    },
    {
      title: '文件类型',
      dataIndex: 'type',
      width: 90,
      key: 'type',
      render: (_: any, record: any) => (
        <>
          {record.typeName}
        </>
      )
    },
    {
      title: '大小',
      width: 80,
      dataIndex: 'size',
      key: 'size'
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      width: 135,
      key: 'updateTime'
    }
  ];
  return <>
    <App>
      <ConfigProvider theme={{
        token: {
          fontSize: 13
        },
        components: {
          Table: {
            motion: false,
            headerColor: '#333',
            rowHoverBg: '#f5f6f7',
            rowSelectedBg: '#f4f5f6',
            rowSelectedHoverBg: '#e6e7e8'
          }
        }
      }} locale={zhCN}>
        <Table style={props.style} className={css`
            user-select: none;

            .ant-table-thead {
                & .ant-table-cell {
                    font-size: 12px;
                    padding: 5px 8px !important;
                }
            }

            .ant-table-tbody {
                & .ant-table-cell {
                    font-size: 13px;
                    padding: 5px 8px !important;
                }
            }
        `} columns={columns} dataSource={props?.data?.map(it => {
          const [typeName, icon] = (MIME.parse(it.name) || []);
          return {
            ...it,
            typeName,
            icon,
            size: MIME.formatBytes(Number(it.size))
          };
        })} size="small" pagination={false}/>
      </ConfigProvider>
    </App>
  </>;
};
export default Component;
