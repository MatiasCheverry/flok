import {makeStyles} from "@material-ui/core"
import React from "react"
import {useForm} from "./FormProvider"
import FormQuestionProvider from "./FormQuestionProvider"
import {FormHeader} from "./Headers"
import {AddNewQuestionButton, RegFormBuilderQuestion} from "./Questions"

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

type FormBuilderProps = {}
export default function FormBuilder(props: FormBuilderProps) {
  let classes = useStyles(props)
  let form = useForm()

  return (
    <div className={classes.builderForm}>
      <div className={classes.formSection}>
        <FormHeader
          editable
          formId={form.id}
          title={form.title}
          description={form.description ?? ""}
        />
      </div>
      {form.questions.map((questionId) => (
        <div className={classes.formSection}>
          <FormQuestionProvider questionId={questionId}>
            <RegFormBuilderQuestion key={questionId} />
          </FormQuestionProvider>
        </div>
      ))}
      <div className={classes.addQuestionButtonContainer}>
        <AddNewQuestionButton formId={form.id} />
      </div>
    </div>
  )
}
