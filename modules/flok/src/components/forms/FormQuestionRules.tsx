import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  makeStyles,
  MenuItem,
  TextField,
  TextFieldProps,
  Typography,
} from "@material-ui/core"
import {Add, Delete, Edit} from "@material-ui/icons"
import clsx from "clsx"
import {useFormik} from "formik"
import {ReactNode, useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import * as yup from "yup"
import {
  FormQuestionModel,
  FormQuestionRuleModel,
  FormQuestionSelectOptionModel,
} from "../../models/form"
import {RootState} from "../../store"
import {ApiAction} from "../../store/actions/api"
import {
  deleteFormQuestionRule,
  getFormQuestion,
  patchFormQuestionRule,
  postFormQuestionRule,
} from "../../store/actions/form"
import {
  useForm,
  useFormQuestion,
  useFormQuestionRule,
} from "../../utils/formUtils"
import AppLoadingScreen from "../base/AppLoadingScreen"
import AppTypography from "../base/AppTypography"

let useStyles = makeStyles((theme) => ({
  root: {},
  clickableLink: {
    cursor: "pointer",
  },
}))

type FormQuestionRulesProps = {questionId: number}
export default function FormQuestionRules(props: FormQuestionRulesProps) {
  let classes = useStyles(props)

  let [editorModalOpen, setEditorModalOpen] = useState(false)

  let [currentQuestion] = useFormQuestion(props.questionId)

  return currentQuestion ? (
    <>
      <Typography variant="body1">
        {currentQuestion.form_question_rules.length} rules{" "}
        <Link
          variant="inherit"
          className={classes.clickableLink}
          onClick={() => setEditorModalOpen(true)}>
          <Edit fontSize="inherit" />
        </Link>
      </Typography>
      <FormQuestionRulesModal
        questionId={props.questionId}
        open={editorModalOpen}
        onClose={() => setEditorModalOpen(false)}
      />
    </>
  ) : (
    <></>
  )
}

type FormQuestionRulesModalProps = {
  questionId: number
  open?: boolean
  onClose?: () => void
}
export function FormQuestionRulesModal(props: FormQuestionRulesModalProps) {
  let [question, questionLoading] = useFormQuestion(props.questionId)
  let [newRuleActive, setNewRuleActive] = useState(false)
  return (
    <Dialog
      disablePortal
      fullWidth
      maxWidth="md"
      open={!!props.open}
      onClose={props.onClose}>
      {questionLoading ? (
        <AppLoadingScreen />
      ) : question ? (
        <>
          <DialogTitle>
            Question Rules
            <Typography variant="body1">
              This question will only be shown if{" "}
              <AppTypography variant="inherit" fontWeight="bold">
                all
              </AppTypography>{" "}
              the following conditions are met.
            </Typography>
          </DialogTitle>
          <DialogContent>
            {question.form_question_rules.map((ruleId, index) => (
              <EditQuestionRule ruleId={ruleId} index={index + 1} />
            ))}
            {newRuleActive || !question.form_question_rules.length ? (
              <NewQuestionRule
                questionId={props.questionId}
                onDelete={() => setNewRuleActive(false)}
                onAddSuccess={() => setNewRuleActive(false)}
              />
            ) : undefined}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setNewRuleActive(true)}
              disabled={newRuleActive}>
              Add rule
            </Button>
          </DialogActions>
        </>
      ) : (
        <DialogContent>Something went wrong</DialogContent>
      )}
    </Dialog>
  )
}

function NewQuestionRule(props: {
  questionId: number
  onDelete: () => void
  onAddSuccess: () => void
}) {
  let dispatch = useDispatch()
  let [question, questionLoading] = useFormQuestion(props.questionId)
  let [form, formLoading] = useForm(question?.form_id || -1)
  let formik = useFormik<
    Omit<FormQuestionRuleModel, "id" | "form_question_id">
  >({
    initialValues: {
      depends_on_form_question_id: -1,
      depends_on_select_option_id: -1,
    },
    validationSchema: yup.object({
      depends_on_form_question_id: yup.number().positive(),
      depends_on_select_options_id: yup.number().positive(),
    }),
    onSubmit: async (values) => {
      let postResponse = (await dispatch(
        postFormQuestionRule({...values, form_question_id: props.questionId})
      )) as unknown as ApiAction
      if (!postResponse.error) {
        props.onAddSuccess()
      }
    },
  })
  let questions =
    form && question
      ? form.questions.slice(
          0,
          form.questions.indexOf(question.id) === -1
            ? undefined
            : form.questions.indexOf(question.id)
        )
      : []
  let {submitForm} = formik
  useEffect(() => {
    submitForm()
  }, [formik.values.depends_on_select_option_id, submitForm])
  return questionLoading || formLoading ? (
    <>Loading...</>
  ) : question && form ? (
    <FormQuestionRuleSelector
      index={<Add fontSize="inherit" />}
      questions={questions}
      dependsOnQuestionId={formik.values.depends_on_form_question_id}
      dependsOnOptionId={formik.values.depends_on_select_option_id}
      onUpdateQuestionId={(questionId) => {
        formik.setFieldValue("depends_on_form_question_id", questionId)
        formik.setFieldValue("depends_on_select_option_id", -1)
      }}
      onUpdateOptionId={(optionId) =>
        formik.setFieldValue("depends_on_select_option_id", optionId)
      }
    />
  ) : (
    <>Something went wrong</>
  )
}

