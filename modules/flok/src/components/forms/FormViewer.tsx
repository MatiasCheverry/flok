import {Button, makeStyles} from "@material-ui/core"
import clsx from "clsx"
import {useFormik} from "formik"
import {useState} from "react"
import {useDispatch} from "react-redux"
import * as yup from "yup"
import {
  FormQuestionResponsePostModel,
  FormResponseModel,
  FormResponsePostModel,
  FormResponseType,
} from "../../models/form"
import {ApiAction} from "../../store/actions/api"
import {postFormResponse} from "../../store/actions/form"
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
  let [submissionLoading, setSubmissionLoading] = useState(false)
  let formik = useFormik<{[key: string]: string}>({
    initialValues: form.questions.reduce(
      (prev, currId) => ({...prev, [currId.toString()]: ""}),
      {}
    ),
    onSubmit: (values) => {
      let answers: FormQuestionResponsePostModel[] = Object.keys(values).map(
        (questionId) => {
          return {
            answer: values[questionId],
            form_question_id: parseInt(questionId),
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
      {form.questions.map((questionId) => (
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
            />
          </FormQuestionProvider>
        </div>
      ))}
      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  )
}
