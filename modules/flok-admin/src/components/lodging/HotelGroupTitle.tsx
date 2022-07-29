import {Button, IconButton, makeStyles, TextField} from "@material-ui/core"
import {Edit} from "@material-ui/icons"
import {useFormik} from "formik"
import _ from "lodash"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {AdminSelectedHotelProposalModel, HotelGroup} from "../../models"
import {deleteHotelGroup, patchHotelGroup} from "../../store/actions/admin"
import {ApiAction} from "../../store/actions/api"
import AppTypography from "../base/AppTypography"

let useStyles = makeStyles((theme) => ({
  outerDiv: {
    display: "flex",
    alignItems: "center",
  },
  titleText: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  form: {
    display: "flex",
    alignItems: "center",
  },
  titleTextInput: {
    margin: theme.spacing(1),
  },
  deleteButton: {
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
    marginLeft: theme.spacing(1),
  },
}))
type HotelGroupTitleProps = {
  group: HotelGroup
  hotels: AdminSelectedHotelProposalModel[]
  setHotels: (hotels: AdminSelectedHotelProposalModel[]) => void
}
function HotelGroupTitle(props: HotelGroupTitleProps) {
  let classes = useStyles()
  let dispatch = useDispatch()
  let [editing, setEditing] = useState(false)
  let formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      title: props.group.title,
    },
    onSubmit: async (values) => {
      let response = (await dispatch(
        patchHotelGroup(props.group.id, {...values})
      )) as unknown as ApiAction
      if (!response.error) {
        setEditing(false)
      }
    },
  })

  return (
    <div className={classes.outerDiv}>
      {editing ? (
        <form onSubmit={formik.handleSubmit} className={classes.form}>
          <TextField
            id="title"
            onChange={formik.handleChange}
            label="Group title"
            size="small"
            value={formik.values.title}
            className={classes.titleTextInput}
          />
          {_.isEqual(formik.values, formik.initialValues) ? (
            <Button
              size="small"
              variant="outlined"
              color="primary"
              onClick={() => {
                setEditing(false)
              }}>
              Done
            </Button>
          ) : (
            <Button
              type="submit"
              size="small"
              variant="outlined"
              color="primary">
              Save
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            className={classes.deleteButton}
            onClick={async () => {
              let response = (await dispatch(
                deleteHotelGroup(props.group.id)
              )) as unknown as ApiAction
              if (!response.error) {
                let newHotels = [...props.hotels]
                newHotels.forEach((hotel, index) => {
                  if (hotel.group_id == props.group.id) {
                    let newHotel = hotel
                    newHotel.group_id = undefined
                    newHotels[index] = newHotel
                  }
                })
                props.setHotels(newHotels)
                setEditing(false)
              }
            }}>
            Delete
          </Button>
        </form>
      ) : (
        <>
          <AppTypography variant="h4" className={classes.titleText}>
            {props.group.title}
          </AppTypography>
          <IconButton
            size="small"
            onClick={() => {
              setEditing((editing) => !editing)
            }}>
            <Edit fontSize="small" />
          </IconButton>
        </>
      )}
    </div>
  )
}

export default HotelGroupTitle
