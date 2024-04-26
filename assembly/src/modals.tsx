import React from 'react';
import { Collapse, Modal } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { css } from '@emotion/css';
import Utils from 'beer-network/utils';

export default class Modals {
  public static error({
    title,
    content,
    messageTitle,
    message,
    callback
  }: { title: string, content: string, messageTitle: string, message: string, callback?: () => void | undefined }) {
    Modal.error({
      title,
      content: <div>
        <div>{content}</div>
        <Collapse
          bordered={false}
          defaultActiveKey={['1']}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0}/>}
          style={{
            background: '#f9f9f9',
            margin: '10px 0',
            padding: '0'
          }}
          size="small"
          items={[{
            key: '1',
            label: <span style={{
              fontWeight: 500,
              fontSize: 13
            }}>{messageTitle}</span>,
            children: <div className={css`
                font-size: 13px;
                line-height: 1.68;
            `}>
              <div dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br/>') }}></div>
              <a onClick={async () => {
                const value = '网站地址：' + window.location.href + '\n'
                  + '==========================\n'
                  + message + '\n'
                  + '==========================';
                await Utils.copy(value);
              }}>复制错误信息</a>
            </div>,
            style: {
              padding: '0',
              border: 'none'
            }
          }]}
        />
      </div>,
      okText: '我知道了',
      onOk: () => {
        if (callback) {
          callback();
        }
      }
    });
  }
}
