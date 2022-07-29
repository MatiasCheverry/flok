import querystring from "querystring"
import {
  AdminDestinationModel,
  AdminHotelDetailsModel,
  AdminLodgingProposalUpdateModel,
  AdminRetreatAttendeeModel,
  AdminRetreatAttendeeUpdateModel,
  AdminRetreatListType,
  AdminRetreatModel,
  AdminSelectedHotelProposalModel,
  HotelGroup,
  RetreatTask,
  RetreatToTaskState,
} from "../../models"
import {nullifyEmptyString} from "../../utils"
import {createApiAction} from "./api"

export const GET_RETREATS_LIST_REQUEST = "GET_RETREATS_LIST_REQUEST"
export const GET_RETREATS_LIST_SUCCESS = "GET_RETREATS_LIST_SUCCESS"
export const GET_RETREATS_LIST_FAILURE = "GET_RETREATS_LIST_FAILURE"

export function getRetreatsList(state: AdminRetreatListType) {
  let endpoint = "/v1.0/admin/retreats?" + querystring.stringify({state})
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      {type: GET_RETREATS_LIST_REQUEST, meta: {state}},
      {type: GET_RETREATS_LIST_SUCCESS, meta: {state}},
      {type: GET_RETREATS_LIST_FAILURE, meta: {state}},
    ],
  })
}

export const GET_RETREAT_DETAILS_REQUEST = "GET_RETREAT_DETAILS_REQUEST"
export const GET_RETREAT_DETAILS_SUCCESS = "GET_RETREAT_DETAILS_SUCCESS"
export const GET_RETREAT_DETAILS_FAILURE = "GET_RETREAT_DETAILS_FAILURE"

export function getRetreatDetails(id: number) {
  let endpoint = `/v1.0/admin/retreats/${id}`
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      {type: GET_RETREAT_DETAILS_REQUEST, meta: {id}},
      {type: GET_RETREAT_DETAILS_SUCCESS, meta: {id}},
      {type: GET_RETREAT_DETAILS_FAILURE, meta: {id}},
    ],
  })
}

export function createRetreatDetailsForm(
  obj: Partial<AdminRetreatModel>
): Partial<AdminRetreatModel> {
  let keys = Object.keys(obj) as (keyof AdminRetreatModel)[]
  keys.forEach((key) => {
    if (obj[key] == null || obj[key] === "") {
      obj[key] = undefined
    }
  })
  return obj
}

export const PATCH_RETREAT_DETAILS_REQUEST = "PATCH_RETREAT_DETAILS_REQUEST"
export const PATCH_RETREAT_DETAILS_SUCCESS = "PATCH_RETREAT_DETAILS_SUCCESS"
export const PATCH_RETREAT_DETAILS_FAILURE = "PATCH_RETREAT_DETAILS_FAILURE"

export function patchRetreatDetails(
  id: number,
  retreatDetails: Partial<AdminRetreatModel>
) {
  let endpoint = `/v1.0/admin/retreats/${id}`
  return createApiAction({
    endpoint,
    method: "PATCH",
    body: JSON.stringify(retreatDetails, (key, value) =>
      typeof value === "undefined" ? null : value
    ),
    types: [
      {type: PATCH_RETREAT_DETAILS_REQUEST, meta: {id}},
      {type: PATCH_RETREAT_DETAILS_SUCCESS, meta: {id}},
      {type: PATCH_RETREAT_DETAILS_FAILURE, meta: {id}},
    ],
  })
}

export const GET_DESTINATIONS_REQUEST = "GET_DESTINATIONS_REQUEST"
export const GET_DESTINATIONS_SUCCESS = "GET_DESTINATIONS_SUCCESS"
export const GET_DESTINATIONS_FAILURE = "GET_DESTINATIONS_FAILURE"

export function getDestinations() {
  let endpoint = `/v1.0/admin/destinations`
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      GET_DESTINATIONS_REQUEST,
      GET_DESTINATIONS_SUCCESS,
      GET_DESTINATIONS_FAILURE,
    ],
  })
}

