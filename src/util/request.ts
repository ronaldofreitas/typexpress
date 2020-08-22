import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface ResquesConfig extends AxiosRequestConfig {}
export interface Response<T=any> extends AxiosResponse<T> {}

export class Request {
    constructor(private request = axios) {}

    public get<T>(
        url: string, 
        config: ResquesConfig = {}
    ): Promise<Response<T>> {
        return this.request.get<T, Response<T>>(url, config);
    }

    public static isRequestError(error: AxiosError): boolean {
        return !!(error.response && error.response.status)
    }
}