import {ThunkDispatch} from "redux-thunk"
import {RootState} from ".."
import {
  AttendeeLandingWebsiteBlockModel,
  AttendeeLandingWebsiteModel,
  AttendeeLandingWebsitePageModel,
  RetreatAttendeeModel,
  RetreatModel,
  RetreatToTaskState,
  RetreatTravelModel,
  RetreatTripModel,
} from "../../models/retreat"
import {closeSnackbar, enqueueSnackbar} from "../../notistack-lib/actions"
import {apiNotification} from "../../notistack-lib/utils"
import {ApiAction, createApiAction} from "./api"

export const POST_NEW_RETREAT_REQUEST = "POST_NEW_RETREAT_REQUEST"
export const POST_NEW_RETREAT_SUCCESS = "POST_NEW_RETREAT_SUCCESS"
export const POST_NEW_RETREAT_FAILURE = "POST_NEW_RETREAT_FAILURE"

export function postNewRetreat(
  name: string,
  email: string,
  companyName: string,
  onSuccess: (guid: string) => void = () => undefined
) {
  let endpoint = "/v1.0/retreats"
  return async (
    dispatch: ThunkDispatch<any, any, any>,
    getState: () => RootState
  ) => {
    let apiResponse = (await dispatch(
      createApiAction({
        endpoint,
        method: "POST",
        types: [
          POST_NEW_RETREAT_REQUEST,
          POST_NEW_RETREAT_SUCCESS,
          POST_NEW_RETREAT_FAILURE,
        ],
        body: JSON.stringify({
          name,
          email,
          company_name: companyName,
        }),
      })
    )) as unknown as ApiAction
    if (!apiResponse.error) {
      let guid = apiResponse.payload.retreat?.guid
      if (guid) {
        onSuccess(guid)
      }
    } else {
      dispatch(
        enqueueSnackbar(
          apiNotification(
            "An error occurred, try again.",
            (key) => dispatch(closeSnackbar(key)),
            true
          )
        )
      )
    }
  }
}

export const GET_RETREAT_BY_GUID_REQUEST = "GET_RETREAT_BY_GUID_REQUEST"
export const GET_RETREAT_BY_GUID_SUCCESS = "GET_RETREAT_BY_GUID_SUCCESS"
export const GET_RETREAT_BY_GUID_FAILURE = "GET_RETREAT_BY_GUID_FAILURE"

export function getRetreatByGuid(retreatGuid: string) {
  let endpoint = `/v1.0/retreats-by-guid/${retreatGuid}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      GET_RETREAT_BY_GUID_REQUEST,
      {type: GET_RETREAT_BY_GUID_SUCCESS, meta: {retreatGuid}},
      {type: GET_RETREAT_BY_GUID_FAILURE, meta: {retreatGuid}},
    ],
  })
}

export const GET_RETREAT_REQUEST = "GET_RETREAT_REQUEST"
export const GET_RETREAT_SUCCESS = "GET_RETREAT_SUCCESS"
export const GET_RETREAT_FAILURE = "GET_RETREAT_FAILURE"

export function getRetreat(retreatId: number) {
  let endpoint = `/v1.0/retreats/${retreatId}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      GET_RETREAT_REQUEST,
      {type: GET_RETREAT_SUCCESS, meta: {retreatId}},
      {type: GET_RETREAT_FAILURE, meta: {retreatId}},
    ],
  })
}

export const PUT_RETREAT_PREFERENCES_REQUEST = "PUT_RETREAT_PREFERENCES_REQUEST"
export const PUT_RETREAT_PREFERENCES_SUCCESS = "PUT_RETREAT_PREFERENCES_SUCCESS"
export const PUT_RETREAT_PREFERENCES_FAILURE = "PUT_RETREAT_PREFERENCES_FAILURE"

