import {
  Button,
  FormHelperText,
  makeStyles,
  Paper,
  TextField,
} from "@material-ui/core"
import {ToggleButton, ToggleButtonGroup} from "@material-ui/lab"
import clsx from "clsx"
import {push} from "connected-react-router"
import {useFormik} from "formik"
import _ from "lodash"
import {useEffect} from "react"
import {useDispatch, useSelector} from "react-redux"
import * as yup from "yup"
import {AgendaType} from "../../models/retreat"
import {useRetreat} from "../../pages/misc/RetreatProvider"
import {RootState} from "../../store"
import {ApiAction} from "../../store/actions/api"
import {getRFP, patchRetreat, postRFP} from "../../store/actions/retreat"
import {theme} from "../../theme"
import {getTextFieldErrorProps, useQuery} from "../../utils"
import AppTypography from "../base/AppTypography"
import PageBody from "../page/PageBody"
import PageHeader from "../page/PageHeader"
import RFPDatesInput from "./RFPDatesRangeInput"

let useStyles = makeStyles((theme) => ({
  errorAgendaTypes: {
    borderColor: theme.palette.error.main,
  },
  agendaTypeErrorMessage: {
    marginLeft: theme.spacing(3),
  },
  overallBody: {
    margin: theme.spacing(2),
  },
  rfpForm: {
    marginLeft: theme.spacing(1),
  },
  guestRoomsQuestion: {
    display: "flex",
    marginTop: theme.spacing(5),
    alignItems: "center",
  },
  datesField: {
    display: "flex",
    marginTop: theme.spacing(4),
    alignItems: "center",
    gap: theme.spacing(1),
  },
  datesInputWrapper: {
    marginLeft: "auto",
    marginRight: "16%",
  },
  roomsTextField: {
    marginLeft: "auto",
    marginRight: "16%",
  },
  agendaField: {
    marginTop: theme.spacing(4),
    display: "flex",
    alignItems: "center",
  },
  agendaSubtext: {
    marginLeft: theme.spacing(3),
    marginTop: theme.spacing(0.5),
  },
  agendaToggle: {
    marginLeft: theme.spacing(2),
  },
  agendaNotesWrapper: {
    marginTop: theme.spacing(2),
    marginLeft: "5%",
  },
  agendaNotesTextField: {
    marginLeft: "auto",
    maxWidth: "80%",
    marginRight: "auto",
  },
  submitButton: {
    float: "right",
    marginTop: theme.spacing(2),
    marginRight: "10%",
  },
}))
function RetreatRfpPage() {
  let dispatch = useDispatch()
  let classes = useStyles()
  let toDate = (dt?: Date) =>
    dt
      ? dt.toISOString().substring(0, dt.toISOString().indexOf("T"))
      : undefined

  let [retreat] = useRetreat()
  let [next] = useQuery("next")
  let minPlanningDate = new Date()
  minPlanningDate.setDate(minPlanningDate.getDate() + 90)

  let rfp = useSelector((state: RootState) => {
    if (retreat.request_for_proposal_id) {
      return state.retreat.RFPs[retreat.request_for_proposal_id]
    }
  })

  useEffect(() => {
    if (!rfp && retreat.request_for_proposal_id) {
      dispatch(getRFP(retreat.request_for_proposal_id))
    }
  }, [dispatch, rfp, retreat.request_for_proposal_id])

  let formik = useFormik({
    validationSchema: yup.object().shape({
      number_of_rooms: yup
        .number()
        .required("Number of rooms is required.")
        .min(1, "At least 1 room is required."),
      has_exact_dates: yup.boolean().required(),
      exact_dates_start: yup.date().when("has_exact_dates", {
        is: true,
        then: yup.date().required("Start date is required."),
      }),
      exact_dates_end: yup.date().when("has_exact_dates", {
        is: true,
        then: yup.date().required("End date is required."),
      }),
      flexible_number_of_nights: yup.number().when("has_exact_dates", {
        is: false,
        then: yup
          .number()
          .required("Number of nights is required.")
          .min(1, "At least one night required."),
      }),
      agenda_type: yup.string().required("Agenda type is required."),
    }),
    initialValues: {
      has_exact_dates: rfp?.has_exact_dates ?? true,
      exact_dates_start: rfp?.exact_dates_start
        ? new Date(rfp.exact_dates_start)
        : undefined,
      exact_dates_end: rfp?.exact_dates_end
        ? new Date(rfp.exact_dates_end)
        : undefined,
      flexible_number_of_nights: rfp?.flexible_number_of_nights ?? 0,
      exact_dates_notes: rfp?.exact_dates_notes ?? "",
      flexible_dates_notes: rfp?.flexible_dates_notes ?? "",
      agenda_type: rfp?.agenda_type ?? "",
      agenda_notes: rfp?.agenda_notes ?? "",
      number_of_rooms: rfp?.number_of_rooms ?? undefined,
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      let response = (await dispatch(
        postRFP({
          ...values,
          retreat_id: retreat.id,
          exact_dates_start: toDate(values.exact_dates_start),
          exact_dates_end: toDate(values.exact_dates_end),
          agenda_type: values.agenda_type as AgendaType,
        })
      )) as unknown as ApiAction
      if (!response.error) {
        let patchResponse = (await dispatch(
          patchRetreat(retreat.id, {
            request_for_proposal_id: response.payload.request_for_proposal.id,
          })
        )) as unknown as ApiAction
        if (!patchResponse.error && next) {
          dispatch(push(decodeURIComponent(next)))
        }
      }
    },
  })

  return (
    <PageBody appBar>
      <div className={classes.overallBody}>
        <PageHeader
          header={
            <AppTypography variant="h1" fontWeight="bold">
              RFP
            </AppTypography>
          }
          subheader="It is ok if some of this information has not been confirmed yet.  You will be able to make changes before signing a formal contract"
        />
        <form onSubmit={formik.handleSubmit}>
          <div className={classes.rfpForm}>
            <div className={classes.guestRoomsQuestion}>
              <AppTypography fontWeight="bold">
                1. How many guest rooms do you need each night?
              </AppTypography>
              <TextField
                className={classes.roomsTextField}
                value={formik.values.number_of_rooms}
                id="number_of_rooms"
                onChange={formik.handleChange}
                type="number"
                {...getTextFieldErrorProps(
                  formik,
                  "number_of_rooms"
                )}></TextField>
            </div>
            <div className={classes.datesField}>
              <AppTypography fontWeight="bold">
                2. Tell us a little bit about when you are planning to go.
              </AppTypography>
              <div className={classes.datesInputWrapper}>
                <RFPDatesInput
                  error={
                    !!(
                      formik.errors.exact_dates_start ||
                      formik.errors.exact_dates_end ||
                      formik.errors.has_exact_dates ||
                      formik.errors.flexible_number_of_nights
                    )
                  }
                  onChangeExactDatesNotes={(newNotes) => {
                    formik.setFieldValue("exact_dates_notes", newNotes)
                  }}
                  onChangeFlexibleDatesNotes={(newNotes) => {
                    formik.setFieldValue("flexible_dates_notes", newNotes)
                  }}
                  exactDatesNotes={formik.values.exact_dates_notes}
                  flexibleDatesNotes={formik.values.flexible_dates_notes}
                  isExactDates={formik.values.has_exact_dates}
                  onChangeIsExactDates={(isExact) => {
                    formik.setFieldValue("has_exact_dates", isExact)
                  }}
                  start={formik.values.exact_dates_start}
                  end={formik.values.exact_dates_end}
                  onChangeDateRange={(start, end) => {
                    formik.setFieldValue("exact_dates_start", start)
                    formik.setFieldValue("exact_dates_end", end)
                  }}
                  onChangeNumNights={(numNights) => {
                    formik.setFieldValue("flexible_number_of_nights", numNights)
                  }}
                  numNights={formik.values.flexible_number_of_nights}
                />
              </div>
            </div>
            <div className={classes.agendaField}>
              <div>
                <AppTypography fontWeight="bold">
                  3. Choose the Agenda which best matches your planned
                  itinerary.
                </AppTypography>
                <AppTypography
                  className={classes.agendaSubtext}
                  fontWeight="light">
                  Venues need to get a sense of how much meeting space you will
                  need
                </AppTypography>
              </div>
              <div>
                <ToggleButtonGroup
                  className={classes.agendaToggle}
                  orientation="horizontal"
                  value={formik.values.agenda_type}
                  id="agenda_type"
                  exclusive
                  onChange={(e, newValue) => {
                    formik.setFieldValue("agenda_type", newValue)
                  }}>
                  <ToggleButton
                    value="ALL_WORK"
                    aria-label="list"
                    className={clsx(
                      !!formik.errors.agenda_type && classes.errorAgendaTypes
                    )}>
                    All Work
                  </ToggleButton>
                  <ToggleButton
                    value="ALL_PLAY"
                    aria-label="module"
                    className={clsx(
                      !!formik.errors.agenda_type && classes.errorAgendaTypes
                    )}>
                    All Play
                  </ToggleButton>
                  <ToggleButton
                    value="WORK_AND_PLAY"
                    aria-label="quilt"
                    className={clsx(
                      !!formik.errors.agenda_type && classes.errorAgendaTypes
                    )}>
                    Work & Play
                  </ToggleButton>
                </ToggleButtonGroup>
                {!!formik.errors.agenda_type && (
                  <FormHelperText
                    error
                    className={classes.agendaTypeErrorMessage}>
                    {formik.errors.agenda_type}
                  </FormHelperText>
                )}
              </div>
            </div>
            <div className={classes.agendaNotesWrapper}>
              <TextField
                value={formik.values.agenda_notes}
                onChange={formik.handleChange}
                id="agenda_notes"
                multiline
                placeholder="What else should we know about your agenda?"
                rows={4}
                variant="outlined"
                fullWidth
                className={classes.agendaNotesTextField}
              />
            </div>
            <Paper
              style={{
                marginTop: theme.spacing(3),
                padding: theme.spacing(1.5),
              }}>
              <AppTypography fontWeight="bold">
                4. What is your corporate address?
              </AppTypography>
              <AppTypography
                className={classes.agendaSubtext}
                fontWeight="light">
                Venues need to get a sense of how much meeting space you will
                need
              </AppTypography>
              <TextField
                className={classes.agendaSubtext}
                style={{minWidth: 375}}
                onChange={formik.handleChange}
                placeholder="123 Flok St. New York, New York 10013"
                variant="outlined"></TextField>
            </Paper>
          </div>
          <Button
            variant="contained"
            color="primary"
            disabled={_.isEqual(formik.values, formik.initialValues)}
            type="submit"
            className={classes.submitButton}>
            Submit
          </Button>
        </form>
      </div>
    </PageBody>
  )
}
export default RetreatRfpPage
