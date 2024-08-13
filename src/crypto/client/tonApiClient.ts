import { Api, HttpClient } from "tonapi-sdk-js";
import { Axios } from 'axios'


const config = {
    baseUrl: 'https://tonapi.io',
    headers: {
        Authorization: `Bearer ${process.env.TON_API_KEY}`,
        'Content-type': 'application/json'
    }
};

const axios = new Axios({
    headers: {
        Authorization: `Bearer ${process.env.TON_API_KEY}`,
        'Content-type': 'application/json'
    }
});

const httpClient = new HttpClient({
    baseUrl: 'https://tonapi.io',
    baseApiParams: config
});

export const TonApiClient = new Api(httpClient);

export async function TonApiRawRequest<T>(link: string, body?: any): Promise<T> {
    console.log(link)
    const response = await axios.get(link, config);

    console.log(response.data)

    return response.data as T
}