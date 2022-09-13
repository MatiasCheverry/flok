import {Action} from "redux"
import {createAction, RSAACall, RSAAResultAction} from "redux-api-middleware"
import {ThunkDispatch} from "redux-thunk"
import {RootState} from ".."
import config, {APP_VERSION_KEY, SERVER_BASE_URL_KEY} from "../../config"
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {setUserLoggedOut} from "./user"

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "x-flok-user-agent": `Flok Web/${config.get(APP_VERSION_KEY)}`,
}

/* Adds default headers and authentication headers to every request */
var headers = (customHeaders = {}) => {
  var headers: Function
  if (customHeaders instanceof Function) headers = customHeaders
  else headers = () => customHeaders
  return (store: RootState) => {
    return {...DEFAULT_HEADERS, ...headers(store)}
  }
}

/* Custom fetch implementation to use in redux-api-middleware */
var _fetch = async (path: RequestInfo, opts?: RequestInit) => {
  let baseUrl: string = config.get(SERVER_BASE_URL_KEY)
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1)
  }
  const url = baseUrl + path

  // Ensure login cookie is included in fetch
  if (opts) {
    opts.credentials = "include"
  } else {
    opts = {
      credentials: "include",
    }
  }

  return await fetch(url, opts)
}

/**
 * Generic Api Action from redux-api-middleware
 */
export type ApiAction<Payload = any> = RSAAResultAction<Payload, any>

/**
 * Generic action creator. Given input, adds default
 *  summn's logic, and creates an action for use
 *  by redux-api-middleware
 */
export function createApiAction(
  args: RSAACall<RootState, unknown, unknown>,
  apiOptions: {
    successMessage?: string
    onSuccess?: (dispatch: ThunkDispatch<any, any, Action<any>>) => void
    errorMessage?: string
    onError?: (dispatch: ThunkDispatch<any, any, Action<any>>) => void
  } = {}
) {
  return async (
    dispatch: ThunkDispatch<any, any, Action<any>>,
    getState: () => RootState
  ) => {
    args.fetch = _fetch
    args.headers = headers(args.headers)
    const response = await dispatch(createAction(args) as any)
    if (response.error) {
      if (apiOptions.onError) {
        apiOptions.onError(dispatch)
      }
      if (apiOptions.errorMessage) {
        dispatch(
          enqueueSnackbar({
            message: apiOptions.errorMessage,
            options: {variant: "error"},
          })
        )
      }
      // Special authentication case
      if (
        response.payload &&
        response.payload.status === 401 &&
        response.payload.response &&
        response.payload.response.code === 1004
      ) {
        dispatch(setUserLoggedOut())
      }
      return response
    } else {
      if (apiOptions.onSuccess) {
        apiOptions.onSuccess(dispatch)
      }
      if (apiOptions.successMessage) {
        dispatch(
          enqueueSnackbar({
            message: apiOptions.successMessage,
            options: {variant: "success"},
          })
        )
      }
      return response
    }
  }
}

export class ApiUtils {
  static typeWithMeta(type: string, meta: any) {
    return {type, meta: () => meta}
  }
  static listToDict(apiResponse: Array<{id: number; [key: string]: any}>) {
    var d: {[key: number]: any} = {}
    apiResponse.forEach((resource) => {
      d[resource.id] = resource
    })
    return d
  }
}
