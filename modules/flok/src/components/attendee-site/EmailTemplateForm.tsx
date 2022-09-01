import {
  Button,
  Fab,
  Fade,
  InputAdornment,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
} from "@material-ui/core"
import {Add, Send} from "@material-ui/icons"
import {useFormik} from "formik"
import _ from "lodash"
import {useEffect, useRef, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {RootState} from "../../store"
import {ApiAction} from "../../store/actions/api"
import {
  getEmailTemplate,
  patchEmailTemplate,
  patchRetreat,
  postEmailTemplate,
  postSendSampleEmailTemplate,
} from "../../store/actions/retreat"
import AppImage from "../base/AppImage"

let useStyles = makeStyles((theme) => ({
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  headerPaper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  toLine: {
    marginTop: theme.spacing(1),
  },
  subjectLine: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  bodyPaper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(2),
  },
  headerImage: {
    marginLeft: "auto",
    marginRight: "auto",
  },
  sendGridBody: {
    // To match the style of text in the SendGrid email
    marginTop: 9,
    marginBottom: 9,
    fontSize: 14,
    fontFamily: "arial",
    padding: 9,
    resize: "none",
    borderRadius: theme.shape.borderRadius,
    border: "none",
  },
  sendGridButton: {
    borderRadius: 6,
    marginLeft: "auto",
    marginRight: "auto",
  },
  fab: {
    marginLeft: "auto",
  },
  buttonsDiv: {
    marginTop: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
  },
  sendButton: {
    background: theme.palette.common.white,
  },
}))
type AppEmailTemplateFormProps = {
  retreatId: number
  emailTemplateId?: number
  type: string
  typeInfo: {
    defaultId: number
    variable: string
    header: string
    subheader: string
    buttonText?: string
    buttonTooltip?: string
  }
}
export default function EmailTemplateForm(props: AppEmailTemplateFormProps) {
  let dispatch = useDispatch()
  let classes = useStyles()

  let email_template_start = useSelector((state: RootState) => {
    if (props.emailTemplateId) {
      return state.retreat.emailTemplates[props.emailTemplateId]
    } else {
      return state.retreat.emailTemplates[props.typeInfo.defaultId]
    }
  })
  let [focusBody, setFocusBody] = useState(false)
  let [focusFab, setFocusFab] = useState(false)

  const [variableMenuAnchorEl, setVariableMenuAnchorEl] =
    useState<Element | null>(null)
  const variableMenuOpen = Boolean(variableMenuAnchorEl)
  const handleCloseVariableMenu = () => {
    setVariableMenuAnchorEl(null)
  }
  function split(str: string, index: number) {
    const result = [str.slice(0, index), str.slice(index)]
    return result
  }

  const bodyRef = useRef<HTMLInputElement>()
  const [caretIndex, setCaretIndex] = useState<number | null>(null)
  const updateSelectionStart = () => {
    setCaretIndex(
      bodyRef && bodyRef.current ? bodyRef.current.selectionStart : 0
    )
  }

  let formik = useFormik({
    initialValues: {
      subject: email_template_start?.subject ?? "",
      body: email_template_start?.body ?? "",
    },
    onSubmit: async () => {
      if (!props.emailTemplateId) {
        let response = (await dispatch(
          postEmailTemplate(formik.values)
        )) as unknown as ApiAction
        if (!response.error) {
          if (props.type === "registration") {
            dispatch(
              patchRetreat(props.retreatId, {
                registration_email_template_id:
                  response.payload.email_template.id,
              })
            )
          } else if (props.type === "flights") {
            dispatch(
              patchRetreat(props.retreatId, {
                flights_email_template_id: response.payload.email_template.id,
              })
            )
          }
        }
      } else {
        dispatch(patchEmailTemplate(props.emailTemplateId, formik.values))
      }
    },
    enableReinitialize: true,
  })

  useEffect(() => {
    !email_template_start &&
      dispatch(getEmailTemplate(props.emailTemplateId ?? -1))
    !email_template_start &&
      dispatch(getEmailTemplate(props.typeInfo.defaultId))
  }, [
    dispatch,
    props.emailTemplateId,
    email_template_start,
    props.typeInfo.defaultId,
  ])

  let user = useSelector((state: RootState) => state.user.user)
  return (
    <form className={classes.form} onSubmit={formik.handleSubmit}>
      <Paper className={classes.headerPaper}>
        <TextField
          fullWidth
          value={"All Attendees"}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">To</InputAdornment>
            ),
          }}
          disabled
          size="small"
          className={classes.toLine}></TextField>
        <TextField
          fullWidth
          value={formik.values.subject}
          onChange={formik.handleChange}
          placeholder="Subject"
          id="subject"
          size="small"
          className={classes.subjectLine}></TextField>
      </Paper>
      <Paper className={classes.bodyPaper}>
        <AppImage
          img="branding/logos/icon_text-empty_bg.png"
          alt="flok logo"
          height={87}
          className={classes.headerImage}
        />
        <TextField
          value={formik.values.body}
          onFocus={() => {
            setFocusBody(true)
          }}
          onBlur={async (e) => {
            setTimeout(() => {
              setFocusBody(false)
            }, 100)
          }}
          onChange={formik.handleChange}
          onSelect={updateSelectionStart}
          inputRef={bodyRef}
          onKeyDown={async (e) => {
            if (e.key === "Tab") {
              e.preventDefault()
              let [firstHalf, secondHalf] = split(
                formik.values.body,
                caretIndex ?? formik.values.body.length - 1
              )
              let index = caretIndex
              await formik.setFieldValue(
                "body",
                firstHalf + "    " + secondHalf
              )
              bodyRef.current?.setSelectionRange(
                (index ?? 0) + 4,
                (index ?? 0) + 4
              )
            }
          }}
          id="body"
          multiline
          variant="outlined"
          className={classes.sendGridBody}></TextField>
        {props.typeInfo.buttonTooltip ? (
          <Tooltip title={props.typeInfo.buttonTooltip} hidden={true}>
            <Button
              className={classes.sendGridButton}
              variant="contained"
              color="primary">
              {props.typeInfo.buttonText ?? "Register Now!"}
            </Button>
          </Tooltip>
        ) : (
          <Button
            className={classes.sendGridButton}
            variant="contained"
            color="primary">
            {props.typeInfo.buttonText ?? "Register Now!"}
          </Button>
        )}
        <Menu
          id="fade-menu"
          anchorEl={variableMenuAnchorEl}
          keepMounted
          open={variableMenuOpen}
          onClose={handleCloseVariableMenu}
          TransitionComponent={Fade}>
          <MenuItem
            onClick={() => {
              let [firstHalf, secondHalf] = split(
                formik.values.body,
                caretIndex ?? formik.values.body.length - 1
              )
              setCaretIndex(
                (caretIndex) => (caretIndex ?? formik.values.body.length) + 23
              )
              formik.setFieldValue(
                "body",
                firstHalf + "{{attendee.first_name}}" + secondHalf
              )
            }}>
            Insert First Name
          </MenuItem>
          <MenuItem
            onClick={() => {
              let [firstHalf, secondHalf] = split(
                formik.values.body,
                caretIndex ?? formik.values.body.length - 1
              )
              setCaretIndex(
                (caretIndex) => (caretIndex ?? formik.values.body.length) + 22
              )
              formik.setFieldValue(
                "body",
                firstHalf + "{{attendee.last_name}}" + secondHalf
              )
            }}>
            Insert Last Name
          </MenuItem>
        </Menu>
        {(focusBody || variableMenuOpen || focusFab) && (
          <Fab
            onFocus={() => {
              setFocusFab(true)
            }}
            onBlur={() => {
              setTimeout(() => {
                setFocusFab(false)
              }, 100)
            }}
            color="primary"
            aria-label="add"
            size="small"
            className={classes.fab}
            aria-controls="fade-menu"
            aria-haspopup="true"
            onClick={(event) => {
              setVariableMenuAnchorEl(event.currentTarget)
            }}>
            <Add fontSize="small" />
          </Fab>
        )}
      </Paper>
      <div className={classes.buttonsDiv}>
        <Button
          color="primary"
          variant="contained"
          type="submit"
          disabled={_.isEqual(formik.values, formik.initialValues)}>
          Save
        </Button>
        <Tooltip
          title={`Email will be sent to ${
            user ? user.email : "currently logged in user"
          }`}>
          <Button
            variant="outlined"
            size="small"
            disabled={!_.isEqual(formik.values, formik.initialValues)}
            color="primary"
            className={classes.sendButton}
            onClick={async () => {
              let response = (await dispatch(
                postSendSampleEmailTemplate(
                  props.emailTemplateId ?? props.typeInfo.defaultId
                )
              )) as unknown as ApiAction
              if (!response.error) {
                dispatch(
                  enqueueSnackbar({
                    message: "Sample email sent",
                    options: {
                      variant: "success",
                    },
                  })
                )
              }
            }}>
            Send to Myself &nbsp;
            <Send fontSize="small" />
          </Button>
        </Tooltip>
      </div>
    </form>
  )
}
