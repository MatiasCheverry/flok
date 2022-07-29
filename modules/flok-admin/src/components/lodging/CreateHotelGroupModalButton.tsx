import {Button, Dialog, DialogContent, DialogTitle} from "@material-ui/core"
import {useState} from "react"
import CreateHotelGroupForm from "./CreateHotelGroupForm"

type CreateHotelGroupModalButtonProps = {
  retreatId: number
}
function CreateHotelGroupModalButton(props: CreateHotelGroupModalButtonProps) {
  let [modalOpen, setModalOpen] = useState(false)
  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => {
          setModalOpen(true)
        }}>
        Add Group
      </Button>
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Add Hotel Group</DialogTitle>
        <DialogContent>
          <CreateHotelGroupForm
            retreatId={props.retreatId}
            onSubmit={() => {
              setModalOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
export default CreateHotelGroupModalButton