function EditQuestionRule(props: {ruleId: number; index: number}) {
  let dispatch = useDispatch()
  let [questionRule, questionRuleLoading] = useFormQuestionRule(props.ruleId)
  let [question, questionLoading] = useFormQuestion(
    questionRule?.form_question_id || -1
  )
  let [form, formLoading] = useForm(question?.form_id || -1)
  let formik = useFormik<
    Omit<FormQuestionRuleModel, "id" | "form_question_id">
  >({
    enableReinitialize: true,
    initialValues: {
      depends_on_form_question_id:
        questionRule?.depends_on_form_question_id || -1,
      depends_on_select_option_id:
        questionRule?.depends_on_select_option_id || -1,
    },
    validationSchema: yup.object({
      depends_on_form_question_id: yup.number().positive(),
      depends_on_select_options_id: yup.number().positive(),
    }),
    onSubmit: (values) => {
      if (formik.initialValues !== values) {
        dispatch(patchFormQuestionRule(props.ruleId, {...values}))
      }
    },
  })
  let {submitForm} = formik
  useEffect(() => {
    submitForm()
  }, [formik.values.depends_on_select_option_id, submitForm])
  let questions =
    form && question
      ? form.questions.slice(
          0,
          form.questions.indexOf(question.id) === -1
            ? undefined
            : form.questions.indexOf(question.id)
        )
      : []
  return questionLoading || formLoading || questionRuleLoading ? (
    <>Loading...</>
  ) : question && form && questionRule ? (
    <FormQuestionRuleSelector
      index={props.index}
      onDeleteRule={() => dispatch(deleteFormQuestionRule(questionRule!.id))}
      questions={questions}
      dependsOnQuestionId={formik.values.depends_on_form_question_id}
      dependsOnOptionId={formik.values.depends_on_select_option_id}
      onUpdateQuestionId={(questionId) => {
        formik.setFieldValue("depends_on_form_question_id", questionId)
        formik.setFieldValue("depends_on_select_option_id", -1)
      }}
      onUpdateOptionId={(optionId) =>
        formik.setFieldValue("depends_on_select_option_id", optionId)
      }
    />
  ) : (
    <>Something went wrong</>
  )
}

/** Question Rule Selector Components */
let useQuestionRuleSelectorStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ruleNumber: {width: "4ch"},
  titleContainer: {maxWidth: 200},
  select: {
    minWidth: 200,
    flex: 1,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  hidden: {opacity: 0},
}))
type FormQuestionRuleSelectorProps = {
  index?: number | ReactNode
  questions: number[]
  dependsOnOptionId?: number
  dependsOnQuestionId?: number
  onUpdateOptionId: (optionId: number) => void
  onUpdateQuestionId: (questionId: number) => void
  onDeleteRule?: () => void
}
function FormQuestionRuleSelector(props: FormQuestionRuleSelectorProps) {
  let classes = useQuestionRuleSelectorStyles()
  let dispatch = useDispatch()
  let [question, questionLoading] = useFormQuestion(
    props.dependsOnQuestionId || -1
  )
  let formQuestions = useSelector(
    (state: RootState) => state.form.formQuestions
  )
  let questionOptions = useSelector(
    (state: RootState) => state.form.questionOptions
  )

  function getQuestionTitle(question: FormQuestionModel) {
    return question.title ? question.title : "Untitled question"
  }

  function getOptionName(option: FormQuestionSelectOptionModel) {
    return option.option ? option.option : "Untitled option"
  }

  let textFieldProps: TextFieldProps = {
    variant: "outlined",
    size: "small",
    SelectProps: {
      MenuProps: {disablePortal: true},
      native: false,
    },
    select: true,
  }

  return (
    <div className={classes.root}>
      <AppTypography
        variant="body1"
        fontWeight="bold"
        className={classes.ruleNumber}>
        {props.index ? (
          typeof props.index === "number" ? (
            `${props.index}.`
          ) : (
            props.index
          )
        ) : (
          <>&nbsp;</>
        )}
      </AppTypography>
      {questionLoading ? (
        "Loading..."
      ) : (
        <>
          <TextField
            {...textFieldProps}
            className={classes.select}
            value={props.dependsOnQuestionId}
            label="Question"
            onChange={(e) =>
              props.onUpdateQuestionId(parseInt(e.target.value))
            }>
            {[
              props.dependsOnQuestionId === -1 ? (
                <MenuItem value={-1} key={-1} disabled>
                  Select a question
                </MenuItem>
              ) : undefined,
              ...props.questions.map((id) => {
                let question = formQuestions[id]
                if (!question) {
                  dispatch(getFormQuestion(id))
                }
                if (
                  question &&
                  !["MULTI_SELECT", "SINGLE_SELECT"].includes(question.type)
                ) {
                  return undefined
                }
                return (
                  <MenuItem key={id} value={id}>
                    {question ? getQuestionTitle(question) : "Loading..."}
                  </MenuItem>
                )
              }),
            ]}
          </TextField>
          <Typography variant="body1">is</Typography>
          <TextField
            {...textFieldProps}
            label="Answer"
            className={classes.select}
            disabled={!question}
            value={props.dependsOnOptionId}
            onChange={(e) => props.onUpdateOptionId(parseInt(e.target.value))}>
            {!question ? (
              <MenuItem value={-1}>Select a question first</MenuItem>
            ) : (
              props.dependsOnOptionId === -1 && (
                <MenuItem value={-1} disabled>
                  Select an option
                </MenuItem>
              )
            )}
            {question &&
              question.select_options.map((id) => {
                let selectOption = questionOptions[id]
                return (
                  <MenuItem value={id} key={id}>
                    {selectOption
                      ? getOptionName(selectOption)
                      : "Loading options..."}
                  </MenuItem>
                )
              })}
          </TextField>
          <IconButton
            disabled={!props.onDeleteRule}
            onClick={props.onDeleteRule}
            className={clsx(!props.onDeleteRule ? classes.hidden : undefined)}>
            <Delete />
          </IconButton>
        </>
      )}
    </div>
  )
}
