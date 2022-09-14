import {ImageModel} from "."
import config from "../config"

export type RetreatSelectedHotelProposalState =
  | "SELECTED"
  | "PENDING"
  | "NOT_AVAILABLE"
  | "REVIEW"
  | "REQUESTED"

export type HotelLodgingProposalLink = {
  link_url: string
  link_text: string
  affinity?: "MEETING_ROOMS" | "FOOD_BEV" | "GUESTROOMS"
}

export type HotelLodgingProposal = {
  id: number
  dates: string
  dates_note: string
  num_guests?: string
  is_all_inclusive?: boolean
  currency?: "USD" | "EUR"
  compare_room_rate: number
  compare_room_total: number
  on_hold: boolean
  summary: string
  hold_status: string
  guestroom_rates: string
  approx_room_total: string
  resort_fee: string
  tax_rates: string
  additional_fees: string
  suggested_meeting_spaces: string
  meeting_room_rates: string
  meeting_room_tax_rates: string
  food_bev_minimum: string
  food_bev_service_fee: string
  avg_breakfast_price: string
  avg_snack_price: string
  avg_lunch_price: string
  avg_dinner_price: string
  cost_saving_notes: string
  additional_links: HotelLodgingProposalLink[]
  final_concessions?: string
}

export type RetreatSelectedHotelProposal = {
  retreat_id: number
  hotel_id: number
  state: RetreatSelectedHotelProposalState
  hotel_proposals?: HotelLodgingProposal[]
  created_by: "USER" | "ADMIN"
  group_id?: number
}

export type PresetImageModel = {
  type: PresetImageType
  id: number
  image: ImageModel
}

export type RetreatProgressState = // Deprecated

    | "INTAKE_1"
    | "INTAKE_2"
    | "FILTER_SELECT"
    | "DESTINATION_SELECT"
    | "HOTEL_SELECT"
    | "PROPOSAL"
    | "PROPOSAL_READY"

/****************** Retreat states types (keep synced with models/retreat.tsx in flok) ******************/
export const OrderedRetreatIntakeState = [
  "SIGNED_UP",
  "INTAKE_CALL",
  "FOLLOW_UP",
  "NOT_MOVING_FORWARD",
  "INVOICED",
  "HANDOFF",
] as const
export type RetreatIntakeState = typeof OrderedRetreatIntakeState[number]

export const OrderedRetreatLodgingState = [
  "NOT_STARTED",
  "PROPOSALS",
  "CONTRACT",
  "HANDOFF",
] as const
export type RetreatLodgingState = typeof OrderedRetreatLodgingState[number]

export const OrderedRetreatAttendeesState = [
  "NOT_STARTED",
  "FORM_REVIEW",
  "REGISTRATION_OPEN",
] as const
export type RetreatAttendeesState = typeof OrderedRetreatAttendeesState[number]

export const OrderedRetreatFlightsState = [
  "NOT_STARTED",
  "POLICY_REVIEW",
  "BOOKING",
] as const
export type RetreatFlightsState = typeof OrderedRetreatFlightsState[number]

export const OrderedRetreatItineraryState = [
  "NOT_STARTED",
  "IN_PROGRESS",
] as const
export type RetreatItineraryState = typeof OrderedRetreatItineraryState[number]
/****************** End retreat states types ******************/

export type RetreatToTaskState = "TODO" | "COMPLETED" | "HIDDEN"

export type RetreatToTask = {
  task_id: number
  order: number
  state: RetreatToTaskState
  due_date?: string
  title: string
  description?: string
  link?: string
  is_flok_task?: boolean
}
export type RetreatModel = {
  id: number
  guid: string
  company_name: string
  retreat_name?: string
  state: RetreatProgressState

  // Retreat data related to the intake form
  contact_email: string
  preferences_num_attendees_lower?: number // `_lower` is legacy, treat this as the number input in form
  preferences_is_dates_flexible?: boolean
  preferences_dates_exact_start?: string
  preferences_dates_exact_end?: string
  preferences_dates_flexible_months?: string[]
  preferences_dates_flexible_num_nights?: number

  // Retreat data related to lodging
  lodging_state?: RetreatLodgingState
  lodging_final_start_date?: string
  lodging_final_end_date?: string
  lodging_final_destination?: string
  lodging_final_hotel_id?: number
  lodging_final_contract_notes?: string
  lodging_final_contract_url?: string
  selected_hotels_ids: number[]
  selected_hotels: RetreatSelectedHotelProposal[]
  lodging_site_inspection_url?: string
  request_for_proposal_id?: number

  // Retreat data related to attendees
  attendees_state?: RetreatAttendeesState
  attendees_website_id?: number
  attendees_registration_form_id?: number
  registration_live: boolean
  attendees_v2_released?: boolean

  // Retreat data related to flights
  flights_state?: RetreatFlightsState

  // Retreat data related to itinerary
  itinerary_state?: RetreatItineraryState

  // Other documents
  faq_link: string
  budget_link: string

  tasks_todo: RetreatToTask[]
  tasks_completed: RetreatToTask[]

  //Retreat itinerary links
  itinerary_first_draft_link?: string
  itinerary_final_draft_link?: string

  // hotel groups
  group_ids: number[]

  // flights page
  flights_live?: boolean
  flights_page_id?: number
  hide_group_flights?: boolean
  require_flight_receipts?: boolean

  //  Email templates
  registration_email_template_id?: number
  flights_email_template_id?: number
  // RMC users
  users: number[]
}

