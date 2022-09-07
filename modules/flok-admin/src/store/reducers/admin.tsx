import _ from "lodash"
import {Action} from "redux"
import {ApiError} from "redux-api-middleware"
import {
  AdminDestinationModel,
  AdminHotelDetailsModel,
  AdminHotelModel,
  AdminPastItineraryLocationModel,
  AdminPastItineraryModel,
  AdminRetreatAttendeeModel,
  AdminRetreatListModel,
  AdminRetreatListType,
  AdminRetreatModel,
  HotelGroup,
  LodgingTagModel,
  RetreatNoteModel,
  RetreatTask,
  RetreatToTask,
  RFPModel,
  User,
} from "../../models"
import {GooglePlace} from "../../utils"
import {
  ADD_GOOGLE_PLACE,
  ADD_RETREAT_TASKS_SUCCESS,
  DELETE_HOTEL_GROUP_SUCCESS,
  DELETE_HOTEL_SUCCESS,
  DELETE_RETREAT_ATTENDEES_SUCCESS,
  DELETE_RETREAT_HOTEL_PROPOSAL_SUCCESS,
  DELETE_SELECTED_HOTEL_SUCCESS,
  GET_DESTINATIONS_SUCCESS,
  GET_HOTELS_BY_DEST_SUCCESS,
  GET_HOTELS_BY_ID_SUCCESS,
  GET_HOTELS_FOR_DATAGRID_SUCCESS,
  GET_HOTELS_SEARCH_SUCCESS,
  GET_HOTEL_DETAILS_SUCCESS,
  GET_HOTEL_GROUP_SUCCESS,
  GET_LOCATIONS_SUCCESS,
  GET_LODGING_TAGS_SUCCESS,
  GET_LOGIN_TOKEN_SUCCESS,
  GET_PAST_ITINERARIES_SUCCESS,
  GET_RETREATS_LIST_SUCCESS,
  GET_RETREAT_ATTENDEES_SUCCESS,
  GET_RETREAT_DETAILS_FAILURE,
  GET_RETREAT_DETAILS_REQUEST,
  GET_RETREAT_DETAILS_SUCCESS,
  GET_RETREAT_NOTES_SUCCESS,
  GET_RETREAT_TASKS_SUCCESS,
  GET_RFP_SUCCESS,
  GET_TASKS_LIST_SUCCESS,
  GET_TASK_SUCCESS,
  GET_USERS_SUCCESS,
  PATCH_HOTEL_GROUP_SUCCESS,
  PATCH_HOTEL_SUCCESS,
  PATCH_PAST_ITINERARY_SUCCESS,
  PATCH_RETREAT_ATTENDEE_SUCCESS,
  PATCH_RETREAT_DETAILS_FAILURE,
  PATCH_RETREAT_DETAILS_REQUEST,
  PATCH_RETREAT_DETAILS_SUCCESS,
  PATCH_RETREAT_TASK_SUCCESS,
  PATCH_TASK_SUCCESS,
  PATCH_USER_SUCCESS,
  POST_DESTINATION_SUCCESS,
  POST_HOTEL_GROUP_SUCCESS,
  POST_HOTEL_SUCCESS,
  POST_HOTEL_TEMPLATE_PROPOSAL_SUCCESS,
  POST_LOCATION_SUCCESS,
  POST_PAST_ITINERARY_SUCCESS,
  POST_RETREAT_ATTENDEE_SUCCESS,
  POST_RETREAT_HOTEL_PROPOSAL_SUCCESS,
  POST_RETREAT_NOTES_SUCCESS,
  POST_SELECTED_HOTEL_SUCCESS,
  POST_USER_SUCCESS,
  PUT_HOTEL_TEMPLATE_PROPOSAL_SUCCESS,
  PUT_RETREAT_HOTEL_PROPOSAL_SUCCESS,
  PUT_SELECTED_HOTEL_SUCCESS,
} from "../actions/admin"
import {ApiAction} from "../actions/api"