/** This is a special controller that updates retreat preferences by GUID */
export function updateRetreatPreferences(
  retreatId: number,
  isFlexDates: boolean,
  numAttendeesLower: number,
  numAttendeesUpper?: number,
  flexNumNights?: number,
  flexMonths: string[] = [],
  flexStartDow: string[] = [],
  exactStartDate?: Date,
  exactEndDate?: Date,
  onSuccess: () => void = () => undefined
) {
  let endpoint = `/v1.0/retreats/${retreatId}/preferences`
  let toDate = (dt?: Date) =>
    dt
      ? dt.toISOString().substring(0, dt.toISOString().indexOf("T"))
      : undefined

  return createApiAction(
    {
      endpoint,
      method: "PUT",
      types: [
        PUT_RETREAT_PREFERENCES_REQUEST,
        {type: PUT_RETREAT_PREFERENCES_SUCCESS, meta: {retreatId}},
        PUT_RETREAT_PREFERENCES_FAILURE,
      ],
      body: JSON.stringify({
        num_attendees_lower: numAttendeesLower,
        num_attendees_upper: numAttendeesUpper,
        is_flexible_dates: isFlexDates,
        flexible_num_nights: flexNumNights,
        flexible_months: flexMonths,
        flexible_start_dow: flexStartDow,
        exact_start_date: toDate(exactStartDate),
        exact_end_date: toDate(exactEndDate),
      }),
    },
    {onSuccess, errorMessage: "Something went wrong."}
  )
}

export const GET_RETREAT_ATTENDEES_REQUEST = "GET_RETREAT_ATTENDEES_REQUEST"
export const GET_RETREAT_ATTENDEES_SUCCESS = "GET_RETREAT_ATTENDEES_SUCCESS"
export const GET_RETREAT_ATTENDEES_FAILURE = "GET_RETREAT_ATTENDEES_FAILURE"

export function getRetreatAttendees(retreatId: number) {
  let endpoint = `/v1.0/retreats/${retreatId}/attendees`
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

export const GET_TRIP_REQUEST = "GET_TRIP_REQUEST"
export const GET_TRIP_SUCCESS = "GET_TRIP_SUCCESS"
export const GET_TRIP_FAILURE = "GET_TRIP_FAILURE"
export function getTrip(tripId: number) {
  let endpoint = `/v1.0/trips/${tripId}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_TRIP_REQUEST},
      {type: GET_TRIP_SUCCESS, meta: {tripId}},
      {type: GET_TRIP_FAILURE, meta: {tripId}},
    ],
  })
}

export const GET_TRIPS_REQUEST = "GET_TRIPS_REQUEST"
export const GET_TRIPS_SUCCESS = "GET_TRIPS_SUCCESS"
export const GET_TRIPS_FAILURE = "GET_TRIPS_FAILURE"
export function getTrips(tripIds: number[]) {
  if (tripIds.length > 50) {
    tripIds = tripIds.slice(0, 50)
  }
  let endpoint = `/v1.0/trips?${new URLSearchParams(
    tripIds.map((id) => ["id", id.toString()])
  )}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_TRIPS_REQUEST},
      {type: GET_TRIPS_SUCCESS},
      {type: GET_TRIPS_FAILURE},
    ],
  })
}

