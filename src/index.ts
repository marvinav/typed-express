import {
  RequestInfo,
  Response as FetchResponse,
  RequestInit,
} from "node-fetch";
import { NextFunction, Router, Response, Request } from "express";

//#region base
export type FetchWrap =
  | typeof fetch
  | ((req: RequestInfo, init: RequestInit) => Promise<FetchResponse>);

export type GetInnerArgsOfMeta<S, U = {}> = S extends EndpointMeta<
  infer Args,
  infer Resp
> &
  infer U
  ? Args
  : never;

export type GetInnerResponseOfMeta<S, U = {}> = S extends EndpointMeta<
  infer Args,
  infer Resp
> &
  infer U
  ? Resp
  : never;

export type BaseResponse = {};

export type BaseRequest = {
  headers?: Record<string, any>;
  query?: Record<string, any>;
  body?: any;
  params?: Record<string, any>;
};

export type EndpointResponse<T extends BaseResponse> = Promise<T>;

export type EndpointsProvider<T extends BaseController> =
  T["endpoints"] extends EndpointList<infer Ty>
    ? {
        [key in keyof T["endpoints"]]: (
          args: GetInnerArgsOfMeta<T["endpoints"][key], Ty>
        ) => GetInnerResponseOfMeta<T["endpoints"][key], Ty>;
      }
    : never;

export type IController<T extends BaseController> = EndpointsProvider<T>;

export type IControllerClient<T extends BaseController> = EndpointsProvider<T> &
  T;

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
export function createEndpoint<
  Args extends BaseRequest,
  Resp extends BaseResponse,
  U = {}
>(meta: EndpointMeta & U) {
  return meta as EndpointMeta<Args, Resp> & U;
}

/**
 * REST description  about endpoint
 * Can be extended with additional fields or methods. For instance, auth protected endpoint
 */
export type EndpointMeta<
  T extends BaseRequest = {},
  U extends BaseResponse = {}
> = {
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

export type EndpointList<T> = Record<string, EndpointMeta<any, any> & T>;

/**
 * All controllers should implement BaseController
 */
export abstract class BaseController<T = {}> {
  abstract readonly route: string;
  /**
   * Each controller should declare endpoints in ExpressJs Format.
   * @example { "addOrUpdate": "/", "getById": "/:id" }
   */
  abstract readonly endpoints: EndpointList<T>;

  /**
   * Simple endpoint parser
   */
  replaceEndpoints = <U>(
    obj: U extends EndpointMeta<infer R> & infer Z ? R : unknown,
    controllerMethod: string
  ) => {
    let result = "";
    if (obj) {
      let meta = this.endpoints[controllerMethod];
      const paths = meta.url.split("/");
      paths.forEach((x) => {
        if (x.length <= 0) {
          return;
        }
        if (x[0] !== ":") {
          result = result + "/" + x;
          return;
        }
        const property = (obj as Record<string, any>)[x.slice(1)];
        if (property) {
          result = result + "/" + property;
        } else {
          throw new Error(`Property ${x} not defined`);
        }
      });
    }
    return result;
  };
}

export interface IFillRouteWithEndpointsOptions<
  Endpoint extends BaseController
> {
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
  preprocessor?: (
    key: Endpoint extends BaseController<infer T>
      ? EndpointMeta<any, any> & T
      : unknown,
    exp: { req: Request; res: Response; next: NextFunction }
  ) => Promise<boolean>;
}

/**
 * Fill provided route with endpoints
 * @param options Fill options
 * @returns Filled route and route path
 */
export function fillRouteWithEndpoints<Endpoint extends BaseController>(
  options: IFillRouteWithEndpointsOptions<Endpoint>
) {
  const { controller, router, controllerEndpoints } = options;
  const { endpoints } = controllerEndpoints;
  const { preprocessor, logging } = options ?? {};
  logging &&
    console.log(`Start initializing contoller ${controller.constructor.name}`);
  const logEntries: Record<string, { method: string; url: string }> = {};
  for (const end in endpoints) {
    if (Object.prototype.hasOwnProperty.call(endpoints, end)) {
      const key = end as keyof BaseController["endpoints"];

      const endpoint = endpoints[key] as Endpoint extends BaseController<
        infer T
      >
        ? EndpointMeta<any, any> & T
        : unknown;
      router[endpoint.method ?? "use"](endpoint.url, async (req, res, next) => {
        if (
          preprocessor &&
          !(await preprocessor(endpoint, { req, res, next }))
        ) {
          return;
        }
        const headers = { ...req.headers };
        const params = { ...req.params };
        const body = req.body;
        const query = { ...req.query };

        if (Object.prototype.hasOwnProperty.call(controller, end)) {
          const response = await controller[key]({
            query,
            headers,
            params,
            body,
          } as any);
          res.send(response);
        } else {
          res.sendStatus(400);
        }
      });
      logEntries[key] = {
        method: `${(endpoint.method ?? "use").toUpperCase()}`,
        url: `${controllerEndpoints.route}${endpoint.url}`,
      };
    } else {
      throw new Error(
        `${end} of ${controller.constructor.name} not initialized`
      );
    }
  }

  logging && console.table(logEntries);

  return { path: controllerEndpoints.route, router };
}
