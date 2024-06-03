export default interface GetGroupResponse {
    id:string;
    group_name:string;
    created_at:Date;
    last_updated:Date;
    members:string[];
    admins:string[];
    conv_id:string;
    deleted:boolean;
}