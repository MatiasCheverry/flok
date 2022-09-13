import {
  makeStyles,
  TextField,
  TextFieldProps,
  Typography,
} from "@material-ui/core"
import clsx from "clsx"
import {useFormik} from "formik"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {patchForm, patchFormQuestion} from "../../store/actions/form"

let useFormHeaderStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
  },
  formTitle: {
    ...theme.typography.h1,
  },
  formDescription: {
    whiteSpace: "pre-wrap",
    ...theme.typography.body1,
  },
  editableText: {
    width: "100%",
    borderBottomStyle: "dashed",
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey[700],
  },
}))

type FormHeaderProps = {
  formId: number
  title: string
  description: string
  editable?: boolean
}

export function FormHeader(props: FormHeaderProps) {
  let classes = useFormHeaderStyles()
  let dispatch = useDispatch()
  let titleFormik = useFormik({
    initialValues: {
      title: props.title,
    },
    onSubmit: (values) => {
      let patchData: {title?: string; description?: string} = {}
      if (values.title !== props.title) {
        patchData.title = values.title
      }
      if (Object.keys(patchData).length) {
        dispatch(patchForm(props.formId, patchData))
      }
    },
    enableReinitialize: true,
  })

  let descriptionFormik = useFormik({
    initialValues: {
      description: props.description,
    },
    onSubmit: (values) => {
      let patchData: {title?: string; description?: string} = {}
      if (values.description !== props.description) {
        patchData.description = values.description
      }
      if (Object.keys(patchData).length) {
        dispatch(patchForm(props.formId, patchData))
      }
    },
    enableReinitialize: true,
  })

  const commonTextFieldProps: TextFieldProps = {
    variant: "outlined",
    fullWidth: true,
    size: "small",
    spellCheck: true,
  }
  let [editActive, setEditActive] = useState(false)
  return (
    <div
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
      {editActive && props.editable ? (
        <form className={classes.root}>
          <TextField
            {...commonTextFieldProps}
            id="title"
            value={titleFormik.values.title ?? ""}
            onChange={titleFormik.handleChange}
            onBlur={() => titleFormik.handleSubmit()}
            placeholder={"Form title"}
            InputProps={{
              className: classes.formTitle,
            }}
          />
          <TextField
            {...commonTextFieldProps}
            id="description"
            value={descriptionFormik.values.description ?? ""}
            onChange={descriptionFormik.handleChange}
            onBlur={() => descriptionFormik.handleSubmit()}
            placeholder={"(Optional) form description"}
            InputProps={{
              className: classes.formDescription,
            }}
            multiline
            rows={2}
            rowsMax={10}
          />
        </form>
      ) : (
        <div className={classes.root}>
          <Typography
            variant="inherit"
            component="h1"
            className={clsx(
              classes.formTitle,
              props.editable ? classes.editableText : undefined
            )}>
            {titleFormik.values.title}
          </Typography>
          <Typography
            variant="inherit"
            component="p"
            className={clsx(
              classes.formDescription,
              props.editable ? classes.editableText : undefined
            )}>
            {descriptionFormik.values.description || !props.editable ? (
              descriptionFormik.values.description
            ) : (
              <Typography
                variant="inherit"
                component="span"
                color="textSecondary">
                (Optional) Form description
              </Typography>
            )}
          </Typography>
        </div>
      )}
    </div>
  )
}

let useFormQuestionHeaderStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
  },
  questionTitle: {
    ...theme.typography.body1,
    fontWeight: theme.typography.fontWeightBold,
  },
  questionDescription: {
    whiteSpace: "pre-wrap",
    ...theme.typography.body2,
  },
  editableText: {
    width: "100%",
    borderBottomStyle: "dashed",
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey[700],
    "&:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
  },
}))

type FormQuestionHeaderProps = {
  questionId: number
  title: string
  description: string
  editable?: "both" | "descriptionOnly"
  editActive?: boolean
  required?: boolean
}

