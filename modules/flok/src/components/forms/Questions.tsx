import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  ListItem,
  makeStyles,
  MenuItem,
  Popover,
  Radio,
  Switch,
  TextField,
} from "@material-ui/core"
import {Add, CalendarToday, Delete, DragIndicator} from "@material-ui/icons"
import {Alert} from "@material-ui/lab"
import clsx from "clsx"
import {useFormik} from "formik"
import React, {useEffect, useState} from "react"
import {DraggableProvidedDragHandleProps} from "react-beautiful-dnd"
import {useDispatch} from "react-redux"
import {
  FormQuestionModel,
  FormQuestionSnapshotModel,
  FormQuestionType,
  FormQuestionTypeEnum,
  FormQuestionTypeName,
  FormQuestionTypeValues,
} from "../../models/form"
import {
  deleteFormQuestion,
  deleteFormQuestionOption,
  patchFormQuestion,
  patchFormQuestionOption,
  postFormQuestion,
  postFormQuestionOption,
} from "../../store/actions/form"
import {useFormQuestionOption} from "../../utils/formUtils"
import AppLoadingScreen from "../base/AppLoadingScreen"
import AppTypography from "../base/AppTypography"
import {useFormQuestion} from "./FormQuestionProvider"
import FormQuestionRules from "./FormQuestionRules"
import {FormQuestionHeader} from "./Headers"

let useQuestionStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    flexDirection: "column",
    "&:not(:hover) $dragIndicatorDiv:not(.draggable)": {
      opacity: 0,
    },
  },
  questionHeaderContainer: {
    display: "flex",
    flexDirection: "row",
    marginBottom: theme.spacing(4),
  },
  questionTitleSubtitle: {
    flex: 1,
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
  },
  formQuestionTitleInput: {
    ...theme.typography.body1,
    fontWeight: theme.typography.fontWeightBold,
  },
  formQuestionDescriptionInput: {
    ...theme.typography.body2,
  },
  formQuestionActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(2),
    "& > *:last-child": {
      marginLeft: theme.spacing(1),
    },
    "& > *:first-child": {
      display: "flex",
      alignItems: "center",
      marginRight: "auto",
      "& > *:nth-child(2)": {
        marginLeft: theme.spacing(1),
      },
    },
  },
  dragIndicator: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: `-${theme.spacing(1.5)}px`,
    transform: "rotate(90deg)",
  },
  dragIndicatorDiv: {},
  dragIndicatorWrapper: {
    display: "flex",
  },
  alert: {
    marginBottom: theme.spacing(1),
  },
}))

