import {Box, makeStyles} from "@material-ui/core"
import {useEffect, useMemo, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {RouteComponentProps, withRouter} from "react-router-dom"
import AppMoreInfoIcon from "../../components/base/AppMoreInfoIcon"
import AppTypography from "../../components/base/AppTypography"
import ProposalListRow from "../../components/lodging/ProposalListRow"
import PageBody from "../../components/page/PageBody"
import PageContainer from "../../components/page/PageContainer"
import PageHeader from "../../components/page/PageHeader"
import {ResourceNotFound} from "../../models"
import {RetreatSelectedHotelProposal} from "../../models/retreat"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {getHotels} from "../../store/actions/lodging"
import {getHotelGroup} from "../../store/actions/retreat"
import {convertGuid} from "../../utils"
import {DestinationUtils, useDestinations} from "../../utils/lodgingUtils"
import {useRetreatByGuid} from "../../utils/retreatUtils"

let useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1),
    paddingTop: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
      paddingTop: theme.spacing(4),
    },
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    "& > *:not(:first-child):not(:nth-child(2))": {
      marginTop: theme.spacing(2),
    },
  },
  proposalsList: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
  },
}))

type ProposalsListPageProps = RouteComponentProps<{
  retreatGuid: string
}>
function ProposalsListPage(props: ProposalsListPageProps) {
  // Setup
  let dispatch = useDispatch()
  let classes = useStyles(props)

  // Path and query params
  let retreatGuid = convertGuid(props.match.params.retreatGuid)
  let [retreat, loadingRetreat] = useRetreatByGuid(retreatGuid)

  let hotelsById = useSelector((state: RootState) => state.lodging.hotels)
  let selectedHotels = useMemo(
    () =>
      retreat && retreat !== ResourceNotFound ? retreat.selected_hotels : [],
    [retreat]
  )

  useEffect(() => {
    document.title = "Lodging Proposals"
  }, [])
  useEffect(() => {
    if (retreat && retreat !== ResourceNotFound) {
      for (let groupId of retreat.group_ids) {
        if (!hotelGroups.find((group) => group.id === groupId)) {
          dispatch(getHotelGroup(groupId))
        }
      }
    }
  }, [dispatch, retreat])
  let [groupedSelectedHotels, setGroupedSelectedHotels] = useState<
    {destinationId: number; selectedHotels: RetreatSelectedHotelProposal[]}[]
  >([])
  let [showOld, setShowOld] = useState(true)
  useEffect(() => {
    for (let hotel of selectedHotels) {
      if (
        hotel.group_id &&
        hotel.state !== "NOT_AVAILABLE" &&
        hotel.state !== "PENDING"
      ) {
        setShowOld(false)
        console.log(hotel)
        break
      }
    }
  }, [selectedHotels])

  let hotelGroups = useSelector((state: RootState) => {
    return Object.values(state.retreat.hotelGroups).filter((group) => {
      if (retreat && retreat !== ResourceNotFound) {
        return group?.retreat_id === retreat.id
      }
      return false
    })
  })
  // Probably not the best way to set loading state, but will do for now
  let [loadingHotels, setLoadingHotels] = useState(false)
  useEffect(() => {
    async function loadMissingHotels(ids: number[]) {
      setLoadingHotels(true)
      await dispatch(getHotels(ids))
      setLoadingHotels(false)
    }
    let missingHotels = selectedHotels.filter(
      (selectedHotel) => hotelsById[selectedHotel.hotel_id] === undefined
    )
    if (missingHotels.length > 0) {
      let missingHotelIds = missingHotels.map(
        (selectedHotel) => selectedHotel.hotel_id
      )
      loadMissingHotels(missingHotelIds)
    }
  }, [selectedHotels, hotelsById, dispatch, setLoadingHotels])

  let [destinations, loadingDestinations] = useDestinations()

  useEffect(() => {
    let byDestinationId: {[key: number]: RetreatSelectedHotelProposal[]} = {}
    let reviewableHotels = hotelsById
      ? selectedHotels
          .filter((selectedHotel) => hotelsById[selectedHotel.hotel_id])
          .filter((selectedHotel) => selectedHotel.state === "REVIEW")
      : []
    reviewableHotels.forEach((selectedHotel) => {
      let destinationId = hotelsById[selectedHotel.hotel_id].destination_id
      if (!byDestinationId[destinationId]) {
        byDestinationId[destinationId] = []
      }
      byDestinationId[destinationId].push(selectedHotel)
    })
    setGroupedSelectedHotels(
      Object.keys(byDestinationId)
        .sort()
        .map((destId) => {
          let _destId = parseInt(destId)
          return {
            destinationId: _destId,
            selectedHotels: byDestinationId[_destId],
          }
        })
    )
  }, [selectedHotels, hotelsById, retreat, setGroupedSelectedHotels])
  // Set unavailable hotels bucket
  let [unavailableSelectedHotels, setUnavailableSelectedHotels] = useState<
    RetreatSelectedHotelProposal[]
  >([])
  useEffect(() => {
    let unavailableHotels = hotelsById
      ? selectedHotels
          .filter((selectedHotel) => hotelsById[selectedHotel.hotel_id])
          .filter((selectedHotel) => selectedHotel.state === "NOT_AVAILABLE")
          .sort(
            (a, b) =>
              hotelsById[a.hotel_id].destination_id -
              hotelsById[b.hotel_id].destination_id
          )
      : []
    setUnavailableSelectedHotels(unavailableHotels)
  }, [selectedHotels, setUnavailableSelectedHotels, retreat, hotelsById])

  return (
    <PageContainer>
      <PageBody>
        {retreat === ResourceNotFound ? (
          <Box
            height={"100%"}
            display="flex"
            justifyContent="center"
            alignItems="center">
            <AppTypography variant="h4">Retreat not found</AppTypography>
          </Box>
        ) : (
          <div className={classes.root}>
            <PageHeader
              header={`Proposals`}
              subheader="Review proposals from hotels with negotiated prices from our team."
              retreat={retreat ? retreat : undefined}
            />
            {selectedHotels.filter((hotel) => hotel.state !== "PENDING")
              .length === 0 ? (
              loadingRetreat || loadingHotels || loadingDestinations ? (
                <AppTypography variant="body1">Loading...</AppTypography>
              ) : (
                <AppTypography variant="body1">
                  Check back soon. We're currently working on collecting hotel
                  proposals on your behalf!
                </AppTypography>
              )
            ) : undefined}
            {/* Available hotels render */}
            {!showOld &&
              selectedHotels.filter((hotel) => hotel.state !== "PENDING")
                .length !== 0 &&
              hotelGroups
                .sort((a, b) => a.id - b.id)
                .map((group) => {
                  return (
                    <div className={classes.proposalsList}>
                      {!loadingRetreat &&
                        !loadingHotels &&
                        !loadingDestinations && (
                          <AppTypography variant="h2">
                            {group.title}
                          </AppTypography>
                        )}
                      {selectedHotels
                        .filter(
                          (hotel) =>
                            hotel.group_id === group.id &&
                            hotelsById[hotel.hotel_id] &&
                            hotel.state !== "NOT_AVAILABLE" &&
                            hotel.state !== "PENDING"
                        )
                        .map((selectedHotel) => {
                          let hotel = hotelsById[selectedHotel.hotel_id]
                          let destination = destinations[hotel.destination_id]
                          let proposals = selectedHotel.hotel_proposals || []
                          return (
                            destination && (
                              <ProposalListRow
                                hotel={hotel}
                                destination={destination}
                                proposals={proposals}
                                openInTab
                                proposalUrl={AppRoutes.getPath(
                                  "DeprecatedProposalPage",
                                  {
                                    retreatGuid: retreatGuid,
                                    hotelGuid: hotel.guid,
                                  }
                                )}
                              />
                            )
                          )
                        })}
                    </div>
                  )
                })}
            {!showOld &&
            selectedHotels.filter(
              (hotel) =>
                !hotel.group_id &&
                hotelsById[hotel.hotel_id] &&
                hotel.state !== "NOT_AVAILABLE" &&
                hotel.state !== "PENDING"
            ).length ? (
              <div className={classes.proposalsList}>
                <AppTypography variant="h2">Other</AppTypography>
                {selectedHotels
                  .filter(
                    (hotel) =>
                      !hotel.group_id &&
                      hotelsById[hotel.hotel_id] &&
                      hotel.state !== "NOT_AVAILABLE" &&
                      hotel.state !== "PENDING"
                  )
                  .map((selectedHotel) => {
                    let hotel = hotelsById[selectedHotel.hotel_id]
                    let destination = destinations[hotel.destination_id]
                    let proposals = selectedHotel.hotel_proposals || []
                    return (
                      destination && (
                        <ProposalListRow
                          hotel={hotel}
                          destination={destination}
                          proposals={proposals}
                          openInTab
                          proposalUrl={AppRoutes.getPath(
                            "DeprecatedProposalPage",
                            {
                              retreatGuid: retreatGuid,
                              hotelGuid: hotel.guid,
                            }
                          )}
                        />
                      )
                    )
                  })}
              </div>
            ) : (
              ""
            )}
            {/* Old way hotels render */}
            {showOld &&
              groupedSelectedHotels.map((destList) => {
                let destination = destinations[destList.destinationId]
                if (destination && destList.selectedHotels.length) {
                  return (
                    <div className={classes.proposalsList}>
                      <AppTypography variant="h2">
                        {DestinationUtils.getLocationName(destination)}
                      </AppTypography>
                      {destList.selectedHotels.map((selectedHotel) => {
                        let hotel = hotelsById[selectedHotel.hotel_id]
                        let proposals = selectedHotel.hotel_proposals || []
                        return (
                          <ProposalListRow
                            hotel={hotel}
                            destination={destination}
                            proposals={proposals}
                            openInTab
                            proposalUrl={AppRoutes.getPath(
                              "DeprecatedProposalPage",
                              {
                                retreatGuid: retreatGuid,
                                hotelGuid: hotel.guid,
                              }
                            )}
                          />
                        )
                      })}
                    </div>
                  )
                } else {
                  return undefined
                }
              })}
            {/* Unavailable hotels render */}
            {unavailableSelectedHotels.length ? (
              <AppTypography variant="h2">
                Unavailable Hotels{" "}
                <AppMoreInfoIcon tooltipText="We reached out to the following hotels but they cannot support your group during the requested dates." />
              </AppTypography>
            ) : undefined}
            <div className={classes.proposalsList}>
              {unavailableSelectedHotels.map((selectedHotel) => {
                let hotel = hotelsById[selectedHotel.hotel_id]
                let destination = destinations[hotel.destination_id]
                return destination ? (
                  <ProposalListRow
                    unavailable
                    hotel={hotel}
                    proposals={[]}
                    destination={destination}
                  />
                ) : undefined
              })}
            </div>
          </div>
        )}
      </PageBody>
    </PageContainer>
  )
}
export default withRouter(ProposalsListPage)
