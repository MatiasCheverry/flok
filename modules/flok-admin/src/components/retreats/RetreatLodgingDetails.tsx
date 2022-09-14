import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Link,
  makeStyles,
  Modal,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core"
import {Favorite, Menu} from "@material-ui/icons"
import {useFormik} from "formik"
import querystring from "querystring"
import {useEffect, useState} from "react"
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd"
import {useDispatch, useSelector} from "react-redux"
import {Link as ReactRouterLink} from "react-router-dom"
import config, {FLOK_BASE_URL_KEY} from "../../config"
import {AdminRetreatModel, AdminSelectedHotelProposalModel} from "../../models"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {
  deleteRetreatHotelProposal,
  deleteSelectedHotel,
  getDestinations,
  getHotelGroup,
  getHotelsByHotelId,
  postHotelProposal,
  postSelectedHotel,
  putRetreatHotelProposal,
  putSelectedHotel,
} from "../../store/actions/admin"
import {ApiAction} from "../../store/actions/api"
import {nullifyEmptyString} from "../../utils"
import AppTypography from "../base/AppTypography"
import ConfirmationModal from "../base/ConfirmationModal"
import CreateHotelGroupModalButton from "../lodging/CreateHotelGroupModalButton"
import HotelGroupTitle from "../lodging/HotelGroupTitle"
import HotelSelectModal from "../lodging/HotelSelectModal"
import HotelProposalForm from "./HotelProposalForm"

let useAccordionItemStyles = makeStyles((theme) => ({
  accordionDetails: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  heart: {
    color: theme.palette.primary.light,
  },
  nameDisplay: {
    display: "flex",
  },
  rfpModal: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  rfpModalTitle: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuIcon: {
    marginLeft: theme.spacing(2),
  },
}))

