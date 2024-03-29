import {Action} from "redux"
import {ResourceNotFound, ResourceNotFoundType} from "../../models"
import {
  AttendeeApiResponse,
  AttendeeLandingWebsiteApiResponse,
  AttendeeLandingWebsitePageApiResponse,
  AttendeeLandingWebsitePageBlockApiResponse,
  PresetImagesApiResponse,
  RetreatAttendeesApiResponse,
  TripApiResponse,
} from "../../models/api"
import {
  AttendeeLandingWebsiteBlockModel,
  AttendeeLandingWebsiteModel,
  AttendeeLandingWebsitePageModel,
  EmailTemplateModel,
  FileModel,
  HotelGroup,
  PresetImageModel,
  PresetImageType,
  RetreatAttendeeModel,
  RetreatModel,
  RetreatTripModel,
  RFPModel,
} from "../../models/retreat"
import {UserModel} from "../../models/user"
import {ApiAction} from "../actions/api"
import {
  DELETE_PAGE_SUCCESS,
  DELETE_RECEIPT_TO_ATTENDEE_SUCCESS,
  DELETE_RETREAT_ATTENDEES_SUCCESS,
  DELETE_USER_SUCCESS,
  GET_ATTENDEE_SUCCESS,
  GET_BLOCK_SUCCESS,
  GET_EMAIL_TEMPLATE_SUCCESS,
  GET_HOTEL_GROUP_SUCCESS,
  GET_MY_ATTENDEE_SUCCESS,
  GET_PAGE_SUCCESS,
  GET_PRESET_IMAGES_SUCCESS,
  GET_RETREAT_ATTENDEES_SUCCESS,
  GET_RETREAT_BY_GUID_FAILURE,
  GET_RETREAT_BY_GUID_SUCCESS,
  GET_RETREAT_FAILURE,
  GET_RETREAT_SUCCESS,
  GET_RFP_SUCCESS,
  GET_TRIPS_SUCCESS,
  GET_TRIP_SUCCESS,
  GET_USER_SUCCESS,
  GET_WEBSITE_BY_ATTENDEE_SUCCESS,
  GET_WEBSITE_SUCCESS,
  INSTANTIATE_ATTENDEE_TRIPS_SUCCESS,
  PATCH_ATTENDEE_SUCCESS,
  PATCH_ATTENDEE_TRAVEL_SUCCESS,
  PATCH_BLOCK_SUCCESS,
  PATCH_EMAIL_TEMPLATE_SUCCESS,
  PATCH_PAGE_SUCCESS,
  PATCH_RETREAT_SUCCESS,
  PATCH_TRIP_SUCCESS,
  PATCH_WEBSITE_SUCCESS,
  POST_ATTENDEE_REG_SUCCESS,
  POST_BLOCK_SUCCESS,
  POST_EMAIL_TEMPLATE_SUCCESS,
  POST_FLIGHTS_LIVE_SUCCESS,
  POST_INITIAL_WEBSITE_SUCCESS,
  POST_PAGE_SUCCESS,
  POST_REGISTRATION_LIVE_SUCCESS,
  POST_RETREAT_ATTENDEES_BATCH_SUCCESS,
  POST_RETREAT_ATTENDEES_SUCCESS,
  POST_RFP_SUCCESS,
  POST_SELECTED_HOTEL_SUCCESS,
  POST_TEMPLATED_PAGE_SUCCESS,
  POST_USER_SUCCESS,
  PUT_RETREAT_PREFERENCES_SUCCESS,
  PUT_RETREAT_TASK_SUCCESS,
} from "../actions/retreat"

