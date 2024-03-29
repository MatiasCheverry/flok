import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Fab,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
} from "@material-ui/core"
import {Close, Compare} from "@material-ui/icons"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {
  HotelGroup,
  RetreatModel,
  RetreatSelectedHotelProposal,
} from "../../models/retreat"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {getHotels} from "../../store/actions/lodging"
import {getHotelGroup} from "../../store/actions/retreat"
import {DestinationUtils, useDestinations} from "../../utils/lodgingUtils"
import AppMoreInfoIcon from "../base/AppMoreInfoIcon"
import AppShareableLinkButton from "../base/AppShareableLinkButton"
import AppTypography from "../base/AppTypography"
import PageLockedModal from "../page/PageLockedModal"
import ProposalComparision from "./ProposalComparison"
import ProposalListRow from "./ProposalListRow"

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
  fab: {
    position: "absolute",
    bottom: theme.spacing(4),
    right: "40%",
    [theme.breakpoints.down("sm")]: {
      right: "50%",
      transform: "translateX(50%)",
    },
    zIndex: 10000,
    "&:disabled": {
      opacity: 1,
      backgroundColor: theme.palette.grey[200],
    },
  },
  compareButton: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  dialogHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  dialogBody: {
    backgroundColor: theme.palette.background.default,
  },
  comparisonContainer: {
    overflowX: "auto",
    width: "100%",
  },
}))

