import {
  Button,
  CircularProgress,
  Grid,
  makeStyles,
  TextField,
} from "@material-ui/core"
import {useFormik} from "formik"
import {useEffect} from "react"
import * as yup from "yup"
import AppTypography from "../base/AppTypography"
import AppAttendeesInput from "./AppAttendeesInput"
import AppDatesRangeInput from "./AppDatesRangeInput"

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    "& > form": {
      height: "100%",
    },
    overflowY: "auto",
  },
  ctaContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing(2),
  },
  formBody: {
    minHeight: "100%",
  },
}))

export type NewRetreatFormValues = {
  name: string
  email: string
  companyName: string
}
type NewRetreatFormProps = {
  onSubmit: (vals: NewRetreatFormValues) => void
  onError: (error: string) => void
  isLoading?: boolean
}
export function NewRetreatForm(props: NewRetreatFormProps) {
  const classes = useStyles()
  let formik = useFormik<NewRetreatFormValues>({
    validationSchema: yup.object().shape({
      name: yup.string().required("Name is a required field."),
      email: yup.string().email().required("Email is a required field."),
      companyName: yup.string().min(3).required("Company is a required field."),
    }),
    initialValues: {name: "", email: "", companyName: ""},
    onSubmit: props.onSubmit,
  })
  return (
    <div className={classes.root}>
      <form onSubmit={formik.handleSubmit}>
        <Grid
          className={classes.formBody}
          container
          direction="column"
          justify="space-between">
          <Grid item xs={12} container spacing={4}>
            <Grid
              container
              spacing={2}
              alignItems="center"
              justify="space-between"
              item
              xs={12}>
              <Grid item>
                <AppTypography variant="h4">What's your name?</AppTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="name"
                  value={formik.values.name}
                  error={!!(formik.touched.name && formik.errors.name)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Leeroy Jenkins"
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems="center"
              justify="space-between"
              item
              xs={12}>
              <Grid item>
                <AppTypography variant="h4">What's your email?</AppTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="email"
                  value={formik.values.email}
                  error={!!(formik.touched.email && formik.errors.email)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="leeroy@goflok.com"
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems="center"
              justify="space-between"
              item
              xs={12}>
              <Grid item>
                <AppTypography variant="h4">What's your company?</AppTypography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  id="companyName"
                  value={formik.values.companyName}
                  error={
                    !!(formik.touched.companyName && formik.errors.companyName)
                  }
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Flok"
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item className={classes.ctaContainer}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={props.isLoading}
              onClick={() => {
                formik.validateForm().then((errs) => {
                  if (Object.values(errs).length > 0) {
                    Object.values(errs)
                      .slice(0, 3)
                      .forEach((err) => {
                        if (typeof err === "string") {
                          props.onError(err)
                        }
                      })
                  }
                })
              }}>
              {props.isLoading ? (
                <CircularProgress
                  size={`${0.9375 * 1.75}rem`}
                  color="inherit"
                />
              ) : (
                "Get started"
              )}
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  )
}

export type RetreatPreferencesFormValues = {
  attendeesLower: number
  isFlexibleDates: boolean
  flexibleNumNights?: number
  flexibleMonths: string[]
  flexibleStartDow: string[]
  exactStartDate?: Date
  exactEndDate?: Date
}
type RetreatPreferencesFormProps = {
  onSubmit: (vals: RetreatPreferencesFormValues) => void
  initialVals: Partial<RetreatPreferencesFormValues>
  onError: (error: string) => void
  isLoading?: boolean
  submitButtonText: string
}
export function RetreatPreferencesForm(props: RetreatPreferencesFormProps) {
  const classes = useStyles()
  let formik = useFormik<RetreatPreferencesFormValues>({
    validationSchema: yup.object().shape({
      attendeesLower: yup
        .number()
        .required("Number of attendees is required.")
        .min(25, "At least 25 attendees required."),
      isFlexibleDates: yup.boolean().required(),
      exactStartDate: yup.date().when("isFlexibleDates", {
        is: false,
        then: yup.date().required("Start date is required."),
      }),
      exactEndDate: yup.date().when("isFlexibleDates", {
        is: false,
        then: yup.date().required("End date is required."),
      }),
      flexibleNumNights: yup.number().when("isFlexibleDates", {
        is: true,
        then: yup
          .number()
          .required("Number of nights is required.")
          .min(1, "At least one night required."),
      }),
      flexibleMonths: yup.array().when("isFlexibleDates", {
        is: true,
        then: yup
          .array(yup.string())
          .min(1, "At least one preferred month is required")
          .required("At least one preferred month is required"),
      }),
    }),
    initialValues: {
      attendeesLower: 0,
      isFlexibleDates: false,
      flexibleNumNights: 0,
      flexibleStartDow: [],
      flexibleMonths: [],
    },
    onSubmit: props.onSubmit,
  })
  let {setValues, initialValues} = {...formik}
  useEffect(() => {
    setValues({...initialValues, ...props.initialVals})
  }, [props.initialVals, initialValues, setValues])
  return (
    <div className={classes.root}>
      <form onSubmit={formik.handleSubmit}>
        <Grid
          className={classes.formBody}
          container
          direction="column"
          justify="space-between">
          <Grid item xs={12} container spacing={4}>
            <Grid
              container
              spacing={2}
              alignItems="center"
              alignContent="space-between"
              justify="space-between"
              item
              xs={12}>
              <Grid item>
                <AppTypography variant="h4">How many attendees?</AppTypography>
                <AppTypography variant="body2" color="textSecondary">
                  If you’re not 100% sure just start with a best guess.
                </AppTypography>
              </Grid>
              <Grid item xs={12} md="auto">
                <AppAttendeesInput
                  error={
                    !!(
                      formik.touched.attendeesLower &&
                      formik.errors.attendeesLower
                    )
                  }
                  numAttendees={formik.values.attendeesLower}
                  onChange={(attendees) => {
                    formik.setFieldValue("attendeesLower", attendees)
                  }}
                />
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems="center"
              justify="space-between"
              item
              xs={12}>
              <Grid item xs={12} md={6}>
                <AppTypography variant="h4">
                  When do you want to go?
                </AppTypography>
                <AppTypography variant="body2" color="textSecondary">
                  Exact dates or a time of year, you tell us.
                </AppTypography>
              </Grid>
              <Grid item xs={12} md="auto">
                <AppDatesRangeInput
                  isExactDates={!formik.values.isFlexibleDates}
                  onChangeIsExactDates={(isExact) =>
                    formik.setFieldValue("isFlexibleDates", !isExact)
                  }
                  start={formik.values.exactStartDate}
                  end={formik.values.exactEndDate}
                  onChangeDateRange={(start, end) => {
                    if (start === end) {
                      end = undefined
                    }
                    formik.setFieldValue("exactStartDate", start)
                    formik.setFieldValue("exactEndDate", end)
                  }}
                  numNights={formik.values.flexibleNumNights || 0}
                  onChangeNumNights={(val) =>
                    formik.setFieldValue("flexibleNumNights", val)
                  }
                  preferredMonths={formik.values.flexibleMonths}
                  onChangePreferredMonths={(vals) => {
                    formik.setFieldValue("flexibleMonths", vals)
                  }}
                  error={
                    !!(
                      formik.touched.isFlexibleDates &&
                      (formik.errors.isFlexibleDates ||
                        formik.errors.exactStartDate ||
                        formik.errors.exactEndDate ||
                        formik.errors.flexibleNumNights ||
                        formik.errors.flexibleMonths)
                    )
                  }
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item className={classes.ctaContainer}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={props.isLoading}
              onClick={() => {
                formik.validateForm().then((errs) => {
                  if (Object.values(errs).length > 0) {
                    Object.values(errs)
                      .slice(0, 3)
                      .forEach((err) => {
                        if (typeof err === "string") {
                          props.onError(err)
                        } else if (err && err.length > 0) {
                          props.onError(err[0])
                        }
                      })
                  }
                })
              }}>
              {props.isLoading ? (
                <CircularProgress
                  size={`${0.9375 * 1.75}rem`}
                  color="inherit"
                />
              ) : (
                props.submitButtonText
              )}
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  )
}
