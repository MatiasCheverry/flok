import {makeStyles, Paper, Popper, Typography} from "@material-ui/core"
import {useState} from "react"
import {RetreatAttendeeModel} from "../../models/retreat"
import {splitFileName} from "../attendee-site/EditWebsiteForm"

let useStyles = makeStyles((theme) => ({
  linkStyle: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
    display: "inline",
    margin: 0,
    padding: 0,
    color: "#0000EE", //To match default color of a link
  },
}))

export default function AttendeeFlightReceiptViewer(props: {
  attendee: RetreatAttendeeModel
}) {
  let {attendee} = props
  let classes = useStyles()
  // For receipts column
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const popperOpen = Boolean(anchorEl)
  const id = popperOpen ? "simple-popper" : undefined
  return (
    <div
      className={classes.linkStyle}
      onMouseEnter={(event) => {
        setAnchorEl(anchorEl ? null : event.currentTarget)
      }}
      onMouseLeave={() => {
        setAnchorEl(null)
      }}>
      <Typography>{attendee.receipts.length}</Typography>
      <Popper id={id} open={popperOpen} anchorEl={anchorEl}>
        <Paper style={{padding: 16}}>
          {attendee.receipts.length === 0 ? (
            <Typography>No receipts yet</Typography>
          ) : (
            <>
              <ul
                style={{
                  listStyleType: "none",
                  gap: 8,
                  display: "flex",
                  flexDirection: "column",
                }}>
                {attendee.receipts.map((receipt) => (
                  <li
                    style={{
                      maxWidth: 400,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                    <a href={receipt.file_url}>
                      {splitFileName(receipt.file_url)}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Paper>
      </Popper>
    </div>
  )
}