export const GET_HOTELS_BY_DEST_REQUEST = "GET_HOTELS_BY_DEST_REQUEST"
export const GET_HOTELS_BY_DEST_SUCCESS = "GET_HOTELS_BY_DEST_SUCCESS"
export const GET_HOTELS_BY_DEST_FAILURE = "GET_HOTELS_BY_DEST_FAILURE"

export function getHotelsByDest(destinationId: number) {
  let endpoint =
    `/v1.0/admin/hotels?` +
    querystring.stringify({destination_ids: [destinationId]})
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      GET_HOTELS_BY_DEST_REQUEST,
      GET_HOTELS_BY_DEST_SUCCESS,
      GET_HOTELS_BY_DEST_FAILURE,
    ],
  })
}

export const GET_HOTELS_BY_ID_REQUEST = "GET_HOTELS_BY_ID_REQUEST"
export const GET_HOTELS_BY_ID_SUCCESS = "GET_HOTELS_BY_ID_SUCCESS"
export const GET_HOTELS_BY_ID_FAILURE = "GET_HOTELS_BY_ID_FAILURE"

export function getHotelsByHotelId(hotelIds: number[]) {
  let endpoint =
    `/v1.0/admin/hotels?` + querystring.stringify({hotel_ids: hotelIds})
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      GET_HOTELS_BY_ID_REQUEST,
      GET_HOTELS_BY_ID_SUCCESS,
      GET_HOTELS_BY_ID_FAILURE,
    ],
  })
}

export const GET_HOTEL_DETAILS_REQUEST = "GET_HOTEL_DETAILS_REQUEST"
export const GET_HOTEL_DETAILS_SUCCESS = "GET_HOTEL_DETAILS_SUCCESS"
export const GET_HOTEL_DETAILS_FAILURE = "GET_HOTEL_DETAILS_FAILURE"

export function getHotelDetails(hotelId: number) {
  let endpoint = `/v1.0/admin/hotels/${hotelId}`
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      GET_HOTEL_DETAILS_REQUEST,
      GET_HOTEL_DETAILS_SUCCESS,
      GET_HOTEL_DETAILS_FAILURE,
    ],
  })
}

export const POST_HOTEL_REQUEST = "POST_HOTEL_REQUEST"
export const POST_HOTEL_SUCCESS = "POST_HOTEL_SUCCESS"
export const POST_HOTEL_FAILURE = "POST_HOTEL_FAILURE"

export function postHotel(hotel: Partial<AdminHotelDetailsModel>) {
  let endpoint = `/v1.0/admin/hotels`
  return createApiAction({
    endpoint,
    body: JSON.stringify(hotel),
    method: "POST",
    types: [POST_HOTEL_REQUEST, POST_HOTEL_SUCCESS, POST_HOTEL_FAILURE],
  })
}

export const PATCH_HOTEL_REQUEST = "PATCH_HOTEL_REQUEST"
export const PATCH_HOTEL_SUCCESS = "PATCH_HOTEL_SUCCESS"
export const PATCH_HOTEL_FAILURE = "PATCH_HOTEL_FAILURE"

export function patchHotel(
  hotelId: number,
  hotel: Partial<AdminHotelDetailsModel>
) {
  let endpoint = `/v1.0/admin/hotels/${hotelId}`
  return createApiAction({
    endpoint,
    body: JSON.stringify(nullifyEmptyString(hotel)),
    method: "PATCH",
    types: [PATCH_HOTEL_REQUEST, PATCH_HOTEL_SUCCESS, PATCH_HOTEL_FAILURE],
  })
}

export const POST_HOTEL_TEMPLATE_PROPOSAL_REQUEST =
  "POST_HOTEL_TEMPLATE_PROPOSAL_REQUEST"
export const POST_HOTEL_TEMPLATE_PROPOSAL_SUCCESS =
  "POST_HOTEL_TEMPLATE_PROPOSAL_SUCCESS"
export const POST_HOTEL_TEMPLATE_PROPOSAL_FAILURE =
  "POST_HOTEL_TEMPLATE_PROPOSAL_FAILURE"