export function FormQuestionHeader(props: FormQuestionHeaderProps) {
  let classes = useFormQuestionHeaderStyles()
  let dispatch = useDispatch()
  let titleFormik = useFormik({
    initialValues: {
      title: props.title,
    },
    onSubmit: (values) => {
      let patchData: {title?: string; description?: string} = {}
      if (values.title !== props.title) {
        patchData.title = values.title
      }
      if (Object.keys(patchData).length) {
        dispatch(patchFormQuestion(props.questionId, patchData))
      }
    },
    enableReinitialize: true,
  })

  let descriptionFormik = useFormik({
    initialValues: {
      description: props.description,
    },
    onSubmit: (values) => {
      let patchData: {title?: string; description?: string} = {}
      if (values.description !== props.description) {
        patchData.description = values.description
      }
      if (Object.keys(patchData).length) {
        dispatch(patchFormQuestion(props.questionId, patchData))
      }
    },
    enableReinitialize: true,
  })
  const commonTextFieldProps: TextFieldProps = {
    variant: "outlined",
    fullWidth: true,
    size: "small",
    spellCheck: true,
  }

  return props.editable === "both" && props.editActive ? (
    <form className={classes.root}>
      <TextField
        {...commonTextFieldProps}
        id="title"
        required={props.required}
        value={titleFormik.values.title ?? ""}
        onChange={titleFormik.handleChange}
        onBlur={() => titleFormik.handleSubmit()}
        placeholder={"Question header"}
        InputProps={{
          className: classes.questionTitle,
        }}
      />
      <TextField
        {...commonTextFieldProps}
        id="description"
        value={descriptionFormik.values.description ?? ""}
        onChange={descriptionFormik.handleChange}
        onBlur={() => descriptionFormik.handleSubmit()}
        placeholder={"(Optional) question description"}
        InputProps={{
          className: classes.questionDescription,
        }}
        multiline
        rows={2}
        rowsMax={10}
      />
    </form>
  ) : props.editable === "descriptionOnly" && props.editActive ? (
    <form className={classes.root}>
      <Typography
        variant="inherit"
        component="h1"
        className={clsx(
          classes.questionTitle,
          props.editable ? classes.editableText : undefined
        )}>
        {titleFormik.values.title || !props.editable ? (
          titleFormik.values.title
        ) : (
          <Typography variant="inherit" component="span" color="textSecondary">
            Question title
          </Typography>
        )}
        {props.required ? (
          <>
            &nbsp;<sup style={{color: "red"}}>*</sup>
          </>
        ) : undefined}
      </Typography>
      <TextField
        {...commonTextFieldProps}
        id="description"
        value={descriptionFormik.values.description ?? ""}
        onChange={descriptionFormik.handleChange}
        onBlur={() => descriptionFormik.handleSubmit()}
        placeholder={"(Optional) question description"}
        InputProps={{
          className: classes.questionDescription,
        }}
        multiline
        rows={2}
        rowsMax={10}
      />
    </form>
  ) : (
    <div tabIndex={-1}>
      <Typography
        variant="inherit"
        component="h1"
        className={clsx(
          classes.questionTitle,
          props.editable ? classes.editableText : undefined
        )}>
        {titleFormik.values.title || !props.editable ? (
          titleFormik.values.title
        ) : (
          <Typography variant="inherit" component="span" color="textSecondary">
            Question title
          </Typography>
        )}
        {props.required ? (
          <>
            &nbsp;<sup style={{color: "red"}}>*</sup>
          </>
        ) : undefined}
      </Typography>
      <Typography
        variant="inherit"
        component="p"
        className={clsx(
          classes.questionDescription,
          props.editable ? classes.editableText : undefined
        )}>
        {descriptionFormik.values.description || !props.editable ? (
          descriptionFormik.values.description
        ) : (
          <Typography variant="inherit" component="span" color="textSecondary">
            (Optional) question description
          </Typography>
        )}
      </Typography>
    </div>
  )
}
