import { BaseResponse, EndpointMeta, BaseRequest } from "@marvinav/typed-express";
interface ServerEndpoint {
    authRequired: boolean;
}
interface AuthHeader<T extends ServerEndpoint> extends BaseRequest {
    headers: T["authRequired"] extends true ? {
        "Auth-Token": string;
    } & Record<string, any> : Record<string, any> | undefined;
}
export declare function createServerEndpoint<T extends BaseRequest, U extends BaseResponse>(meta: EndpointMeta & ServerEndpoint): EndpointMeta<AuthHeader<EndpointMeta<{}, {}> & ServerEndpoint> & T, U> & ServerEndpoint;
export {};
