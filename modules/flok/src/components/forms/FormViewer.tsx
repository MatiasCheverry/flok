import {Box, Button, CircularProgress, makeStyles} from "@material-ui/core"
import clsx from "clsx"
import {useFormik} from "formik"
import _ from "lodash"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import * as yup from "yup"
import {
  FormQuestionResponsePostModel,
  FormQuestionRuleModel,
  FormResponseModel,
  FormResponsePostModel,
  FormResponseType,
} from "../../models/form"
import {RootState} from "../../store"
import {ApiAction} from "../../store/actions/api"
import {
  getFormQuestion,
  getFormQuestionOption,
  getFormQuestionRule,
  postFormResponse,
} from "../../store/actions/form"
import AppLoadingScreen from "../base/AppLoadingScreen"
import {useForm} from "./FormProvider"
import FormQuestionProvider from "./FormQuestionProvider"
import {FormHeader} from "./Headers"
import {RegFormViewerQuestion} from "./Questions"

let useStyles = makeStyles((theme) => ({
  builderForm: {
    margin: theme.spacing(1),
    "& > :not(:first-child)": {marginTop: theme.spacing(2)},
  },
  formSection: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
    "&.error": {
      border: "solid thin red",
    },
  },
  formQuestionTitleInput: {
    ...theme.typography.body1,
    fontWeight: theme.typography.fontWeightBold,
  },
  formQuestionDescriptionInput: {
    ...theme.typography.body2,
  },
  addQuestionButtonContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
}))

