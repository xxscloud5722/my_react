import React, { FC, useEffect, useState } from 'react';
import { Alert, Button, Modal } from 'antd';
import ElementUtils from 'beer-network/elementUtils';
import * as XLSX from 'xlsx';

export declare type ImportData = {
  fileName: string,
  sheets: { index: number, name: string, items: any[] }[]
};
export declare type ImportFileStatus = {
  file?: FileList | undefined
  message?: string | undefined
  loading?: boolean | undefined
  sheets?: { name: string, number: number, index: number }[] | undefined
}
export declare type ImportModalProps = {
  open: boolean,
  onDownloadTemplate?: () => Promise<void> | undefined
  onCancel?: () => Promise<void>
  request: (data: ImportData) => Promise<{ success: boolean, message?: string | undefined }>
}
const G_VARIABLE = {
  importExcel: {
    fileName: '',
    sheets: []
  } as ImportData,
  importExcelReset: () => {
    G_VARIABLE.importExcel = {
      fileName: '',
      sheets: []
    };
  }
};
const App: FC<ImportModalProps> = (props) => {
  const [isOpenImportModal, setIsOpenImportModal] = useState(false);
  const [importFile, setImportFile] = useState(
    {} as ImportFileStatus
  );
  const onConfirmImport = async () => {
    if (importFile.file === undefined) {
      setImportFile({
        ...importFile,
        message: '请先选择需要导入的文件！'
      });
      return;
    }
    if (G_VARIABLE.importExcel.sheets.filter(sheet => sheet.items.length > 0).length === 0) {
      setImportFile({
        ...importFile,
        message: '导入的文件无有效数据，请关闭后重新导入！'
      });
      return;
    }
    setImportFile({
      ...importFile,
      message: undefined,
      loading: true
    });
    const result = await props.request(G_VARIABLE.importExcel);
    if (result.success) {
      setImportFile({
        ...importFile,
        loading: false
      });
      props?.onCancel?.();
    } else {
      setImportFile({
        ...importFile,
        message: result.message,
        loading: false
      });
    }
  };
  const onAnalyseImportFile = async () => {
    const file = await ElementUtils.selectFile();
    if (file == null) {
      return;
    }
    if (!file[0].name.endsWith('.xlsx') && !file[0].name.endsWith('.xls')) {
      setImportFile({
        message: '选择的文件格式不正确，请重新选择！'
      });
      return;
    }
    if (file[0].size / (1024 * 1024) > 15) {
      setImportFile({
        message: '选择的文件超过最大限制 （15MB）'
      });
      return;
    }
    setImportFile({
      file,
      loading: true
    });
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target === null) {
        setImportFile({ message: '解析文件失败，请上传模板文件' });
        return;
      }
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, {
          type: 'array',
          raw: true
        });
        G_VARIABLE.importExcelReset();
        G_VARIABLE.importExcel.fileName = file[0].name;
        setImportFile({
          file,
          loading: false,
          sheets: workbook.SheetNames.map((sheetName, index) => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            if (jsonData.length > 0) {
              const key = Object.keys(jsonData[0] as any)
                .find(it => !/[a-zA-Z\d\u4E00-\u9FA5\x20-\x7E]/.test(it.trim()));
              if (key !== undefined) {
                throw new Error('SYSTEM:Excel 文件编码不支持，请将文件用WPS另存为新文件然后重试');
              }
            }
            G_VARIABLE.importExcel.sheets.push({
              index,
              name: sheetName,
              items: jsonData.map((it: any) => {
                const v: any = {};
                for (const key of Object.keys(it)) {
                  v[key] = String(it[key]);
                }
                return v;
              })
            });
            return {
              index,
              name: sheetName,
              number: jsonData.length
            };
          })
        });
      } catch (ex) {
        console.log(ex);
        if (ex !== undefined) {
          const { message } = (ex as Error);
          if (message.startsWith('SYSTEM:')) {
            setImportFile({ message: message.substring(7) });
            return;
          }
        }
        setImportFile({ message: '解析文件失败，请上传模板文件' });
      }
    };
    reader.readAsArrayBuffer(file[0]);
  };
  useEffect(() => {
    if (props.open) {
      G_VARIABLE.importExcelReset();
      setImportFile({} as ImportFileStatus);
    }
    setIsOpenImportModal(props.open);
  }, [props.open]);
  return <>
    <Modal
      maskClosable={false}
      open={isOpenImportModal}
      title="数据导入"
      okText={importFile.loading ? '正在导入' : '确认导入'}
      onCancel={() => {
        if (importFile.loading === true) {
          return;
        }
        props?.onCancel?.();
      }}
      onOk={() => onConfirmImport()}
      confirmLoading={importFile.loading}
      width="400px"
      styles={{ body: { padding: '12px 0' } }}>
      {importFile.message !== undefined && importFile.message !== '' ? <Alert style={{
        padding: '4px 6px',
        marginBottom: 8
      }} message={<span style={{ fontSize: 13 }}>{importFile.message}</span>} type="error" showIcon/> : undefined}
      <div>
        请先
        <a onClick={() => props?.onDownloadTemplate?.()}>下载模板</a>，按照模板格式导入数据
      </div>
      <ul style={{
        padding: '0 0 0 20px',
        margin: '6px 0'
      }}>
        <li>文件格式仅支持 <b>xlsx</b> 、<b>xls</b></li>
        <li>文件大小限制 <b>15MB</b> 以内</li>
      </ul>
      {importFile.file === undefined ? <Button style={{
        margin: '8px 0 0 0',
        borderColor: '#bbb'
      }} type="dashed" onClick={() => onAnalyseImportFile()}>选择文件</Button> : <>
        <div style={{
          border: '1px dashed #bbb',
          padding: '6px 10px',
          borderRadius: '4px',
          margin: '8px 0 0 0'
        }}>
          <div>已选择文件：</div>
          <div style={{ fontWeight: 500 }}>{importFile.file[0].name}</div>
          {importFile.sheets !== undefined && importFile.sheets.length > 0 ? <div style={{ margin: '2px 0' }}>
            <ul style={{
              padding: '0 0 0 15px',
              margin: '0px 0',
              fontSize: 13
            }}>
              {importFile.sheets?.map(it => (
                <li key={it.index} style={{ color: '#666' }}>{it.name}（{it.index}）&nbsp;-&nbsp;有<span style={{ fontWeight: 500 }}>{it.number}条</span></li>
              ))}
            </ul>
          </div> : undefined}
        </div>
      </>}
    </Modal>
  </>;
};
export default App;
