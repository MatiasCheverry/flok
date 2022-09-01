import {ThunkDispatch} from "redux-thunk"
import {
  FormCreationTypeEnum,
  FormModel,
  FormQuestionModel,
  FormQuestionSelectOptionModel,
  FormResponsePostModel,
  FormResponseType,
} from "../../models/form"
import {ApiAction, createApiAction} from "./api"
import {patchRetreat} from "./retreat"

export const POST_FORM_REQUEST = "POST_FORM_REQUEST"
export const POST_FORM_SUCCESS = "POST_FORM_SUCCESS"
export const POST_FORM_FAILURE = "POST_FORM_FAILURE"

export function postForm(
  formType?: FormCreationTypeEnum,
  initialValues?: {title?: string; description?: string}
) {
  let endpoint = `/v1.0/forms${
    formType ? `?${new URLSearchParams({type: formType!}).toString()}` : ""
  }`
  return createApiAction({
    method: "POST",
    endpoint,
    body: JSON.stringify(initialValues),
    types: [POST_FORM_REQUEST, POST_FORM_SUCCESS, POST_FORM_FAILURE],
  })
}

export const INITIALIZE_REG_FORM_REQUEST = "INITIALIZE_REG_FORM_REQUEST"
export const INITIALIZE_REG_FORM_SUCCESS = "INITIALIZE_REG_FORM_SUCCESS"
export const INITIALIZE_REG_FORM_FAILURE = "INITIALIZE_REG_FORM_FAILURE"

export function initializeRegForm(retreatId: number) {
  return async (dispatch: ThunkDispatch<any, any, any>) => {
    let postFormResponse = (await dispatch(
      postForm(FormCreationTypeEnum.ATTENDEE_REGISTRATION)
    )) as unknown as ApiAction
    if (!postFormResponse.error) {
      let newFormId = postFormResponse.payload.form.id as number
      await dispatch(
        patchRetreat(retreatId, {attendees_registration_form_id: newFormId})
      )
    }
  }
}

export const GET_FORM_REQUEST = "GET_FORM_REQUEST"
export const GET_FORM_SUCCESS = "GET_FORM_SUCCESS"
export const GET_FORM_FAILURE = "GET_FORM_FAILURE"

export function getForm(formId: number) {
  let endpoint = `/v1.0/forms/${formId}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [GET_FORM_REQUEST, GET_FORM_SUCCESS, GET_FORM_FAILURE],
  })
}

export const PATCH_FORM_REQUEST = "PATCH_FORM_REQUEST"
export const PATCH_FORM_SUCCESS = "PATCH_FORM_SUCCESS"
export const PATCH_FORM_FAILURE = "PATCH_FORM_FAILURE"

export function patchForm(
  formId: number,
  form: Partial<Pick<FormModel, "description" | "title">>
) {
  let endpoint = `/v1.0/forms/${formId}`
  return createApiAction({
    method: "PATCH",
    body: JSON.stringify(form),
    endpoint,
    types: [PATCH_FORM_REQUEST, PATCH_FORM_SUCCESS, PATCH_FORM_FAILURE],
  })
}

export const GET_FORM_QUESTION_REQUEST = "GET_FORM_QUESTION_REQUEST"
export const GET_FORM_QUESTION_SUCCESS = "GET_FORM_QUESTION_SUCCESS"
export const GET_FORM_QUESTION_FAILURE = "GET_FORM_QUESTION_FAILURE"

export function getFormQuestion(questionId: number) {
  let endpoint = `/v1.0/questions/${questionId}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      GET_FORM_QUESTION_REQUEST,
      GET_FORM_QUESTION_SUCCESS,
      GET_FORM_QUESTION_FAILURE,
    ],
  })
}

export const POST_FORM_QUESTION_REQUEST = "POST_FORM_QUESTION_REQUEST"
export const POST_FORM_QUESTION_SUCCESS = "POST_FORM_QUESTION_SUCCESS"
export const POST_FORM_QUESTION_FAILURE = "POST_FORM_QUESTION_FAILURE"

export function postFormQuestion(
  formQuestion: Pick<FormQuestionModel, "form_id" | "type">
) {
  let endpoint = "/v1.0/questions"
  return async (dispatch: ThunkDispatch<any, any, any>) => {
    let postResponse = (await dispatch(
      createApiAction({
        method: "POST",
        body: JSON.stringify({...formQuestion, title: ""}),
        endpoint,
        types: [
          POST_FORM_QUESTION_REQUEST,
          POST_FORM_QUESTION_SUCCESS,
          POST_FORM_QUESTION_FAILURE,
        ],
      })
    )) as unknown as ApiAction
    if (!postResponse.error) {
      dispatch(getForm(formQuestion.form_id))
    }
  }
}