export function postHotelTemplateProposal(
  hotelId: number,
  proposal: AdminLodgingProposalUpdateModel
) {
  let endpoint = `/v1.0/admin/hotels/${hotelId}/proposal`
  return createApiAction({
    endpoint,
    method: "POST",
    body: JSON.stringify(nullifyEmptyString(proposal)),
    types: [
      POST_HOTEL_TEMPLATE_PROPOSAL_REQUEST,
      POST_HOTEL_TEMPLATE_PROPOSAL_SUCCESS,
      POST_HOTEL_TEMPLATE_PROPOSAL_FAILURE,
    ],
  })
}

export const PUT_HOTEL_TEMPLATE_PROPOSAL_REQUEST =
  "PUT_HOTEL_TEMPLATE_PROPOSAL_REQUEST"
export const PUT_HOTEL_TEMPLATE_PROPOSAL_SUCCESS =
  "PUT_HOTEL_TEMPLATE_PROPOSAL_SUCCESS"
export const PUT_HOTEL_TEMPLATE_PROPOSAL_FAILURE =
  "PUT_HOTEL_TEMPLATE_PROPOSAL_FAILURE"

export function putHotelTemplateProposal(
  hotelId: number,
  proposal: AdminLodgingProposalUpdateModel
) {
  let endpoint = `/v1.0/admin/hotels/${hotelId}/proposal`
  return createApiAction({
    endpoint,
    method: "PUT",
    body: JSON.stringify(nullifyEmptyString(proposal)),
    types: [
      PUT_HOTEL_TEMPLATE_PROPOSAL_REQUEST,
      PUT_HOTEL_TEMPLATE_PROPOSAL_SUCCESS,
      PUT_HOTEL_TEMPLATE_PROPOSAL_FAILURE,
    ],
  })
}

export const POST_SELECTED_HOTEL_REQUEST = "POST_SELECTED_HOTEL_REQUEST"
export const POST_SELECTED_HOTEL_SUCCESS = "POST_SELECTED_HOTEL_SUCCESS"
export const POST_SELECTED_HOTEL_FAILURE = "POST_SELECTED_HOTEL_FAILURE"

/** "Selects" a hotel for a particular retreat. */
export function postSelectedHotel(retreatId: number, hotelId: number) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/hotels/${hotelId}`
  return createApiAction({
    endpoint,
    method: "POST",
    types: [
      POST_SELECTED_HOTEL_REQUEST,
      POST_SELECTED_HOTEL_SUCCESS,
      POST_SELECTED_HOTEL_FAILURE,
    ],
  })
}

export const PUT_SELECTED_HOTEL_REQUEST = "PUT_SELECTED_HOTEL_REQUEST"
export const PUT_SELECTED_HOTEL_SUCCESS = "PUT_SELECTED_HOTEL_SUCCESS"
export const PUT_SELECTED_HOTEL_FAILURE = "PUT_SELECTED_HOTEL_FAILURE"

/** Update the proposal state for given hotel and retreat. */
export function putSelectedHotel(
  retreatId: number,
  hotelId: number,
  values: Partial<AdminSelectedHotelProposalModel>
) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/hotels/${hotelId}`
  return createApiAction({
    endpoint,
    method: "PUT",
    body: JSON.stringify(values, (key, value) =>
      typeof value === "undefined" ? null : value
    ),
    types: [
      PUT_SELECTED_HOTEL_REQUEST,
      PUT_SELECTED_HOTEL_SUCCESS,
      PUT_SELECTED_HOTEL_FAILURE,
    ],
  })
}

export const DELETE_SELECTED_HOTEL_REQUEST = "DELETE_SELECTED_HOTEL_REQUEST"
export const DELETE_SELECTED_HOTEL_SUCCESS = "DELETE_SELECTED_HOTEL_SUCCESS"
export const DELETE_SELECTED_HOTEL_FAILURE = "DELETE_SELECTED_HOTEL_FAILURE"