type RegFormBuilderQuestionProps = {
  dragHandleProps: DraggableProvidedDragHandleProps | undefined
  isDragging: boolean
}
export function RegFormBuilderQuestion(props: RegFormBuilderQuestionProps) {
  let classes = useQuestionStyles()
  let [editActive, setEditActive] = useState(false)
  let question = useFormQuestion()
  let dispatch = useDispatch()
  let [deleteLoading, setDeleteLoading] = useState(false)
  let [patchTypeLoading, setPatchTypeLoading] = useState(false)
  let requiredFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      required: question.required ?? false,
    },
    onSubmit: (values) => {
      if (values.required !== question.required) {
        dispatch(patchFormQuestion(question.id, {required: values.required}))
      }
    },
  })
  return (
    <div
      className={classes.root}
      onClick={() => setEditActive(true)}
      onFocus={() => setEditActive(true)}
      onBlur={(e) => {
        if (
          e.relatedTarget == null ||
          e.currentTarget == null ||
          !e.currentTarget.contains(e.relatedTarget as Node)
        ) {
          setEditActive(false)
        }
      }}
      tabIndex={0}>
      <div
        className={clsx(
          classes.dragIndicatorDiv,
          editActive || props.isDragging ? "draggable" : undefined
        )}>
        <div
          {...props.dragHandleProps}
          className={classes.dragIndicatorWrapper}>
          <DragIndicator fontSize="small" className={classes.dragIndicator} />
        </div>
      </div>
      {editActive && question.non_editable ? (
        <Alert severity="warning" className={classes.alert}>
          Some fields in Flok required questions aren't editable
        </Alert>
      ) : (
        <></>
      )}
      <div className={classes.questionHeaderContainer}>
        <div className={classes.questionTitleSubtitle}>
          <FormQuestionHeader
            required={requiredFormik.values.required}
            title={question.title}
            description={question.description ?? ""}
            questionId={question.id}
            editable={question.non_editable ? "descriptionOnly" : "both"}
            editActive={editActive}
          />
        </div>
      </div>
      <RegFormBuilderQuestionSwitch question={question} />
      {editActive &&
        (question.type === "DATE" || question.type === "DATETIME") && (
          <RegFormBuilderDateMinMax question={question} />
        )}
      {editActive && (
        <div className={classes.formQuestionActions}>
          <div>
            <FormControl>
              <FormControlLabel
                disabled={question.non_editable}
                checked={requiredFormik.values.required}
                onChange={async (e, checked) => {
                  await requiredFormik.setFieldValue("required", checked)
                  requiredFormik.submitForm()
                }}
                control={<Switch color="primary" />}
                label="Required?"
              />
            </FormControl>
            <FormQuestionRules questionId={question.id} />
          </div>
          <TextField
            variant="outlined"
            select
            disabled={question.non_editable}
            size="small"
            onChange={async (e) => {
              let type = e.target.value as FormQuestionType
              if (type !== question.type) {
                setPatchTypeLoading(true)
                await dispatch(patchFormQuestion(question.id, {type}))
                setPatchTypeLoading(false)
              }
            }}
            value={
              patchTypeLoading ? "loading" : question.type || "SHORT_ANSWER"
            }
            SelectProps={{
              MenuProps: {disablePortal: true},
              native: false,
            }}>
            {patchTypeLoading ? (
              <MenuItem value="loading">
                &nbsp;&nbsp;&nbsp;
                <CircularProgress size="15px" />
                &nbsp;&nbsp;&nbsp;
              </MenuItem>
            ) : (
              FormQuestionTypeValues.map((type) => (
                <MenuItem value={type} key={type}>
                  {FormQuestionTypeName[type] ?? type}
                </MenuItem>
              ))
            )}
          </TextField>
          <div style={{display: "flex", alignItems: "center"}}>
            <IconButton
              size="small"
              disabled={deleteLoading || question.non_editable}
              onClick={async () => {
                setDeleteLoading(true)
                await dispatch(deleteFormQuestion(question.id))
                setDeleteLoading(false)
              }}>
              {deleteLoading ? <CircularProgress size={25} /> : <Delete />}
            </IconButton>
          </div>
        </div>
      )}
    </div>
  )
}

type RegFormViewerQuestionProps = {
  value: string
  onChange: (newVal: string) => void
  onLoad: (question: FormQuestionModel) => void
  onUnload: (question: FormQuestionModel) => void
  readOnly?: boolean
}

/**
 * Needs to be rendered in a FormQuestionProvider
 */
