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
  authRequired: true;
};
type UnprotectedEndpoint = {
  authRequired: false;
};

interface AuthHeader<T extends ServerEndpoint> {
  headers: T extends ProtectedEndpoint & infer U
    ? { "Auth-Token": string }
    : undefined;
}

export function createServerEndpoint<
  T extends BaseRequest,
  U extends BaseResponse
>(meta: EndpointMeta & ServerEndpoint) {
  return createEndpoint<AuthHeader<typeof meta> & T, U, ServerEndpoint>(meta);
}

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
  authRequired: true,
});

const getTask = createServerEndpoint({
  url: "/:id",
  method: "get",
  authRequired: false,
});

const endpoints = { addTask, getTask };

class TaskController extends BaseController {
  route = "/task";
  endpoints = endpoints;
}

class Con implements IController<TaskController> {
  addTask: (
    args: AuthHeader<EndpointMeta<{}, {}> & ServerEndpoint> & {
      body: {
        name: string;
        done: boolean;
      };
    }
  ) => {
    id: string;
  } = (req) => {
    return { id: "1" };
  };

  getTask: (
    args: AuthHeader<EndpointMeta<{}, {}> & ServerEndpoint> & BaseRequest
  ) => BaseResponse = req => {
    req.headers?.["Auth-Token"]  
    return {};
  };
}