/** "Deselects" a hotel for the given retreat. */
export function deleteSelectedHotel(retreatId: number, hotelId: number) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/hotels/${hotelId}`
  return createApiAction({
    endpoint,
    method: "DELETE",
    types: [
      DELETE_SELECTED_HOTEL_REQUEST,
      DELETE_SELECTED_HOTEL_SUCCESS,
      DELETE_SELECTED_HOTEL_FAILURE,
    ],
  })
}

export const POST_RETREAT_HOTEL_PROPOSAL_REQUEST =
  "POST_RETREAT_HOTEL_PROPOSAL_REQUEST"
export const POST_RETREAT_HOTEL_PROPOSAL_SUCCESS =
  "POST_RETREAT_HOTEL_PROPOSAL_SUCCESS"
export const POST_RETREAT_HOTEL_PROPOSAL_FAILURE =
  "POST_RETREAT_HOTEL_PROPOSAL_FAILURE"

/** Adds hotel proposal. */
export function postHotelProposal(
  retreatId: number,
  hotelId: number,
  proposal: AdminLodgingProposalUpdateModel
) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/hotels/${hotelId}/proposals`
  return createApiAction({
    endpoint,
    method: "POST",
    body: JSON.stringify(proposal, (key, value) =>
      typeof value === "undefined" ? null : value
    ),
    types: [
      POST_RETREAT_HOTEL_PROPOSAL_REQUEST,
      POST_RETREAT_HOTEL_PROPOSAL_SUCCESS,
      POST_RETREAT_HOTEL_PROPOSAL_FAILURE,
    ],
  })
}

export const PUT_RETREAT_HOTEL_PROPOSAL_REQUEST =
  "PUT_RETREAT_HOTEL_PROPOSAL_REQUEST"
export const PUT_RETREAT_HOTEL_PROPOSAL_SUCCESS =
  "PUT_RETREAT_HOTEL_PROPOSAL_SUCCESS"
export const PUT_RETREAT_HOTEL_PROPOSAL_FAILURE =
  "PUT_RETREAT_HOTEL_PROPOSAL_FAILURE"

/** Edits hotel proposal. */
export function putRetreatHotelProposal(
  retreatId: number,
  hotelId: number,
  proposalId: number,
  proposal: AdminLodgingProposalUpdateModel
) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/hotels/${hotelId}/proposals/${proposalId}`
  return createApiAction({
    endpoint,
    method: "PUT",
    body: JSON.stringify(proposal, (key, value) =>
      typeof value === "undefined" ? null : value
    ),
    types: [
      PUT_RETREAT_HOTEL_PROPOSAL_REQUEST,
      PUT_RETREAT_HOTEL_PROPOSAL_SUCCESS,
      PUT_RETREAT_HOTEL_PROPOSAL_FAILURE,
    ],
  })
}

export const DELETE_RETREAT_HOTEL_PROPOSAL_REQUEST =
  "DELETE_RETREAT_HOTEL_PROPOSAL_REQUEST"
export const DELETE_RETREAT_HOTEL_PROPOSAL_SUCCESS =
  "DELETE_RETREAT_HOTEL_PROPOSAL_SUCCESS"
export const DELETE_RETREAT_HOTEL_PROPOSAL_FAILURE =
  "DELETE_RETREAT_HOTEL_PROPOSAL_FAILURE"

/** Adds hotel proposal. */
export function deleteRetreatHotelProposal(
  retreatId: number,
  hotelId: number,
  proposalId: number
) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/hotels/${hotelId}/proposals/${proposalId}`
  return createApiAction({
    endpoint,
    method: "DELETE",
    types: [
      DELETE_RETREAT_HOTEL_PROPOSAL_REQUEST,
      DELETE_RETREAT_HOTEL_PROPOSAL_SUCCESS,
      DELETE_RETREAT_HOTEL_PROPOSAL_FAILURE,
    ],
  })
}

