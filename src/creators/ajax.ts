import fetch, { RequestInfo, RequestInit } from "node-fetch";
import { ObjectReadable } from "./../utils/ObjectReadable";

type ResponseType = "text" | "json" | "buffer";

interface AjaxInit extends RequestInit {
    responseType?: ResponseType;
}

export const ajax = (url: RequestInfo, init: AjaxInit = {}) => {
    const { responseType = "json", ...requestInit } = init;

    if (!["text", "json", "buffer"].includes(responseType!)) {
        throw new Error(
            "responseType must be one of type 'text', 'json', 'buffer'"
        );
    }

    return new ObjectReadable({
        read: async function ajaxRead() {
            try {
                const res = await fetch(url, requestInit);

                const {
                    ok,
                    status,
                    statusText,
                    headers,
                    url: originalUrl,
                    body
                } = res;
                const data = await res[responseType]();

                this.push({
                    ok,
                    status,
                    statusText,
                    headers,
                    url: originalUrl,
                    data
                });

                this.push(null);
            } catch (err) {
                this.destroy(err);
            }
        }
    });
};