export type ApiStatus = {
  loading?: boolean
  status?: number
}
export type AdminState = {
  retreatsList: {
    active: AdminRetreatListModel[]
    inactive: AdminRetreatListModel[]
    complete: AdminRetreatListModel[]
  }
  retreatsDetails: {
    [key: number]: AdminRetreatModel | undefined
  }
  hotels: {
    [key: number]: AdminHotelModel | undefined // for name, destination, id
  }
  hotelsDetails: {
    [key: number]: AdminHotelDetailsModel | undefined // for all hotel details
  }
  destinations: {
    [key: number]: AdminDestinationModel | undefined
  }
  allDestinations?: number[]
  hotelsByDestination: {[key: number]: number[]}
  hotelsBySearch: {
    [key: string]: {id: number; name: string; location: string}[] | undefined
  }
  api: {
    retreatsDetails: {
      [key: number]: ApiStatus | undefined
    }
  }
  attendeesByRetreat: {
    [id: number]: AdminRetreatAttendeeModel[]
  }
  notesByRetreat: {
    [key: number]: RetreatNoteModel[] | undefined
  }
  allUsers?: {[id: number]: User}
  tasksByRetreat: {
    [id: number]: RetreatToTask[] | undefined
  }
  usersByRetreat: {
    [id: number]: {[id: number]: User}
  }
  userLoginTokens: {
    [id: number]: string
  }
  tasks: {
    [id: number]: RetreatTask | undefined
  }
  past_itineraries: {
    [id: number]: AdminPastItineraryModel | undefined
  }
  past_itinerary_locations: {
    [id: number]: AdminPastItineraryLocationModel | undefined
  }
  lodgingTags: {
    [id: number]: LodgingTagModel
  }
  googlePlaces: {[place_id: string]: GooglePlace}
  hotelsDataGridHasNext: boolean
  RFPs: {
    [id: string]: RFPModel | undefined
  }
  hotelGroups: {
    [id: number]: HotelGroup | undefined
  }
}

const initialState: AdminState = {
  retreatsList: {
    active: [],
    inactive: [],
    complete: [],
  },
  retreatsDetails: {},
  destinations: {},
  hotelsByDestination: {},
  hotelsBySearch: {},
  hotels: {},
  hotelsDetails: {},
  api: {
    retreatsDetails: {},
  },
  attendeesByRetreat: {},
  notesByRetreat: {},
  tasksByRetreat: {},
  usersByRetreat: {},
  userLoginTokens: {},
  tasks: {},
  past_itineraries: {},
  past_itinerary_locations: {},
  lodgingTags: {},
  googlePlaces: {},
  hotelsDataGridHasNext: false,
  RFPs: {},
  hotelGroups: {},
}

