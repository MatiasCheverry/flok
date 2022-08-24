import {
  Box,
  makeStyles,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core"
import React, {useEffect, useState} from "react"
import {useSelector} from "react-redux"
import {RetreatModel} from "../../models/retreat"
import {RootState} from "../../store"
import {useQuery} from "../../utils"
import {
  usePastItineraries,
  usePastItineraryLocations,
} from "../../utils/itineraryUtils"
import AppLoadingScreen from "../base/AppLoadingScreen"
import AppTypography from "../base/AppTypography"
import ItineraryListRow from "./PastItinerariesListRow"

let useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    flex: 1,
    height: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  proposalsList: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    marginTop: theme.spacing(2),
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
  },
  container: {
    float: "left",
  },
}))

type PastItineraryListPageBodyProps = {
  retreat: RetreatModel
  retreatIdx: number
}
export default function PastItineraryListPageBody(
  props: PastItineraryListPageBodyProps
) {
  // let {retreat, retreatIdx} = {...props}
  let classes = useStyles(props)

  let [locationIdQuery, setLocationIdQuery] = useQuery("location")
  let [selectedLocationId, setSelectedLocationId] = useState<number | "none">(
    locationIdQuery && parseInt(locationIdQuery)
      ? parseInt(locationIdQuery)
      : "none"
  )
  useEffect(() => {
    setSelectedLocationId(
      locationIdQuery && parseInt(locationIdQuery)
        ? parseInt(locationIdQuery)
        : "none"
    )
  }, [locationIdQuery])
  let [locations, loadingLocations] = usePastItineraryLocations()
  let [itineraries, loadingItineraries] = usePastItineraries()

  let itineraryIds = useSelector((state: RootState) => {
    let ids =
      selectedLocationId !== "none"
        ? state.itinerary.itineraryToLocation[selectedLocationId]
        : []
    return ids ? ids : []
  })
  let activeItineraries = itineraryIds
    .map((id) => itineraries[id])
    .filter((i) => i)

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div>
          <Typography variant="h1">
            Itinerary
            <AppTypography variant="inherit" fontWeight="light">
              {" "}
              - Itinerary Inspiration
            </AppTypography>
          </Typography>
          <Typography
            variant="body1"
            style={{
              paddingBottom: "15px",
            }}>
            Review the following itineraries that past travelers have enjoyed.
          </Typography>
        </div>
      </div>
      <div>
        <div className={classes.container}>
          <Paper elevation={0}>
            <TextField
              fullWidth
              id="location"
              label="Location"
              size="small"
              style={{minWidth: 200}}
              variant="outlined"
              select
              InputLabelProps={{shrink: true}}
              onChange={(e: React.ChangeEvent<{value: unknown}>) => {
                setLocationIdQuery(
                  parseInt(e.target.value as string)
                    ? (e.target.value as string)
                    : null
                )
              }}
              value={selectedLocationId}
              SelectProps={{
                native: false,
              }}>
              {loadingLocations ? (
                <MenuItem key="none" value="none">
                  Loading locations...
                </MenuItem>
              ) : selectedLocationId === "none" ? (
                <MenuItem key="none" value="none">
                  Select a location
                </MenuItem>
              ) : (
                <></>
              )}
              {Object.values(locations)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((location) => (
                  <MenuItem key={location.name} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
            </TextField>
          </Paper>
        </div>
      </div>
      <Box alignItems="center" overflow="auto" width="100%">
        {activeItineraries.length ? (
          activeItineraries.map((itinerary) => (
            <div className={classes.proposalsList}>
              <ItineraryListRow itinerary={itinerary} />
            </div>
          ))
        ) : selectedLocationId === "none" ? (
          <Box marginTop={2}>
            <Typography variant="h3">
              Please select a location to see sample itineraries.
            </Typography>
          </Box>
        ) : loadingItineraries ? (
          <Box marginTop={2}>
            <AppLoadingScreen />
          </Box>
        ) : (
          <Box marginTop={2}>
            <Typography variant="h3">
              Oops, we currently don't have any itineraries for this location.
            </Typography>
          </Box>
        )}
      </Box>
    </div>
  )
}
