export class ResponseDto {
  success: boolean;
  message: string;
  data: Object | Array<object> | null;

  constructor(
    success: boolean,
    message: string,
    data: Object | Array<object> | null,
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}
