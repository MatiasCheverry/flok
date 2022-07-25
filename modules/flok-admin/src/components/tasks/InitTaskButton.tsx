import {Button} from "@material-ui/core"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {addRetreatTasks} from "../../store/actions/admin"

export default function InitTaskButton(props: {retreatId: number}) {
  let [modalOpen, setModalOpen] = useState(false)
  let [version, setVersion] = useState(1)
  let [overwrite, setOverwrite] = useState(false)

  let dispatch = useDispatch()

  let onSubmit = () => {
    dispatch(addRetreatTasks(props.retreatId, version, overwrite))
  }

  return (
    <Button variant="contained" color="primary" onClick={onSubmit}>
      Initialize Retreat Tasks
    </Button>
  )
}
