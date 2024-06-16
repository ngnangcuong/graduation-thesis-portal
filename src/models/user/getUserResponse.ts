export default interface GetUserResponse {
    id:string;
    username:string;
    first_name:string;
    last_name:string;
    email:string;
    phone_number:string;
    avatar:string;
    created_at:Date;
    last_updated:Date;
    public_key:string;
}