export type RetreatTripModel = {
  id: number
  cost: number
  duration?: number
  confirmation_number?: string
  trip_legs: RetreatTripLeg[]
}

export type AttendeeLandingWebsitePageModel = {
  title: string
  website_id: number
  id: number
  block_ids: number[]
}

export type AttendeeLandingWebsiteBlockModel = {
  content: any
  type: "WYSIWYG" | "img"
  page_id: number
  id: number
}

export type AttendeeLandingWebsiteModel = {
  banner_image?: ImageModel
  name: string
  logo_image?: ImageModel
  retreat_id: number
  id: number
  page_ids: number[]
  background_color?: string
  primary_color?: string
  text_color?: string
}

export type PresetImageType = "BANNER"
// aka flight
export type RetreatTripLeg = {
  trip_id: number
  airline?: string
  dep_airport?: string
  dep_datetime?: string
  arr_airport?: string
  arr_datetime?: string
  flight_num?: string
  duration?: number // number of minutes
}

export type FileModel = {
  id: number
  file_url: string
}

export type RetreatTravelModel = {
  id: number
  cost: number
  dep_trip?: RetreatTripModel
  arr_trip?: RetreatTripModel
}
export type AttendeeInfoStatus =
  | "CREATED"
  | "INFO_ENTERED"
  | "NOT_ATTENDING"
  | "CANCELLED"
export type RetreatAttendeeModel = {
  id: number
  email_address: string
  first_name: string
  last_name: string
  travel?: RetreatTravelModel
  city?: string
  dietary_prefs: string
  notes: string
  info_status: AttendeeInfoStatus
  flight_status: "PENDING" | "OPT_OUT" | "BOOKED"
  hotel_check_in?: string | null // iso date string
  hotel_check_out?: string | null // iso date string
  retreat_id: number
  registration_form_response_id?: number
  receipts: FileModel[]
}