export const GET_ATTENDEE_REQUEST = "GET_ATTENDEE_REQUEST"
export const GET_ATTENDEE_SUCCESS = "GET_ATTENDEE_SUCCESS"
export const GET_ATTENDEE_FAILURE = "GET_ATTENDEE_FAILURE"
export function getAttendee(attendeeId: number) {
  let endpoint = `/v1.0/attendees/${attendeeId}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_ATTENDEE_REQUEST},
      {type: GET_ATTENDEE_SUCCESS, meta: {attendeeId}},
      {type: GET_ATTENDEE_FAILURE, meta: {attendeeId}},
    ],
  })
}

export const INSTANTIATE_ATTENDEE_TRIPS_REQUEST =
  "INSTANTIATE_ATTENDEE_TRIPS_REQUEST"
export const INSTANTIATE_ATTENDEE_TRIPS_SUCCESS =
  "INSTANTIATE_ATTENDEE_TRIPS_SUCCESS"
export const INSTANTIATE_ATTENDEE_TRIPS_FAILURE =
  "INSTANTIATE_ATTENDEE_TRIPS_FAILURE"
export function instantiateAttendeeTrips(attendeeId: number) {
  let endpoint = `/v1.0/attendees/${attendeeId}/travel/instantiate`
  return createApiAction({
    method: "POST",
    endpoint,
    types: [
      {type: INSTANTIATE_ATTENDEE_TRIPS_REQUEST},
      {type: INSTANTIATE_ATTENDEE_TRIPS_SUCCESS, meta: {attendeeId}},
      {type: INSTANTIATE_ATTENDEE_TRIPS_FAILURE, meta: {attendeeId}},
    ],
  })
}

export const PATCH_ATTENDEE_REQUEST = "PATCH_ATTENDEE_REQUEST"
export const PATCH_ATTENDEE_SUCCESS = "PATCH_ATTENDEE_SUCCESS"
export const PATCH_ATTENDEE_FAILURE = "PATCH_ATTENDEE_FAILURE"
export function patchAttendee(
  attendeeId: number,
  values: Partial<RetreatAttendeeModel>
) {
  let endpoint = `/v1.0/attendees/${attendeeId}`
  if (values.hotel_check_in === "") {
    values.hotel_check_in = null
  }
  if (values.hotel_check_out === "") {
    values.hotel_check_out = null
  }
  return createApiAction(
    {
      method: "PATCH",
      endpoint,
      body: JSON.stringify(values),
      types: [
        {type: PATCH_ATTENDEE_REQUEST},
        {type: PATCH_ATTENDEE_SUCCESS, meta: {attendeeId}},
        {type: PATCH_ATTENDEE_FAILURE, meta: {attendeeId}},
      ],
    },
    {errorMessage: "Something went wrong"}
  )
}

export const PATCH_TRIP_REQUEST = "PATCH_TRIP_REQUEST"
export const PATCH_TRIP_SUCCESS = "PATCH_TRIP_SUCCESS"
export const PATCH_TRIP_FAILURE = "PATCH_TRIP_FAILURE"
export function patchTrip(tripId: number, values: Partial<RetreatTripModel>) {
  let endpoint = `/v1.0/trips/${tripId}`
  return createApiAction(
    {
      method: "PATCH",
      endpoint,
      body: JSON.stringify(values),
      types: [
        {type: PATCH_TRIP_REQUEST},
        {type: PATCH_TRIP_SUCCESS, meta: {tripId}},
        {type: PATCH_TRIP_FAILURE, meta: {tripId}},
      ],
    },
    {
      successMessage: "Successfully updated",
      errorMessage: "Something went wrong",
    }
  )
}

export const PATCH_ATTENDEE_TRAVEL_REQUEST = "PATCH_ATTENDEE_TRAVEL_REQUEST"
export const PATCH_ATTENDEE_TRAVEL_SUCCESS = "PATCH_ATTENDEE_TRAVEL_SUCCESS"
export const PATCH_ATTENDEE_TRAVEL_FAILURE = "PATCH_ATTENDEE_TRAVEL_FAILURE"
export function patchAttendeeTravel(
  attendeeId: number,
  values: Partial<RetreatTravelModel>
) {
  let endpoint = `/v1.0/attendees/${attendeeId}/travel`
  return createApiAction({
    method: "PATCH",
    endpoint,
    body: JSON.stringify(values),
    types: [
      {type: PATCH_ATTENDEE_TRAVEL_REQUEST},
      {type: PATCH_ATTENDEE_TRAVEL_SUCCESS, meta: {attendeeId}},
      {type: PATCH_ATTENDEE_TRAVEL_FAILURE, meta: {attendeeId}},
    ],
  })
}

export const POST_RETREAT_ATTENDEES_REQUEST = "POST_RETREAT_ATTENDEES_REQUEST"
export const POST_RETREAT_ATTENDEES_SUCCESS = "POST_RETREAT_ATTENDEES_SUCCESS"
export const POST_RETREAT_ATTENDEES_FAILURE = "POST_RETREAT_ATTENDEES_FAILURE"
export function postRetreatAttendees(
  retreatId: number,
  first_name: string,
  last_name: string,
  email_address: string
) {
  let endpoint = `/v1.0/retreats/${retreatId}/attendees`
  return createApiAction({
    method: "POST",
    endpoint,
    body: JSON.stringify({first_name, last_name, email_address}),
    types: [
      {
        type: POST_RETREAT_ATTENDEES_REQUEST,
      },
      {
        type: POST_RETREAT_ATTENDEES_SUCCESS,
        meta: {retreatId},
      },
      {
        type: POST_RETREAT_ATTENDEES_FAILURE,
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
  let endpoint = `/v1.0/retreats/${retreatId}/attendees/${attendeeId}`
  return createApiAction({
    method: "DELETE",
    endpoint,
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

export const PUT_RETREAT_TASK_REQUEST = "POST_RETREAT_TASK_REQUEST"
export const PUT_RETREAT_TASK_SUCCESS = "POST_RETREAT_TASK_SUCCESS"
export const PUT_RETREAT_TASK_FAILURE = "POST_RETREAT_TASK_FAILURE"
export function putRetreatTask(
  task_id: number,
  retreatId: number,
  new_state: RetreatToTaskState
) {
  let endpoint = `/v1.0/retreats/${retreatId}/tasks/${task_id}`
  return createApiAction(
    {
      method: "PUT",
      endpoint,
      body: JSON.stringify({new_state}),
      types: [
        {
          type: PUT_RETREAT_TASK_REQUEST,
          meta: {retreatId},
        },
        {
          type: PUT_RETREAT_TASK_SUCCESS,
          meta: {retreatId},
        },
        {
          type: PUT_RETREAT_TASK_FAILURE,
          meta: {retreatId},
        },
      ],
    },
    {
      errorMessage: "Oops, something went wrong.",
    }
  )
}

export const GET_WEBSITE_REQUEST = "GET_WEBSITE_REQUEST"
export const GET_WEBSITE_SUCCESS = "GET_WEBSITE_SUCCESS"
export const GET_WEBSITE_FAILURE = "GET_WEBSITE_FAILURE"
export function getWebsite(websiteId: number) {
  let endpoint = `/v1.0/websites/${websiteId}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_WEBSITE_REQUEST},
      {type: GET_WEBSITE_SUCCESS, meta: {websiteId}},
      {type: GET_WEBSITE_FAILURE, meta: {websiteId}},
    ],
  })
}
export function getWebsiteByName(websiteName: string) {
  let endpoint = `/v1.0/websites/name/${websiteName}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_WEBSITE_REQUEST},
      {type: GET_WEBSITE_SUCCESS, meta: {websiteName}},
      {type: GET_WEBSITE_FAILURE, meta: {websiteName}},
    ],
  })
}
export const GET_PAGE_REQUEST = "GET_PAGE_REQUEST"
export const GET_PAGE_SUCCESS = "GET_PAGE_SUCCESS"
export const GET_PAGE_FAILURE = "GET_PAGE_FAILURE"
export function getPage(pageId: number) {
  let endpoint = `/v1.0/website-pages/${pageId}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_PAGE_REQUEST},
      {type: GET_PAGE_SUCCESS, meta: {pageId}},
      {type: GET_PAGE_FAILURE, meta: {pageId}},
    ],
  })
}

