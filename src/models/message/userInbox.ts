export default interface UserInbox {
    user_id:string;
    inbox_msg_id:number;
    conv_id:string;
    conv_msg_id:number;
    msg_time:number;
    sender:string;
    content:string;
    iv:string;
}