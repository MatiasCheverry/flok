import {
  Button,
  InputLabel,
  makeStyles,
  Paper,
  TextField,
  TextFieldProps,
} from "@material-ui/core"
import {Autocomplete} from "@material-ui/lab"
import {useFormik} from "formik"
import _ from "lodash"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import * as yup from "yup"
import AppImageUpload from "../../components/base/AppImageUpload"
import {
  AdminImageModel,
  AdminPastItineraryLocationModel,
  AdminPastItineraryModel,
} from "../../models"
import {RootState} from "../../store"
import {
  getHotelDetails,
  PastItineraryPostModel,
} from "../../store/actions/admin"
import {
  getTextFieldErrorProps,
  nullifyEmptyString,
  useLocations,
} from "../../utils"
import HotelSelectModal from "../lodging/HotelSelectModal"

let useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    marginTop: -theme.spacing(2),
    marginLeft: -theme.spacing(2),
    "& > *": {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(2),
      padding: theme.spacing(2),
    },
  },
  formGroup: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    "& > *:not(:first-child)": {marginTop: theme.spacing(2)},
  },
  imgContainer: {
    flexShrink: 0,
    marginRight: theme.spacing(1),
    height: 150,
    width: 220,
    [theme.breakpoints.down("xs")]: {
      height: 100,
      width: 133,
    },
    "& img": {
      borderRadius: theme.shape.borderRadius,
      objectFit: "cover",
      horizontalAlign: "center",
      height: "100%",
      width: "100%",
    },
  },
}))
type PastItineraryFormValues = Pick<
  AdminPastItineraryModel,
  | "name"
  | "end_date"
  | "start_date"
  | "hotel_id"
  | "itinerary_link"
  | "location_ids"
  | "nights"
  | "spotlight_img_id"
  | "team_size"
  | "spotlight_img"