export const PATCH_FORM_QUESTION_REQUEST = "PATCH_FORM_QUESTION_REQUEST"
export const PATCH_FORM_QUESTION_SUCCESS = "PATCH_FORM_QUESTION_SUCCESS"
export const PATCH_FORM_QUESTION_FAILURE = "PATCH_FORM_QUESTION_FAILURE"

export function patchFormQuestion(
  questionId: number,
  formQuestion: Partial<
    Pick<
      FormQuestionModel,
      "description" | "title" | "type" | "required" | "min_date" | "max_date"
    >
  >
) {
  let endpoint = `/v1.0/questions/${questionId}`
  return createApiAction({
    method: "PATCH",
    body: JSON.stringify(formQuestion),
    endpoint,
    types: [
      PATCH_FORM_QUESTION_REQUEST,
      PATCH_FORM_QUESTION_SUCCESS,
      PATCH_FORM_QUESTION_FAILURE,
    ],
  })
}

export const DELETE_FORM_QUESTION_REQUEST = "DELETE_FORM_QUESTION_REQUEST"
export const DELETE_FORM_QUESTION_SUCCESS = "DELETE_FORM_QUESTION_SUCCESS"
export const DELETE_FORM_QUESTION_FAILURE = "DELETE_FORM_QUESTION_FAILURE"

export function deleteFormQuestion(questionId: number) {
  let endpoint = `/v1.0/questions/${questionId}`
  return createApiAction({
    method: "DELETE",
    endpoint,
    types: [
      {type: DELETE_FORM_QUESTION_REQUEST, meta: {questionId}},
      {type: DELETE_FORM_QUESTION_SUCCESS, meta: {questionId}},
      {type: DELETE_FORM_QUESTION_FAILURE, meta: {questionId}},
    ],
  })
}

export const GET_FORM_QUESTION_OPTION_REQUEST =
  "GET_FORM_QUESTION_OPTION_REQUEST"
export const GET_FORM_QUESTION_OPTION_SUCCESS =
  "GET_FORM_QUESTION_OPTION_SUCCESS"
export const GET_FORM_QUESTION_OPTION_FAILURE =
  "GET_FORM_QUESTION_OPTION_FAILURE"