export const SampleLockedAttendees: RetreatAttendeeModel[] = [
  {
    dietary_prefs: "Vegan",
    retreat_id: 1,
    info_status: "INFO_ENTERED",
    first_name: "Eli",
    last_name: "Manning",
    id: 1,
    receipts: [
      {id: 0, file_url: "http://www.africau.edu/images/default/sample.pdf"},
    ],
    notes: "Says they are vegan but not really",
    city: "New York",
    flight_status: "BOOKED",
    hotel_check_in: "2022-04-21",
    hotel_check_out: "2022-04-25",
    travel: {
      id: 1,
      cost: 450,
      arr_trip: {
        id: config.get("demo_trip_arrival"),
        cost: 250,
        trip_legs: [
          {
            trip_id: 1,
            airline: "Jet Blue",
            dep_airport: "LGA",
            dep_datetime: "2022-04-07T13:33:14.195Z",
            arr_airport: "LAX",
            arr_datetime: "2022-04-06T13:33:14.195Z",
            flight_num: "1018",
          },
        ],
      },
      dep_trip: {
        id: config.get("demo_trip_departure"),
        cost: 250,
        trip_legs: [
          {
            trip_id: 2,
            airline: "Jet Blue",
            dep_airport: "LGA",
            dep_datetime: "2022-04-10T13:33:14.195Z",
            arr_airport: "LAX",
            arr_datetime: "2022-04-06T13:33:14.195Z",
            flight_num: "967",
          },
        ],
      },
    },
    email_address: "tp@123.com",
  },
  {
    dietary_prefs: "Vegan",
    retreat_id: 1,
    receipts: [],
    info_status: "CREATED",
    first_name: "Tiki",
    last_name: "Barber",
    id: 2,
    travel: undefined,
    notes: "",
    city: "New York",
    flight_status: "OPT_OUT",
    email_address: "tp@123.com",
    hotel_check_in: "2022-04-21",
    hotel_check_out: "2022-04-25",
  },
  {
    dietary_prefs: "Paleo",
    retreat_id: 1,
    receipts: [],
    info_status: "INFO_ENTERED",
    first_name: "Jeremy",
    last_name: "Shockey",
    id: 3,
    hotel_check_in: "2022-04-21",
    hotel_check_out: "2022-04-25",
    travel: {
      id: 7,
      cost: 400,
      arr_trip: {
        id: 11,
        cost: 250,
        trip_legs: [
          {
            trip_id: 11,
            airline: "Jet Blue",
            dep_airport: "LGA",
            dep_datetime: "2022-04-07T18:31:27.963Z",
            arr_airport: "LAX",
            arr_datetime: "2022-04-06T15:25:14.195Z",
            flight_num: "8088",
          },
        ],
      },
      dep_trip: {
        id: 28,
        cost: 250,
        trip_legs: [
          {
            trip_id: 28,
            airline: "Jet Blue",
            dep_airport: "LGA",
            dep_datetime: "2022-04-10T13:33:14.195Z",
            arr_airport: "LAX",
            arr_datetime: "2022-04-06T13:33:14.195Z",
            flight_num: "967",
          },
        ],
      },
    },
    notes: "",
    city: "New York",
    flight_status: "BOOKED",
    email_address: "tp@123.com",
  },
  {
    dietary_prefs: "Vegan",
    retreat_id: 1,
    info_status: "INFO_ENTERED",
    first_name: "Kevin",
    last_name: "Boss",
    id: 67,
    receipts: [],
    travel: {
      id: 323,
      cost: 325,
      arr_trip: {
        id: 311,
        cost: 250,
        trip_legs: [
          {
            trip_id: 311,
            airline: "Jet Blue",
            dep_airport: "LGA",
            dep_datetime: "2022-04-07T18:31:27.963Z",
            arr_airport: "LAX",
            arr_datetime: "2022-04-06T13:33:14.195Z",
            flight_num: "1018",
          },
        ],
      },
      dep_trip: {
        id: 354,
        cost: 250,
        trip_legs: [
          {
            trip_id: 354,
            airline: "Jet Blue",
            dep_airport: "LGA",
            dep_datetime: "2022-04-10T13:33:14.195Z",
            arr_airport: "LAX",
            arr_datetime: "2022-04-06T13:33:14.195Z",
            flight_num: "967",
          },
        ],
      },
    },
    notes: "Says they are vegan but not really",
    city: "New York",
    flight_status: "BOOKED",
    email_address: "tp@123.com",
  },
  {
    dietary_prefs: "Kosher",
    receipts: [],
    retreat_id: 1,
    info_status: "CREATED",
    first_name: "Plaxico",
    last_name: "Burress",
    id: 682,
    travel: undefined,
    notes: "",
    city: "New York",
    flight_status: "PENDING",
    email_address: "tp@123.com",
  },
  {
    dietary_prefs: "Paleo",
    receipts: [],
    retreat_id: 1,
    info_status: "INFO_ENTERED",
    first_name: "Amani",
    last_name: "Toomer",
    id: 292,
    travel: undefined,
    notes: "",
    city: "New York",
    flight_status: "OPT_OUT",
    email_address: "tp@123.com",
  },
  {
    dietary_prefs: "Vegan",
    receipts: [],
    retreat_id: 1,
    info_status: "INFO_ENTERED",
    first_name: "Ahmad",
    last_name: "Bradshaw",
    id: 893,
    travel: undefined,
    notes: "Says they are vegan but not really",
    city: "New York",
    flight_status: "PENDING",
    email_address: "tp@123.com",
  },
  {
    dietary_prefs: "Vegetarian",
    receipts: [],
    retreat_id: 1,
    info_status: "CREATED",
    first_name: "Brandon",
    last_name: "Jacobs",
    id: 3156,
    travel: undefined,
    notes: "",
    city: "New York",
    flight_status: "PENDING",
    email_address: "tp@123.com",
  },
  {
    dietary_prefs: "Paleo",
    receipts: [],
    retreat_id: 1,
    info_status: "INFO_ENTERED",
    first_name: "Mario",
    last_name: "Manningham",
    id: 130,
    travel: undefined,
    notes: "",
    city: "New York",
    flight_status: "PENDING",
    email_address: "tp@123.com",
  },
]

export type AgendaType = "ALL_WORK" | "ALL_PLAY" | "WORK_AND_PLAY"
export type RFPModel = {
  id: number
  retreat_id: number
  has_exact_dates: boolean
  exact_dates_start?: string
  exact_dates_end?: string
  flexible_number_of_nights?: number
  exact_dates_notes?: string
  flexible_dates_notes?: string
  agenda_type: AgendaType
  agenda_notes?: string
  number_of_rooms: number
}

export type HotelGroup = {
  id: number
  title: string
  retreat_id: number
}

export type EmailTemplateModel = {
  id: number
  subject: string
  body: string
}