export const GET_RETREAT_ATTENDEES_REQUEST = "GET_RETREAT_ATTENDEES_REQUEST"
export const GET_RETREAT_ATTENDEES_SUCCESS = "GET_RETREAT_ATTENDEES_SUCCESS"
export const GET_RETREAT_ATTENDEES_FAILURE = "GET_RETREAT_ATTENDEES_FAILURE"
export function getRetreatAttendees(retreatId: number) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/attendees`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_RETREAT_ATTENDEES_REQUEST},
      {type: GET_RETREAT_ATTENDEES_SUCCESS, meta: {retreatId}},
      {type: GET_RETREAT_ATTENDEES_FAILURE, meta: {retreatId}},
    ],
  })
}

export const PATCH_RETREAT_ATTENDEE_REQUEST = "PATCH_RETREAT_ATTENDEE_REQUEST"
export const PATCH_RETREAT_ATTENDEE_SUCCESS = "PATCH_RETREAT_ATTENDEE_SUCCESS"
export const PATCH_RETREAT_ATTENDEE_FAILURE = "PATCH_RETREAT_ATTENDEE_FAILURE"
export function patchRetreatAttendee(
  retreatId: number,
  attendeeId: number,
  attendee: AdminRetreatAttendeeUpdateModel
) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/attendees/${attendeeId}`
  return createApiAction({
    method: "PATCH",
    endpoint,
    body: JSON.stringify(attendee, (key, value) =>
      typeof value === "undefined" ? null : value
    ),
    types: [
      {
        type: PATCH_RETREAT_ATTENDEE_REQUEST,
      },
      {
        type: PATCH_RETREAT_ATTENDEE_SUCCESS,
        meta: {retreatId},
      },
      {
        type: PATCH_RETREAT_ATTENDEE_FAILURE,
        meta: {retreatId},
      },
    ],
  })
}

export const POST_RETREAT_ATTENDEE_REQUEST = "POST_RETREAT_ATTENDEE_REQUEST"
export const POST_RETREAT_ATTENDEE_SUCCESS = "POST_RETREAT_ATTENDEE_SUCCESS"
export const POST_RETREAT_ATTENDEE_FAILURE = "POST_RETREAT_ATTENDEE_FAILURE"
export function postRetreatAttendee(
  retreatId: number,
  attendee: Partial<AdminRetreatAttendeeModel>
) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/attendees`
  return createApiAction({
    method: "POST",
    endpoint,
    body: JSON.stringify(attendee),
    types: [
      {
        type: POST_RETREAT_ATTENDEE_REQUEST,
      },
      {
        type: POST_RETREAT_ATTENDEE_SUCCESS,
        meta: {retreatId},
      },
      {
        type: POST_RETREAT_ATTENDEE_FAILURE,
        meta: {retreatId},
      },
    ],
  })
}

export const DELETE_RETREAT_ATTENDEES_REQUEST =
  "DELETE_RETREAT_ATTENDEES_REQUEST"
export const DELETE_RETREAT_ATTENDEES_SUCCESS =
  "DELETE_RETREAT_ATTENDEES_SUCCESS"
export const DELETE_RETREAT_ATTENDEES_FAILURE =
  "DELETE_RETREAT_ATTENDEES_FAILURE"
export function deleteRetreatAttendees(retreatId: number, attendeeId: number) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/attendees`
  return createApiAction({
    method: "DELETE",
    endpoint,
    body: JSON.stringify({attendee_id: attendeeId}),
    types: [
      {
        type: DELETE_RETREAT_ATTENDEES_REQUEST,
      },
      {
        type: DELETE_RETREAT_ATTENDEES_SUCCESS,
        meta: {retreatId},
      },
      {
        type: DELETE_RETREAT_ATTENDEES_FAILURE,
        meta: {retreatId},
      },
    ],
  })
}

export const GET_RETREAT_NOTES_REQUEST = "GET_RETREAT_NOTES_REQUEST"
export const GET_RETREAT_NOTES_SUCCESS = "GET_RETREAT_NOTES_SUCCESS"
export const GET_RETREAT_NOTES_FAILURE = "GET_RETREAT_NOTES_FAILURE"
export function getRetreatNotes(retreatId: number) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/notes`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      GET_RETREAT_NOTES_REQUEST,
      {type: GET_RETREAT_NOTES_SUCCESS, meta: {retreatId}},
      {type: GET_RETREAT_NOTES_FAILURE, meta: {retreatId}},
    ],
  })
}

export const POST_RETREAT_NOTES_REQUEST = "POST_RETREAT_NOTES_REQUEST"
export const POST_RETREAT_NOTES_SUCCESS = "POST_RETREAT_NOTES_SUCCESS"
export const POST_RETREAT_NOTES_FAILURE = "POST_RETREAT_NOTES_FAILURE"
export function postRetreatNotes(retreatId: number, note: string) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/notes`
  return createApiAction({
    method: "POST",
    endpoint,
    body: JSON.stringify({note}),
    types: [
      POST_RETREAT_NOTES_REQUEST,
      {type: POST_RETREAT_NOTES_SUCCESS, meta: {retreatId}},
      {type: POST_RETREAT_NOTES_FAILURE, meta: {retreatId}},
    ],
  })
}

