import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core"
import {Autocomplete} from "@material-ui/lab"
import {useFormik} from "formik"
import _ from "lodash"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import * as yup from "yup"
import {RetreatModel} from "../../models/retreat"
import {useRetreat} from "../../pages/misc/RetreatProvider"
import {RootState} from "../../store"
import {ApiAction} from "../../store/actions/api"
import {getHotels} from "../../store/actions/lodging"
import {patchRetreat} from "../../store/actions/retreat"
import {getTextFieldErrorProps} from "../../utils"
import AppLoadingScreen from "../base/AppLoadingScreen"

let useStyles = makeStyles((theme) => ({
  textField: {
    marginBottom: theme.spacing(2),
  },
}))
type ContractFormModalProps = {
  open: boolean
  sideNav?: boolean
  onClose?: () => void
}
function ContractFormModal(props: ContractFormModalProps) {
  let classes = useStyles()
  let [retreat] = useRetreat()
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      lodging_final_destination: retreat.lodging_final_destination || "",
      lodging_final_hotel_id: retreat.lodging_final_hotel_id || -1,
      lodging_final_start_date: retreat.lodging_final_start_date || "",
      lodging_final_end_date: retreat.lodging_final_end_date || "",
      lodging_final_contract_url: retreat.lodging_final_contract_url || "",
    },
    onSubmit: async (values) => {
      setLoading(true)
      let newValues: Partial<RetreatModel> = {...values}
      for (let key in newValues) {
        if (newValues[key as keyof RetreatModel] === "") {
          newValues[key as keyof RetreatModel] = undefined
        }
      }
      let response = (await dispatch(
        patchRetreat(retreat.id, newValues)
      )) as unknown as ApiAction
      setLoading(false)

      if (!response.error && props.onClose !== undefined) {
        props.onClose()
      }
    },
    validationSchema: yup.object().shape({
      lodging_final_contract_url: yup.string().url("Enter a valid url"),
    }),
  })

  let selectedHotels = retreat.selected_hotels
  let hotelsById = useSelector((state: RootState) => state.lodging.hotels)
  useEffect(() => {
    dispatch(getHotels(selectedHotels.map((hotel) => hotel.hotel_id)))
  }, [dispatch, selectedHotels])
  return (
    <Dialog
      open={props.open}
      style={props.sideNav ? {zIndex: 1000} : {}}
      onClose={props.onClose !== undefined ? props.onClose : undefined}>
      <DialogTitle>Contract Details</DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Typography>
            Please only fill out this form once you have recieved the final
            details on your contract
          </Typography>
          <Autocomplete
            className={classes.textField}
            fullWidth
            id="lodging_final_hotel_id"
            options={selectedHotels}
            getOptionLabel={(option) =>
              hotelsById[option.hotel_id]
                ? hotelsById[option.hotel_id].name
                : option.hotel_id.toString()
            }
            value={selectedHotels.find(
              (hotel) => hotel.hotel_id === formik.values.lodging_final_hotel_id
            )}
            onInputChange={(event, value: string, reason: string) => {
              formik.setFieldValue(
                "lodging_final_hotel_id",
                Object.values(hotelsById).find((hotel) => hotel.name === value)
                  ?.id
              )
            }}
            renderInput={(params) => (
              <TextField required {...params} label="Selected Hotel" />
            )}
          />
          <TextField
            className={classes.textField}
            id="lodging_final_destination"
            label="Destination"
            required
            fullWidth
            InputLabelProps={{shrink: true}}
            onChange={formik.handleChange}
            value={formik.values.lodging_final_destination}
          />
          <TextField
            className={classes.textField}
            id="lodging_final_start_date"
            type="date"
            label="Start date"
            onChange={formik.handleChange}
            fullWidth
            InputLabelProps={{shrink: true}}
            value={formik.values.lodging_final_start_date}
          />
          <TextField
            className={classes.textField}
            id="lodging_final_end_date"
            type="date"
            label="End date"
            onChange={formik.handleChange}
            fullWidth
            InputLabelProps={{shrink: true}}
            value={formik.values.lodging_final_end_date}
          />
          <TextField
            className={classes.textField}
            id="lodging_final_contract_url"
            label="Final Contract Link"
            fullWidth
            InputLabelProps={{shrink: true}}
            onChange={formik.handleChange}
            value={formik.values.lodging_final_contract_url}
            {...getTextFieldErrorProps(formik, "lodging_final_contract_url")}
          />
        </DialogContent>
        <DialogActions>
          {loading ? (
            <AppLoadingScreen />
          ) : (
            <Button
              type="submit"
              size="small"
              disabled={_.isEqual(formik.values, formik.initialValues)}>
              {"Submit"}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  )
}
export default ContractFormModal
