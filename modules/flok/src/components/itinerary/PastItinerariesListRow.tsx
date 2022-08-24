import {Button, makeStyles, Paper} from "@material-ui/core"
import React from "react"
import {PastItineraryModel} from "../../models/itinerary"
import {useHotelFromId} from "../../utils/lodgingUtils"
import AppTypography from "../base/AppTypography"

let useStyles = makeStyles((theme) => ({
  card: {
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    borderRadius: theme.shape.borderRadius,
    width: "100%",
    maxWidth: "100%",
    flexDirection: "row",
    padding: theme.spacing(1),
  },
  imgContainer: {
    position: "relative",
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
      verticalAlign: "center",
      height: "100%",
      width: "100%",
    },
  },
  imgAndBodyContainer: {
    display: "flex",
    flexWrap: "nowrap",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: theme.spacing(3),
  },
  attributesContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: theme.spacing(-0.5),
    marginBottom: theme.spacing(0.5),
    "& > *": {
      marginBottom: theme.spacing(0.5),
      marginLeft: theme.spacing(0.5),
    },
  },
  attributeTag: {
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    minWidth: "175px",
    height: "60px",
    padding: theme.spacing(0.5),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    backgroundColor: theme.palette.grey[300],
  },
  tagsContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginLeft: theme.spacing(-0.5),
    "& > *": {
      marginLeft: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
    },
  },
  viewProposalButton: {
    alignSelf: "center",
    padding: "8px 22px",
    marginLeft: "auto",
    marginRight: theme.spacing(1),
  },
}))

type ProposalListRowProps = {
  itinerary: PastItineraryModel
}
export default function ItinerarylListRow(props: ProposalListRowProps) {
  let classes = useStyles(props)
  let {itinerary} = {
    ...props,
  }
  let [hotel] = useHotelFromId(itinerary.hotel_id)

  let startDate = new Intl.DateTimeFormat("en-US", {dateStyle: "long"}).format(
    new Date(itinerary.start_date)
  )
  let endDate = new Intl.DateTimeFormat("en-US", {dateStyle: "long"}).format(
    new Date(itinerary.end_date)
  )

  return (
    <Paper elevation={0} className={classes.card}>
      <div className={classes.imgAndBodyContainer}>
        <div className={classes.imgContainer}>
          <img
            src={itinerary.spotlight_img.image_url}
            alt={`${itinerary.id} spotlight`}
          />
        </div>
        <div className={classes.cardBody}>
          <div className={classes.headerContainer}>
            <AppTypography variant="h4">
              {startDate}
              <text style={{fontWeight: "lighter"}}> to </text>
              {endDate}
            </AppTypography>
          </div>
          <div className={classes.attributesContainer}>
            {itinerary.team_size && (
              <div className={classes.attributeTag}>
                <AppTypography variant="body2" noWrap uppercase>
                  Team Size{" "}
                </AppTypography>
                <AppTypography variant="body1" fontWeight="bold">
                  {itinerary.team_size}
                </AppTypography>
              </div>
            )}
            {itinerary.nights && (
              <div className={classes.attributeTag}>
                <AppTypography variant="body2" noWrap uppercase>
                  Nights{" "}
                </AppTypography>
                <AppTypography variant="body1" fontWeight="bold">
                  {itinerary.nights}
                </AppTypography>
              </div>
            )}
            {hotel && (
              <div className={classes.attributeTag}>
                <AppTypography variant="body2" noWrap uppercase>
                  Hotel{" "}
                </AppTypography>
                <AppTypography variant="body1" fontWeight="bold">
                  {hotel.name}
                </AppTypography>
              </div>
            )}
          </div>
        </div>
      </div>
      <Button
        className={classes.viewProposalButton}
        color="primary"
        href={itinerary.itinerary_link}
        target="_blank">
        <AppTypography variant="inherit" noWrap>
          View Itinerary
        </AppTypography>
      </Button>
    </Paper>
  )
}
