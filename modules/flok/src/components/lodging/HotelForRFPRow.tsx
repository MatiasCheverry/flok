import {Button, makeStyles, Paper} from "@material-ui/core"
import {useDispatch} from "react-redux"
import {Link as RouterLink} from "react-router-dom"
import {DestinationModel, HotelModel} from "../../models/lodging"
import {useRetreat} from "../../pages/misc/RetreatProvider"
import {deleteSelectedHotel} from "../../store/actions/lodging"
import {postSelectedHotel} from "../../store/actions/retreat"
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
    flexDirection: "column",
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
    marginTop: "auto",
    marginLeft: "auto",
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  lodgingTagsContainer: {
    display: "flex",
    gap: theme.spacing(0.6),
    marginTop: theme.spacing(1),
    maxWidth: "100%",
    overflow: "hidden",
  },
  attributeTagsContainer: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    overflowWrap: "initial",
  },
  lodgingTag: {
    marginTop: 4,
    color: theme.palette.common.white,
    borderRadius: theme.shape.borderRadius,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: theme.spacing(0.5),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  hotelName: {
    color: theme.palette.common.black,
    "&:hover": {
      textDecoration: "none",
    },
  },
  buttonsDiv: {
    alignSelf: "center",
    marginTop: "auto",
    marginLeft: "auto",
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  routerLink: {
    textDecoration: "none",
  },
}))

type ProposalListRowProps = {
  hotel: HotelModel
  destination: DestinationModel
  selected?: boolean
  setModalOpen: () => void
  hotelLinkTo: string
  outOfRequests: boolean
  deleteId?: number
}
function HotelForRFPRow(props: ProposalListRowProps) {
  let {hotel, destination} = {
    ...props,
  }
  let dispatch = useDispatch()
  let [retreat] = useRetreat()

  let classes = useStyles()
  return (
    <RouterLink to={props.hotelLinkTo} className={classes.routerLink}>
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
                {DestinationUtils.getHotelLocationName(hotel, true)}
              </AppTypography>
              <AppTypography variant="h4">{hotel.name}</AppTypography>
            </div>
            <div className={classes.attributeTagsContainer}>
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
              {hotel.num_rooms && (
                <div className={classes.attributeTag}>
                  <AppTypography variant="body2" noWrap uppercase>
                    Number of Rooms
                  </AppTypography>
                  <AppTypography variant="body1" fontWeight="bold">
                    {hotel.num_rooms}
                  </AppTypography>
                </div>
              )}
            </div>
            <div className={classes.lodgingTagsContainer}>
              {hotel.lodging_tags.map((tag) => {
                return (
                  <div className={classes.lodgingTag}>
                    <AppTypography fontWeight="bold">{tag.name}</AppTypography>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className={classes.buttonsDiv} id="buttond">
          {props.deleteId && (
            <Button
              id="button"
              variant={"outlined"}
              size="small"
              color="primary"
              onClick={(e) => {
                e.preventDefault()
                if (props.deleteId) {
                  dispatch(deleteSelectedHotel(retreat.id, props.deleteId))
                }
              }}>
              Cancel
            </Button>
          )}
          <Button
            id="button"
            variant={"outlined"}
            size="small"
            color="primary"
            disabled={props.selected || props.outOfRequests}
            onClick={(e) => {
              e.preventDefault()
              dispatch(
                postSelectedHotel(
                  "REQUESTED",
                  retreat.id,
                  hotel.id,
                  retreat.request_for_proposal_id
                )
              )
            }}>
            <AppTypography variant="inherit" noWrap>
              {props.selected
                ? "Requested"
                : props.outOfRequests
                ? "No Requests Remaining"
                : "Request Proposal"}
            </AppTypography>
          </Button>
        </div>
      </Paper>
    </RouterLink>
  )
}
export default HotelForRFPRow
