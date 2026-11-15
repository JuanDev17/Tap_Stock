export interface ISendOtpRequest {
    email: string
}

export interface IVerifyOtpRequest {
    email: string,
    token: string
}