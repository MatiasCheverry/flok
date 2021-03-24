import {
  Box,
  Button,
  Grid,
  ListItem,
  makeStyles,
  StandardProps,
  TextField,
  Typography,
} from "@material-ui/core"
import clsx from "clsx"
import {useState} from "react"
import {GooglePlaceType} from "../../models"
import {RetreatEmployeeLocation} from "../../models/retreat"
import AppList from "../AppList"
import AppLocationFinder from "../AppLocationFinder"
import AppLocationList from "../AppLocationList"

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    paddingTop: theme.spacing(4),
    flexDirection: "row",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "center",
    },
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  footerText: {
    marginTop: theme.spacing(1),
    textAlign: "center",
  },
  uploadSection: {
    textAlign: "center",
    width: "100%",
    justifyContent: "space-around",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
    },
  },
  textFieldNoOutline: {},
}))

interface RetreatEmployeeOnboardingProps extends StandardProps<{}, "root"> {
  postEmployeeLocations: (
    employeeLocations: RetreatEmployeeLocation[],
    extraInfo?: string
  ) => void
}

export default function RetreatEmployeeOnboarding(
  props: RetreatEmployeeOnboardingProps
) {
  const classes = useStyles(props)

  let [employeeLocations, setEmployeeLocations] = useState<
    {
      location: GooglePlaceType
      number: number
    }[]
  >([])
  let [extraInfo, setExtraInfo] = useState("")

  // Optional form + submit button only show when location is added
  //  they stay stay sticky event when locations are all removed
  let [showSubmit, setShowSubmit] = useState(false)

  function addEmployeeLocation(location: GooglePlaceType): void {
    if (
      !employeeLocations
        .map((loc) => loc.location.placeId)
        .includes(location.placeId)
    ) {
      setEmployeeLocations([
        ...employeeLocations,
        {location: location, number: 1},
      ])
    }
    if (!showSubmit) setShowSubmit(true)
  }
  function removeEmployeeLocation(location: GooglePlaceType): void {
    setEmployeeLocations(
      employeeLocations.filter((loc) => location !== loc.location)
    )
  }
  function setEmployeeLocationNumber(
    location: GooglePlaceType,
    number: number
  ): void {
    setEmployeeLocations(
      employeeLocations.map((loc) =>
        location === loc.location ? {...loc, number} : loc
      )
    )
  }

  return (
    <Grid item container className={clsx(classes.root, props.className)}>
      <Grid item md={6} xs={10}>
        <Typography variant="h3">
          Where are your team members located?
        </Typography>
        <AppLocationFinder onSelectLocation={addEmployeeLocation} />
        {employeeLocations.length ? (
          <AppLocationList
            locations={employeeLocations}
            onRemoveLocation={removeEmployeeLocation}
            onSetLocationNumber={setEmployeeLocationNumber}
          />
        ) : undefined}
        {showSubmit ? (
          <>
            <Box marginTop={2}>
              <AppList>
                <ListItem>
                  <Typography variant="body1">
                    <Box component="span" fontWeight="fontWeightMedium">
                      (Optional) provide additional details
                    </Box>
                  </Typography>
                </ListItem>
                <ListItem>
                  <TextField
                    multiline
                    fullWidth
                    variant="outlined"
                    rows={3}
                    rowsMax={8}
                    placeholder="E.g. we still aren’t sure if 2 people from NY and 1 person from SF can make it. We are giving them a deadline of [2 weeks from now] to decide"
                    value={extraInfo}
                    onChange={(e) => setExtraInfo(e.target.value)}
                  />
                </ListItem>
              </AppList>
            </Box>
            <Button
              onClick={() =>
                props.postEmployeeLocations(employeeLocations, extraInfo)
              }
              className={classes.submitButton}
              variant="contained"
              color="primary"
              fullWidth>
              Continue to retreat proposals
            </Button>
            {employeeLocations.length ? (
              <Typography className={classes.footerText} variant="body1">
                {employeeLocations
                  .map((loc) => loc.number)
                  .reduce((prev, curr) => prev + curr)}{" "}
                people going on the trip
              </Typography>
            ) : undefined}
          </>
        ) : undefined}
      </Grid>
    </Grid>
  )
}
