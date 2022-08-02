import {Button, Chip, makeStyles, Paper, Tooltip} from "@material-ui/core"
import {Info} from "@material-ui/icons"
import React from "react"
import {Link as ReactRouterLink} from "react-router-dom"
import {DestinationModel, HotelModel} from "../../models/lodging"
import {HotelLodgingProposal} from "../../models/retreat"
import {formatCurrency} from "../../utils"
import {DestinationUtils, HotelUtils} from "../../utils/lodgingUtils"
import AppMoreInfoIcon from "../base/AppMoreInfoIcon"
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
    marginBottom: theme.spacing(1),
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
    padding: theme.spacing(0.5),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    backgroundColor: theme.palette.grey[300], // matching chip default background color
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
  hotel: HotelModel
  destination: DestinationModel
  proposals: HotelLodgingProposal[]
  openInTab?: boolean
  proposalUrl?: string
  unavailable?: boolean
  requested?: boolean
}
export default function ProposalListRow(props: ProposalListRowProps) {
  let classes = useStyles(props)
  let {hotel, proposals, destination, openInTab, proposalUrl, unavailable} = {
    ...props,
  }

  function getLowestCompare(vals: HotelLodgingProposal[]) {
    if (vals.length > 0) {
      return vals.filter((x) => x.compare_room_rate).sort()[0]
    }
  }

  let lowestProposal = getLowestCompare(proposals)
  let avgRoomCost: string | undefined =
    lowestProposal && lowestProposal.compare_room_rate
      ? formatCurrency(
          lowestProposal.compare_room_rate,
          lowestProposal.currency
        )
      : undefined
  let avgRoomTotal: string | undefined =
    lowestProposal && lowestProposal.compare_room_total
      ? formatCurrency(
          lowestProposal.compare_room_total,
          lowestProposal.currency
        )
      : undefined

  return (
    <Paper elevation={0} className={classes.card}>
      <div className={classes.imgAndBodyContainer}>
        <div className={classes.imgContainer}>
          <img
            src={hotel.spotlight_img.image_url}
            alt={`${hotel.name} spotlight`}
          />
        </div>
        <div className={classes.cardBody}>
          <div className={classes.headerContainer}>
            <AppTypography variant="body2" color="textSecondary" uppercase>
              {DestinationUtils.getLocationName(destination, true, hotel)}
            </AppTypography>
            <AppTypography variant="h4">{hotel.name}</AppTypography>
          </div>
          {!unavailable && (
            <div className={classes.attributesContainer}>
              {avgRoomCost && (
                <div className={classes.attributeTag}>
                  <AppTypography variant="body2" noWrap uppercase>
                    Avg Room Cost{" "}
                    <AppMoreInfoIcon
                      tooltipText={
                        "This cost does not include tax and resort fee (if applicable)."
                      }
                    />
                  </AppTypography>
                  <AppTypography variant="body1" fontWeight="bold">
                    {avgRoomCost}
                  </AppTypography>
                </div>
              )}
              {avgRoomTotal && (
                <div className={classes.attributeTag}>
                  <AppTypography variant="body2" noWrap uppercase>
                    Est. Room Total{" "}
                    <AppMoreInfoIcon
                      tooltipText={
                        "Based on the room rate and anticipated number of attendees. This total is an estimate of rooms only and does not include resort fees (if applicable) or taxes."
                      }
                    />
                  </AppTypography>
                  <AppTypography variant="body1" fontWeight="bold">
                    {avgRoomTotal}
                  </AppTypography>
                </div>
              )}
              {hotel.airport_travel_time && (
                <div className={classes.attributeTag}>
                  <AppTypography variant="body2" noWrap uppercase>
                    Airport distance{" "}
                    <AppMoreInfoIcon
                      tooltipText={`This travel time is calculated to the nearest major airport${
                        hotel.airport ? `(${hotel.airport})` : ""
                      }. There may be smaller regional airports closer to ${DestinationUtils.getLocationName(
                        destination,
                        false,
                        hotel
                      )}.`}
                    />
                  </AppTypography>
                  <AppTypography variant="body1" fontWeight="bold">
                    {HotelUtils.getAirportTravelTime(hotel.airport_travel_time)}
                  </AppTypography>
                </div>
              )}
            </div>
          )}
          {!unavailable && (
            <div className={classes.attributesContainer}>
              {proposals.filter((proposal) => proposal.is_all_inclusive)
                .length > 0 && (
                <Tooltip title="The hotel price represents an all inclusive proposal.">
                  <Chip
                    size="small"
                    color="primary"
                    label={
                      <div>
                        All inclusive <Info fontSize="inherit" />
                      </div>
                    }
                  />
                </Tooltip>
              )}
            </div>
          )}
        </div>
      </div>
      <Button
        className={classes.viewProposalButton}
        disabled={unavailable || props.requested}
        variant={unavailable ? "contained" : "outlined"}
        color="primary"
        {...(openInTab && proposalUrl
          ? {
              component: "a",
              href: proposalUrl,
              target: "_blank",
            }
          : proposalUrl
          ? {
              component: ReactRouterLink,
              to: proposalUrl,
            }
          : {})}>
        <AppTypography variant="inherit" noWrap>
          {!props.requested
            ? unavailable
              ? "No Availability"
              : `View Proposal${
                  proposals!.length > 1 ? `s (${proposals!.length})` : ""
                }`
            : "Requested"}
        </AppTypography>
      </Button>
    </Paper>
  )
}