export const GET_RETREAT_TASKS_REQUEST = "GET_RETREAT_TASK_REQUEST"
export const GET_RETREAT_TASKS_SUCCESS = "GET_RETREAT_TASK_SUCCCESS"
export const GET_RETREAT_TASKS_FAILURE = "GET_RETREAT_TASK_FAILURE"
export function getRetreatTasks(retreatId: number) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/tasks`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_RETREAT_TASKS_REQUEST, meta: {retreatId}},
      {type: GET_RETREAT_TASKS_SUCCESS, meta: {retreatId}},
      {type: GET_RETREAT_TASKS_FAILURE, meta: {retreatId}},
    ],
  })
}
export const GET_HOTELS_SEARCH_REQUEST = "GET_HOTELS_SEARCH_REQUEST"
export const GET_HOTELS_SEARCH_SUCCESS = "GET_HOTELS_SEARCH_SUCCESS"
export const GET_HOTELS_SEARCH_FAILURE = "GET_HOTELS_SEARCH_FAILURE"
export function getHotelsSearch(search: string) {
  let endpoint = `/v1.0/admin/hotels/search?${new URLSearchParams({
    q: search,
  }).toString()}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      GET_HOTELS_SEARCH_REQUEST,
      {type: GET_HOTELS_SEARCH_SUCCESS, meta: {search}},
      {type: GET_HOTELS_SEARCH_FAILURE, meta: {search}},
    ],
  })
}

export const PATCH_RETREAT_TASK_REQUEST = "PATCH_RETREAT_TASK_REQUEST"
export const PATCH_RETREAT_TASK_SUCCESS = "PATCH_RETREAT_TASK_SUCCESS"
export const PATCH_RETREAT_TASK_FAILURE = "PATCH_RETREAT_TASK_FAILURE"
export function patchRetreatTask(
  retreatId: number,
  taskId: number,
  state: RetreatToTaskState,
  dueDate: string,
  taskVars: {[key: string]: string | null}
) {
  let endpoint = `/v1.0/admin/retreats/${retreatId}/tasks/${taskId}`
  return createApiAction({
    method: "PATCH",
    endpoint,
    body: JSON.stringify({
      state,
      due_date: dueDate ? dueDate : null,
      task_vars: taskVars,
    }),
    types: [
      {type: PATCH_RETREAT_TASK_REQUEST, meta: {retreatId}},
      {type: PATCH_RETREAT_TASK_SUCCESS, meta: {retreatId}},
      {type: PATCH_RETREAT_TASK_FAILURE, meta: {retreatId}},
    ],
  })
}

export const GET_USERS_REQUEST = "GET_USERS_REQUEST"
export const GET_USERS_SUCCESS = "GET_USERS_SUCCESS"
export const GET_USERS_FAILURE = "GET_USERS_FAILURE"
export function getUsers(retreatId?: number) {
  let endpoint = retreatId
    ? `/v1.0/admin/users?retreat_id=${retreatId}`
    : `/v1.0/admin/users`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      GET_USERS_REQUEST,
      {type: GET_USERS_SUCCESS, meta: {retreatId}},
      {type: GET_USERS_FAILURE, meta: {retreatId}},
    ],
  })
}

export const POST_USER_REQUEST = "POST_USER_REQUEST"
export const POST_USER_SUCCESS = "POST_USER_SUCCESS"
export const POST_USER_FAILURE = "POST_USER_FAILURE"
export function postUser(
  email: string,
  firstName: string,
  lastName: string,
  retreatIds: number[]
) {
  let endpoint = `/v1.0/admin/users`
  return createApiAction({
    method: "POST",
    body: JSON.stringify({
      email,
      first_name: firstName,
      last_name: lastName,
      retreat_ids: retreatIds,
    }),
    endpoint,
    types: [POST_USER_REQUEST, POST_USER_SUCCESS, POST_HOTEL_FAILURE],
  })
}

