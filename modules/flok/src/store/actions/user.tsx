import {push} from "connected-react-router"
import querystring from "querystring"
import {ThunkDispatch} from "redux-thunk"
import {RootState} from ".."
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {AppRoutes} from "../../Stack"
import {modelToApi} from "../../utils/apiUtils"
import {ApiAction, ApiUtils, createApiAction} from "./api"

// Authentication
export const POST_USER_SIGNIN_REQUEST = "POST_USER_SIGNIN_REQUEST"
export const POST_USER_SIGNIN_SUCCESS = "POST_USER_SIGNIN_SUCCESS"
export const POST_USER_SIGNIN_FAILURE = "POST_USER_SIGNIN_FAILURE"

export function postUserSignin(email: string, password: string, next?: string) {
  let endpoint = "/v1.0/auth/signin"
  return createApiAction(
    {
      endpoint,
      method: "POST",
      body: JSON.stringify({email, password, login_provider: "FLOK"}),
      types: [
        POST_USER_SIGNIN_REQUEST,
        POST_USER_SIGNIN_SUCCESS,
        POST_USER_SIGNIN_FAILURE,
      ],
    },
    {
      errorMessage: "Failed to login",
      onSuccess: (dispatch) => {
        dispatch(setUserLoggedIn())
        if (next) {
          dispatch(push(decodeURIComponent(next)))
        } else {
          dispatch(push(AppRoutes.getPath("HomeRoutingPage")))
        }
      },
    }
  )
}

export const DELETE_USER_SIGNIN_REQUEST = "DELETE_USER_SIGNIN_REQUEST"
export const DELETE_USER_SIGNIN_SUCCESS = "DELETE_USER_SIGNIN_SUCCESS"
export const DELETE_USER_SIGNIN_FAILURE = "DELETE_USER_SIGNIN_FAILURE"

/** Aka sign out */
export function deleteUserSignin() {
  let endpoint = "/v1.0/auth/signin"
  return async (
    dispatch: ThunkDispatch<any, any, any>,
    getState: () => RootState
  ) => {
    let signupResponse = (await dispatch(
      createApiAction({
        endpoint,
        method: "DELETE",
        types: [
          DELETE_USER_SIGNIN_REQUEST,
          DELETE_USER_SIGNIN_SUCCESS,
          DELETE_USER_SIGNIN_FAILURE,
        ],
      })
    )) as unknown as ApiAction
    if (!signupResponse.error) {
      dispatch(setUserLoggedOut())
    }
    return signupResponse
  }
}

export const GET_USER_RESET_REQUEST = "GET_USER_RESET_REQUEST"
export const GET_USER_RESET_SUCCESS = "GET_USER_RESET_SUCCESS"
export const GET_USER_RESET_FAILURE = "GET_USER_RESET_FAILURE"

export function getUserResetToken(loginToken: string) {
  let endpoint = `/v1.0/auth/reset?${querystring.stringify(
    modelToApi({loginToken})
  )}`
  return async (
    dispatch: ThunkDispatch<any, any, any>,
    getState: () => RootState
  ) => {
    let resetRequest = (await dispatch(
      createApiAction({
        endpoint,
        method: "GET",
        types: [
          ApiUtils.typeWithMeta(GET_USER_RESET_REQUEST, {loginToken}),
          ApiUtils.typeWithMeta(GET_USER_RESET_SUCCESS, {loginToken}),
          ApiUtils.typeWithMeta(GET_USER_RESET_FAILURE, {loginToken}),
        ],
      })
    )) as unknown as ApiAction
    if (resetRequest.error) {
      dispatch(enqueueSnackbar({message: resetRequest.payload.message}))
    }
  }
}

export const POST_USER_RESET_REQUEST = "POST_USER_RESET_REQUEST"
export const POST_USER_RESET_SUCCESS = "POST_USER_RESET_SUCCESS"
export const POST_USER_RESET_FAILURE = "POST_USER_RESET_FAILURE"

export function postUserReset(loginToken: string, password: string) {
  let endpoint = "/v1.0/auth/reset"
  return async (
    dispatch: ThunkDispatch<any, any, any>,
    getState: () => RootState
  ) => {
    let signupResponse = (await dispatch(
      createApiAction({
        endpoint,
        body: JSON.stringify(modelToApi({loginToken, password})),
        method: "POST",
        types: [
          ApiUtils.typeWithMeta(POST_USER_RESET_REQUEST, {loginToken}),
          ApiUtils.typeWithMeta(POST_USER_RESET_SUCCESS, {loginToken}),
          ApiUtils.typeWithMeta(POST_USER_RESET_FAILURE, {loginToken}),
        ],
      })
    )) as unknown as ApiAction
    if (!signupResponse.error) {
      dispatch(setUserLoggedIn())
    }
    return signupResponse
  }
}

export const SET_USER_LOGGED_IN = "SET_USER_LOGGED_IN"
export const SET_USER_LOGGED_OUT = "SET_USER_LOGGED_OUT"

export function setUserLoggedIn() {
  return {type: SET_USER_LOGGED_IN}
}
export function setUserLoggedOut() {
  return {type: SET_USER_LOGGED_OUT}
}

// User home
export const GET_USER_HOME_REQUEST = "GET_USER_HOME_REQUEST"
export const GET_USER_HOME_SUCCESS = "GET_USER_HOME_SUCCESS"
export const GET_USER_HOME_FAILURE = "GET_USER_HOME_FAILURE"

export function getUserHome() {
  let endpoint = "/v1.0/user/home"
  return createApiAction(
    {
      endpoint,
      method: "GET",
      types: [
        GET_USER_HOME_REQUEST,
        GET_USER_HOME_SUCCESS,
        GET_USER_HOME_FAILURE,
      ],
    },
    {onSuccess: (dispatch) => dispatch(setUserLoggedIn())}
  )
}

// Send Password Reset Email
export const POST_FORGOT_PASSWORD_REQUEST = "POST_FORGOT_PASSWORD_REQUEST"
export const POST_FORGOT_PASSWORD_SUCCESS = "POST_FORGOT_PASSWORD_SUCCESS"
export const POST_FORGOT_PASSWORD_FAILURE = "POST_FORGOT_PASSWORD_FAILURE"

export function postForgotPassword(email: string) {
  let endpoint = `/v1.0/auth/reset-email`
  return createApiAction({
    endpoint,
    method: "POST",
    types: [
      POST_FORGOT_PASSWORD_SUCCESS,
      POST_FORGOT_PASSWORD_SUCCESS,
      POST_FORGOT_PASSWORD_FAILURE,
    ],
    body: JSON.stringify({email}),
  })
}

// Send Password Reset Email
export const POST_ATTENDEE_PW_RESET_REQUEST = "POST_ATTENDEE_PW_RESET_REQUEST"
export const POST_ATTENDEE_PW_RESET_SUCCESS = "POST_ATTENDEE_PW_RESET_SUCCESS"
export const POST_ATTENDEE_PW_RESET_FAILURE = "POST_ATTENDEE_PW_RESET_FAILURE"

export function postAttendeePasswordReset(email: string, retreat_id: number) {
  let endpoint = `/v1.0/attendees/sign-up-attendee`
  return createApiAction({
    endpoint,
    method: "POST",
    types: [
      POST_ATTENDEE_PW_RESET_REQUEST,
      POST_ATTENDEE_PW_RESET_SUCCESS,
      POST_ATTENDEE_PW_RESET_FAILURE,
    ],
    body: JSON.stringify({email: email, retreat_id: retreat_id}),
  })
}