function HotelAccordionItem(props: {
  selectedHotel: AdminSelectedHotelProposalModel
  hotel: {name: string; location: string}
  retreatRFPId?: number
}) {
  let classes = useAccordionItemStyles()
  let dispatch = useDispatch()
  let [expanded, setExpanded] = useState(false)
  let [activeProposalIndex, setActiveProposalIndex] = useState(0)

  let [newProposalModalOpen, setNewProposalModalOpen] = useState(false)
  let [newProposalDates, setNewProposalDates] = useState<string | undefined>(
    undefined
  )
  let [removeSelectedHotelModalOpen, setRemoveSelectedHotelModalOpen] =
    useState(false)
  let [rfpModalOpen, setRfpModalOpen] = useState(false)
  let [deleteProposalModalOpen, setDeleteProposalModalOpen] = useState(false)
  let proposalStateFormik = useFormik({
    enableReinitialize: true,
    initialValues: {state: props.selectedHotel.state},
    onSubmit: (values) => {
      dispatch(
        putSelectedHotel(
          props.selectedHotel.retreat_id,
          props.selectedHotel.hotel_id,
          {state: values.state}
        )
      )
    },
  })
  let [tabValue, setTabValue] = useState("current")
  return (
    <Accordion
      expanded={expanded}
      onChange={(e, newState) => {
        setExpanded(newState)
      }}>
      <AccordionSummary>
        <Box display="flex" justifyContent="space-between" width="100%">
          <div className={classes.nameDisplay}>
            <AppTypography variant="body1">
              <strong>{props.hotel.name}</strong>
              {props.hotel.location ? `, ${props.hotel.location}` : ""}
            </AppTypography>
            {props.selectedHotel.is_liked && (
              <Favorite fontSize="small" className={classes.heart} />
            )}
          </div>
          {props.selectedHotel.state === "REVIEW" ? (
            <Chip
              label="Ready for review"
              style={{color: "white", backgroundColor: "green"}}
            />
          ) : props.selectedHotel.state === "NOT_AVAILABLE" ? (
            <Chip
              label="Not available"
              style={{color: "white", backgroundColor: "red"}}
            />
          ) : (
            <Chip label="Pending" style={{backgroundColor: "yellow"}} />
          )}
          =======
          <AppTypography variant="body1">
            <strong>{props.hotel.name}</strong>
            {props.hotel.location ? `, ${props.hotel.location}` : ""}
          </AppTypography>
          <div>
            {props.selectedHotel.state === "REQUESTED" ? (
              <Chip
                label="Requested"
                style={{color: "white", backgroundColor: "blue"}}
              />
            ) : props.selectedHotel.state === "REVIEW" ? (
              <Chip
                label="Ready for review"
                style={{color: "white", backgroundColor: "green"}}
              />
            ) : props.selectedHotel.state === "NOT_AVAILABLE" ? (
              <Chip
                label="Not available"
                style={{color: "white", backgroundColor: "red"}}
              />
            ) : (
              <Chip label="Pending" style={{backgroundColor: "yellow"}} />
            )}
            <Menu className={classes.menuIcon} />
          </div>
        </Box>
      </AccordionSummary>
      {expanded && (
        <AccordionDetails className={classes.accordionDetails}>
          <Box display="flex" alignItems="center">
            <Link
              component={ReactRouterLink}
              to={AppRoutes.getPath("HotelPage", {
                hotelId: props.selectedHotel.hotel_id.toString(),
              })}
              target="_blank">
              <AppTypography variant="h3" fontWeight="bold">
                {props.hotel.name}
              </AppTypography>
            </Link>
            <Button
              onClick={() => setRemoveSelectedHotelModalOpen(true)}
              style={{marginLeft: 8}}
              color="secondary"
              variant="outlined"
              size="small">
              Remove Hotel
            </Button>
            {removeSelectedHotelModalOpen ? (
              <ConfirmationModal
                onSubmit={() => {
                  dispatch(
                    deleteSelectedHotel(
                      props.selectedHotel.retreat_id,
                      props.selectedHotel.hotel_id
                    )
                  )
                }}
                onClose={() => setRemoveSelectedHotelModalOpen(false)}
                confirmationText={`Are you sure you want to remove ${props.hotel.name}?`}
              />
            ) : undefined}
          </Box>
          <form onSubmit={proposalStateFormik.handleSubmit}>
            <Box display="flex" alignItems="center" marginY={2}>
              <TextField
                id="state"
                value={proposalStateFormik.values.state}
                onChange={proposalStateFormik.handleChange}
                select
                SelectProps={{native: true}}
                InputLabelProps={{shrink: true, style: {whiteSpace: "nowrap"}}}
                label="Current Proposal State">
                {props.selectedHotel.state === "SELECTED" && (
                  <option value={"SELECTED"}>Initial</option>
                )}
                <option value={"PENDING"}>Pending</option>
                <option value={"REVIEW"}>Ready</option>
                <option value={"NOT_AVAILABLE"}>No availability</option>
              </TextField>
              {proposalStateFormik.values.state !==
                proposalStateFormik.initialValues.state && (
                <Button
                  style={{marginLeft: 8}}
                  type="submit"
                  size="small"
                  variant="contained"
                  color="primary">
                  Save State
                </Button>
              )}
            </Box>
          </form>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={props.selectedHotel.is_top_pick}
                id="is_pareto_task_complete"
                onChange={(e, checked) => {
                  dispatch(
                    putSelectedHotel(
                      props.selectedHotel.retreat_id,
                      props.selectedHotel.hotel_id,
                      {is_top_pick: checked}
                    )
                  )
                }}
              />
            }
            label="Is Flok Top Pick?"
          />
          <Box display="flex" alignItems="center">
            <AppTypography variant="h3" fontWeight="bold">
              Proposals (
              {props.selectedHotel.hotel_proposals
                ? props.selectedHotel.hotel_proposals.length
                : 0}
              )
            </AppTypography>
            <Button
              style={{marginLeft: 8}}
              size="small"
              color="primary"
              variant="outlined"
              onClick={() => setNewProposalModalOpen(true)}>
              New Proposal
            </Button>
            <Modal
              open={newProposalModalOpen}
              onClose={() => {
                setNewProposalModalOpen(false)
                setNewProposalDates(undefined)
              }}>
              <Box
                maxWidth={400}
                minWidth={300}
                position="fixed"
                top="50%"
                left="50%"
                style={{
                  transform: "translate(-50%, -50%)",
                }}>
                <Paper>
                  <Box
                    paddingY={4}
                    paddingX={2}
                    display="flex"
                    flexDirection="column">
                    <AppTypography variant="body1" fontWeight="bold">
                      New Proposal
                    </AppTypography>
                    <AppTypography variant="body2" paragraph>
                      If {props.hotel.name} has a proposal template in the
                      proposals database, we'll copy those values. If not, the
                      proposal will require you to fill in all the values. To
                      check the proposals database, click{" "}
                      <Link
                        component={ReactRouterLink}
                        underline="always"
                        to={
                          AppRoutes.getPath("HotelPage", {
                            hotelId: props.selectedHotel.hotel_id.toString(),
                          }) + `?${querystring.stringify({tab: "proposal"})}`
                        }
                        target="_blank">
                        here
                      </Link>
                      .
                    </AppTypography>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        setNewProposalModalOpen(false)
                        setNewProposalDates(undefined)
                      }}>
                      <TextField
                        fullWidth
                        type="text"
                        label="Dates"
                        required
                        InputLabelProps={{shrink: true}}
                        value={newProposalDates ?? ""}
                        onChange={(e) =>
                          setNewProposalDates(e.currentTarget.value)
                        }
                      />
                      <br />
                      <br />
                      <Box display="flex" justifyContent={"space-between"}>
                        <Button
                          type="submit"
                          variant="contained"
                          onClick={() => {
                            dispatch(
                              postHotelProposal(
                                props.selectedHotel.retreat_id,
                                props.selectedHotel.hotel_id,
                                nullifyEmptyString({
                                  dates: newProposalDates,
                                })
                              )
                            )
                          }}>
                          Submit
                        </Button>
                      </Box>
                    </form>
                  </Box>
                </Paper>
              </Box>
            </Modal>
          </Box>
          {props.selectedHotel.hotel_proposals?.length ? (
            <>
              <Tabs
                value={activeProposalIndex}
                onChange={(e, val) => {
                  setActiveProposalIndex(val)
                }}>
                {props.selectedHotel.hotel_proposals!.map((proposal, i) => (
                  <Tab
                    key={i}
                    value={i}
                    label={proposal.dates ? proposal.dates : `Proposal ${i}`}
                  />
                ))}
              </Tabs>
              {props.selectedHotel.hotel_proposals![activeProposalIndex] ? (
                <>
                  <HotelProposalForm
                    onSave={(values) => {
                      dispatch(
                        putRetreatHotelProposal(
                          props.selectedHotel.retreat_id,
                          props.selectedHotel.hotel_id,
                          props.selectedHotel.hotel_proposals![
                            activeProposalIndex
                          ].id,
                          nullifyEmptyString(values)
                        )
                      )
                    }}
                    onDelete={() => setDeleteProposalModalOpen(true)}
                    proposal={
                      props.selectedHotel.hotel_proposals![activeProposalIndex]
                    }
                  />
                  {deleteProposalModalOpen ? (
                    <ConfirmationModal
                      confirmationText="Are you sure you want to delete this proposal?"
                      onClose={() => setDeleteProposalModalOpen(false)}
                      onSubmit={() => {
                        dispatch(
                          deleteRetreatHotelProposal(
                            props.selectedHotel.retreat_id,
                            props.selectedHotel.hotel_id,
                            props.selectedHotel.hotel_proposals![
                              activeProposalIndex
                            ].id
                          )
                        )
                        setActiveProposalIndex(-1)
                      }}
                    />
                  ) : undefined}
                </>
              ) : undefined}
            </>
          ) : undefined}
        </AccordionDetails>
      )}
    </Accordion>
  )
}

