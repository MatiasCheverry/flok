import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Paper,
  TextField,
  TextFieldProps,
  Typography,
} from "@material-ui/core"
import {Autocomplete} from "@material-ui/lab"
import {useFormik} from "formik"
import _ from "lodash"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import * as yup from "yup"
import config, {GOOGLE_API_KEY} from "../../config"
import {AdminHotelDetailsModel} from "../../models"
import {RootState} from "../../store"
import {
  addGooglePlace,
  getLodgingTags,
  patchHotel,
} from "../../store/actions/admin"
import {ApiAction} from "../../store/actions/api"
import {
  fetchGooglePlace,
  getTextFieldErrorProps,
  nullifyEmptyString,
  useDestinations,
  useScript,
} from "../../utils"
import AppLoadingScreen from "../base/AppLoadingScreen"
import AppTypography from "../base/AppTypography"
import GooglePlacesAutoComplete from "./GoogleLocationsAutocomplete"

let useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    marginLeft: theme.spacing(-2),
    "& > *": {
      marginTop: theme.spacing(2),
      marginLeft: theme.spacing(2),
    },
  },
  formGroup: {
    position: "relative",
    padding: theme.spacing(2),
    display: "flex",
    width: "100%",
    flexDirection: "column",
    "& > *:nth-child(n+3)": {marginTop: theme.spacing(2)},
  },
  locationGroup: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    gap: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      flexDirection: "row",
    },
  },
}))

