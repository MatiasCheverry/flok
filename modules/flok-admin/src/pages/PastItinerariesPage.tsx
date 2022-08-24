import {Box, Button, makeStyles, Typography} from "@material-ui/core"
import {push} from "connected-react-router"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {RouteComponentProps, withRouter} from "react-router"
import AddPastItineraryLocationForm from "../components/itinerary/AddPastItineraryLocationForm"
import PastItinerariesTable, {
  PastItinerariesTableRow,
} from "../components/itinerary/PastItinerariesTable"
import PageBase from "../components/page/PageBase"
import {
  AdminPastItineraryLocationModel,
  AdminPastItineraryModel,
} from "../models"
import {AppRoutes} from "../Stack"
import {useItineraries, useLocations} from "../utils"

let useStyles = makeStyles((theme) => ({
  body: {
    flex: "1 1 auto",
    width: "100%",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
  },
  table: {
    flex: 1,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
}))

type PastItinerariesPageProps = RouteComponentProps<{}>

function PastItinerariesPage(props: PastItinerariesPageProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()

  let [addPastItineraryLocationFormOpen, setAddPastItineraryLocationFormOpen] =
    useState(false)

  let [all_locations] = useLocations()

  function transformToRows(
    itineraries: AdminPastItineraryModel[]
  ): PastItinerariesTableRow[] {
    return itineraries
      .map((itinerary) => {
        let filtered_locations =
          itinerary !== undefined
            ? (itinerary.location_ids
                .filter((locationId) => all_locations[locationId] !== undefined)
                .map(
                  (locationId: number) => all_locations[locationId]
                ) as AdminPastItineraryLocationModel[])
            : []
        if (itinerary) {
          return {
            id: itinerary.id,
            name: itinerary.name,
            start_date: new Date(itinerary.start_date),
            end_date: new Date(itinerary.end_date),
            hotel_id: itinerary.hotel_id,
            nights: itinerary.nights,
            team_size: itinerary.team_size,
            itinerary_link: itinerary.itinerary_link,
            spotlight_img_id: itinerary.spotlight_img_id,
            location_ids: Object.values(filtered_locations).map(
              (location) => location.name
            ),
          }
        } else {
          return undefined
        }
      })
      .filter((x) => x) as PastItinerariesTableRow[]
  }

  let [itineraries] = useItineraries()

  return (
    <PageBase>
      <div className={classes.body}>
        <Typography variant="h1">Past Itineraries</Typography>
        <Typography variant="body1" component="div" paragraph>
          Select a past itinerary in order to edit itinerary data such as dates,
          nights, locations, etc.
        </Typography>
        <Box display="flex">
          <Box ml={1} clone>
            <Button
              color="primary"
              variant="outlined"
              onClick={() =>
                dispatch(
                  push({
                    pathname: AppRoutes.getPath("PastItineraryPage", {
                      itineraryId: "new",
                    }),
                  })
                )
              }>
              Add a past itinerary
            </Button>
          </Box>
          <Box ml={1} clone>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => {
                setAddPastItineraryLocationFormOpen(true)
              }}>
              Add a past itinerary location
            </Button>
          </Box>
          <AddPastItineraryLocationForm
            open={addPastItineraryLocationFormOpen}
            onClose={() => {
              setAddPastItineraryLocationFormOpen(false)
            }}
          />
        </Box>
        <div className={classes.table}>
          <PastItinerariesTable
            rows={transformToRows(
              Object.values(itineraries).filter(
                (x) => x
              ) as AdminPastItineraryModel[]
            )}
            onSelect={(id) =>
              dispatch(
                push({
                  pathname: AppRoutes.getPath("PastItineraryPage", {
                    itineraryId: id.toString(),
                  }),
                })
              )
            }
          />
        </div>
      </div>
    </PageBase>
  )
}

export default withRouter(PastItinerariesPage)