export function getPageByName(websiteId: number, pageName: string) {
  let endpoint = `/v1.0/websites/${websiteId}/website-pages/name/${pageName}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_PAGE_REQUEST},
      {type: GET_PAGE_SUCCESS, meta: {pageName}},
      {type: GET_PAGE_FAILURE, meta: {pageName}},
    ],
  })
}

export const GET_BLOCK_REQUEST = "GET_BLOCK_REQUEST"
export const GET_BLOCK_SUCCESS = "GET_BLOCK_SUCCESS"
export const GET_BLOCK_FAILURE = "GET_BLOCK_FAILURE"
export function getBlock(blockId: number) {
  let endpoint = `/v1.0/website-page-blocks/${blockId}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_BLOCK_REQUEST},
      {type: GET_BLOCK_SUCCESS, meta: {blockId}},
      {type: GET_BLOCK_FAILURE, meta: {blockId}},
    ],
  })
}

export const PATCH_BLOCK_REQUEST = "PATCH_BLOCK_REQUEST"
export const PATCH_BLOCK_SUCCESS = "PATCH_BLOCK_SUCCESS"
export const PATCH_BLOCK_FAILURE = "PATCH_BLOCK_FAILURE"
export function patchBlock(
  blockId: number,
  values: Partial<AttendeeLandingWebsiteBlockModel>
) {
  let endpoint = `/v1.0/website-page-blocks/${blockId}`
  return createApiAction({
    method: "PATCH",
    endpoint,
    body: JSON.stringify(values),
    types: [
      {type: PATCH_BLOCK_REQUEST},
      {type: PATCH_BLOCK_SUCCESS, meta: {blockId}},
      {type: PATCH_BLOCK_FAILURE, meta: {blockId}},
    ],
  })
}
export const POST_BLOCK_REQUEST = "POST_BLOCK_REQUEST"
export const POST_BLOCK_SUCCESS = "POST_BLOCK_SUCCESS"
export const POST_BLOCK_FAILURE = "POST_BLOCK_FAILURE"
export function postBlock(values: Partial<AttendeeLandingWebsiteBlockModel>) {
  let endpoint = `/v1.0/website-page-blocks`
  return createApiAction({
    method: "POST",
    endpoint,
    body: JSON.stringify(values),
    types: [
      {type: POST_BLOCK_REQUEST},
      {type: POST_BLOCK_SUCCESS},
      {type: POST_BLOCK_FAILURE},
    ],
  })
}

