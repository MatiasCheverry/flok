import {makeStyles} from "@material-ui/core"
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
}
export default function FormResponseViewer(props: FormResponseViewerProps) {
  let classes = useStyles(props)
  let [formResponse, loadingFormResponse] = useFormResponse(
    props.formResponseId
  )

  return formResponse != null ? (
    <div className={classes.root}>
      {formResponse.answers.map((answer) => {
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