type FormViewerProps = {
  onSuccess?: (
    formResponse: FormResponseModel
  ) => void | Promise<ApiAction | undefined>
}
export default function FormViewer(props: FormViewerProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()
  let form = useForm()
  let questions = useSelector((state: RootState) =>
    _.pick(state.form.formQuestions, form.questions)
  )
  let [loadingQuestions, setLoadingQuestions] = useState(false)

  useEffect(() => {
    async function loadQuestions(questionIds: number[]) {
      setLoadingQuestions(true)
      await Promise.all(questionIds.map((id) => dispatch(getFormQuestion(id))))
      setLoadingQuestions(false)
    }
    if (!loadingQuestions) {
      let missingQuestions = form.questions
        .map((questionId) => (!questions[questionId] ? questionId : undefined))
        .filter((id) => id)
      if (missingQuestions.length > 0) {
        loadQuestions(missingQuestions as number[])
      }
    }
  }, [form, dispatch, questions, loadingQuestions])

  let [loadingQuestionRules, setLoadingQuestionRules] = useState(false)

  let questionRules = useSelector((state: RootState) => {
    let questionRuleIds = Object.values(questions).reduce((prev, curr) => {
      return [...prev, ...(curr ? curr.form_question_rules : [])]
    }, [] as number[])
    return _.pick(state.form.questionRules, questionRuleIds)
  })

  useEffect(() => {
    async function loadQuestionRules(missingRuleIds: number[]) {
      setLoadingQuestionRules(true)
      await Promise.all(
        missingRuleIds.map((ruleId) => {
          return dispatch(getFormQuestionRule(ruleId))
        })
      )
      setLoadingQuestionRules(false)
    }
    if (!loadingQuestionRules) {
      let missingRuleIds = Object.values(questions)
        .reduce((prev, curr) => {
          return [...prev, ...(curr ? curr.form_question_rules : [])]
        }, [] as number[])
        .map((id) => (!questionRules[id] ? id : undefined))
        .filter((id) => id)
      if (missingRuleIds.length > 0) {
        loadQuestionRules(missingRuleIds as number[])
      }
    }
  }, [questions, loadingQuestionRules, questionRules, dispatch])

  let [loadingQuestionOptions, setLoadingQuestionOptions] = useState(false)

  let questionOptions = useSelector((state: RootState) => {
    let questionOptionIds = Object.values(questions).reduce((prev, curr) => {
      return [...prev, ...(curr ? curr.select_options : [])]
    }, [] as number[])
    return _.pick(state.form.questionOptions, questionOptionIds)
  })

  useEffect(() => {
    async function loadQuestionOptions(missingOptionIds: number[]) {
      setLoadingQuestionOptions(true)
      await Promise.all(
        missingOptionIds.map((optionId) => {
          return dispatch(getFormQuestionOption(optionId))
        })
      )
      setLoadingQuestionOptions(false)
    }
    if (!loadingQuestionOptions) {
      let missingOptionIds = Object.values(questions)
        .reduce((prev, curr) => {
          return [...prev, ...(curr ? curr.select_options : [])]
        }, [] as number[])
        .map((id) => (!questionOptions[id] ? id : undefined))
        .filter((id) => id)
      if (missingOptionIds.length > 0) {
        loadQuestionOptions(missingOptionIds as number[])
      }
    }
  }, [questions, loadingQuestionOptions, questionOptions, dispatch])

  let [submissionLoading, setSubmissionLoading] = useState(false)
  let formik = useFormik<{[key: string]: string}>({
    initialValues: form.questions.reduce(
      (prev, currId) => ({...prev, [currId.toString()]: ""}),
      {}
    ),
    onSubmit: (values) => {
      let answers: FormQuestionResponsePostModel[] = form.questions.map(
        (questionId) => {
          return {
            answer: values[questionId.toString()] ?? "",
            form_question_id: questionId,
          }
        }
      )
      let formResponse: FormResponsePostModel = {
        form_id: form.id,
        answers: answers,
      }
      async function postAttendeeFormResponse() {
        setSubmissionLoading(true)
        let formResponseApiResponse = (await dispatch(
          postFormResponse(formResponse, FormResponseType.ATTENDEE_REGISTRATION)
        )) as unknown as ApiAction<{form_response: FormResponseModel}>
        if (
          !formResponseApiResponse.error &&
          formResponseApiResponse.payload.form_response != null &&
          formResponseApiResponse.payload.form_response.id != null &&
          props.onSuccess
        ) {
          await props.onSuccess(formResponseApiResponse.payload.form_response)
        }
        setSubmissionLoading(false)
      }
      postAttendeeFormResponse()
    },
    validateOnBlur: true,
  })

  let displayedQuestions = form.questions.filter((questionId) => {
    let question = questions[questionId]
    let display = true
    if (question) {
      let rules = question.form_question_rules
        .map((ruleId) => questionRules[ruleId])
        .filter((rule) => rule) as FormQuestionRuleModel[]
      rules.forEach((rule) => {
        let dependsOnQuestion = questions[rule.depends_on_form_question_id]
        let dependsOnOption = questionOptions[rule.depends_on_select_option_id]
        if (dependsOnQuestion && dependsOnOption) {
          if (formik.values[dependsOnQuestion.id] !== dependsOnOption.option) {
            display = false
          }
        }
      })
    }
    return display
  })

  return (
    <form onSubmit={formik.handleSubmit} className={classes.builderForm}>
      <div className={classes.formSection}>
        <FormHeader
          formId={form.id}
          title={form.title}
          description={form.description ?? ""}
        />
        {submissionLoading && <AppLoadingScreen />}
      </div>
      {loadingQuestionOptions || loadingQuestionRules || loadingQuestions ? (
        <Box width="100%" display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        displayedQuestions.map((questionId) => (
          <div
            key={questionId}
            className={clsx(
              classes.formSection,
              formik.errors[questionId] &&
                (formik.touched[questionId] || formik.submitCount > 0)
                ? "error"
                : undefined
            )}>
            <FormQuestionProvider questionId={questionId}>
              <RegFormViewerQuestion
                key={questionId}
                value={formik.values[questionId]}
                onChange={(newVal) =>
                  formik.setFieldValue(questionId.toString(), newVal)
                }
                onLoad={(question) => {
                  formik.registerField(questionId.toString(), {
                    validate: (val: string) => {
                      let validator = yup.string()
                      if (question.required) {
                        validator = validator.required(
                          "This question is required"
                        )
                      }
                      try {
                        validator.validateSync(val)
                      } catch (exception) {
                        if (exception instanceof yup.ValidationError) {
                          return exception.message
                        }
                      }
                    },
                  })
                }}
                onUnload={(question) => {
                  formik.registerField(question.id.toString(), {
                    validate: (val: string) => undefined,
                  })
                  formik.setFieldValue(question.id.toString(), "")
                }}
              />
            </FormQuestionProvider>
          </div>
        ))
      )}
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  )
}