export type RetreatState = {
  retreats: {
    [id: number]: RetreatModel | ResourceNotFoundType
  }
  retreatsByGuid: {
    [guid: string]: RetreatModel | ResourceNotFoundType | undefined
  }
  retreatAttendees: {[id: number]: number[] | undefined}
  attendees: {
    [id: number]: RetreatAttendeeModel
  }
  trips: {
    [id: number]: RetreatTripModel
  }
  websites: {
    [id: number]: AttendeeLandingWebsiteModel | undefined
  }
  pages: {
    [id: number]: AttendeeLandingWebsitePageModel | undefined
  }
  blocks: {
    [id: number]: AttendeeLandingWebsiteBlockModel | undefined
  }
  presetImages: {
    BANNER: PresetImageModel[]
  }
  users: {
    [id: number]: UserModel | undefined
  }
  RFPs: {
    [id: number]: RFPModel | undefined
  }
  hotelGroups: {
    [id: number]: HotelGroup
  }
  emailTemplates: {
    [id: number]: EmailTemplateModel
  }
}

const initialState: RetreatState = {
  retreats: {},
  retreatsByGuid: {},
  retreatAttendees: {},
  attendees: {},
  trips: {},
  websites: {},
  pages: {},
  blocks: {},
  presetImages: {
    BANNER: [],
  },
  users: {},
  RFPs: {},
  hotelGroups: {},
  emailTemplates: {},
}