export default function AdminReducer(
  state: AdminState = initialState,
  action: Action
): AdminState {
  var payload
  var meta
  var newState: AdminState
  switch (action.type) {
    case GET_RETREATS_LIST_SUCCESS:
      meta = (action as unknown as {meta: {state: AdminRetreatListType}}).meta
      payload = (action as unknown as ApiAction).payload as {
        retreats: AdminRetreatListModel[]
      }
      return {
        ...state,
        retreatsList: {...state.retreatsList, [meta.state]: payload.retreats},
      }
    case GET_RETREAT_DETAILS_REQUEST:
    case GET_RETREAT_DETAILS_SUCCESS:
    case GET_RETREAT_DETAILS_FAILURE:
    case PATCH_RETREAT_DETAILS_REQUEST:
    case PATCH_RETREAT_DETAILS_SUCCESS:
    case PATCH_RETREAT_DETAILS_FAILURE:
      meta = (action as unknown as {meta: {id: number}}).meta
      action = action as unknown as ApiAction
      payload = (action as unknown as ApiAction).payload as {
        retreat: AdminRetreatModel
      }
      if ((action.type as string).endsWith("SUCCESS")) {
        state = {
          ...state,
          retreatsDetails: {
            ...state.retreatsDetails,
            [meta.id]: payload.retreat,
          },
        }
      }
      return {
        ...state,
        api: {
          ...state.api,
          retreatsDetails: {
            ...state.api.retreatsDetails,
            [meta.id]: {
              loading: (action.type as string).endsWith("REQUEST")
                ? true
                : false,
              status: (action.type as string).endsWith("FAILURE")
                ? ((action as unknown as ApiAction).payload as ApiError).status
                : undefined,
            },
          },
        },
      }
    case GET_DESTINATIONS_SUCCESS:
      meta = (action as unknown as {meta: {id: number}}).meta
      action = action as unknown as ApiAction
      payload = (action as unknown as ApiAction).payload as {
        destinations: AdminDestinationModel[]
      }
      return {
        ...state,
        destinations: {
          ...state.destinations,
          ...payload.destinations.reduce(
            (last, curr) => ({...last, [curr.id]: curr}),
            {}
          ),
        },
        allDestinations: payload.destinations
          .sort((a, b) => (a.location > b.location ? 0 : 1))
          .map((dest) => dest.id),
      }
    case GET_HOTELS_BY_DEST_SUCCESS:
      meta = (action as unknown as {meta: {id: number}}).meta
      action = action as unknown as ApiAction
      payload = (action as unknown as ApiAction).payload as {
        hotels: AdminHotelModel[]
      }
      let hotelsByDestination: {[key: number]: number[]} = {}
      payload.hotels.forEach((hotel) => {
        if (hotelsByDestination[hotel.destination_id] == null) {
          hotelsByDestination[hotel.destination_id] = [hotel.id]
        } else {
          hotelsByDestination[hotel.destination_id].push(hotel.id)
        }
      })
      return {
        ...state,
        hotels: {
          ...state.hotels,
          ...payload.hotels.reduce(
            (last, curr) => ({...last, [curr.id]: curr}),
            {}
          ),
        },
        hotelsByDestination: {
          ...state.hotelsByDestination,
          ...hotelsByDestination,
        },
      }
    case GET_HOTELS_BY_ID_SUCCESS:
      meta = (action as unknown as {meta: {id: number}}).meta
      payload = (action as unknown as ApiAction).payload as {
        hotels: AdminHotelModel[]
      }
      return {
        ...state,
        hotels: {
          ...state.hotels,
          ...payload.hotels.reduce(
            (last, curr) => ({...last, [curr.id]: curr}),
            {}
          ),
        },
      }
    case GET_HOTEL_DETAILS_SUCCESS:
    case POST_HOTEL_TEMPLATE_PROPOSAL_SUCCESS:
    case PUT_HOTEL_TEMPLATE_PROPOSAL_SUCCESS:
    case PATCH_HOTEL_SUCCESS:
    case POST_HOTEL_SUCCESS:
      meta = (action as unknown as {meta: {id: number}}).meta
      payload = (action as unknown as ApiAction).payload as {
        hotel: AdminHotelDetailsModel
      }
      return {
        ...state,
        hotelsDetails: {
          ...state.hotelsDetails,
          [payload.hotel.id]: payload.hotel,
        },
      }
    case GET_HOTELS_FOR_DATAGRID_SUCCESS:
      meta = (action as unknown as {meta: {id: number}}).meta
      payload = (action as unknown as ApiAction).payload as {
        hotels: AdminHotelDetailsModel[]
        has_next: boolean
      }
      return {
        ...state,
        hotels: {
          ...state.hotels,
          ...payload.hotels.reduce(
            (last, curr) => ({...last, [curr.id]: curr}),
            {}
          ),
        },
        hotelsDataGridHasNext: payload.has_next,
      }
    case DELETE_HOTEL_SUCCESS:
      meta = (action as unknown as {meta: {hotelId: number}}).meta
      let newHotels = {...state.hotels}
      delete newHotels[meta.hotelId]
      return {
        ...state,
        hotels: newHotels,
      }

    case POST_SELECTED_HOTEL_SUCCESS:
    case PUT_SELECTED_HOTEL_SUCCESS:
    case DELETE_SELECTED_HOTEL_SUCCESS:
    case POST_RETREAT_HOTEL_PROPOSAL_SUCCESS:
    case PUT_RETREAT_HOTEL_PROPOSAL_SUCCESS:
    case DELETE_RETREAT_HOTEL_PROPOSAL_SUCCESS:
      action = action as unknown as ApiAction
      payload = (action as unknown as ApiAction).payload as {
        retreat: AdminRetreatModel
      }
      return {
        ...state,
        retreatsDetails: {
          ...state.retreatsDetails,
          [payload.retreat.id]: payload.retreat,
        },
      }
    case POST_RETREAT_ATTENDEE_SUCCESS:
    case PATCH_RETREAT_ATTENDEE_SUCCESS:
    case DELETE_RETREAT_ATTENDEES_SUCCESS:
    case GET_RETREAT_ATTENDEES_SUCCESS:
      meta = (action as unknown as {meta: {retreatId: number}}).meta
      payload = (action as unknown as ApiAction).payload as {
        attendees: AdminRetreatAttendeeModel[]
      }
      return {
        ...state,
        attendeesByRetreat: {
          ...state.attendeesByRetreat,
          [meta.retreatId]: payload.attendees,
        },
      }
    case GET_RETREAT_NOTES_SUCCESS:
    case POST_RETREAT_NOTES_SUCCESS:
      meta = (action as unknown as {meta: {retreatId: number}}).meta
      payload = (action as unknown as ApiAction).payload as {
        notes: RetreatNoteModel[]
      }
      return {
        ...state,
        notesByRetreat: {
          ...state.notesByRetreat,
          [meta.retreatId]: payload.notes,
        },
      }
    case ADD_RETREAT_TASKS_SUCCESS:
    case GET_RETREAT_TASKS_SUCCESS:
    case PATCH_RETREAT_TASK_SUCCESS:
      meta = (action as unknown as {meta: {retreatId: number}}).meta
      payload = (action as unknown as ApiAction).payload as {
        tasks: RetreatToTask[]
      }
      return {
        ...state,
        tasksByRetreat: {
          ...state.tasksByRetreat,
          [meta.retreatId]: payload.tasks,
        },
      }
    case GET_HOTELS_SEARCH_SUCCESS:
      let searchStr = (action as unknown as {meta: {search: string}}).meta
        .search
      payload = (action as unknown as ApiAction).payload as {
        hotels: {id: number; name: string; location: string}[]
      }
      return {
        ...state,
        hotelsBySearch: {
          ...state.hotelsBySearch,
          [searchStr]: payload.hotels,
        },
      }
    case GET_USERS_SUCCESS:
      meta = (action as unknown as {meta: {retreatId: number}}).meta
      payload = (action as unknown as ApiAction).payload as {
        users: User[]
      }
      newState = {...state} as AdminState
      if (meta.retreatId !== undefined) {
        newState.usersByRetreat[meta.retreatId] = _.keyBy(
          payload.users,
          (u) => u.id
        )
      } else {
        newState.allUsers = _.keyBy(payload.users, (u) => u.id)
      }
      return newState
    case POST_USER_SUCCESS:
    case PATCH_USER_SUCCESS:
      let thisPayload = (action as unknown as ApiAction).payload as {
        user: User
        login_token?: string
      }
      newState = {
        ...state,
        allUsers: {...state.allUsers, [thisPayload.user.id]: thisPayload.user},
      } as AdminState
      thisPayload.user.retreat_ids.forEach((id) => {
        newState.usersByRetreat[id] = {
          ...newState.usersByRetreat[id],
          [thisPayload.user.id]: thisPayload.user,
        }
      })
      if (thisPayload.login_token) {
        newState.userLoginTokens = {
          ...newState.userLoginTokens,
          [thisPayload.user.id]: thisPayload.login_token,
        }
      }
      return newState
    case GET_LOGIN_TOKEN_SUCCESS:
      payload = (action as unknown as ApiAction).payload as {
        login_token: string
      }
      meta = (action as unknown as {meta: {userId: number}}).meta
      return {
        ...state,
        userLoginTokens: {
          ...state.userLoginTokens,
          [meta.userId]: payload.login_token,
        },
      }
    case GET_TASKS_LIST_SUCCESS:
      payload = (action as unknown as ApiAction).payload as {
        tasks: RetreatTask[]
      }
      return {
        ...state,
        tasks: {
          ...state.tasks,
          ...payload.tasks.reduce(
            (last, curr) => ({...last, [curr.id]: curr}),
            {}
          ),
        },
      }
    case PATCH_TASK_SUCCESS:
    case GET_TASK_SUCCESS:
      payload = (action as unknown as ApiAction).payload as {task: RetreatTask}
      meta = (action as unknown as {meta: {taskId: number}}).meta
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [payload.task.id]: payload.task,
        },
      }
    case POST_DESTINATION_SUCCESS:
      action = action as unknown as ApiAction
      payload = (action as unknown as ApiAction).payload as {
        destination: AdminDestinationModel
      }

      let allDestinationsArray = Object.values(state.destinations).filter(
        (destination) => destination !== undefined
      ) as AdminDestinationModel[]
      return {
        ...state,
        destinations: {
          ...state.destinations,
          [payload.destination.id]: payload.destination,
        },
        allDestinations: allDestinationsArray
          .sort((a, b) => (a.location > b.location ? 0 : 1))
          .map((dest) => dest.id),
      }
    case GET_PAST_ITINERARIES_SUCCESS:
      action = action as unknown as ApiAction
      payload = (action as unknown as ApiAction).payload as {
        past_itineraries: AdminPastItineraryModel[]
      }
      return {
        ...state,
        past_itineraries: {
          ...state.past_itineraries,
          ...payload.past_itineraries.reduce(
            (last, curr) => ({...last, [curr.id]: curr}),
            {}
          ),
        },
      }
    case POST_LOCATION_SUCCESS:
      action = action as unknown as ApiAction
      payload = (action as unknown as ApiAction).payload as {
        past_itinerary_location: AdminPastItineraryLocationModel
      }
      return {
        ...state,
        past_itinerary_locations: {
          ...state.past_itinerary_locations,
          [payload.past_itinerary_location.id]: payload.past_itinerary_location,
        },
      }
    case GET_LOCATIONS_SUCCESS:
      action = action as unknown as ApiAction
      payload = (action as unknown as ApiAction).payload as {
        past_itinerary_locations: AdminPastItineraryLocationModel[]
      }
      return {
        ...state,
        past_itinerary_locations: {
          ...state.past_itinerary_locations,
          ...payload.past_itinerary_locations.reduce(
            (last, curr) => ({...last, [curr.id]: curr}),
            {}
          ),
        },
      }
    case POST_PAST_ITINERARY_SUCCESS:
    case PATCH_PAST_ITINERARY_SUCCESS:
      action = action as unknown as ApiAction
      payload = (action as unknown as ApiAction).payload as {
        past_itinerary: AdminPastItineraryModel
      }
      return {
        ...state,
        past_itineraries: {
          ...state.past_itineraries,
          [payload.past_itinerary.id]: payload.past_itinerary,
        },
      }
    case GET_LODGING_TAGS_SUCCESS:
      let lodgingTags = (
        (action as ApiAction).payload as {lodging_tags: LodgingTagModel[]}
      ).lodging_tags
      let newTags = lodgingTags.reduce((last: any, curr: LodgingTagModel) => {
        return {...last, [curr.id]: curr}
      }, {})
      return {
        ...state,
        lodgingTags: {
          ...state.lodgingTags,
          ...newTags,
        },
      }
    case ADD_GOOGLE_PLACE:
      let newPlace = action as GooglePlace
      return {
        ...state,
        googlePlaces: {
          ...state.googlePlaces,
          [newPlace.place_id]: newPlace,
        },
      }
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
    case POST_HOTEL_GROUP_SUCCESS:
    case GET_HOTEL_GROUP_SUCCESS:
    case PATCH_HOTEL_GROUP_SUCCESS:
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
    case DELETE_HOTEL_GROUP_SUCCESS:
      meta = (action as unknown as {meta: {groupId: number}}).meta
      let newHotelGroups = {...state.hotelGroups}
      delete newHotelGroups[meta.groupId]
      return {
        ...state,
        hotelGroups: newHotelGroups,
      }
    default:
      return state
  }
}
