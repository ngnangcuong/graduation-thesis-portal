export interface ChangeUser {
    action:string;
    users:string[];
}

export default interface UpdateGroupRequest {
    group_name:string;
    members:ChangeUser[];
}