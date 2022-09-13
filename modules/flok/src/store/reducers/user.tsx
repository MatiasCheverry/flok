import {Action} from "redux"
import {
  AttendeeApiResponse,
  UserAuthResponse,
  UserHomeResponse,
} from "../../models/api"
import {UserModel} from "../../models/user"
import {ApiAction} from "../actions/api"
import {GET_MY_ATTENDEE_SUCCESS} from "../actions/retreat"
import {
  GET_USER_HOME_SUCCESS,
  GET_USER_RESET_SUCCESS,
  SET_USER_LOGGED_IN,
  SET_USER_LOGGED_OUT,
} from "../actions/user"

export type UserState = {
  loginStatus: "UNKNOWN" | "LOGGED_IN" | "LOGGED_OUT"
  auth: {
    tokens: {[key: string]: UserModel}
  }
  user?: UserModel
  myAttendeeByRetreat: {
    // retreatId => attendeeId
    [id: number]: number
  }
}

const initialState: UserState = {
  auth: {
    tokens: {},
  },
  loginStatus: "UNKNOWN",
  user: undefined,
  myAttendeeByRetreat: {},
}

export default function userReducer(
  state: UserState = initialState,
  action: Action
): UserState {
  var payload
  switch (action.type) {
    case SET_USER_LOGGED_IN:
      return {...state, loginStatus: "LOGGED_IN"}
    case SET_USER_LOGGED_OUT:
      return {...state, loginStatus: "LOGGED_OUT"}
    case GET_USER_HOME_SUCCESS:
      payload = (action as ApiAction).payload as UserHomeResponse
      return {...state, user: payload.user}
    case GET_USER_RESET_SUCCESS:
      let loginToken = (action as unknown as {meta: {loginToken: string}}).meta
        .loginToken
      let user = (action as ApiAction).payload as UserAuthResponse
      return {
        ...state,
        auth: {
          ...state.auth,
          tokens: {...state.auth.tokens, [loginToken]: user.user},
        },
      }
    case GET_MY_ATTENDEE_SUCCESS:
      payload = (action as ApiAction).payload as AttendeeApiResponse
      return {
        ...state,
        myAttendeeByRetreat: {
          ...state.myAttendeeByRetreat,
          [payload.attendee.retreat_id]: payload.attendee.id,
        },
      }
    default:
      return state
  }
}
