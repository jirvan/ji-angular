export class JiDialogErrorObject {

  dialogTitle: string;
  errorMessage: string;
  errorInfo: string;

  constructor(dialogTitle: string, errorMessage: string, errorInfo: string) {
    this.dialogTitle = dialogTitle;
    this.errorMessage = errorMessage;
    this.errorInfo = errorInfo;
  }

}