export function getFormQuestionOption(optionId: number) {
  let endpoint = `/v1.0/options/${optionId}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      GET_FORM_QUESTION_OPTION_REQUEST,
      GET_FORM_QUESTION_OPTION_SUCCESS,
      GET_FORM_QUESTION_OPTION_FAILURE,
    ],
  })
}

export const POST_FORM_QUESTION_OPTION_REQUEST =
  "POST_FORM_QUESTION_OPTION_REQUEST"
export const POST_FORM_QUESTION_OPTION_SUCCESS =
  "POST_FORM_QUESTION_OPTION_SUCCESS"
export const POST_FORM_QUESTION_OPTION_FAILURE =
  "POST_FORM_QUESTION_OPTION_FAILURE"

export function postFormQuestionOption(
  questionOption: Pick<
    FormQuestionSelectOptionModel,
    "option" | "form_question_id"
  >
) {
  let endpoint = "/v1.0/options"
  return async (dispatch: ThunkDispatch<any, any, any>) => {
    let postResponse = (await dispatch(
      createApiAction({
        method: "POST",
        body: JSON.stringify(questionOption),
        endpoint,
        types: [
          POST_FORM_QUESTION_OPTION_REQUEST,
          POST_FORM_QUESTION_OPTION_SUCCESS,
          POST_FORM_QUESTION_OPTION_FAILURE,
        ],
      })
    )) as unknown as ApiAction
    if (!postResponse.error) {
      dispatch(getFormQuestion(questionOption.form_question_id))
    }
  }
}

export const PATCH_FORM_QUESTION_OPTION_REQUEST =
  "PATCH_FORM_QUESTION_OPTION_REQUEST"
export const PATCH_FORM_QUESTION_OPTION_SUCCESS =
  "PATCH_FORM_QUESTION_OPTION_SUCCESS"
export const PATCH_FORM_QUESTION_OPTION_FAILURE =
  "PATCH_FORM_QUESTION_OPTION_FAILURE"

export function patchFormQuestionOption(
  optionId: number,
  questionOption: Partial<Pick<FormQuestionSelectOptionModel, "option">>
) {
  let endpoint = `/v1.0/options/${optionId}`
  return createApiAction({
    method: "PATCH",
    body: JSON.stringify(questionOption),
    endpoint,
    types: [
      PATCH_FORM_QUESTION_OPTION_REQUEST,
      PATCH_FORM_QUESTION_OPTION_SUCCESS,
      PATCH_FORM_QUESTION_OPTION_FAILURE,
    ],
  })
}

export const DELETE_FORM_QUESTION_OPTION_REQUEST =
  "DELETE_FORM_QUESTION_OPTION_REQUEST"
export const DELETE_FORM_QUESTION_OPTION_SUCCESS =
  "DELETE_FORM_QUESTION_OPTION_SUCCESS"
export const DELETE_FORM_QUESTION_OPTION_FAILURE =
  "DELETE_FORM_QUESTION_OPTION_FAILURE"

export function deleteFormQuestionOption(optionId: number) {
  let endpoint = `/v1.0/options/${optionId}`
  return createApiAction({
    method: "DELETE",
    endpoint,
    types: [
      {type: DELETE_FORM_QUESTION_OPTION_REQUEST, meta: {optionId}},
      {type: DELETE_FORM_QUESTION_OPTION_SUCCESS, meta: {optionId}},
      {type: DELETE_FORM_QUESTION_OPTION_FAILURE, meta: {optionId}},
    ],
  })
}

export const POST_FORM_RESPONSE_REQUEST = "POST_FORM_RESPONSE_REQUEST"
export const POST_FORM_RESPONSE_SUCCESS = "POST_FORM_RESPONSE_SUCCESS"
export const POST_FORM_RESPONSE_FAILURE = "POST_FORM_RESPONSE_FAILURE"

export function postFormResponse(
  formResponse: FormResponsePostModel,
  responseType?: FormResponseType
) {
  let endpoint = "/v1.0/form-responses"
  let queryParams: Record<string, string> = {}
  if (responseType) {
    queryParams.type = responseType
  }
  if (Object.keys(queryParams).length > 0) {
    endpoint += "?" + new URLSearchParams(queryParams).toString()
  }
  return createApiAction({
    method: "POST",
    endpoint,
    body: JSON.stringify(formResponse),
    types: [
      {type: POST_FORM_RESPONSE_REQUEST},
      {type: POST_FORM_RESPONSE_SUCCESS},
      {type: POST_FORM_RESPONSE_FAILURE},
    ],
  })
}

export const GET_FORM_RESPONSE_REQUEST = "GET_FORM_RESPONSE_REQUEST"
export const GET_FORM_RESPONSE_SUCCESS = "GET_FORM_RESPONSE_SUCCESS"
export const GET_FORM_RESPONSE_FAILURE = "GET_FORM_RESPONSE_FAILURE"

export function getFormResponse(formResponseId: number) {
  let endpoint = `/v1.0/form-responses/${formResponseId}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_FORM_RESPONSE_REQUEST},
      {type: GET_FORM_RESPONSE_SUCCESS},
      {type: GET_FORM_RESPONSE_FAILURE},
    ],
  })
}
export const POST_QUESTION_REORDER_REQUEST = "POST_QUESTION_REORDER_REQUEST"
export const POST_QUESTION_REORDER_SUCCESS = "POST_QUESTION_REORDER_SUCCESS"
export const POST_QUESTION_REORDER_FAILURE = "POST_QUESTION_REORDER_FAILURE"

export function postReorderQuestion(
  questionId: number,
  formId: number,
  prevQuestionId: number | undefined
) {
  let endpoint = `/v1.0/forms/${formId}/questions/${questionId}/move`
  return createApiAction({
    method: "POST",
    endpoint,
    body: JSON.stringify({previousId: prevQuestionId}),
    types: [
      {type: POST_QUESTION_REORDER_REQUEST},
      {type: POST_QUESTION_REORDER_SUCCESS},
      {type: POST_QUESTION_REORDER_FAILURE},
    ],
  })
}

export const GET_FORM_RESPONSES_REQUEST = "GET_FORM_RESPONSES_REQUEST"
export const GET_FORM_RESPONSES_SUCCESS = "GET_FORM_RESPONSES_SUCCESS"
export const GET_FORM_RESPONSES_FAILURE = "GET_FORM_RESPONSES_FAILURE"
export function getFormResponses(formResponseIds: number[]) {
  if (formResponseIds.length > 50) {
    formResponseIds = formResponseIds.slice(0, 50)
  }
  let endpoint = `/v1.0/form-responses?${new URLSearchParams(
    formResponseIds.map((id) => ["id", id.toString()])
  )}`
  return createApiAction({
    method: "GET",
    endpoint,
    types: [
      {type: GET_FORM_RESPONSES_REQUEST},
      {type: GET_FORM_RESPONSES_SUCCESS},
      {type: GET_FORM_RESPONSES_FAILURE},
    ],
  })
}
