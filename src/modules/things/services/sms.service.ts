import { Injectable } from "@nestjs/common";
import { Axios } from 'axios';
import { ApiException } from "../../base/utils/ApiException.class";
import { SMS_AUTHOR_NAME, SMS_OFFICE_BASE_URL } from "../utils/consts";

@Injectable()
export class SmsService {

    private axiosClient: Axios;

    constructor() {
        this.axiosClient = new Axios({ baseURL: SMS_OFFICE_BASE_URL })
    }


    async send(destination: string, message: string) {
        try {
            const { data } = await this.axiosClient.get(`send?key=${process.env.SMS_OFFICE_API_KEY}&destination=${destination}&sender=${SMS_AUTHOR_NAME}&content=${message}`)

            const result = JSON.parse(data);
            if (!result.Success) {
                throw new ApiException("CANT_SEND_SMS", result.Message)
            }
        } catch (error) {
            throw new ApiException("CANT_SEND_SMS", error)
        }
    }

    async multi(destinations: string, message: string) {
        try {
            const { data } = await this.axiosClient.get(`send?key=${process.env.SMS_OFFICE_API_KEY}&destination=${destinations}&sender=${SMS_AUTHOR_NAME}&content=${message}`)

            const result = JSON.parse(data);
            if (!result.Success) {
                throw new ApiException("CANT_SEND_SMS", result.Message)
            }
        } catch (error) {
            throw new ApiException("CANT_SEND_SMS", error)
        }
    }
}