export default function retreatReducer(
  state: RetreatState = initialState,
  action: Action
): RetreatState {
  var payload
  var retreatId: number, retreat: RetreatModel
  switch (action.type) {
    case GET_RETREAT_BY_GUID_SUCCESS: // TODO, remove once dashboard release
    case GET_RETREAT_SUCCESS:
    case PUT_RETREAT_PREFERENCES_SUCCESS:
    case PUT_RETREAT_TASK_SUCCESS:
    case POST_SELECTED_HOTEL_SUCCESS:
    case POST_REGISTRATION_LIVE_SUCCESS:
    case POST_FLIGHTS_LIVE_SUCCESS:
    case PATCH_RETREAT_SUCCESS:
      retreat = ((action as ApiAction).payload as {retreat: RetreatModel})
        .retreat
      retreatId = retreat.id
      return {
        ...state,
        retreats: {...state.retreats, [retreatId]: retreat},
        retreatsByGuid: {...state.retreatsByGuid, [retreat.guid]: retreat}, // TODO, remove once dashboard release
      }
    case GET_RETREAT_FAILURE:
      // Probably should check for 404 here
      retreatId = (action as unknown as {meta: {retreatId: number}}).meta
        .retreatId
      return {
        ...state,
        retreats: {...state.retreats, [retreatId]: ResourceNotFound},
      }
    // TODO, remove once dashboard release
    case GET_RETREAT_BY_GUID_FAILURE:
      let retreatGuid = (action as unknown as {meta: {retreatGuid: string}})
        .meta.retreatGuid
      return {
        ...state,
        retreatsByGuid: {
          ...state.retreatsByGuid,
          [retreatGuid]: ResourceNotFound,
        },
      }
    case POST_RETREAT_ATTENDEES_SUCCESS:
    case DELETE_RETREAT_ATTENDEES_SUCCESS:
    case GET_RETREAT_ATTENDEES_SUCCESS:
      retreatId = (action as unknown as {meta: {retreatId: number}}).meta
        .retreatId
      payload = (action as ApiAction).payload as RetreatAttendeesApiResponse
      if (payload) {
        state.retreatAttendees = {
          ...state.retreatAttendees,
          [retreatId]: payload.attendees.map((attendee) => attendee.id),
        }
        state.attendees = payload.attendees.reduce(
          (last: any, curr: RetreatAttendeeModel) => {
            return {...last, [curr.id]: curr}
          },
          {}
        )
      }
      return state
    case GET_ATTENDEE_SUCCESS:
    case PATCH_ATTENDEE_SUCCESS:
    case PATCH_ATTENDEE_TRAVEL_SUCCESS:
    case GET_MY_ATTENDEE_SUCCESS:
    case POST_ATTENDEE_REG_SUCCESS:
      payload = (action as ApiAction).payload as AttendeeApiResponse
      if (payload) {
        state.attendees = {
          ...state.attendees,
          [payload.attendee.id]: payload.attendee,
        }
      }
      return state

    case PATCH_TRIP_SUCCESS:
    case GET_TRIP_SUCCESS:
      payload = (action as ApiAction).payload as TripApiResponse
      if (payload) {
        state.trips = {
          ...state.trips,
          [payload.trip.id]: payload.trip,
        }
      }
      return state
    case GET_TRIPS_SUCCESS:
      payload = (action as ApiAction).payload as {trips: RetreatTripModel[]}
      return {
        ...state,
        trips: {
          ...state.trips,
          ...payload.trips.reduce(
            (prev, curr) => ({...prev, [curr.id]: curr}),
            {}
          ),
        },
      }
    case INSTANTIATE_ATTENDEE_TRIPS_SUCCESS:
      payload = (action as ApiAction).payload as AttendeeApiResponse
      if (payload) {
        state.attendees = {
          ...state.attendees,
          [payload.attendee.id]: payload.attendee,
        }
        if (
          payload &&
          payload.attendee.travel?.arr_trip?.id &&
          payload.attendee.travel?.dep_trip?.id
        ) {
          state.trips = {
            ...state.trips,
            [payload.attendee.travel.arr_trip.id]:
              payload.attendee.travel.arr_trip,
            [payload.attendee.travel.dep_trip.id]:
              payload.attendee.travel.dep_trip,
          }
        }
      }
      return state
    case GET_WEBSITE_SUCCESS:
    case GET_WEBSITE_BY_ATTENDEE_SUCCESS:
    case PATCH_WEBSITE_SUCCESS:
    case POST_INITIAL_WEBSITE_SUCCESS:
      payload = (action as ApiAction)
        .payload as AttendeeLandingWebsiteApiResponse
      return {
        ...state,
        websites: {
          ...state.websites,
          [payload.website.id]: payload.website,
        },
        retreats: {
          ...state.retreats,
          ...(state.retreats[payload.website.retreat_id] &&
          state.retreats[payload.website.retreat_id] !== ResourceNotFound
            ? {
                [payload.website.retreat_id]: {
                  ...(state.retreats[
                    payload.website.retreat_id
                  ] as RetreatModel),
                  attendees_website_id: payload.website.id,
                },
              }
            : {}),
        },
      }
    case GET_PAGE_SUCCESS:
    case PATCH_PAGE_SUCCESS:
      payload = (action as ApiAction)
        .payload as AttendeeLandingWebsitePageApiResponse
      return {
        ...state,
        pages: {...state.pages, [payload.page.id]: payload.page},
      }
    case GET_BLOCK_SUCCESS:
    case PATCH_BLOCK_SUCCESS:
      payload = (action as ApiAction)
        .payload as AttendeeLandingWebsitePageBlockApiResponse
      return {
        ...state,
        blocks: {...state.blocks, [payload.block.id]: payload.block},
      }
    case POST_BLOCK_SUCCESS:
      payload = (action as ApiAction)
        .payload as AttendeeLandingWebsitePageBlockApiResponse
      return {
        ...state,
        blocks: {...state.blocks, [payload.block.id]: payload.block},
        pages: {
          ...state.pages,
          [payload.block.page_id]: {
            ...state.pages[payload.block.page_id]!,
            block_ids: [
              ...(state.pages[payload.block.page_id]
                ? state.pages[payload.block.page_id]!.block_ids
                : []),
              payload.block.id,
            ],
          },
        },
      }
    case POST_PAGE_SUCCESS:
      payload = (action as ApiAction)
        .payload as AttendeeLandingWebsitePageApiResponse
      return {
        ...state,
        pages: {...state.pages, [payload.page.id]: payload.page},
        websites: {
          ...state.websites,
          [payload.page.website_id]: {
            ...state.websites[payload.page.website_id]!,
            page_ids: [
              ...(state.websites[payload.page.website_id]
                ? state.websites[payload.page.website_id]!.page_ids
                : []),
              payload.page.id,
            ],
          },
        },
      }
    case POST_TEMPLATED_PAGE_SUCCESS:
      payload = (action as ApiAction)
        .payload as AttendeeLandingWebsitePageApiResponse
      let meta = action as unknown as {
        meta: {
          type: "FLIGHTS"
          retreatId: number | undefined
        }
      }
      let oldRetreat =
        state.retreats[meta.meta.retreatId ? meta.meta.retreatId : -1]
      let newRetreat =
        oldRetreat === ResourceNotFound ? ResourceNotFound : {...oldRetreat}
      if (newRetreat !== "RESOURCE_NOT_FOUND") {
        newRetreat.flights_page_id = payload.page.id
      }
      return {
        ...state,
        pages: {...state.pages, [payload.page.id]: payload.page},
        websites: {
          ...state.websites,
          [payload.page.website_id]: {
            ...state.websites[payload.page.website_id]!,
            page_ids: [
              ...(state.websites[payload.page.website_id]
                ? state.websites[payload.page.website_id]!.page_ids
                : []),
              payload.page.id,
            ],
          },
        },
        retreats: {
          ...state.retreats,
          [newRetreat !== ResourceNotFound ? newRetreat.id : -1]: newRetreat,
        },
      }
    case "ADD_RECEIPT_TO_ATTENDEE":
      payload = action as {
        type: "ADD_RECEIPT_TO_ATTENDEE"
        receipt: FileModel
        attendee_id: number
      }

      return {
        ...state,
        attendees: {
          ...state.attendees,
          [payload.attendee_id]: {
            ...state.attendees[payload.attendee_id],
            receipts: [
              ...state.attendees[payload.attendee_id].receipts,
              payload.receipt,
            ],
          },
        },
      }
    case DELETE_RECEIPT_TO_ATTENDEE_SUCCESS:
      let metaResponse = action as unknown as {
        meta: {
          attendeeId: number
          receiptId: number
        }
      }
      let newReceipts = [
        ...state.attendees[metaResponse.meta.attendeeId].receipts,
      ]
      let indexOfReceipt = newReceipts.findIndex((file) => {
        return file.id === metaResponse.meta.receiptId
      })
      if (indexOfReceipt !== -1) {
        newReceipts.splice(indexOfReceipt, 1)
      }
      return {
        ...state,
        attendees: {
          ...state.attendees,
          [metaResponse.meta.attendeeId]: {
            ...state.attendees[metaResponse.meta.attendeeId],
            receipts: newReceipts,
          },
        },
      }

    case DELETE_PAGE_SUCCESS:
      const pageId = (action as unknown as {meta: {pageId: number}}).meta.pageId
      let websiteId = Object.values(state.websites).find((website) =>
        website?.page_ids.includes(pageId)
      )?.id
      let newPages = {...state.pages}
      delete newPages[pageId]
      return {
        ...state,
        websites: {
          ...state.websites,
          [websiteId!]: {
            ...state.websites[websiteId!]!,
            page_ids: [
              ...state.websites[websiteId!]!.page_ids.filter(
                (id) => id !== pageId
              ),
            ],
          },
        },
        pages: newPages,
      }
    case POST_RETREAT_ATTENDEES_BATCH_SUCCESS:
      retreatId = (action as unknown as {meta: {retreatId: number}}).meta
        .retreatId
      payload = (action as ApiAction).payload as RetreatAttendeesApiResponse
      let newState = {...state}
      if (payload) {
        newState.retreatAttendees = {
          ...state.retreatAttendees,
          [retreatId]: [
            ...(state.retreatAttendees[retreatId] !== undefined
              ? state.retreatAttendees[retreatId]!
              : []),
            ...payload.attendees.map((attendee) => attendee.id),
          ],
        }
        newState.attendees = {
          ...state.attendees,
          ...payload.attendees.reduce(
            (last: any, curr: RetreatAttendeeModel) => {
              return {...last, [curr.id]: curr}
            },
            {}
          ),
        }
      }
      return newState
    case GET_HOTEL_GROUP_SUCCESS:
      action = action as unknown as ApiAction
      payload = (action as unknown as ApiAction).payload as {
        group: HotelGroup
      }
      return {
        ...state,
        hotelGroups: {
          ...state.hotelGroups,
          [payload.group.id]: payload.group,
        },
      }
    case GET_PRESET_IMAGES_SUCCESS:
      let type = (action as unknown as {meta: {type: PresetImageType}}).meta
        .type
      payload = (action as ApiAction).payload as PresetImagesApiResponse
      let newPresetState = {...state}
      if (payload) {
        newPresetState = {
          ...newPresetState,
          presetImages: {[type]: payload.preset_images},
        }
      }
      return newPresetState
    case GET_USER_SUCCESS:
      payload = (action as unknown as ApiAction).payload as {
        user: UserModel
      }
      return {
        ...state,
        users: {
          ...state.users,
          [payload.user.id]: payload.user,
        },
      }
    case POST_USER_SUCCESS:
      payload = (action as unknown as ApiAction).payload as {
        user: UserModel
      }
      retreatId = (action as unknown as {meta: {retreatId: number}}).meta
        .retreatId

      let allRetreats = {...state.retreats}
      let currentRetreat = allRetreats[retreatId]
      if (currentRetreat !== "RESOURCE_NOT_FOUND") {
        currentRetreat.users = [...currentRetreat.users, payload.user.id]
      }
      return {
        ...state,
        users: {
          ...state.users,
          [payload.user.id]: payload.user,
        },
        retreats: {
          [retreatId]: currentRetreat,
        },
      }
    case DELETE_USER_SUCCESS:
      let userId = (
        action as unknown as {meta: {userId: number; retreatId: number}}
      ).meta.userId
      let updatedUser = {...state.users[userId]}
      let currentRetreatId = (
        action as unknown as {meta: {userId: number; retreatId: number}}
      ).meta.retreatId

      let indexOfRetreatId =
        updatedUser && updatedUser.retreat_ids
          ? updatedUser.retreat_ids.indexOf(currentRetreatId)
          : -1
      if (indexOfRetreatId !== -1 && updatedUser.retreat_ids) {
        updatedUser.retreat_ids.splice(indexOfRetreatId, 1)
      }
      let retreats = {...state.retreats}
      let updatedRetreat = retreats[currentRetreatId]
      if (updatedRetreat !== "RESOURCE_NOT_FOUND") {
        let indexOfUserId = updatedRetreat.users.indexOf(userId)
        if (indexOfUserId !== -1) {
          updatedRetreat.users.splice(indexOfUserId, 1)
        }
      }
      return {
        ...state,
        users: {
          ...state.users,
          [userId]: updatedUser as UserModel,
        },
        retreats: {
          ...state.retreats,
          [currentRetreatId]: updatedRetreat,
        },
      }

    case POST_RFP_SUCCESS:
    case GET_RFP_SUCCESS:
      payload = (action as ApiAction).payload as {
        request_for_proposal: RFPModel
      }
      let newRFPState = {...state}

      newRFPState.RFPs = {
        ...newRFPState.RFPs,
        [payload.request_for_proposal.id]: payload.request_for_proposal,
      }
      return newRFPState
    case POST_EMAIL_TEMPLATE_SUCCESS:
    case GET_EMAIL_TEMPLATE_SUCCESS:
    case PATCH_EMAIL_TEMPLATE_SUCCESS:
      payload = (action as ApiAction).payload as {
        email_template: EmailTemplateModel
      }
      return {
        ...state,
        emailTemplates: {
          ...state.emailTemplates,
          [payload.email_template.id]: payload.email_template,
        },
      }

    default:
      return state
  }
}
