import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
} from "@material-ui/core"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {ApiAction} from "../../store/actions/api"
import {
  postFlightsLive,
  postRegistrationLive,
} from "../../store/actions/retreat"

import {makeStyles} from "@material-ui/core"

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

type GoLiveButtonProps = {
  isLive: boolean
  isLiveText: string

  goLiveBtnText: string
  goLiveBtnTooltip: string

  confirmationTextHeader: string
  confirmationTextBody: string

  onGoLive: () => boolean // return success or failure
}
function GoLiveButton(props: GoLiveButtonProps) {
  let classes = useStyles(props)
  let [goLiveModalOpen, setGoLiveModalOpen] = useState(false)
  return (
    <>
      {props.isLive ? (
        <Chip
          size="medium"
          className={classes.successChip}
          label={props.isLiveText}
          classes={{label: classes.successChipLabel}}
        />
      ) : (
        <Tooltip title={props.goLiveBtnTooltip} placement="left">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setGoLiveModalOpen(true)
            }}>
            {props.goLiveBtnText}
          </Button>
        </Tooltip>
      )}
      <Dialog
        open={goLiveModalOpen}
        onClose={() => {
          setGoLiveModalOpen(false)
        }}>
        <DialogTitle>{props.confirmationTextHeader}</DialogTitle>
        <DialogContent>{props.confirmationTextBody}</DialogContent>
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
            onClick={() => {
              let successfullyLive = props.onGoLive()
              if (successfullyLive) {
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

type RegistrationGoLiveButtonProps = {retreatId: number; isLive: boolean}
export function RegistrationGoLiveButton(props: RegistrationGoLiveButtonProps) {
  let dispatch = useDispatch()

  function onGoLive() {
    let response = Promise.resolve(
      dispatch(postRegistrationLive(props.retreatId))
    ) as unknown as ApiAction
    return !response.error
  }

  return (
    <GoLiveButton
      isLive={props.isLive}
      isLiveText="Registration active"
      confirmationTextHeader="Are you sure you wish to go live with attendee registration?"
      confirmationTextBody="Going live will publish your website and send a registration email to all attendees. This action cannot be undone"
      goLiveBtnText="Registration go live"
      goLiveBtnTooltip="Go live with your attendee website and registration."
      onGoLive={onGoLive}
    />
  )
}

type FlightsGoLiveButtonProps = {retreatId: number; isLive: boolean}
export function FlightsGoLiveButton(props: FlightsGoLiveButtonProps) {
  let dispatch = useDispatch()

  function onGoLive() {
    let response = Promise.resolve(
      dispatch(postFlightsLive(props.retreatId))
    ) as unknown as ApiAction
    return !response.error
  }

  return (
    <GoLiveButton
      isLive={props.isLive}
      isLiveText="Flights page active"
      confirmationTextHeader="Are you sure you wish to go live with the flights page?"
      confirmationTextBody="Going live will publish your flight booking instructions and send a email to all attendees asking them to upload flight details. This action cannot be undone"
      goLiveBtnText="Go live with flights?"
      goLiveBtnTooltip="Go live with your flights booking instructions."
      onGoLive={onGoLive}
    />
  )
}
