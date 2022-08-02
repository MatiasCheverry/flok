import {makeStyles, Paper} from "@material-ui/core"
import {useEffect} from "react"
import {useDispatch, useSelector} from "react-redux"
import {RootState} from "../../store"
import {getRFP} from "../../store/actions/admin"
import AppTypography from "../base/AppTypography"

let useStyles = makeStyles((theme) => ({
  rfpQuestion: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(4),
    marginTop: theme.spacing(3),
  },
  rfp: {
    padding: theme.spacing(2),
  },
  rfpQuestionOne: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(4),
  },
  answerParagraph: {
    maxWidth: "80%",
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.grey[400]}`,
    padding: theme.spacing(1),
  },
  noneAvailable: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}))
type ViewRFPProps = {
  rfpId?: number
}
export default function ViewRFP(props: ViewRFPProps) {
  let classes = useStyles()
  let rfp = useSelector((state: RootState) => {
    if (props.rfpId) {
      return state.admin.RFPs[props.rfpId]
    }
  })
  let dispatch = useDispatch()

  useEffect(() => {
    if (!rfp && props.rfpId) {
      dispatch(getRFP(props.rfpId))
    }
  }, [dispatch, rfp, props.rfpId])

  return (
    <>
      {rfp ? (
        <Paper className={classes.rfp}>
          <div className={classes.rfpQuestionOne}>
            <AppTypography fontWeight="bold">Number of Rooms:</AppTypography>
            <AppTypography>{rfp.number_of_rooms}</AppTypography>
          </div>
          <div className={classes.rfpQuestion}>
            <AppTypography fontWeight="bold">Has Exact Dates:</AppTypography>
            <AppTypography>{rfp.has_exact_dates ? "Yes" : "No"}</AppTypography>
          </div>
          {rfp.has_exact_dates &&
          rfp.exact_dates_start &&
          rfp.exact_dates_end ? (
            <div className={classes.rfpQuestion}>
              <AppTypography fontWeight="bold">Dates:</AppTypography>
              <AppTypography>
                {rfp.exact_dates_start} - {rfp.exact_dates_end}
              </AppTypography>
            </div>
          ) : (
            <div className={classes.rfpQuestion}>
              <AppTypography fontWeight="bold">Number of Nights:</AppTypography>
              <AppTypography>{rfp.flexible_number_of_nights}</AppTypography>
            </div>
          )}
          {rfp.has_exact_dates ? (
            <div className={classes.rfpQuestion}>
              <AppTypography fontWeight="bold">
                Exact Dates Notes:
              </AppTypography>
              <p className={classes.answerParagraph}>{rfp.exact_dates_notes}</p>
            </div>
          ) : (
            <div className={classes.rfpQuestion}>
              <AppTypography fontWeight="bold">
                Flexible Dates Notes:
              </AppTypography>
              <p className={classes.answerParagraph}>
                {rfp.flexible_dates_notes}
              </p>
            </div>
          )}
          <div className={classes.rfpQuestion}>
            <AppTypography fontWeight="bold">Agenda Type:</AppTypography>
            <AppTypography>{rfp.agenda_type}</AppTypography>
          </div>
          <div className={classes.rfpQuestion}>
            <AppTypography fontWeight="bold">Agenda Notes:</AppTypography>
            <p className={classes.answerParagraph}>{rfp.agenda_notes}</p>
          </div>
        </Paper>
      ) : (
        <AppTypography variant="h5" className={classes.noneAvailable}>
          No RFP Available
        </AppTypography>
      )}
    </>
  )
}
