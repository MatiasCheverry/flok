import {Action} from "redux"
import {
  FormApiResponse,
  QuestionApiResponse,
  QuestionOptionApiResponse,
} from "../../models/api"
import {
  FormModel,
  FormQuestionModel,
  FormQuestionRuleModel,
  FormQuestionSelectOptionModel,
  FormResponseModel,
} from "../../models/form"
import {ApiAction} from "../actions/api"
import {
  DELETE_FORM_QUESTION_OPTION_SUCCESS,
  DELETE_FORM_QUESTION_RULE_SUCCESS,
  DELETE_FORM_QUESTION_SUCCESS,
  GET_FORM_QUESTION_OPTION_SUCCESS,
  GET_FORM_QUESTION_RULE_SUCCESS,
  GET_FORM_QUESTION_SUCCESS,
  GET_FORM_RESPONSES_SUCCESS,
  GET_FORM_RESPONSE_SUCCESS,
  GET_FORM_SUCCESS,
  PATCH_FORM_QUESTION_OPTION_SUCCESS,
  PATCH_FORM_QUESTION_RULE_SUCCESS,
  PATCH_FORM_QUESTION_SUCCESS,
  PATCH_FORM_SUCCESS,
  POST_FORM_QUESTION_OPTION_SUCCESS,
  POST_FORM_QUESTION_RULE_SUCCESS,
  POST_FORM_QUESTION_SUCCESS,
  POST_FORM_RESPONSE_SUCCESS,
  POST_QUESTION_REORDER_SUCCESS,
} from "../actions/form"

export type FormState = {
  forms: {
    [id: number]: FormModel | undefined
  }
  formQuestions: {
    [id: number]: FormQuestionModel | undefined
  }
  questionOptions: {
    [id: number]: FormQuestionSelectOptionModel | undefined
  }
  questionRules: {
    [id: number]: FormQuestionRuleModel | undefined
  }
  formResponses: {
    [id: number]: FormResponseModel
  }
}

const initialState: FormState = {
  forms: {},
  formQuestions: {},
  questionOptions: {},
  questionRules: {},
  formResponses: {},
}

export default function formReducer(
  state: FormState = initialState,
  action: Action
): FormState {
  var newFormQuestions
  var newForms
  var newQuestionOptions
  var newQuestionRules
  switch (action.type) {
    case GET_FORM_SUCCESS:
    case PATCH_FORM_SUCCESS:
      let form = ((action as ApiAction).payload as FormApiResponse).form
      return {
        ...state,
        forms: {...state.forms, [form.id]: form},
      }
    case GET_FORM_QUESTION_SUCCESS:
    case POST_FORM_QUESTION_SUCCESS:
    case PATCH_FORM_QUESTION_SUCCESS:
      let question = ((action as ApiAction).payload as QuestionApiResponse)
        .form_question
      return {
        ...state,
        formQuestions: {...state.formQuestions, [question.id]: question},
      }
    case DELETE_FORM_QUESTION_SUCCESS:
      let questionId = (action as unknown as {meta: {questionId: number}}).meta
        .questionId
      newFormQuestions = {...state.formQuestions}
      delete newFormQuestions[questionId]
      newForms = Object.keys(state.forms).reduce((prev, currKey: string) => {
        let currId = currKey as unknown as number
        let currForm = state.forms[currId]
        if (currForm && currForm.questions) {
          currForm = {...currForm}
          currForm.questions = currForm.questions.filter(
            (id) => id !== questionId
          )
        }
        return {...prev, [currId]: currForm}
      }, {})
      return {
        ...state,
        forms: newForms,
        formQuestions: newFormQuestions,
      }
    case GET_FORM_QUESTION_OPTION_SUCCESS:
    case POST_FORM_QUESTION_OPTION_SUCCESS:
    case PATCH_FORM_QUESTION_OPTION_SUCCESS:
      let option = ((action as ApiAction).payload as QuestionOptionApiResponse)
        .select_option
      return {
        ...state,
        questionOptions: {...state.questionOptions, [option.id]: option},
      }
    case DELETE_FORM_QUESTION_OPTION_SUCCESS:
      let optionId = (action as unknown as {meta: {optionId: number}}).meta
        .optionId
      newQuestionOptions = {...state.questionOptions}
      delete newQuestionOptions[optionId]
      newFormQuestions = Object.keys(state.formQuestions).reduce(
        (prev, currKey: string) => {
          let currId = currKey as unknown as number
          let currQuestion = state.formQuestions[currId]
          if (currQuestion && currQuestion.select_options) {
            currQuestion = {...currQuestion}
            currQuestion.select_options = currQuestion.select_options.filter(
              (id) => id !== optionId
            )
          }
          return {...prev, [currId]: currQuestion}
        },
        {}
      )
      return {
        ...state,
        questionOptions: newQuestionOptions,
        formQuestions: newFormQuestions,
      }
    case GET_FORM_QUESTION_RULE_SUCCESS:
    case POST_FORM_QUESTION_RULE_SUCCESS:
    case PATCH_FORM_QUESTION_RULE_SUCCESS:
      let rule = (
        (action as ApiAction).payload as {
          form_question_rule: FormQuestionRuleModel
        }
      ).form_question_rule
      return {
        ...state,
        questionRules: {...state.questionRules, [rule.id]: rule},
      }
    case DELETE_FORM_QUESTION_RULE_SUCCESS:
      let ruleId = (action as unknown as {meta: {ruleId: number}}).meta.ruleId
      newQuestionRules = {...state.questionRules}
      newFormQuestions = Object.keys(state.formQuestions).reduce(
        (prev, currKey: string) => {
          let currId = currKey as unknown as number
          let currQuestion = state.formQuestions[currId]
          if (currQuestion && currQuestion.form_question_rules) {
            currQuestion = {...currQuestion}
            currQuestion.form_question_rules =
              currQuestion.form_question_rules.filter((id) => id !== ruleId)
          }
          return {...prev, [currId]: currQuestion}
        },
        {}
      )
      return {
        ...state,
        questionRules: newQuestionRules,
        formQuestions: newFormQuestions,
      }

    case GET_FORM_RESPONSE_SUCCESS:
    case POST_FORM_RESPONSE_SUCCESS:
      let formResponse = (
        (action as ApiAction).payload as {form_response: FormResponseModel}
      ).form_response
      return {
        ...state,
        formResponses: {
          ...state.formResponses,
          [formResponse.id]: formResponse,
        },
      }
    case POST_QUESTION_REORDER_SUCCESS:
      let questions = (
        (action as ApiAction).payload as {questions: FormQuestionModel[]}
      ).questions
      let formId = questions[0].form_id
      return {
        ...state,
        forms: {
          ...state.forms,
          [formId]: {
            ...state.forms[formId],
            questions: questions.map((question) => question.id),
          } as FormModel,
        },
      }
    case GET_FORM_RESPONSES_SUCCESS:
      let formResponses = (
        (action as ApiAction).payload as {form_responses: FormResponseModel[]}
      ).form_responses
      let newResponses = formResponses.reduce(
        (last: any, curr: FormResponseModel) => {
          return {...last, [curr.id]: curr}
        },
        {}
      )
      return {
        ...state,
        formResponses: {
          ...state.formResponses,
          ...newResponses,
        },
      }
    default:
      return state
  }
}
