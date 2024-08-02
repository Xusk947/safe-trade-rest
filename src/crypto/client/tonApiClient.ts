import { Api, HttpClient } from "tonapi-sdk-js";

const httpClient = new HttpClient({
    baseUrl: 'https://tonapi.io',
    baseApiParams: {
        headers: {
            Authorization: `Bearer ${process.env.TON_API_KEY}`,
            'Content-type': 'application/json'
        }
    }
});

export const TonApiClient = new Api(httpClient);