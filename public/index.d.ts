import { RequestInfo, Response as FetchResponse, RequestInit } from "node-fetch";
import { NextFunction, Router, Response, Request } from "express";
export declare type FetchWrap = typeof fetch | ((req: RequestInfo, init: RequestInit) => Promise<FetchResponse>);
export declare type GetInnerArgsOfMeta<S, U = {}> = S extends EndpointMeta<infer Args, infer Resp> & infer U ? Args : never;
export declare type GetInnerResponseOfMeta<S, U = {}> = S extends EndpointMeta<infer Args, infer Resp> & infer U ? Resp : never;
export declare type BaseResponse = {};
export declare type BaseRequest = {
    headers?: Record<string, any>;
    query?: Record<string, any>;
    body?: any;
    params?: Record<string, any>;
};
export declare type EndpointResponse<T extends BaseResponse> = Promise<T>;
export declare type EndpointsProvider<T extends BaseController> = T["endpoints"] extends EndpointList<infer Ty> ? {
    [key in keyof T["endpoints"]]: (args: GetInnerArgsOfMeta<T["endpoints"][key], Ty>) => GetInnerResponseOfMeta<T["endpoints"][key], Ty>;
} : never;
export declare type IController<T extends BaseController> = EndpointsProvider<T>;
export declare type IControllerClient<T extends BaseController> = EndpointsProvider<T> & T;
export interface ErrorResponse {
    _: "error";
    code: number;
    message: string;
}
/**
 * Supporter function to create meta
 * @param meta
 * @returns
 */
export declare function createEndpoint<Args extends BaseRequest, Resp extends BaseResponse, U = {}>(meta: EndpointMeta & U): EndpointMeta<Args, Resp> & U;
/**
 * REST description  about endpoint
 * Can be extended with additional fields or methods. For instance, auth protected endpoint
 */
export declare type EndpointMeta<T extends BaseRequest = {}, U extends BaseResponse = {}> = {
    /**
     * Route of endpoint
     */
    route?: `/${string}` | `*`;
    /**
     * Url in express format without route prefix
     */
    url: `/${string}` | `*`;
    /**
     * Method in express format, can be extended by others
     */
    method?: "get" | "post" | "put" | "delete";
};
export declare type EndpointList<T> = Record<string, EndpointMeta<any, any> & T>;
/**
 * All controllers should implement BaseController
 */
export declare abstract class BaseController<T = {}> {
    abstract readonly route: string;
    /**
     * Each controller should declare endpoints in ExpressJs Format.
     * @example { "addOrUpdate": "/", "getById": "/:id" }
     */
    abstract readonly endpoints: EndpointList<T>;
    /**
     * Simple endpoint parser
     */
    replaceEndpoints: <U>(obj: U extends EndpointMeta<infer R, {}> & infer Z ? R : unknown, controllerMethod: string) => string;
}
export interface IFillRouteWithEndpointsOptions<Endpoint extends BaseController> {
    /**
     * Router to fill with endpoints
     */
    router: Router;
    /**
     * Endpoints
     */
    controllerEndpoints: Endpoint;
    /**
     * Endpoints controller implementation
     */
    controller: IController<Endpoint>;
    /**
     * Flag to log system message
     */
    logging?: boolean;
    /**
     * Custom preprocessor for incoming request.
     * Best place for plugins, auth, loggers and et al
     */
    preprocessor?: (key: Endpoint extends BaseController<infer T> ? EndpointMeta<any, any> & T : unknown, exp: {
        req: Request;
        res: Response;
        next: NextFunction;
    }) => Promise<boolean>;
}
/**
 * Fill provided route with endpoints
 * @param options Fill options
 * @returns Filled route and route path
 */
export declare function fillRouteWithEndpoints<Endpoint extends BaseController>(options: IFillRouteWithEndpointsOptions<Endpoint>): {
    path: string;
    router: Router;
};
