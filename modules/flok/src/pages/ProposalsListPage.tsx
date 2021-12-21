import {Button, makeStyles, Paper} from "@material-ui/core"
import {useEffect} from "react"
import {useDispatch, useSelector} from "react-redux"
import AppTypography from "../components/base/AppTypography"
import AppLodgingFlowTimeline from "../components/lodging/AppLodgingFlowTimeline"
import RetreatRequired from "../components/lodging/RetreatRequired"
import PageContainer from "../components/page/PageContainer"
import PageHeader from "../components/page/PageHeader"
import PageOverlay from "../components/page/PageOverlay"
import {ResourceNotFound} from "../models"
import {HotelModel} from "../models/lodging"
import {AppRoutes} from "../Stack"
import {RootState} from "../store"
import {getHotels} from "../store/actions/lodging"
import {convertGuid} from "../utils"
import {
  DestinationUtils,
  useDestinations,
  useRetreat,
} from "../utils/lodgingUtils"

let useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
  },
  card: {
    position: "relative",
    display: "flex",
    borderRadius: theme.shape.borderRadius,
    width: "100%",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(2),
    "& > *:not(:first-child):not($tagsContainer)": {
      marginTop: theme.spacing(1),
    },
  },
  headerContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    [theme.breakpoints.down("xs")]: {
      maxWidth: 140,
    },
  },
  imgContainer: {
    position: "relative",
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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
  spacer: {
    flexGrow: 1,
  },
  viewProposalButton: {
    padding: "8px 22px",
    marginRight: theme.spacing(2),
  },
}))

type ProposalsListPageProps = {retreatGuid: string}
function ProposalsListPage(props: ProposalsListPageProps) {
  // Setup
  let dispatch = useDispatch()
  let classes = useStyles(props)

  // Path and query params
  let retreatGuid = convertGuid(props.retreatGuid)
  let retreat = useRetreat(retreatGuid)

  let hotelsById = useSelector((state: RootState) => state.lodging.hotels)
  let selectedHotels = useSelector((state: RootState) => {
    let retreat = state.retreat.retreats[retreatGuid]
    if (retreat && retreat !== ResourceNotFound) {
      return retreat.selected_hotels
    }
    return []
  })
  useEffect(() => {
    let missingHotels = selectedHotels.filter(
      (selectedHotel) => hotelsById[selectedHotel.hotel_id] === undefined
    )
    if (missingHotels.length > 0) {
      let filter = missingHotels
        .map((selectedHotel) => `id=${selectedHotel.hotel_id}`)
        .join(" OR ")
      dispatch(getHotels(filter))
    }
  }, [selectedHotels, hotelsById, dispatch])

  let destinations = Object.values(useDestinations()[0])

  // Actions
  function onExplore(hotel: HotelModel) {
    const newTab = window.open(
      AppRoutes.getPath("ProposalPage", {
        retreatGuid: props.retreatGuid,
        hotelGuid: hotel.guid,
      }),
      "_blank"
    )
    newTab?.focus()
  }

  return (
    <RetreatRequired retreatGuid={retreatGuid}>
      <PageContainer>
        <PageOverlay>
          <PageHeader
            header={`Proposals`}
            subheader="Review proposals from hotels with negotiated prices from our team."
            preHeader={<AppLodgingFlowTimeline currentStep="PROPOSAL" />}
            retreat={
              retreat && retreat !== ResourceNotFound ? retreat : undefined
            }
          />
          <div className={classes.root}>
            {hotelsById &&
              retreat &&
              retreat !== ResourceNotFound &&
              selectedHotels //TODO
                .filter((selectedHotel) => hotelsById[selectedHotel.hotel_id])
                .sort(
                  (a, b) =>
                    hotelsById[a.hotel_id].destination_id -
                    hotelsById[b.hotel_id].destination_id
                )
                .map((selectedHotel) => {
                  let hotel = hotelsById[selectedHotel.hotel_id]
                  let proposal = selectedHotel.hotel_proposal
                  let proposalReady = false
                  if (proposal && selectedHotel.state === "REVIEW") {
                    proposalReady = true
                  }
                  return (
                    <Paper className={classes.card}>
                      <div className={classes.imgContainer}>
                        <img
                          src={hotel.spotlight_img.image_url}
                          alt={`${hotel.name} spotlight`}
                        />
                      </div>
                      <div className={classes.cardBody}>
                        <div className={classes.headerContainer}>
                          <AppTypography
                            variant="body2"
                            color="textSecondary"
                            uppercase
                            noWrap>
                            {destinations.filter(
                              (dest) => dest.id === hotel.destination_id
                            )[0]
                              ? DestinationUtils.getLocationName(
                                  destinations.filter(
                                    (dest) => dest.id === hotel.destination_id
                                  )[0],
                                  false
                                )
                              : ""}
                          </AppTypography>
                          <AppTypography variant="h4" noWrap>
                            {hotel.name}
                          </AppTypography>
                        </div>
                        {proposalReady ?? (
                          <div className={classes.attributesContainer}>
                            <div className={classes.attributeTag}>
                              <AppTypography variant="body2" noWrap uppercase>
                                Avg Room Cost
                              </AppTypography>
                              <AppTypography variant="body1" fontWeight="bold">
                                {proposal.guestroom_rates}
                              </AppTypography>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={classes.spacer}></div>
                      {proposalReady ? (
                        <Button
                          className={classes.viewProposalButton}
                          variant="outlined"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            onExplore(hotel)
                          }}>
                          View Proposal
                        </Button>
                      ) : (
                        <Button
                          className={classes.viewProposalButton}
                          variant="contained"
                          color="default"
                          disabled>
                          No Availability
                        </Button>
                      )}
                    </Paper>
                  )
                })}
          </div>
        </PageOverlay>
      </PageContainer>
    </RetreatRequired>
  )
}
export default ProposalsListPage