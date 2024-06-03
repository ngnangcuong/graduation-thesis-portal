export default interface LoginResponse {
    access_token:string;
    access_uuid:string;
    refresh_token:string;
    refresh_uuid:string;
    at_expires:number;
    rt_expires:number;
}