export const POST_PAGE_REQUEST = "POST_PAGE_REQUEST"
export const POST_PAGE_SUCCESS = "POST_PAGE_SUCCESS"
export const POST_PAGE_FAILURE = "POST_PAGE_FAILURE"
export function postPage(values: Partial<AttendeeLandingWebsitePageModel>) {
  let endpoint = `/v1.0/website-pages`
  return createApiAction(
    {
      method: "POST",
      endpoint,
      body: JSON.stringify(values),
      types: [
        {type: POST_PAGE_REQUEST},
        {type: POST_PAGE_SUCCESS},
        {type: POST_PAGE_FAILURE},
      ],
    },
    {
      successMessage: "Successfully added page",
      errorMessage: "Something went wrong.",
    }
  )
}
export const PATCH_PAGE_REQUEST = "PATCH_PAGE_REQUEST"
export const PATCH_PAGE_SUCCESS = "PATCH_PAGE_SUCCESS"
export const PATCH_PAGE_FAILURE = "PATCH_PAGE_FAILURE"
export function patchPage(
  pageId: number,
  values: Partial<AttendeeLandingWebsitePageModel>
) {
  let endpoint = `/v1.0/website-pages/${pageId}`
  return createApiAction(
    {
      method: "PATCH",
      endpoint,
      body: JSON.stringify(values),
      types: [
        {type: PATCH_PAGE_REQUEST},
        {type: PATCH_PAGE_SUCCESS, meta: {pageId}},
        {type: PATCH_PAGE_FAILURE, meta: {pageId}},
      ],
    },
    {errorMessage: "Something went wrong"}
  )
}
export const DELETE_PAGE_REQUEST = "DELETE_PAGE_REQUEST"
export const DELETE_PAGE_SUCCESS = "DELETE_PAGE_SUCCESS"
export const DELETE_PAGE_FAILURE = "DELETE_PAGE_FAILURE"
export function deletePage(pageId: number) {
  let endpoint = `/v1.0/website-pages/${pageId}`
  return createApiAction(
    {
      method: "DELETE",
      endpoint,
      types: [
        {type: DELETE_PAGE_REQUEST},
        {type: DELETE_PAGE_SUCCESS, meta: {pageId}},
        {type: DELETE_PAGE_FAILURE, meta: {pageId}},
      ],
    },
    {errorMessage: "Something went wrong"}
  )
}

