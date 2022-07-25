import {makeStyles} from "@material-ui/core"
import {RetreatAttendeeModel} from "../../models/retreat"
import AppTypography from "../base/AppTypography"
import FormResponseViewer from "../forms/FormResponseViewer"

let useStyles = makeStyles((theme) => ({}))
type AttendeeRegResponseTabProps = {
  attendee: RetreatAttendeeModel
}

export default function AttendeeFlightTab(props: AttendeeRegResponseTabProps) {
  let classes = useStyles()
  return (
    <>
      <AppTypography variant="h1">Registration Form Response</AppTypography>
      {props.attendee.registration_form_response_id != null ? (
        <FormResponseViewer
          formResponseId={props.attendee.registration_form_response_id}
        />
      ) : (
        <></>
      )}
    </>
  )
}
