import {
  Button,
  InputAdornment,
  makeStyles,
  TextField,
  TextFieldProps,
  Typography,
} from "@material-ui/core"
import {useFormik} from "formik"
import _ from "lodash"
import {useDispatch} from "react-redux"
import * as yup from "yup"
import {AdminRetreatModel} from "../../models"
import {patchRetreatDetails} from "../../store/actions/admin"
import {getTextFieldErrorProps} from "../../utils"

let useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: theme.shape.borderRadius,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
    display: "flex",
    flexWrap: "wrap",
    marginTop: -theme.spacing(1),
    marginLeft: -theme.spacing(1),
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
  },
  header: {
    width: "100%",
    marginBottom: theme.spacing(1),
  },
  footer: {
    paddingTop: theme.spacing(1),
  },
  textField: {},
}))

function RetreatLinksForm(props: {retreat: AdminRetreatModel}) {
  let classes = useStyles(props)
  let dispatch = useDispatch()

  let formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      attendees_registration_form_link:
        props.retreat.attendees_registration_form_link ?? "",
      faq_link: props.retreat.faq_link ?? "",

      itinerary_final_draft_link:
        props.retreat.itinerary_final_draft_link ?? "",
      budget_link: props.retreat.budget_link ?? "",
      rmc_survey_link: props.retreat.rmc_survey_link ?? "",
      slack_channel: props.retreat.slack_channel ?? "",
    },
    validationSchema: yup.object({
      faq_link: yup.string().url("Please enter a valid URL"),
      attendees_registration_form_link: yup
        .string()
        .url("Please enter a valid URL"),
      itinerary_final_draft_link: yup.string().url("Please enter a valid URL"),
      budget_link: yup.string().url("Please enter a valid URL"),
      rmc_survey_link: yup.string().url("Please enter a valid URL"),
    }),
    onSubmit: (values) => {
      let patchValues: Partial<typeof values> = Object.keys(values).reduce(
        (prev, curr) => {
          let typedCurr: keyof typeof values = curr as keyof typeof values
          return {
            ...prev,
            [curr]: values[typedCurr] !== "" ? values[typedCurr] : undefined,
          }
        },
        {}
      )
      props.retreat &&
        dispatch(patchRetreatDetails(props.retreat.id, patchValues))
    },
  })
  const commonTextFieldProps: TextFieldProps = {
    onChange: formik.handleChange,
    InputLabelProps: {shrink: true},
    fullWidth: true,
    className: classes.textField,
  }
  return (
    <form className={classes.root} onSubmit={formik.handleSubmit}>
      <Typography className={classes.header} variant="h4">
        Retreat Documents
      </Typography>
      <TextField
        {...commonTextFieldProps}
        id="attendees_registration_form_link"
        {...getTextFieldErrorProps(formik, "attendees_registration_form_link")}
        value={formik.values.attendees_registration_form_link}
        label="Attendee registration form link"
      />
      <TextField
        {...commonTextFieldProps}
        {...getTextFieldErrorProps(formik, "rmc_survey_link")}
        id="rmc_survey_link"
        value={formik.values.rmc_survey_link}
        label="RMC survey link"
      />
      <TextField
        {...commonTextFieldProps}
        {...getTextFieldErrorProps(formik, "budget_link")}
        id="budget_link"
        value={formik.values.budget_link}
        label="Budget link"
      />
      <TextField
        {...commonTextFieldProps}
        id="faq_link"
        value={formik.values.faq_link}
        label="FAQ Link"
      />
      <TextField
        {...commonTextFieldProps}
        {...getTextFieldErrorProps(formik, "itinerary_final_draft_link")}
        id="itinerary_final_draft_link"
        value={formik.values.itinerary_final_draft_link}
        label="Itinerary document link"
      />
      <TextField
        {...commonTextFieldProps}
        {...getTextFieldErrorProps(formik, "slack_channel")}
        id="slack_channel"
        value={formik.values.slack_channel}
        label="Slack Notification Channel"
        InputProps={{
          startAdornment: <InputAdornment position="start">#</InputAdornment>,
        }}
      />
      <div className={classes.footer}>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={
            _.isEqual(formik.initialValues, formik.values) || !formik.isValid
          }>
          Save State
        </Button>
      </div>
    </form>
  )
}
export default RetreatLinksForm