export const PATCH_WEBSITE_REQUEST = "PATCH_WEBSITE_REQUEST"
export const PATCH_WEBSITE_SUCCESS = "PATCH_WEBSITE_SUCCESS"
export const PATCH_WEBSITE_FAILURE = "PATCH_WEBSITE_FAILURE"
export function patchWebsite(
  websiteId: number,
  values: Partial<AttendeeLandingWebsiteModel>
) {
  let endpoint = `/v1.0/websites/${websiteId}`
  return createApiAction(
    {
      method: "PATCH",
      endpoint,
      body: JSON.stringify(values, (key, value) =>
        typeof value === "undefined" ? null : value
      ),
      types: [
        {type: PATCH_WEBSITE_REQUEST},
        {type: PATCH_WEBSITE_SUCCESS, meta: {websiteId}},
        {type: PATCH_WEBSITE_FAILURE, meta: {websiteId}},
      ],
    },
    {
      successMessage: "Succesfully updated website",
      errorMessage: "Something went wrong",
    }
  )
}

export const POST_INITIAL_WEBSITE_REQUEST = "POST_INITIAL_WEBSITE_REQUEST"
export const POST_INITIAL_WEBSITE_SUCCESS = "POST_INITIAL_WEBSITE_SUCCESS"
export const POST_INITIAL_WEBSITE_FAILURE = "POST_INITIAL_WEBSITE_FAILURE"
export function postInitialWebsite(
  values: Partial<AttendeeLandingWebsiteModel>
) {
  let endpoint = `/v1.0/websites/initialize`
  return createApiAction(
    {
      method: "POST",
      endpoint,
      body: JSON.stringify(values),
      types: [
        {type: POST_INITIAL_WEBSITE_REQUEST},
        {type: POST_INITIAL_WEBSITE_SUCCESS},
        {type: POST_INITIAL_WEBSITE_FAILURE},
      ],
    },
    {
      errorMessage: "Something went wrong",
    }
  )
}

export const POST_RETREAT_ATTENDEES_BATCH_REQUEST =
  "POST_RETREAT_ATTENDEES_BATCH_REQUEST"
export const POST_RETREAT_ATTENDEES_BATCH_SUCCESS =
  "POST_RETREAT_ATTENDEES_BATCH_SUCCESS"
export const POST_RETREAT_ATTENDEES_BATCH_FAILURE =
  "POST_RETREAT_ATTENDEES_BATCH_FAILURE"
export function postRetreatAttendeesBatch(
  values: {
    attendees: Partial<RetreatAttendeeModel>[]
  },
  retreatId: number
) {
  let endpoint = `/v1.0/attendees/batch`
  return createApiAction(
    {
      method: "POST",
      endpoint,
      body: JSON.stringify(values),
      types: [
        {
          type: POST_RETREAT_ATTENDEES_BATCH_REQUEST,
        },
        {
          type: POST_RETREAT_ATTENDEES_BATCH_SUCCESS,
          meta: {retreatId},
        },
        {
          type: POST_RETREAT_ATTENDEES_BATCH_FAILURE,
          meta: {retreatId},
        },
      ],
    },
    {
      errorMessage: "Something went wrong.",
    }
  )
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

export const PATCH_RETREAT_REQUEST = "PATCH_RETREAT_REQUEST"
export const PATCH_RETREAT_SUCCESS = "PATCH_RETREAT_SUCCESS"
export const PATCH_RETREAT_FAILURE = "PATCH_RETREAT_FAILURE"
export function patchRetreat(
  retreatId: number,
  values: Partial<
    Pick<
      RetreatModel,
      | "budget_link"
      | "itinerary_final_draft_link"
      | "lodging_final_end_date"
      | "lodging_final_start_date"
      | "lodging_final_hotel_id"
      | "lodging_final_destination"
      | "lodging_final_contract_url"
      | "retreat_name"
      | "attendees_registration_form_id"
    >
  >
) {
  let endpoint = `/v1.0/retreats/${retreatId}`
  return createApiAction(
    {
      method: "PATCH",
      endpoint,
      body: JSON.stringify(values, (key, value) =>
        typeof value === "undefined" ? null : value
      ),
      types: [
        {type: PATCH_RETREAT_REQUEST},
        {type: PATCH_RETREAT_SUCCESS, meta: {retreatId: retreatId}},
        {type: PATCH_RETREAT_FAILURE, meta: {retreatId: retreatId}},
      ],
    },
    {
      successMessage: "Successfully updated retreat",
      errorMessage: "Something went wrong",
    }
  )
}

export const GET_WEBSITE_BY_ATTENDEE_REQUEST = "GET_WEBSITE_BY_ATTENDEE_REQUEST"
export const GET_WEBSITE_BY_ATTENDEE_SUCCESS = "GET_WEBSITE_BY_ATTENDEE_SUCCESS"
export const GET_WEBSITE_BY_ATTENDEE_FAILURE = "GET_WEBSITE_BY_ATTENDEE_FAILURE"
export function getWebsiteByAttendee(attendeeId: number) {
  let endpoint = `/v1.0/attendees/${attendeeId}/website`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_WEBSITE_BY_ATTENDEE_REQUEST},
      {type: GET_WEBSITE_BY_ATTENDEE_SUCCESS, meta: {attendeeId}},
      {type: GET_WEBSITE_BY_ATTENDEE_FAILURE, meta: {attendeeId}},
    ],
  })
}