>
type PastItineraryEditFormProps = {
  itinerary: Partial<PastItineraryFormValues>
  onSubmit: (values: PastItineraryPostModel) => void
}
export default function PastItineraryEditForm(
  props: PastItineraryEditFormProps
) {
  let classes = useStyles(props)
  let dispatch = useDispatch()
  let {itinerary} = props

  let [spotlightImage, setSpotlightImage] = useState<
    AdminImageModel | undefined
  >(itinerary.spotlight_img)

  useEffect(() => {
    setSpotlightImage(itinerary.spotlight_img)
  }, [itinerary.spotlight_img])

  let [all_locations] = useLocations()

  let formik = useFormik<PastItineraryPostModel>({
    enableReinitialize: true,
    validateOnBlur: true,
    initialValues: {
      name: props.itinerary.name || "",
      start_date: props.itinerary.start_date || "",
      end_date: props.itinerary.end_date || "",
      nights: props.itinerary.nights || 0,
      team_size: props.itinerary.team_size || 0,
      location_ids: props.itinerary.location_ids || [],
      hotel_id: props.itinerary.hotel_id || 0,
      itinerary_link: props.itinerary.itinerary_link || "",
      spotlight_img_id: props.itinerary.spotlight_img_id || 0,
    },
    validationSchema: yup.object({
      name: yup.string().required(),
      start_date: yup.date().required(),
      end_date: yup.date().required(),
      nights: yup.number().required().positive(),
      team_size: yup.number().required().positive(),
      hotel_id: yup.number().required().positive(),
      itinerary_link: yup.string().url().required(),
      spotlight_img_id: yup.number().required().positive(),
      location_ids: yup.array(yup.number()),
    }),
    onSubmit: (values) => {
      props.onSubmit(values)
    },
  })

  const commonTextFieldProps: TextFieldProps = {
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    InputLabelProps: {shrink: true},
  }

  let [hotelSearchOpen, setHotelSearchOpen] = useState(false)
  let selectedHotel = useSelector((state: RootState) => {
    if (formik.values.hotel_id) {
      return state.admin.hotelsDetails[formik.values.hotel_id]
    }
  })
  let [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadHotel(id: number) {
      setLoading(true)
      await dispatch(getHotelDetails(id))
      setLoading(false)
    }
    if (!selectedHotel && formik.values.hotel_id) {
      loadHotel(formik.values.hotel_id)
    }
  }, [dispatch, selectedHotel, formik.values.hotel_id])

  return (
    <form className={classes.root} onSubmit={formik.handleSubmit}>
      <Paper elevation={0} className={classes.formGroup}>
        <TextField
          {...commonTextFieldProps}
          {...getTextFieldErrorProps(formik, "name", true)}
          id="name"
          value={formik.values.name}
          required
          label="Name"
          type="text"
        />
        <TextField
          {...commonTextFieldProps}
          {...getTextFieldErrorProps(formik, "start_date", true)}
          id="start_date"
          value={formik.values.start_date}
          required
          label="Start Date"
          type="date"
        />
        <TextField
          {...commonTextFieldProps}
          {...getTextFieldErrorProps(formik, "end_date", true)}
          id="end_date"
          value={formik.values.end_date}
          required
          label="End Date"
          type="date"
        />
        <TextField
          {...commonTextFieldProps}
          {...getTextFieldErrorProps(formik, "nights", true)}
          id="nights"
          value={formik.values.nights}
          type="number"
          label="Nights"
          required
        />
        <TextField
          {...commonTextFieldProps}
          {...getTextFieldErrorProps(formik, "team_size", true)}
          id="team_size"
          value={formik.values.team_size}
          type="number"
          label="Team Size"
          required
        />
        <Autocomplete
          id="location_ids"
          value={formik.values.location_ids}
          multiple
          getOptionLabel={(r) => {
            let currLocation = all_locations ? all_locations[r] : undefined
            if (currLocation !== undefined) {
              return currLocation.name
            } else {
              return " "
            }
          }}
          filterSelectedOptions
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          renderInput={(params) => (
            <TextField
              {...params}
              {...commonTextFieldProps}
              inputProps={{
                ...params.inputProps,
                onKeyPress: (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    return false
                  }
                },
              }}
              onChange={undefined}
              label="Location(s)"
              placeholder="Select a location"
            />
          )}
          options={(
            Object.values(all_locations).filter(
              (location) => location !== undefined
            ) as AdminPastItineraryLocationModel[]
          ).map((location) => location.id)}
          onChange={(e, newVals) =>
            formik.setFieldValue("location_ids", newVals)
          }
        />
        <TextField
          {...commonTextFieldProps}
          {...getTextFieldErrorProps(formik, "hotel_id", true)}
          type="text"
          label="Hotel"
          placeholder="Select a hotel"
          required
          focused={false}
          onFocus={(e) => {
            setHotelSearchOpen(true)
            e.target.blur()
          }}
          value={
            loading ? "Loading..." : selectedHotel ? selectedHotel.name : ""
          }
        />
        {hotelSearchOpen && (
          <HotelSelectModal
            submitText="Select"
            onSubmit={(hotelId) => formik.setFieldValue("hotel_id", hotelId)}
            onClose={() => {
              setHotelSearchOpen(false)
              formik.setFieldTouched("hotel_id", true)
            }}
          />
        )}
        <TextField
          {...commonTextFieldProps}
          {...getTextFieldErrorProps(formik, "itinerary_link", true)}
          id="itinerary_link"
          value={formik.values.itinerary_link}
          required
          type="text"
          label="Itinerary Link"
        />
        <AppImageUpload
          value={spotlightImage}
          handleChange={(image) => {
            formik.setFieldValue("spotlight_img_id", image.id)
            setSpotlightImage(image)
          }}
          label={
            <InputLabel error={!!formik.errors.spotlight_img_id} required>
              Spotlight image
            </InputLabel>
          }
          showPreview
        />
      </Paper>
      <Button
        disabled={
          _.isEqual(
            nullifyEmptyString(formik.initialValues),
            nullifyEmptyString(formik.values)
          ) || !formik.isValid
        }
        type="submit"
        variant="contained"
        style={{width: "100%"}}
        color="primary">
        Submit changes
      </Button>
    </form>
  )
}