export const PATCH_USER_REQUEST = "PATCH_USER_REQUEST"
export const PATCH_USER_SUCCESS = "PATCH_USER_SUCCESS"
export const PATCH_USER_FAILURE = "PATCH_USER_FAILURE"
export function patchUser(
  id: number,
  firstName: string,
  lastName: string,
  retreatIds: number[]
) {
  let endpoint = `/v1.0/admin/users`
  return createApiAction({
    method: "PATCH",
    body: JSON.stringify({
      id,
      first_name: firstName,
      last_name: lastName,
      retreat_ids: retreatIds,
    }),
    endpoint,
    types: [PATCH_USER_REQUEST, PATCH_USER_SUCCESS, PATCH_HOTEL_FAILURE],
  })
}

export const GET_LOGIN_TOKEN_REQUEST = "GET_LOGIN_TOKEN_REQUEST"
export const GET_LOGIN_TOKEN_SUCCESS = "GET_LOGIN_TOKEN_SUCCESS"
export const GET_LOGIN_TOKEN_FAILURE = "GET_LOGIN_TOKEN_FAILURE"
export function getUserLoginToken(userId: number) {
  let endpoint = `/v1.0/admin/users/${userId}/login-token`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      GET_LOGIN_TOKEN_REQUEST,
      {type: GET_LOGIN_TOKEN_SUCCESS, meta: {userId}},
      GET_LOGIN_TOKEN_FAILURE,
    ],
  })
}

export const GET_TASKS_LIST_REQUEST = "GET_TASKS_LIST_REQUEST"
export const GET_TASKS_LIST_SUCCESS = "GET_TASKS_LIST_SUCCESS"
export const GET_TASKS_LIST_FAILURE = "GET_TASKS_LIST_FAILURE"

export function getTasksList() {
  let endpoint = "/v1.0/admin/tasks"
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      {type: GET_TASKS_LIST_REQUEST},
      {type: GET_TASKS_LIST_SUCCESS},
      {type: GET_TASKS_LIST_FAILURE},
    ],
  })
}

export const PATCH_TASK_REQUEST = "PATCH_TASK_REQUEST"
export const PATCH_TASK_SUCCESS = "PATCH_TASK_SUCCESS"
export const PATCH_TASK_FAILURE = "PATCH_TASK_FAILURE"
export function patchTask(task_id: string, taskDetails: Partial<RetreatTask>) {
  let endpoint = `/v1.0/admin/tasks/${task_id}`
  return createApiAction({
    endpoint,
    method: "PATCH",
    body: JSON.stringify(taskDetails, (key, value) =>
      typeof value === "undefined" ? null : value
    ),
    types: [
      {type: PATCH_TASK_REQUEST, meta: {task_id}},
      {type: PATCH_TASK_SUCCESS, meta: {task_id}},
      {type: PATCH_TASK_FAILURE, meta: {task_id}},
    ],
  })
}

export const GET_TASK_REQUEST = "GET_TASK_REQUEST"
export const GET_TASK_SUCCESS = "GET_TASK_SUCCESS"
export const GET_TASK_FAILURE = "GET_TASK_FAILURE"

export function getTask(task_id: number) {
  let endpoint = `/v1.0/admin/tasks/${task_id}`
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      {type: GET_TASK_REQUEST, meta: {task_id}},
      {type: GET_TASK_SUCCESS, meta: {task_id}},
      {type: GET_TASK_FAILURE, meta: {task_id}},
    ],
  })
}

export const ADD_RETREAT_TASKS_REQUEST = "ADD_RETREAT_TASKS_REQUEST"
export const ADD_RETREAT_TASKS_SUCCESS = "ADD_RETREAT_TASKS_SUCCESS"
export const ADD_RETREAT_TASKS_FAILURE = "ADD_RETREAT_TASKS_FAILURE"

export function addRetreatTasks(
  retreat_id: number,
  version: number,
  overwrite: boolean
) {
  let endpoint = `/v1.0/admin/retreats/${retreat_id}/tasks`
  return createApiAction({
    endpoint,
    method: "POST",
    body: JSON.stringify({version, overwrite}),
    types: [
      {type: ADD_RETREAT_TASKS_REQUEST, meta: {retreatId: retreat_id}},
      {type: ADD_RETREAT_TASKS_SUCCESS, meta: {retreatId: retreat_id}},
      {type: ADD_RETREAT_TASKS_FAILURE, meta: {retreatId: retreat_id}},
    ],
  })
}

