import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Tooltip,
} from "@material-ui/core"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {ApiAction} from "../../store/actions/api"
import {postRegistrationLive} from "../../store/actions/retreat"

import {makeStyles} from "@material-ui/core"
import {LiveTv} from "@material-ui/icons"
import AppTypography from "../base/AppTypography"

let useStyles = makeStyles((theme) => ({
  goLiveIcon: {
    marginRight: theme.spacing(1),
    marginBottom: 4, // to better center with text in FAB
  },
  successChip: {
    backgroundColor: theme.palette.success.main,
    height: 35,
    textTransform: "uppercase",
  },
  successChipLabel: {
    color: theme.palette.common.white,
    ...theme.typography.body2,
    fontWeight: theme.typography.fontWeightBold,
  },
}))

type SiteGoLiveButtonProps = {retreatId: number; isLive: boolean}
export default function SiteGoLiveButton(props: SiteGoLiveButtonProps) {
  let dispatch = useDispatch()
  let classes = useStyles(props)
  let [goLiveModalOpen, setGoLiveModalOpen] = useState(false)
  return (
    <>
      {props.isLive ? (
        <Chip
          size="medium"
          className={classes.successChip}
          label="Registration active"
          classes={{label: classes.successChipLabel}}
        />
      ) : (
        <Tooltip
          title="Go live with your attendee website and registration."
          placement="left">
          <Fab
            variant="extended"
            size="small"
            color="primary"
            onClick={() => {
              setGoLiveModalOpen(true)
            }}>
            <LiveTv fontSize="small" className={classes.goLiveIcon} />
            <AppTypography variant="body2" fontWeight="bold" uppercase>
              Go Live
            </AppTypography>
          </Fab>
        </Tooltip>
      )}
      <Dialog
        open={goLiveModalOpen}
        onClose={() => {
          setGoLiveModalOpen(false)
        }}>
        <DialogTitle>Are you sure you wish to go live?</DialogTitle>
        <DialogContent>
          Going live will publish your website and send a registration email to
          all attendees. This action cannot be undone
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setGoLiveModalOpen(false)
            }}
            color="primary"
            variant="outlined">
            No
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={async () => {
              let response = (await dispatch(
                postRegistrationLive(props.retreatId)
              )) as unknown as ApiAction
              if (!response.error) {
                setGoLiveModalOpen(false)
              }
            }}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
