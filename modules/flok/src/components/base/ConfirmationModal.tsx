import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core"

type AppConfirmationModalProps = {
  onSubmit: () => void
  title: string
  open: boolean
  onClose: () => void
  text: string
}
function AppConfirmationModal(props: AppConfirmationModalProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{props.text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>No</Button>
        <Button onClick={props.onSubmit}>Yes</Button>
      </DialogActions>
    </Dialog>
  )
}
export default AppConfirmationModal