export const POST_DESTINATION_REQUEST = "POST_DESTINATION_REQUEST"
export const POST_DESTINATION_SUCCESS = "POST_DESTINATION_SUCCESS"
export const POST_DESTINATION_FAILURE = "POST_DESTINATION_FAILURE"

export function postDestination(values: Partial<AdminDestinationModel>) {
  let endpoint = `/v1.0/admin/destinations`
  return createApiAction({
    endpoint,
    method: "POST",
    body: JSON.stringify(values),
    types: [
      {type: POST_DESTINATION_REQUEST},
      {type: POST_DESTINATION_SUCCESS},
      {type: POST_DESTINATION_FAILURE},
    ],
  })
}

export const GET_HOTEL_GROUP_REQUEST = "GET_HOTEL_GROUP_REQUEST"
export const GET_HOTEL_GROUP_SUCCESS = "GET_HOTEL_GROUP_SUCCESS"
export const GET_HOTEL_GROUP_FAILURE = "GET_HOTEL_GROUP_FAILURE"

export function getHotelGroup(groupId: number) {
  let endpoint = `/v1.0/hotel-groups/${groupId}`
  return createApiAction({
    endpoint,
    method: "GET",
    types: [
      {type: GET_HOTEL_GROUP_REQUEST},
      {type: GET_HOTEL_GROUP_SUCCESS},
      {type: GET_HOTEL_GROUP_FAILURE},
    ],
  })
}

export const POST_HOTEL_GROUP_REQUEST = "POST_HOTEL_GROUP_REQUEST"
export const POST_HOTEL_GROUP_SUCCESS = "POST_HOTEL_GROUP_SUCCESS"
export const POST_HOTEL_GROUP_FAILURE = "POST_HOTEL_GROUP_FAILURE"

export function postHotelGroup(values: Partial<HotelGroup>) {
  let endpoint = `/v1.0/admin/hotel-groups`
  return createApiAction({
    endpoint,
    method: "POST",
    body: JSON.stringify(values),
    types: [
      {type: POST_HOTEL_GROUP_REQUEST},
      {type: POST_HOTEL_GROUP_SUCCESS},
      {type: POST_HOTEL_GROUP_FAILURE},
    ],
  })
}

export const PATCH_HOTEL_GROUP_REQUEST = "PATCH_HOTEL_GROUP_REQUEST"
export const PATCH_HOTEL_GROUP_SUCCESS = "PATCH_HOTEL_GROUP_SUCCESS"
export const PATCH_HOTEL_GROUP_FAILURE = "PATCH_HOTEL_GROUP_FAILURE"

export function patchHotelGroup(groupId: number, values: Partial<HotelGroup>) {
  let endpoint = `/v1.0/admin/hotel-groups/${groupId}`
  return createApiAction({
    endpoint,
    method: "PATCH",
    body: JSON.stringify(values),
    types: [
      {type: PATCH_HOTEL_GROUP_REQUEST},
      {type: PATCH_HOTEL_GROUP_SUCCESS},
      {type: PATCH_HOTEL_GROUP_FAILURE},
    ],
  })
}

export const DELETE_HOTEL_GROUP_REQUEST = "DELETE_HOTEL_GROUP_REQUEST"
export const DELETE_HOTEL_GROUP_SUCCESS = "DELETE_HOTEL_GROUP_SUCCESS"
export const DELETE_HOTEL_GROUP_FAILURE = "DELETE_HOTEL_GROUP_FAILURE"
export function deleteHotelGroup(groupId: number) {
  let endpoint = `/v1.0/admin/hotel-groups/${groupId}`
  return createApiAction({
    endpoint,
    method: "DELETE",
    types: [
      {type: DELETE_HOTEL_GROUP_REQUEST, meta: {groupId}},
      {type: DELETE_HOTEL_GROUP_SUCCESS, meta: {groupId}},
      {type: DELETE_HOTEL_GROUP_FAILURE, meta: {groupId}},
    ],
  })
}
