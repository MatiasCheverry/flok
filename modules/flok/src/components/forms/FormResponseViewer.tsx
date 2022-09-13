import {makeStyles} from "@material-ui/core"
import {FormQuestionSelectOptionModel} from "../../models/form"
import {useFormResponse} from "../../utils/formUtils"
import AppLoadingScreen from "../base/AppLoadingScreen"
import {RegFormResponseViewerQuestion} from "./Questions"

let useStyles = makeStyles((theme) => ({
  root: {
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
    pointerEvents: "none",
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

type FormResponseViewerProps = {
  formResponseId: number
  showHiddenQuestions?: boolean
}
export default function FormResponseViewer(props: FormResponseViewerProps) {
  let classes = useStyles(props)
  let [formResponse, loadingFormResponse] = useFormResponse(
    props.formResponseId
  )
  let answers = formResponse
    ? formResponse.answers.reduce<{[id: number]: string}>(
        (prev, answer) => ({...prev, [answer.form_question_id]: answer.answer}),
        {}
      )
    : {}
  let selectOptions = formResponse
    ? formResponse.answers
        .map((answer) => answer.form_question_snapshot.select_options_snapshot)
        .filter((options) => options)
        .reduce((prev, options) => [...prev, ...options], [])
        .reduce<{[id: number]: FormQuestionSelectOptionModel}>(
          (prev, option) => ({...prev, [option.id]: option}),
          {}
        )
    : {}

  return formResponse != null ? (
    <div className={classes.root}>
      {formResponse.answers.map((answer) => {
        let questionShown = true
        answer.form_question_snapshot.form_question_rules_snapshot?.forEach(
          (rule) => {
            let requiredAnswer =
              selectOptions[rule.depends_on_select_option_id].option
            let actualAnswer = answers[rule.depends_on_form_question_id]
            if (requiredAnswer !== actualAnswer) {
              questionShown = false
            }
          }
        )
        if (!props.showHiddenQuestions && !questionShown) {
          return <></>
        }
        return (
          <div key={answer.id} className={classes.formSection}>
            <RegFormResponseViewerQuestion
              readOnly
              question={answer.form_question_snapshot}
              onLoad={() => undefined}
              onChange={() => undefined}
              value={answer.answer}
              key={answer.id}
            />
          </div>
        )
      })}
    </div>
  ) : loadingFormResponse ? (
    <AppLoadingScreen />
  ) : (
    <div>Something went wrong</div>
  )
}
