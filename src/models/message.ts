export default interface Message {
    conv_id:string;
    conv_msg_id:number;
    msg_time:number;
    sender:string;
    content:string;
    iv:string;
    receiver:string;
}