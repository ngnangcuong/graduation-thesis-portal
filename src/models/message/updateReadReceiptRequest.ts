export default interface UpdateReadReceiptRequest {
    conv_id:string;
    read_receipt_update:ReadReceiptUpdate[];
}

export interface ReadReceiptUpdate {
    user_id:string;
    msg_id:number;
}