let useStyles = makeStyles((theme) => ({
  root: {height: "100%"},
  hotelsList: {},
  addHotelButton: {
    marginRight: theme.spacing(2),
  },
}))

type RetreatLodgingDetailsProps = {retreat: AdminRetreatModel}
export default function RetreatLodgingDetails(
  props: RetreatLodgingDetailsProps
) {
  let classes = useStyles(props)
  let dispatch = useDispatch()
  let [newHotelOpen, setNewHotelOpen] = useState(false)
  let hotels = useSelector((state: RootState) => state.admin.hotels)
  let destinations = useSelector((state: RootState) => state.admin.destinations)
  let destinationsList = useSelector(
    (state: RootState) => state.admin.allDestinations
  )

  let groups = useSelector((state: RootState) => {
    return Object.values(state.admin.hotelGroups).filter(
      (group) => group?.retreat_id === props.retreat.id
    )
  })

  let [selectedHotelsState, setSelectedHotelsState] = useState(
    props.retreat.selected_hotels.sort((a, b) => {
      let hotelA = hotels[a.hotel_id]
      let hotelB = hotels[b.hotel_id]
      if (hotelA && hotelB) {
        return hotelA.destination_id - hotelB.destination_id
      }
      return 0
    })
  )

  useEffect(() => {
    setSelectedHotelsState(
      props.retreat.selected_hotels.sort((a, b) => {
        let hotelA = hotels[a.hotel_id]
        let hotelB = hotels[b.hotel_id]
        if (hotelA && hotelB) {
          return hotelA.destination_id - hotelB.destination_id
        }
        return 0
      })
    )
  }, [props.retreat.selected_hotels])
  useEffect(() => {
    let missingHotels: number[] = []
    props.retreat.selected_hotels.forEach((selectedHotel) => {
      if (hotels[selectedHotel.hotel_id] == null) {
        missingHotels.push(selectedHotel.hotel_id)
      }
    })
    if (missingHotels.length) {
      dispatch(getHotelsByHotelId(missingHotels))
    }
  }, [hotels, props.retreat.selected_hotels, dispatch])

  useEffect(() => {
    let missingHotels: number[] = []
    props.retreat.selected_hotels.forEach((selectedHotel) => {
      if (hotels[selectedHotel.hotel_id] == null) {
        missingHotels.push(selectedHotel.hotel_id)
      }
    })
    if (missingHotels.length) {
      dispatch(getHotelsByHotelId(missingHotels))
    }
  }, [hotels, props.retreat.selected_hotels, dispatch])

  useEffect(() => {
    if (destinationsList == null) {
      dispatch(getDestinations())
    }
  }, [destinationsList, dispatch])
  useEffect(() => {
    for (let groupId of props.retreat.group_ids) {
      if (
        !groups.filter((group) => group).find((group) => group!.id == groupId)
      ) {
        dispatch(getHotelGroup(groupId))
      }
    }
  }, [dispatch])

  return (
    <div className={classes.root}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginTop={2}
        marginBottom={1}>
        <Box display="flex" alignItems="baseline">
          <AppTypography variant="h4">
            Hotel Proposals&nbsp;&nbsp;&nbsp;
          </AppTypography>
          <Typography
            variant="body1"
            component={Link}
            href={`${config.get(FLOK_BASE_URL_KEY)}/r/${
              props.retreat.guid
            }/proposals`}
            target="_blank"
            underline="always">
            See client view
          </Typography>
        </Box>
        <div>
          <Button
            color="primary"
            variant="outlined"
            onClick={() => setNewHotelOpen(true)}
            className={classes.addHotelButton}>
            Add Hotel
          </Button>
          <CreateHotelGroupModalButton retreatId={props.retreat.id} />
        </div>
        {newHotelOpen && (
          <HotelSelectModal
            onSubmit={async (hotelId) => {
              let resp = (await dispatch(
                postSelectedHotel(props.retreat.id, hotelId)
              )) as unknown as ApiAction
              if (!resp.error) {
                setNewHotelOpen(false)
              }
            }}
            onClose={() => setNewHotelOpen(false)}
          />
        )}
      </Box>
      <div className={classes.hotelsList}>
        {!props.retreat.selected_hotels.length ? (
          <AppTypography variant="body1">
            No hotel proposals created yet. Add a hotel to start.
          </AppTypography>
        ) : undefined}
        <DragDropContext
          onDragEnd={async (result) => {
            if (!result.destination) return
            const items = Array.from([...selectedHotelsState])
            const [reorderedItem] = items.splice(
              items.findIndex(
                (item) => item.hotel_id === parseInt(result.draggableId)
              ),
              1
            )
            if (result.destination.droppableId !== result.source.droppableId) {
              let originalGroup = reorderedItem.group_id
              if (result.destination.droppableId !== "ungrouped") {
                reorderedItem.group_id = parseInt(
                  result.destination.droppableId
                )
                let putResult = (await dispatch(
                  putSelectedHotel(
                    reorderedItem.retreat_id,
                    reorderedItem.hotel_id,
                    {group_id: parseInt(result.destination.droppableId)}
                  )
                )) as unknown as ApiAction
                if (putResult.error) {
                  reorderedItem.group_id = originalGroup
                }
              } else {
                reorderedItem.group_id = undefined
                let putResult = (await dispatch(
                  putSelectedHotel(
                    reorderedItem.retreat_id,
                    reorderedItem.hotel_id,
                    {group_id: undefined}
                  )
                )) as unknown as ApiAction
                if (putResult.error) {
                  reorderedItem.group_id = originalGroup
                }
              }
            }

            items.splice(result.destination.index, 0, reorderedItem)
            setSelectedHotelsState(
              items.sort((a, b) => {
                let hotelA = hotels[a.hotel_id]
                let hotelB = hotels[b.hotel_id]
                if (hotelA && hotelB) {
                  return hotelA.destination_id - hotelB.destination_id
                }
                return 0
              })
            )
          }}>
          {groups
            .filter((group) => group)
            .sort((a, b) => a!.id - b!.id)
            .map((group) => {
              return (
                <div>
                  {group && (
                    <HotelGroupTitle
                      group={group}
                      hotels={selectedHotelsState}
                      setHotels={setSelectedHotelsState}
                    />
                  )}
                  <Droppable droppableId={group!.id.toString()}>
                    {(provided) => (
                      <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{listStyleType: "none"}}>
                        {selectedHotelsState
                          .filter((hotel) => hotel.group_id == group!.id)
                          .map((selectedHotel, index: number) => (
                            <Draggable
                              key={selectedHotel.hotel_id}
                              draggableId={selectedHotel.hotel_id.toString()}
                              index={index}>
                              {(provided) => (
                                <li
                                  style={{willChange: "transform, opacity"}}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}>
                                  <HotelAccordionItem
                                    retreatRFPId={
                                      props.retreat.request_for_proposal_id
                                    }
                                    hotel={{
                                      name: hotels[selectedHotel.hotel_id]?.name
                                        ? hotels[selectedHotel.hotel_id]!.name
                                        : "",
                                      location:
                                        hotels[selectedHotel.hotel_id]
                                          ?.destination_id &&
                                        destinations[
                                          hotels[selectedHotel.hotel_id]!
                                            .destination_id
                                        ] &&
                                        destinations[
                                          hotels[selectedHotel.hotel_id]!
                                            .destination_id
                                        ]?.location
                                          ? destinations[
                                              hotels[selectedHotel.hotel_id]!
                                                .destination_id
                                            ]?.location!
                                          : "",
                                    }}
                                    selectedHotel={selectedHotel}
                                    key={selectedHotel.hotel_id}
                                  />
                                </li>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </div>
              )
            })}
          <Typography variant="h4">Ungrouped</Typography>
          <Droppable droppableId="ungrouped">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{listStyleType: "none"}}>
                {selectedHotelsState
                  .filter((hotel) => !hotel.group_id)
                  .map((selectedHotel, index: number) => (
                    <Draggable
                      key={selectedHotel.hotel_id}
                      draggableId={selectedHotel.hotel_id.toString()}
                      index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}>
                          <HotelAccordionItem
                            retreatRFPId={props.retreat.request_for_proposal_id}
                            hotel={{
                              name: hotels[selectedHotel.hotel_id]?.name
                                ? hotels[selectedHotel.hotel_id]!.name
                                : "",
                              location:
                                hotels[selectedHotel.hotel_id]
                                  ?.destination_id &&
                                destinations[
                                  hotels[selectedHotel.hotel_id]!.destination_id
                                ] &&
                                destinations[
                                  hotels[selectedHotel.hotel_id]!.destination_id
                                ]?.location
                                  ? destinations[
                                      hotels[selectedHotel.hotel_id]!
                                        .destination_id
                                    ]?.location!
                                  : "",
                            }}
                            selectedHotel={selectedHotel}
                            key={selectedHotel.hotel_id}
                          />
                        </li>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  )
}
