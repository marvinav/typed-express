import {
  BaseResponse,
  EndpointMeta,
  BaseRequest,
  createEndpoint,
  EndpointList,
  IController,
  BaseController,
} from "@marvinav/typed-express";

type ServerEndpoint = ProtectedEndpoint | UnprotectedEndpoint;

type ProtectedEndpoint = {
  _: "protected";
};

type UnprotectedEndpoint = {
  _: "unprotected";
};

export function createServerEndpoint<
  T extends BaseRequest,
  U extends BaseResponse
>(meta: EndpointMeta & ServerEndpoint) {
  type Ttt = typeof meta extends ProtectedEndpoint
    ? T & { headers: T["headers"] & { "Auth-Token": string } }
    : T;

  return createEndpoint<Ttt, U>(meta);
}

type GetHeaderType<
  T extends EndpointMeta & ServerEndpoint,
  H extends BaseRequest
> = T extends ProtectedEndpoint ? H & { headers: { "Auth-Token": string } } : H;

const addTask = createServerEndpoint<
  {
    body: {
      name: string;
      done: boolean;
    };
  },
  { id: string }
>({
  url: "/",
  method: "get",
  _: "protected",
});

const getTaskMeta: EndpointMeta & UnprotectedEndpoint = {
  url: "/:id",
  method: "get",
  _: "unprotected",
};

const getTask = createEndpoint<
  GetHeaderType<
    typeof getTaskMeta,
    { headers: { test: string }; params: { id: string } }
  >,
  { id: string }
>(getTaskMeta);

const endpoints = { addTask, getTask };

class TaskController extends BaseController {
  route = "/task";
  endpoints = endpoints;
}

class Con implements IController<TaskController> {
  // addTask: (
  //   args: AuthHeader<EndpointMeta<{}, {}> & ServerEndpoint> & {
  //     body: {
  //       name: string;
  //       done: boolean;
  //     };
  //   }
  // ) => {
  //   id: string;
  // } = (req) => {
  //   return { id: "1" };
  // };
  // getTask: (
  //   args: AuthHeader<EndpointMeta<{}, {}> & ServerEndpoint> & BaseRequest
  // ) => BaseResponse = (req) => {
  //   req.headers?.["Auth-Token"];
  //   return {};
  // };

  getTask: (
    args: typeof getTask extends EndpointMeta<infer T> & infer U
      ? T
      : BaseRequest
  ) => {
    id: string;
  } = (args) => {
    return { id: "" };
  };
}