type ProposalsListPageBodyProps = {retreat: RetreatModel; retreatIdx: number}
export default function ProposalsListPageBody(
  props: ProposalsListPageBodyProps
) {
  let {retreat, retreatIdx} = {...props}
  let classes = useStyles(props)
  let dispatch = useDispatch()

  useEffect(() => {
    for (let groupId of retreat.group_ids) {
      if (!hotelGroups.find((group) => group.id === groupId)) {
        dispatch(getHotelGroup(groupId))
      }
    }
  }, [dispatch])

  let hotelsById = useSelector((state: RootState) => state.lodging.hotels)
  let selectedHotels = retreat.selected_hotels

  let hotelGroups = useSelector((state: RootState) => {
    return Object.values(state.retreat.hotelGroups).filter(
      (group) => group?.retreat_id === props.retreat.id
    )
  })

  let [showOld, setShowOld] = useState(true)
  useEffect(() => {
    for (let hotel of selectedHotels) {
      if (
        hotel.group_id &&
        hotel.state !== "NOT_AVAILABLE" &&
        hotel.state !== "PENDING"
      ) {
        setShowOld(false)
        break
      }
    }
  }, [selectedHotels])

  // Probably not the best way to set loading state, but will do for now
  let [loadingHotels, setLoadingHotels] = useState(false)
  let [groupedSelectedHotels, setGroupedSelectedHotels] = useState<
    {destinationId: number; selectedHotels: RetreatSelectedHotelProposal[]}[]
  >([])
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

  let destinations = useDestinations()[0]

  useEffect(() => {
    let byDestinationId: {[key: number]: RetreatSelectedHotelProposal[]} = {}
    let reviewableHotels = hotelsById
      ? selectedHotels
          .filter((selectedHotel) => hotelsById[selectedHotel.hotel_id])
          .filter(
            (selectedHotel) =>
              selectedHotel.state === "REVIEW" ||
              selectedHotel.state === "REQUESTED"
          )
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

  let [showComparison, setShowComparison] = useState(false)
  let [comparing, setComparing] = useState(false)
  let [hotelsToCompare, setHotelsToCompare] = useState<{
    [guid: string]: boolean
  }>({})
  let guidToIdMap = useSelector((state: RootState) => {
    return state.lodging.hotelsGuidMapping
  })

  let hotelsToCompareArray = Object.entries(hotelsToCompare)
    .filter((entry) => entry[1])
    .map((entry) => entry[0])

  function closeComparison() {
    setShowComparison(false)
    setHotelsToCompare({})
    setComparing(false)
  }

  return (
    <div className={classes.root}>
      {comparing && !showComparison && (
        <Fab
          className={classes.fab}
          disabled={hotelsToCompareArray.length < 2}
          onClick={() => {
            setShowComparison(true)
          }}
          variant="extended"
          color="primary">
          <Compare />
          &nbsp; Compare ({hotelsToCompareArray.length}/4)
        </Fab>
      )}
      <Dialog
        fullWidth
        maxWidth="xl"
        open={showComparison}
        classes={{paper: classes.dialogBody}}
        onClose={closeComparison}>
        <div className={classes.dialogHeader}>
          <IconButton size="small" onClick={closeComparison}>
            <Close />
          </IconButton>
        </div>
        <DialogContent>
          <div className={classes.comparisonContainer}>
            <ProposalComparision
              retreat={retreat}
              hotels={hotelsToCompareArray.map(
                (guid) => hotelsById[guidToIdMap[guid] as number]
              )}
            />
          </div>
        </DialogContent>
      </Dialog>
      <div className={classes.header}>
        <div>
          <Typography variant="h1">
            Lodging
            <AppTypography variant="inherit" fontWeight="light">
              - Hotel Proposals
            </AppTypography>
          </Typography>
          <Typography variant="body1">
            Review the following hotel proposals with negotiated prices from our
            team.
          </Typography>
        </div>
        <div className={classes.compareButton}>
          <Tooltip
            title={comparing ? "Cancel Comparison" : "Compare Proposals"}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setComparing((comparing) => !comparing)
              }}>
              {comparing ? "Cancel" : "Compare"}
            </Button>
          </Tooltip>
          <AppShareableLinkButton
            link={
              new URL(
                AppRoutes.getPath("DeprecatedProposalsListPage", {
                  retreatGuid: retreat.guid,
                }),
                window.location.origin
              ).href
            }
          />
        </div>
      </div>
      <Box overflow="auto" width="100%">
        {selectedHotels.filter((hotel) => hotel.state !== "PENDING").length ===
        0 ? (
          loadingHotels ? (
            <AppTypography variant="body1">Loading...</AppTypography>
          ) : (
            <PageLockedModal pageDesc="We're currently working on collecting hotel proposals on your behalf and will let you know they are ready to view!" />
          )
        ) : undefined}
        {/* Available hotels render */}
        {!showOld &&
          selectedHotels.filter((hotel) => hotel.state !== "PENDING").length !==
            0 &&
          hotelGroups
            .filter((group) =>
              checkIfGroupHasHotelsReady(group, selectedHotels)
            )
            .sort((a, b) => a.id - b.id)
            .map((group) => {
              return (
                <div className={classes.proposalsList}>
                  <AppTypography variant="h2">{group.title}</AppTypography>
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
                            topPick={selectedHotel.is_top_pick}
                            hotelsToCompare={hotelsToCompare}
                            updateHotelsToCompare={(
                              guid: string,
                              value: boolean
                            ) => {
                              setHotelsToCompare((hotelsToCompare) => {
                                return {...hotelsToCompare, [guid]: value}
                              })
                            }}
                            comparing={comparing}
                            hotel={hotel}
                            destination={destination}
                            proposals={proposals}
                            proposalUrl={AppRoutes.getPath(
                              "RetreatLodgingProposalPage",
                              {
                                retreatIdx: retreatIdx.toString(),
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
                      topPick={selectedHotel.is_top_pick}
                      hotelsToCompare={hotelsToCompare}
                      updateHotelsToCompare={(guid: string, value: boolean) => {
                        setHotelsToCompare((hotelsToCompare) => {
                          return {...hotelsToCompare, [guid]: value}
                        })
                      }}
                      comparing={comparing}
                      hotel={hotel}
                      destination={destination}
                      proposals={proposals}
                      requested={selectedHotel.state === "REQUESTED"}
                      proposalUrl={AppRoutes.getPath(
                        "RetreatLodgingProposalPage",
                        {
                          retreatIdx: retreatIdx.toString(),
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
        {/* Old way render */}
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
                        topPick={selectedHotel.is_top_pick}
                        hotelsToCompare={hotelsToCompare}
                        updateHotelsToCompare={(
                          guid: string,
                          value: boolean
                        ) => {
                          setHotelsToCompare((hotelsToCompare) => {
                            return {...hotelsToCompare, [guid]: value}
                          })
                        }}
                        comparing={comparing}
                        hotel={hotel}
                        destination={destination}
                        proposals={proposals}
                        proposalUrl={AppRoutes.getPath(
                          "RetreatLodgingProposalPage",
                          {
                            retreatIdx: retreatIdx.toString(),
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
        <div className={classes.proposalsList}>
          {unavailableSelectedHotels.length ? (
            <AppTypography variant="h2">
              Unavailable Hotels{" "}
              <AppMoreInfoIcon tooltipText="We reached out to the following hotels but they cannot support your group during the requested dates." />
            </AppTypography>
          ) : undefined}
          {unavailableSelectedHotels.map((selectedHotel) => {
            let hotel = hotelsById[selectedHotel.hotel_id]
            let destination = destinations[hotel.destination_id]
            return destination ? (
              <ProposalListRow
                topPick={selectedHotel.is_top_pick}
                comparing={comparing}
                unavailable
                hotel={hotel}
                proposals={[]}
                destination={destination}
              />
            ) : undefined
          })}
        </div>
      </Box>
    </div>
  )
}

export function checkIfGroupHasHotelsReady(
  group: HotelGroup,
  hotels: RetreatSelectedHotelProposal[]
) {
  return !!hotels.find((hotel) => {
    return (
      hotel.group_id === group.id &&
      (hotel.state === "REVIEW" ||
        hotel.state === "REQUESTED" ||
        hotel.state === "SELECTED")
    )
  })
}