type HotelProfileFormProps = {
  hotel: AdminHotelDetailsModel
}
export default function HotelProfileForm(props: HotelProfileFormProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()
  let [destinations, destinationsLoading] = useDestinations()
  let [loadingUpdate, setLoadingUpdate] = useState(false)
  let [tagsDialogOpen, setTagsDialogOpen] = useState(false)
  let lodgingTags = useSelector((state: RootState) => {
    return state.admin.lodgingTags
  })
  let [googleMapScriptLoaded] = useScript(
    `https://maps.googleapis.com/maps/api/js?libraries=places&key=${config.get(
      GOOGLE_API_KEY
    )}`
  )
  let [selectedGooglePlaceId, setSelectedGooglePlaceId] = useState("")

  let googlePlaces = useSelector((state: RootState) => state.admin.googlePlaces)
  useEffect(() => {
    !Object.values(lodgingTags).length && dispatch(getLodgingTags())
  }, [dispatch, lodgingTags])

  async function updateHotelProfile(values: Partial<AdminHotelDetailsModel>) {
    setLoadingUpdate(true)
    let response = (await dispatch(
      patchHotel(props.hotel.id, values)
    )) as unknown as ApiAction
    setLoadingUpdate(false)
    if (!response.error) {
      setInitialFormikValues(formik.values)
    }
  }

  let [autoCompleteInput, setAutoCompleteInput] = useState(
    props.hotel.google_place_name ?? ""
  )
  function returnLatLng(): [number, number] | undefined {
    let lat = !googlePlaces[selectedGooglePlaceId]
      ? props.hotel.address_coordinates
        ? props.hotel.address_coordinates[1]
        : undefined
      : googlePlaces[selectedGooglePlaceId].lng
    let lng = !googlePlaces[selectedGooglePlaceId]
      ? props.hotel.address_coordinates
        ? props.hotel.address_coordinates[0]
        : undefined
      : googlePlaces[selectedGooglePlaceId].lat
    if (lat && lng) {
      return [lat, lng]
    }
  }

  useEffect(() => {
    if (props.hotel.google_place_name) {
      setAutoCompleteInput(props.hotel.google_place_name)
    }
  }, [props.hotel.google_place_name])
  let formik = useFormik({
    enableReinitialize: true,
    initialValues: nullifyEmptyString({
      name: props.hotel.name,
      destination_id: props.hotel.destination_id,
      airport: props.hotel.airport,
      airport_travel_time: props.hotel.airport_travel_time,
      description_short: props.hotel.description_short,
      website_url: props.hotel.website_url,
      sub_location: props.hotel.sub_location,
      lodging_tags: props.hotel.lodging_tags,
      city: !googlePlaces[selectedGooglePlaceId]
        ? props.hotel.city
        : googlePlaces[selectedGooglePlaceId].city,
      state: !googlePlaces[selectedGooglePlaceId]
        ? props.hotel.state
        : googlePlaces[selectedGooglePlaceId].state,
      country: !googlePlaces[selectedGooglePlaceId]
        ? props.hotel.country
        : googlePlaces[selectedGooglePlaceId].country,
      num_rooms: props.hotel.num_rooms,
      address_coordinates: returnLatLng(),
      google_place_name: !googlePlaces[selectedGooglePlaceId]
        ? props.hotel.google_place_name
        : googlePlaces[selectedGooglePlaceId].name,
      google_place_id: !googlePlaces[selectedGooglePlaceId]
        ? props.hotel.google_place_id
        : googlePlaces[selectedGooglePlaceId].place_id,
    }),
    validationSchema: yup.object({
      website_url: yup.string().url().nullable(),
      num_rooms: yup.number().nullable(),
      airport_travel_time: yup.number().nullable(),
    }),
    onSubmit: updateHotelProfile,
  })
  let [initialFormikValues, setInitialFormikValues] = useState(
    formik.initialValues
  )
  const commonTextFieldProps: TextFieldProps = {
    onChange: formik.handleChange,
    InputLabelProps: {shrink: true},
    disabled: loadingUpdate,
  }
  return (
    <form className={classes.root} onSubmit={formik.handleSubmit}>
      <Paper elevation={0} className={classes.formGroup}>
        <div>{loadingUpdate ? <AppLoadingScreen /> : undefined}</div>
        <Dialog
          open={tagsDialogOpen}
          onClose={() => {
            setTagsDialogOpen(false)
          }}>
          <DialogTitle>Choose Hotel Tags</DialogTitle>
          <DialogContent style={{minWidth: 400}}>
            <div style={{display: "flex", flexDirection: "column", gap: 8}}>
              {Object.values(lodgingTags).map((tag) => {
                return (
                  <div style={{display: "flex", alignItems: "center"}}>
                    <Checkbox
                      key={tag.id}
                      color="primary"
                      checked={
                        formik.values.lodging_tags
                          ?.map((tag) => tag.id)
                          .indexOf(tag.id) !== -1
                      }
                      onChange={(e, checked) => {
                        if (checked) {
                          formik.setFieldValue(
                            "lodging_tags",
                            formik.values.lodging_tags
                              ? [...formik.values.lodging_tags, tag]
                              : [tag]
                          )
                        } else if (formik.values.lodging_tags) {
                          let index = formik.values.lodging_tags
                            .map((tag) => tag.id)
                            .indexOf(tag.id)
                          let tagsCopy = [...formik.values.lodging_tags]
                          tagsCopy.splice(index, 1)
                          formik.setFieldValue("lodging_tags", tagsCopy)
                        }
                      }}
                    />
                    <AppTypography style={{fontSize: "1.3rem"}}>
                      {tag.name}
                    </AppTypography>
                  </div>
                )
              })}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setTagsDialogOpen(false)
              }}>
              Done
            </Button>
          </DialogActions>
        </Dialog>
        <Typography variant="h4">Hotel General Info</Typography>
        <TextField
          {...commonTextFieldProps}
          id="name"
          label="Hotel name"
          value={formik.values.name ?? ""}
          fullWidth
        />
        <TextField
          {...commonTextFieldProps}
          id="num_rooms"
          label="Number of Rooms"
          error={!!formik.errors.num_rooms}
          helperText={
            !!formik.errors.num_rooms ? "This field must be a number" : ""
          }
          value={formik.values.num_rooms ?? ""}
          fullWidth
          onChange={(e) => {
            formik.setFieldValue("num_rooms", e.target.value)
          }}
        />

        <TextField
          {...commonTextFieldProps}
          id="website_url"
          type="url"
          label="Website URL"
          value={formik.values.website_url ?? ""}
          fullWidth
          {...getTextFieldErrorProps(formik, "website_url")}
        />
        <TextField
          {...commonTextFieldProps}
          id="description_short"
          label="Description (short)"
          value={formik.values.description_short ?? ""}
          fullWidth
          multiline
          maxRows={3}
        />
        <Autocomplete
          id="retreatIds"
          value={formik.values.lodging_tags}
          multiple
          getOptionLabel={(tag) => tag.name}
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
              onClick={() => {
                setTagsDialogOpen(true)
              }}
              onChange={undefined}
              label="Hotel Tags"
              placeholder="Select Hotel Tags"
            />
          )}
          options={Object.values(lodgingTags)}
          onChange={async (e, newVals) => {
            formik.setFieldValue("lodging_tags", newVals)
          }}
        />

        <Typography variant="h4">Hotel Location</Typography>
        <GooglePlacesAutoComplete
          inputLabel="Add Hotel or Hotel Address"
          onInputChange={(e, value) => {
            setAutoCompleteInput(value)
          }}
          inputValue={autoCompleteInput}
          onChange={(e, value, reason) => {
            if (reason === "select-option" && googleMapScriptLoaded) {
              setSelectedGooglePlaceId(value.place_id)
              fetchGooglePlace(value.place_id, (place) => {
                dispatch(addGooglePlace(place))
              })
            }
          }}
          selectedOptions={[]}
        />
        <div className={classes.locationGroup}>
          <TextField
            {...commonTextFieldProps}
            id="city"
            label="City"
            value={formik.values.city ?? ""}
            fullWidth
          />
          <TextField
            {...commonTextFieldProps}
            id="state"
            label="State"
            value={formik.values.state ?? ""}
            fullWidth
          />
          <TextField
            {...commonTextFieldProps}
            id="country"
            label="Country"
            value={formik.values.country ?? ""}
            fullWidth
          />
        </div>
        <div className={classes.locationGroup}>
          <TextField
            {...commonTextFieldProps}
            id="airport"
            label="Closest major airport (3-letter code)"
            value={formik.values.airport ?? ""}
            inputProps={{maxLength: 3}}
            fullWidth
          />
          <TextField
            {...commonTextFieldProps}
            id="airport_travel_time"
            label="Airport travel time (in mins)"
            error={!!formik.errors.airport_travel_time}
            helperText={
              !!formik.errors.airport_travel_time
                ? "This field must be a number"
                : ""
            }
            value={formik.values.airport_travel_time}
            fullWidth
          />
        </div>
        <Typography variant="h4">For Proposals</Typography>
        <TextField
          {...commonTextFieldProps}
          id="destination_id"
          label="Destination"
          value={formik.values.destination_id ?? ""}
          select
          SelectProps={{native: true}}
          fullWidth
          onChange={(e) => {
            formik.setFieldValue("destination_id", parseInt(e.target.value))
          }}>
          {destinationsLoading ? (
            <option>Loading destinations...</option>
          ) : undefined}
          {Object.values(destinations)
            .sort((destA, destB) =>
              ("" + destA!.location).localeCompare(destB!.location)
            )
            .map((dest) => {
              return (
                <option value={dest!.id} key={dest!.id}>
                  {dest!.location}
                </option>
              )
            })}
        </TextField>
        <TextField
          {...commonTextFieldProps}
          id="sub_location"
          label="Sub Location"
          value={formik.values.sub_location ?? ""}
          fullWidth
          helperText='Only add if it should be different from the "main" destination'
        />
      </Paper>
      <Box width="100%" display="flex" justifyContent="flex-end">
        <Button
          disabled={
            _.isEqual(
              nullifyEmptyString(formik.values),
              nullifyEmptyString(initialFormikValues)
            ) ||
            loadingUpdate ||
            !formik.isValid
          }
          type="submit"
          color="primary"
          variant="contained">
          Save Changes
        </Button>
      </Box>
    </form>
  )
}
