export default class ElementUtils {
  /**
   * 选择文件本地文件.
   * @param multiple 是否多选.
   */
  public static selectFile(multiple?: boolean | undefined): Promise<FileList | null> {
    return new Promise<FileList | null>((resolve) => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = multiple || false;
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
      fileInput.addEventListener('change', () => {
        resolve(fileInput.files);
        document.body.removeChild(fileInput);
      });
      fileInput.click();
    });
  }

  /**
   * 下载文件.
   * @param url 文件下载地址.
   * @param fileName 文件名称.
   */
  public static download(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  }
}
