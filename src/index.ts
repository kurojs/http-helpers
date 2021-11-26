/* eslint-disable @typescript-eslint/no-throw-literal */
import merge from "lodash.merge";

let apiKey = "torus-default";
let embedHost = "";

// #region API Keys
export const gatewayAuthHeader = "x-api-key";
export const gatewayEmbedHostHeader = "x-embed-host";

export function setEmbedHost(embedHost_: string): void {
  embedHost = embedHost_;
}

export function clearEmbedHost(): void {
  embedHost = "";
}

export function getEmbedHost(): string {
  return embedHost;
}

export function setAPIKey(apiKey_: string): void {
  apiKey = apiKey_;
}

export function clearAPIKey(): void {
  apiKey = "torus-default";
}

export function getAPIKey(): string {
  return apiKey;
}
// #endregion

function getApiKeyHeaders(): Record<string, string> {
  const headers = {};
  if (apiKey) headers[gatewayAuthHeader] = apiKey;
  if (embedHost) headers[gatewayEmbedHostHeader] = embedHost;
  return headers;
}

export const promiseTimeout = <T>(ms: number, promise: Promise<T>): Promise<T> => {
  const timeout = new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error(`Timed out in ${ms}ms`));
    }, ms);
  });
  return Promise.race<T>([promise, timeout]);
};

export const get = async (url: string, options_: Record<string, unknown> = {}, customOptions: Record<string, unknown> = {}) => {
  const defaultOptions = {
    mode: "cors" as RequestMode,
    headers: {},
  };
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() };
  }
  const options = merge(defaultOptions, options_, { method: "GET" });
  const response = await fetch(url, options);
  if (response.ok) {
    return response.json();
  }
  throw response;
};

export const post = (
  url: string,
  data: Record<string, unknown> = {},
  options_: Record<string, unknown> = {},
  customOptions: Record<string, unknown> = {}
) => {
  const defaultOptions = {
    mode: "cors" as RequestMode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() };
  }
  const options = merge(defaultOptions, options_, { method: "POST" });

  // deep merge changes the structure of form data and url encoded data ,
  // so we should not deepmerge body data
  options.body = customOptions.isUrlEncodedData ? data : JSON.stringify(data);
  // for multipart request browser/client will add multipart content type
  // along with multipart boundary , so for multipart request send
  // content-type: undefined or send with multipart boundary if already known
  if (options.headers["Content-Type"] === undefined) {
    delete options.headers["Content-Type"];
  }
  return promiseTimeout(
    (customOptions.timeout as number) || 30000,
    fetch(url, options).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw response;
    })
  );
};

export const patch = async (
  url: string,
  data: Record<string, unknown> = {},
  options_: Record<string, unknown> = {},
  customOptions: Record<string, unknown> = {}
) => {
  const defaultOptions = {
    mode: "cors" as RequestMode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() };
  }
  const options = merge(defaultOptions, options_, { method: "PATCH" });
  // deep merge changes the structure of form data and url encoded data ,
  // so we should not deepmerge body data
  options.body = customOptions.isUrlEncodedData ? data : JSON.stringify(data);
  // for multipart request browser/client will add multipart content type
  // along with multipart boundary , so for multipart request send
  // content-type: undefined or send with multipart boundary if already known
  if (options.headers["Content-Type"] === undefined) {
    delete options.headers["Content-Type"];
  }
  const response = await fetch(url, options);
  if (response.ok) {
    return response.json();
  }
  throw response;
};

export const remove = async (
  url: string,
  _data: Record<string, unknown> = {},
  options_: Record<string, unknown> = {},
  customOptions: Record<string, unknown> = {}
) => {
  const defaultOptions = {
    mode: "cors" as RequestMode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  };
  if (customOptions.useAPIKey) {
    defaultOptions.headers = { ...defaultOptions.headers, ...getApiKeyHeaders() };
  }
  const options = merge(defaultOptions, options_, { method: "DELETE" });
  const response = await fetch(url, options);
  if (response.ok) {
    return response.json();
  }
  throw response;
};

export const generateJsonRPCObject = (method: string, parameters: unknown) => ({
  jsonrpc: "2.0",
  method,
  id: 10,
  params: parameters,
});

export const promiseRace = (url: string, options: Record<string, unknown>, timeout = 30000) =>
  Promise.race([
    get(url, options),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error("timed out"));
      }, timeout);
    }),
  ]);