export const GET_PRESET_IMAGES_REQUEST = "GET_PRESET_IMAGES_REQUEST"
export const GET_PRESET_IMAGES_SUCCESS = "GET_PRESET_IMAGES_SUCCESS"
export const GET_PRESET_IMAGES_FAILURE = "GET_PRESET_IMAGES_FAILURE"
export function getPresetImages(type: string) {
  let endpoint = `/v1.0/preset-images?type=${type}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_PRESET_IMAGES_REQUEST},
      {type: GET_PRESET_IMAGES_SUCCESS, meta: {type}},
      {type: GET_PRESET_IMAGES_FAILURE, meta: {type}},
    ],
  })
}

export const POST_REGISTRATION_LIVE_REQUEST = "POST_REGISTRATION_LIVE_REQUEST"
export const POST_REGISTRATION_LIVE_SUCCESS = "POST_REGISTRATION_LIVE_SUCCESS"
export const POST_REGISTRATION_LIVE_FAILURE = "POST_REGISTRATION_LIVE_FAILURE"
export function postRegistrationLive(retreatId: number) {
  let endpoint = `/v1.0/retreats/${retreatId}/go-live`
  return createApiAction(
    {
      method: "POST",
      endpoint,
      types: [
        {type: POST_REGISTRATION_LIVE_REQUEST},
        {type: POST_REGISTRATION_LIVE_SUCCESS, meta: {retreatId}},
        {type: POST_REGISTRATION_LIVE_FAILURE, meta: {retreatId}},
      ],
    },
    {
      successMessage: "Website is now live",
      errorMessage: "Something went wrong",
    }
  )
}

export const GET_MY_ATTENDEE_REQUEST = "GET_MY_ATTENDEE_REQUEST"
export const GET_MY_ATTENDEE_SUCCESS = "GET_MY_ATTENDEE_SUCCESS"
export const GET_MY_ATTENDEE_FAILURE = "GET_MY_ATTENDEE_FAILURE"
export function getMyAttendee(retreatId: number) {
  let endpoint = `/v1.0/my-attendee?${new URLSearchParams({
    retreat_id: retreatId.toString(),
  })}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_MY_ATTENDEE_REQUEST},
      {type: GET_MY_ATTENDEE_SUCCESS},
      {type: GET_MY_ATTENDEE_FAILURE},
    ],
  })
}

export const POST_ATTENDEE_REG_REQUEST = "POST_ATTENDEE_REG_REQUEST"
export const POST_ATTENDEE_REG_SUCCESS = "POST_ATTENDEE_REG_SUCCESS"
export const POST_ATTENDEE_REG_FAILURE = "POST_ATTENDEE_REG_FAILURE"
export function postAttendeeRegRequest(
  attendeeId: number,
  formResponseId: number
) {
  let endpoint = `/v1.0/attendees/${attendeeId}/registration`
  return createApiAction({
    method: "POST",
    endpoint,
    body: JSON.stringify({
      form_response_id: formResponseId,
    }),
    types: [
      {type: POST_ATTENDEE_REG_REQUEST},
      {type: POST_ATTENDEE_REG_SUCCESS},
      {type: POST_ATTENDEE_REG_FAILURE},
    ],
  })
}