export function RegFormViewerQuestion(props: RegFormViewerQuestionProps) {
  let classes = useQuestionStyles()
  let question = useFormQuestion()

  useEffect(() => {
    props.onLoad(question)
    return () => props.onUnload(question)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={classes.root}>
      <div className={classes.questionHeaderContainer}>
        <div className={classes.questionTitleSubtitle}>
          <FormQuestionHeader
            required={question.required}
            title={question.title}
            description={question.description ?? ""}
            questionId={question.id}
          />
        </div>
      </div>
      <RegFormViewerQuestionSwitch
        minDate={question.min_date}
        maxDate={question.max_date}
        question={question}
        value={props.value}
        onChange={props.onChange}
        readOnly={props.readOnly}
      />
    </div>
  )
}

type RegFormResponseViewerQuestionProps = {
  question: FormQuestionSnapshotModel
  value: string
  onChange: (newVal: string) => void
  onLoad: (question: FormQuestionModel) => void
  readOnly?: boolean
}

/**
 * Needs to be rendered in a FormQuestionProvider
 */
export function RegFormResponseViewerQuestion(
  props: RegFormResponseViewerQuestionProps
) {
  let classes = useQuestionStyles()

  return (
    <div className={classes.root}>
      <div className={classes.questionHeaderContainer}>
        <div className={classes.questionTitleSubtitle}>
          <FormQuestionHeader
            required={props.question.required}
            title={props.question.title}
            description={props.question.description ?? ""}
            questionId={props.question.id}
          />
        </div>
      </div>
      <RegFormViewerQuestionSwitch
        question={props.question}
        value={props.value}
        onChange={props.onChange}
        readOnly={props.readOnly}
      />
    </div>
  )
}

function RegFormBuilderQuestionSwitch(props: {question: FormQuestionModel}) {
  function render(questionType: typeof props.question.type) {
    switch (questionType) {
      case FormQuestionTypeEnum.SHORT_ANSWER:
        return (
          <RegFormBuilderTextQuestion
            type={FormQuestionTypeEnum.SHORT_ANSWER}
          />
        )
      case FormQuestionTypeEnum.LONG_ANSWER:
        return (
          <RegFormBuilderTextQuestion type={FormQuestionTypeEnum.LONG_ANSWER} />
        )
      case FormQuestionTypeEnum.SINGLE_SELECT:
        return (
          <RegFormBuilderSelectQuestion
            nonEditable={props.question.non_editable}
            type={FormQuestionTypeEnum.SINGLE_SELECT}
            optionIds={props.question.select_options}
            questionId={props.question.id}
          />
        )
      case FormQuestionTypeEnum.MULTI_SELECT:
        return (
          <RegFormBuilderSelectQuestion
            nonEditable={props.question.non_editable}
            type={FormQuestionTypeEnum.MULTI_SELECT}
            optionIds={props.question.select_options}
            questionId={props.question.id}
          />
        )
      case FormQuestionTypeEnum.DATE:
        return <RegFormBuilderDateQuestion type={FormQuestionTypeEnum.DATE} />
      case FormQuestionTypeEnum.DATETIME:
        return (
          <RegFormBuilderDateQuestion type={FormQuestionTypeEnum.DATETIME} />
        )
      default:
        return <div>Something went wrong</div>
    }
  }
  return render(props.question.type)
}
type RegFormViewerQuestionSwitchProps = {
  question: FormQuestionModel
  value: string
  onChange: (newVal: string) => void
  readOnly?: boolean
  minDate?: string
  maxDate?: string
}

function RegFormViewerQuestionSwitch(props: RegFormViewerQuestionSwitchProps) {
  function render(questionType: typeof props.question.type) {
    switch (questionType) {
      case FormQuestionTypeEnum.SHORT_ANSWER:
        return (
          <RegFormViewerTextQuestion
            type={FormQuestionTypeEnum.SHORT_ANSWER}
            value={props.value}
            onChange={props.onChange}
            readOnly={props.readOnly}
          />
        )
      case FormQuestionTypeEnum.LONG_ANSWER:
        return (
          <RegFormViewerTextQuestion
            type={FormQuestionTypeEnum.LONG_ANSWER}
            value={props.value}
            onChange={props.onChange}
            readOnly={props.readOnly}
          />
        )
      case FormQuestionTypeEnum.SINGLE_SELECT:
        return (
          <RegFormViewerSelectQuestion
            value={props.value}
            onChange={props.onChange}
            type={FormQuestionTypeEnum.SINGLE_SELECT}
            optionIds={props.question.select_options}
            questionId={props.question.id}
            readOnly={props.readOnly}
          />
        )
      case FormQuestionTypeEnum.MULTI_SELECT:
        return (
          <RegFormViewerSelectQuestion
            value={props.value}
            onChange={props.onChange}
            type={FormQuestionTypeEnum.MULTI_SELECT}
            optionIds={props.question.select_options}
            questionId={props.question.id}
            readOnly={props.readOnly}
          />
        )
      case FormQuestionTypeEnum.DATE:
        return (
          <RegFormViewerDateQuestion
            minDate={props.minDate}
            maxDate={props.maxDate}
            value={props.value}
            onChange={props.onChange}
            type={FormQuestionTypeEnum.DATE}
            readOnly={props.readOnly}
          />
        )
      case FormQuestionTypeEnum.DATETIME:
        return (
          <RegFormViewerDateQuestion
            minDate={props.question.min_date}
            maxDate={props.question.max_date}
            value={props.value}
            onChange={props.onChange}
            type={FormQuestionTypeEnum.DATETIME}
            readOnly={props.readOnly}
          />
        )
      default:
        return <div>Something went wrong</div>
    }
  }
  return render(props.question.type)
}

let useTextQuestionStyles = makeStyles((theme) => ({
  root: {},
  formQuestionTextInput: {
    ...theme.typography.body1,
  },
}))

type RegFormBuilderTextQuestionProps = {
  type: FormQuestionTypeEnum.SHORT_ANSWER | FormQuestionTypeEnum.LONG_ANSWER
}
function RegFormBuilderTextQuestion(props: RegFormBuilderTextQuestionProps) {
  let classes = useTextQuestionStyles()
  return (
    <TextField
      variant="outlined"
      disabled
      fullWidth
      InputProps={{
        className: classes.formQuestionTextInput,
      }}
      multiline={props.type === FormQuestionTypeEnum.LONG_ANSWER}
      rows={props.type === FormQuestionTypeEnum.LONG_ANSWER ? 3 : undefined}
      rowsMax={props.type === FormQuestionTypeEnum.LONG_ANSWER ? 3 : undefined}
      placeholder={`${FormQuestionTypeName[props.type]}`}
    />
  )
}

type RegFormViewerTextQuestionProps = {
  type: FormQuestionTypeEnum.SHORT_ANSWER | FormQuestionTypeEnum.LONG_ANSWER
  value: string
  onChange: (newVal: string) => void
  readOnly?: boolean
}
function RegFormViewerTextQuestion(props: RegFormViewerTextQuestionProps) {
  let classes = useTextQuestionStyles()
  return (
    <TextField
      onChange={(e) => props.onChange(e.target.value)}
      value={props.value}
      variant="outlined"
      fullWidth
      InputProps={{
        readOnly: props.readOnly,
        className: classes.formQuestionTextInput,
      }}
      multiline={props.type === FormQuestionTypeEnum.LONG_ANSWER}
      rows={props.type === FormQuestionTypeEnum.LONG_ANSWER ? 3 : undefined}
      rowsMax={props.type === FormQuestionTypeEnum.LONG_ANSWER ? 3 : undefined}
      placeholder={`${FormQuestionTypeName[props.type]}`}
    />
  )
}

let useSelectQuestionStyles = makeStyles((theme) => ({
  root: {},
  addOptionButton: {
    display: "flex",
    marginTop: theme.spacing(1),
  },
}))

type RegFormBuilderSelectQuestionProps = {
  type: FormQuestionTypeEnum.MULTI_SELECT | FormQuestionTypeEnum.SINGLE_SELECT
  optionIds: number[]
  questionId: number
  nonEditable?: boolean
}
export function RegFormBuilderSelectQuestion(
  props: RegFormBuilderSelectQuestionProps
) {
  let classes = useSelectQuestionStyles()
  let dispatch = useDispatch()
  let [loadingPost, setLoadingPost] = useState(false)
  return (
    <FormControl>
      <FormGroup>
        {props.optionIds.map((optionId, i) => {
          return (
            <SelectQuestionLabel
              key={optionId}
              optionId={optionId}
              type={props.type}
              nonEditable={props.nonEditable}
            />
          )
        })}
        <div className={classes.addOptionButton}>
          <Button
            disabled={loadingPost || props.nonEditable}
            size="small"
            onClick={async () => {
              setLoadingPost(true)
              await dispatch(
                postFormQuestionOption({
                  form_question_id: props.questionId,
                  option: "",
                })
              )
              setLoadingPost(false)
            }}>
            {loadingPost ? (
              <CircularProgress size="20px" />
            ) : (
              <>
                <Add /> Add option
              </>
            )}
          </Button>
        </div>
      </FormGroup>
    </FormControl>
  )
}

type RegFormViewerSelectQuestionProps = {
  value: string
  onChange: (newVal: string) => void
  type: FormQuestionTypeEnum.MULTI_SELECT | FormQuestionTypeEnum.SINGLE_SELECT
  optionIds: number[]
  questionId: number
  readOnly?: boolean
}
export function RegFormViewerSelectQuestion(
  props: RegFormViewerSelectQuestionProps
) {
  let [selectedOptions, setSelectedOptions] = useState(props.value.split(","))
  useEffect(() => {
    setSelectedOptions(props.value.split(","))
  }, [props.value])
  return (
    <FormControl>
      <FormGroup>
        {props.optionIds.map((optionId, i) => {
          return (
            <SelectQuestionViewerLabel
              onChange={(newVal) => props.onChange(newVal.join(","))}
              value={selectedOptions}
              optionId={optionId}
              type={props.type}
              readOnly={props.readOnly}
            />
          )
        })}
      </FormGroup>
    </FormControl>
  )
}

let useSelectOptionStyles = makeStyles((theme) => ({
  label: {
    flex: 1,
  },
  labelInput: {
    display: "flex",
    alignContent: "flex-end",
    "& > :last-child:not(.loading)": {
      opacity: 0,
    },
    "&:hover": {
      "& > :last-child": {
        opacity: "100%",
      },
    },
  },
}))

function SelectQuestionLabel(props: {
  optionId: number
  type:
    | typeof FormQuestionTypeEnum.MULTI_SELECT
    | typeof FormQuestionTypeEnum.SINGLE_SELECT
  nonEditable?: boolean
}) {
  let classes = useSelectOptionStyles()
  let dispatch = useDispatch()

  let [option, loadingOption] = useFormQuestionOption(props.optionId)
  let formik = useFormik({
    initialValues: {
      option: option?.option || "",
    },
    onSubmit: (values) => {
      if (option && option.option !== values.option) {
        dispatch(patchFormQuestionOption(option.id, values))
      }
    },
    enableReinitialize: true,
  })
  let [deleteLoading, setDeleteLoading] = useState(false)
  let control =
    props.type === FormQuestionTypeEnum.MULTI_SELECT ? (
      <Checkbox checked={false} />
    ) : (
      <Radio checked={false} />
    )
  return option ? (
    <FormControlLabel
      disabled
      classes={{label: classes.label}}
      value={""}
      control={control}
      label={
        <div className={classes.labelInput}>
          <TextField
            disabled={props.nonEditable}
            fullWidth
            id="option"
            value={formik.values.option}
            onBlur={() => formik.handleSubmit()}
            onChange={formik.handleChange}
          />
          <IconButton
            className={clsx(deleteLoading ? "loading" : undefined)}
            size="small"
            disabled={deleteLoading || props.nonEditable}
            onClick={async () => {
              setDeleteLoading(true)
              await dispatch(deleteFormQuestionOption(props.optionId))
              setDeleteLoading(false)
            }}>
            {deleteLoading ? <CircularProgress size={25} /> : <Delete />}
          </IconButton>
        </div>
      }
    />
  ) : loadingOption ? (
    <FormControlLabel
      value={""}
      control={control}
      label={
        <Box height="50px" width="100px" position="relative">
          <CircularProgress />
        </Box>
      }
    />
  ) : (
    <></>
  )
}

function SelectQuestionViewerLabel(props: {
  value: string[]
  onChange: (newVal: string[]) => void
  readOnly?: boolean
  optionId: number
  type:
    | typeof FormQuestionTypeEnum.MULTI_SELECT
    | typeof FormQuestionTypeEnum.SINGLE_SELECT
}) {
  let classes = useSelectOptionStyles()
  let [option, loadingOption] = useFormQuestionOption(props.optionId)

  return option ? (
    <FormControlLabel
      classes={{label: classes.label}}
      onChange={(e, checked) => {
        if (checked) {
          if (props.type === FormQuestionTypeEnum.MULTI_SELECT) {
            props.onChange([...props.value, option!.option])
          } else {
            props.onChange([option!.option])
          }
        } else {
          props.onChange(props.value.filter((val) => val !== option!.option))
        }
      }}
      control={
        props.type === FormQuestionTypeEnum.MULTI_SELECT ? (
          <Checkbox
            readOnly={props.readOnly}
            checked={props.value.includes(option.option)}
          />
        ) : (
          <Radio
            readOnly={props.readOnly}
            checked={props.value.includes(option.option)}
          />
        )
      }
      label={option.option}
    />
  ) : loadingOption ? (
    <FormControlLabel
      disabled
      value={""}
      control={
        props.type === FormQuestionTypeEnum.MULTI_SELECT ? (
          <Checkbox checked={false} />
        ) : (
          <Radio checked={false} />
        )
      }
      label={
        <Box height="50px" width="100px" position="relative">
          <CircularProgress />
        </Box>
      }
    />
  ) : (
    <></>
  )
}

type RegFormBuilderDateQuestionProps = {
  type: FormQuestionTypeEnum.DATE | FormQuestionTypeEnum.DATETIME
}
function RegFormBuilderDateQuestion(props: RegFormBuilderDateQuestionProps) {
  return (
    <TextField
      variant="outlined"
      type={
        props.type === FormQuestionTypeEnum.DATETIME ? "datetime-local" : "date"
      }
      InputProps={{
        endAdornment: <CalendarToday fontSize="inherit" />,
      }}
      disabled
    />
  )
}

type RegFormViewerDateQuestionProps = {
  type: FormQuestionTypeEnum.DATE | FormQuestionTypeEnum.DATETIME
  value: string
  onChange: (newVal: string) => void
  readOnly?: boolean
  minDate?: string
  maxDate?: string
}
function RegFormViewerDateQuestion(props: RegFormViewerDateQuestionProps) {
  return (
    <TextField
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      variant="outlined"
      InputProps={{
        inputProps: {min: props.minDate, max: props.maxDate},
        readOnly: props.readOnly,
      }}
      type={
        props.type === FormQuestionTypeEnum.DATETIME ? "datetime-local" : "date"
      }
    />
  )
}

let useNewQuestionButtonStyles = makeStyles((theme) => ({
  addQuestionButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    "&:hover": {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.common.white,
    },
  },
}))
type AddNewQuestionButtonProps = {
  formId: number
}
export function AddNewQuestionButton(props: AddNewQuestionButtonProps) {
  let classes = useNewQuestionButtonStyles()
  let dispatch = useDispatch()
  const [addQuestionAnchorEl, setAddQuestionAnchorEl] =
    React.useState<HTMLButtonElement | null>(null)
  const openAddQuestionPopover = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAddQuestionAnchorEl(event.currentTarget)
  }
  const addQuestionOpen = Boolean(addQuestionAnchorEl)
  let [loadingNewQuestion, setLoadingNewQuestion] = useState(false)
  function closeNewQuestionPopover() {
    setAddQuestionAnchorEl(null)
  }
  async function postNewQuestion(questionType: FormQuestionType) {
    setLoadingNewQuestion(true)
    closeNewQuestionPopover()
    await dispatch(
      postFormQuestion({form_id: props.formId, type: questionType})
    )
    setLoadingNewQuestion(false)
  }
  return loadingNewQuestion ? (
    <Box width="100%" height="100px" position="relative">
      <AppLoadingScreen />
    </Box>
  ) : (
    <>
      <IconButton
        color="inherit"
        className={classes.addQuestionButton}
        onClick={openAddQuestionPopover}>
        <Add />
      </IconButton>
      <Popover
        anchorEl={addQuestionAnchorEl}
        open={addQuestionOpen}
        onClose={closeNewQuestionPopover}>
        <div>
          <ListItem>
            <AppTypography fontWeight="bold" variant="body1">
              Add new question
            </AppTypography>
          </ListItem>
          {FormQuestionTypeValues.map((type) => (
            <MenuItem value={type} button onClick={() => postNewQuestion(type)}>
              {FormQuestionTypeName[type] ?? type}
            </MenuItem>
          ))}
        </div>
      </Popover>
    </>
  )
}
type RegFormBuilderQuestionRestrictionsSwitchProps = {
  question: FormQuestionModel
}
let useStyles = makeStyles((theme) => ({
  datesWrapper: {
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}))
function RegFormBuilderDateMinMax(
  props: RegFormBuilderQuestionRestrictionsSwitchProps
) {
  let dispatch = useDispatch()
  let classes = useStyles()
  let [minDate, setMinDate] = useState(props.question.min_date)
  let [maxDate, setMaxDate] = useState(props.question.max_date)

  return (
    <div className={classes.datesWrapper}>
      <TextField
        variant="outlined"
        type={
          props.question.type === FormQuestionTypeEnum.DATETIME
            ? "datetime-local"
            : "date"
        }
        InputLabelProps={{shrink: true}}
        label="Earliest Date (optional)"
        fullWidth
        value={minDate}
        onChange={(e) => {
          dispatch(
            patchFormQuestion(props.question.id, {
              min_date: e.target.value,
            })
          )
          setMinDate(e.target.value)
        }}
      />
      <TextField
        value={maxDate}
        variant="outlined"
        fullWidth
        type={
          props.question.type === FormQuestionTypeEnum.DATETIME
            ? "datetime-local"
            : "date"
        }
        InputLabelProps={{shrink: true}}
        label="Latest Date (optional)"
        onChange={(e) => {
          dispatch(
            patchFormQuestion(props.question.id, {
              max_date: e.target.value,
            })
          )
          setMaxDate(e.target.value)
        }}
      />
    </div>
  )
}
