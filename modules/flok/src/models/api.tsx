// API endpoints
import {
  FormModel,
  FormQuestionModel,
  FormQuestionSelectOptionModel,
} from "./form"
import {
  AttendeeLandingWebsiteBlockModel,
  AttendeeLandingWebsiteModel,
  AttendeeLandingWebsitePageModel,
  PresetImageModel,
  RetreatAttendeeModel,
  RetreatTripModel,
} from "./retreat"
import {UserModel} from "./user"

// GET v1.0/user/home, GET_USER_HOME_SUCCESS
export type UserHomeResponse = {
  user: UserModel
}

// v1.0/auth/signin
export type UserAuthResponse = {
  user: UserModel
}

export type RetreatAttendeesApiResponse = {
  message: string
  attendees: RetreatAttendeeModel[]
}
export type AttendeeApiResponse = {
  attendee: RetreatAttendeeModel
}

export type PresetImagesApiResponse = {
  preset_images: PresetImageModel[]
}

export type TripApiResponse = {
  trip: RetreatTripModel
}
export type AttendeeLandingWebsiteApiResponse = {
  website: AttendeeLandingWebsiteModel
}
export type AttendeeLandingWebsitePageApiResponse = {
  page: AttendeeLandingWebsitePageModel
}

export type AttendeeLandingWebsitePageBlockApiResponse = {
  block: AttendeeLandingWebsiteBlockModel
}
export type AttendeeLandingWebsiteInitializeApiResponse = {
  website: AttendeeLandingWebsiteModel
  page: AttendeeLandingWebsitePageModel
  block: AttendeeLandingWebsiteBlockModel
}
export type AttendeeBatchUploadApiResponse = {
  attendees: RetreatAttendeeModel[]
  errors: (Pick<
    RetreatAttendeeModel,
    "email_address" | "first_name" | "last_name"
  > & {error: string})[]
}

// Forms
export type FormApiResponse = {
  form: FormModel
}
export type QuestionApiResponse = {
  form_question: FormQuestionModel
}
export type QuestionOptionApiResponse = {
  select_option: FormQuestionSelectOptionModel
}
