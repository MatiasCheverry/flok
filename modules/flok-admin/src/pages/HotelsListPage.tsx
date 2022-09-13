import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  makeStyles,
  Paper,
  TextField,
} from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@material-ui/data-grid"
import {CheckCircle, CheckCircleOutline, LocationOn} from "@material-ui/icons"
import {ToggleButton, ToggleButtonGroup} from "@material-ui/lab"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import PageBase from "../components/page/PageBase"
import {AdminHotelDetailsModel, AdminHotelModel} from "../models"
import {AppRoutes} from "../Stack"
import {RootState} from "../store"
import {getHotelsForDataGrid, getLodgingTags} from "../store/actions/admin"
import {theme} from "../theme"
import {useDestinations} from "../utils"
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
  tabs: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  table: {
    flex: 1,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  dataGridPaper: {
    height: "550px",
    width: "90%",
    marginLeft: "auto",
    marginRight: "auto",
    display: "flex",
  },
  loadingSpinner: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "auto",
    marginBottom: "auto",
  },
}))

export default function HotelsListPage() {
  let classes = useStyles()
  let dispatch = useDispatch()
  let [loadingHotels, setLoadingHotels] = useState(false)
  function filterHotels(
    hotel: AdminHotelModel,
    filters: {
      column?: string
      operator?: string
      value?: string
      pareto?: "complete" | "incomplete"
    }
  ) {
    if (filters.column && filters.operator && filters.value) {
      let column = filters.column
      let operator = filters.operator
      let value = filters.value
      if (!hotel[column as keyof typeof hotel] && operator !== "isEmpty") {
        return false
      }
      if (operator === "contains") {
        return hotel[column as keyof typeof hotel]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      } else if (operator === "equals") {
        return (
          value.toString().toLowerCase() ===
          hotel[column as keyof typeof hotel].toString().toLowerCase()
        )
      } else if (operator === "startsWith") {
        return hotel[column as keyof typeof hotel]
          .toString()
          .toLowerCase()
          .startsWith(value.toString().toLowerCase())
      } else if (operator === "endsWith") {
        return hotel[column as keyof typeof hotel]
          .toString()
          .toLowerCase()
          .endsWith(value.toString().toLowerCase())
      } else if (operator === "isEmpty") {
        return !hotel[column as keyof typeof hotel]
      } else if (operator === "isNotEmpty") {
        return !!hotel[column as keyof typeof hotel]
      }
    } else {
      return true
    }
  }
  let [tagsSelected, setTagsSelected] = useState<{[id: number]: boolean}>({})

  function checkHotelHasAtLeastOneTag(
    hotel: AdminHotelDetailsModel,
    tags: number[]
  ) {
    for (let i = 0; i < hotel.lodging_tags.length; i++) {
      if (tags.indexOf(hotel.lodging_tags[i].id) !== -1) {
        return true
      }
    }
    return false
  }
  let [filters, setFilters] = useState<{
    column?: string
    operator?: string
    value?: string
    pareto?: "complete" | "incomplete"
  }>({column: undefined, operator: undefined, value: undefined})
  let hotels = useSelector((state: RootState) => {
    if (filters.column === "destination_id") {
      return Object.values(state.admin.hotels).filter(
        (hotel) => hotel?.destination_id === parseInt(filters.value ?? "")
      )
    } else if (filters.column === "lodging_tags") {
      return Object.values(state.admin.hotels).filter((hotel) => {
        return checkHotelHasAtLeastOneTag(
          hotel as unknown as AdminHotelDetailsModel,
          Object.entries(tagsSelected)
            .filter((tagPair) => tagPair[1])
            .map((tagPair) => parseInt(tagPair[0]))
        )
      })
    } else {
      return Object.values(state.admin.hotels).filter((hotel) => {
        return hotel
      })
    }
  })
  hotels = hotels.filter((hotel) => {
    let hotelDetails = hotel as unknown as AdminHotelDetailsModel
    if (filters.pareto === "complete") {
      return hotelDetails.is_pareto_task_complete
    } else if (filters.pareto === "incomplete") {
      return !hotelDetails.is_pareto_task_complete
    } else {
      return hotel
    }
  })
  let hasNext = useSelector(
    (state: RootState) => state.admin.hotelsDataGridHasNext
  )

  let [destinations, destinationsLoading] = useDestinations()
  let lodgingTags = useSelector((state: RootState) => state.admin.lodgingTags)

  useEffect(() => {
    async function getInititialHotels() {
      setLoadingHotels(true)
      await dispatch(getHotelsForDataGrid())
      setLoadingHotels(false)
    }
    getInititialHotels()
    dispatch(getLodgingTags())
  }, [dispatch])
  let [destinationFilterModalOpen, setDestinationFilterModalOpen] =
    useState(false)
  // let [tagsFilterModalOpen, setTagsFilterModalOpen] = useState(false)
  let [paretoFilterModalOpen, setParetoFilterModalOpen] = useState(false)
  return (
    <PageBase>
      <div className={classes.body}>
        <Typography variant="h1" paragraph>
          Hotels List
        </Typography>

        <div>
          <Dialog
            open={destinationFilterModalOpen}
            style={{padding: theme.spacing(2)}}
            onClose={() => {
              setDestinationFilterModalOpen(false)
            }}>
            <DialogTitle>Filter by Destination</DialogTitle>
            <DialogContent style={{width: "500px"}}>
              <TextField
                select
                value={
                  filters.column === "destination_id" ? filters.value : "none"
                }
                SelectProps={{native: true}}
                fullWidth
                onChange={async (e) => {
                  setFilters((filters) => {
                    return {
                      column: "destination_id",
                      operator: "isEqual",
                      value: e.target.value,
                      pareto: filters.pareto,
                    }
                  })
                  setTagsSelected({})
                  await dispatch(
                    getHotelsForDataGrid(0, {
                      column: "destination_id",
                      operator: "isEqual",
                      value: e.target.value,
                      pareto: filters.pareto,
                    })
                  )
                  setDestinationFilterModalOpen(false)
                }}>
                <option value={"none"}></option>
                {Object.values(destinations).map((destination) => {
                  return (
                    <option value={destination?.id}>
                      {destination?.location}
                    </option>
                  )
                })}
              </TextField>
            </DialogContent>
          </Dialog>
          {/* <Dialog
            open={tagsFilterModalOpen}
            onClose={() => {
              setTagsFilterModalOpen(false)
            }}>
            <DialogTitle>Filter by Lodging Tags</DialogTitle>
            <DialogContent
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing(1),
                width: "500px",
              }}>
              {Object.values(lodgingTags).map((tag) => {
                return (
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={tagsSelected[tag.id]}
                        onChange={(e) => {
                          setTagsSelected((tagsSelected) => {
                            return {...tagsSelected, [tag.id]: e.target.checked}
                          })
                        }}
                      />
                    }
                    label={tag.name}
                  />
                )
              })}
            </DialogContent>
            <DialogActions>
              <Button
                color="primary"
                variant="contained"
                onClick={() => {
                  setFilters((filters) => {
                    return {
                      column: "lodging_tags",
                      operator: "contains",
                      value: Object.entries(tagsSelected)
                        .filter((tagPair) => tagPair[1])
                        .map((tagPair) => tagPair[0])
                        .join(","),
                      pareto: filters.pareto,
                    }
                  })
                  dispatch(
                    getHotelsForDataGrid(0, {
                      column: "lodging_tags",
                      operator: "contains",
                      value: Object.entries(tagsSelected)
                        .filter((tagPair) => tagPair[1])
                        .map((tagPair) => tagPair[0])
                        .join(", "),
                      pareto: filters.pareto,
                    })
                  )
                }}>
                Apply Filter
              </Button>
            </DialogActions>
          </Dialog> */}
          <Dialog
            open={paretoFilterModalOpen}
            onClose={() => {
              setParetoFilterModalOpen(false)
            }}>
            <DialogTitle>Filter by Pareto Completion</DialogTitle>
            <DialogContent style={{width: "500px", display: "flex"}}>
              <ToggleButtonGroup
                orientation="horizontal"
                value={filters.pareto}
                style={{marginLeft: "auto", marginRight: "auto"}}
                id="agenda_type"
                exclusive
                onChange={(e, newValue) => {
                  setFilters((filters) => {
                    return {...filters, pareto: newValue}
                  })
                  dispatch(
                    getHotelsForDataGrid(0, {...filters, pareto: newValue})
                  )
                }}>
                <ToggleButton value="complete">Only Completed</ToggleButton>
                <ToggleButton value="incomplete"> Only Incomplete</ToggleButton>
              </ToggleButtonGroup>
            </DialogContent>
          </Dialog>

          <Paper className={classes.dataGridPaper}>
            {loadingHotels || destinationsLoading ? (
              <CircularProgress className={classes.loadingSpinner} />
            ) : (
              <DataGrid
                componentsProps={{
                  toolbar: {
                    onFilterDestination: () => {
                      setDestinationFilterModalOpen(true)
                    },
                    // onFilterTags: () => {
                    //   setTagsFilterModalOpen(true)
                    // },
                    onFilterPareto: () => {
                      setParetoFilterModalOpen(true)
                    },
                  },
                  // footer: {
                  //   hasNext: hasNext,
                  // },
                  // pagination: {},
                }}
                components={{
                  Toolbar: HotelDataGridToolbar,
                  // Footer: HotelDataGridFooter,
                }}
                localeText={{
                  MuiTablePagination: {
                    labelDisplayedRows: (paginationInfo) =>
                      `${paginationInfo.from} - ${paginationInfo.to} of ${
                        hasNext ? "many" : paginationInfo.count
                      }`,
                  },
                }}
                columns={[
                  {
                    field: "name",
                    headerName: "Name",
                    width: 250,
                    sortable: false,
                  },
                  {
                    field: "is_pareto_task_complete",
                    headerName: "Pareto Complete?",
                    width: 150,
                    sortable: false,
                    filterable: false,
                    renderCell: (params) => {
                      return params.value ? <CheckCircle /> : <></>
                    },
                  },
                  {
                    field: "num_rooms",
                    headerName: "Rooms",
                    width: 150,
                    sortable: false,
                    filterable: false,
                  },
                  {
                    field: "airport_travel_time",
                    headerName: "Airport Travel Time",
                    width: 200,
                    sortable: false,
                    filterable: false,
                  },
                  {
                    field: "lodging_tags",
                    headerName: "Lodging Tags",
                    valueGetter: (params) => {
                      if (params.value) {
                        return Object.values(params.value)
                          .map((tag) => {
                            return tag.name
                          })
                          .join(", ")
                      }
                    },
                    width: 300,
                    sortable: false,
                    filterable: false,
                  },
                  {
                    field: "city",
                    headerName: "City",
                    width: 200,
                    sortable: false,
                  },
                  {
                    field: "state",
                    headerName: "State",
                    width: 200,
                    sortable: false,
                  },
                  {
                    field: "country",
                    headerName: "Country",
                    width: 200,
                    sortable: false,
                  },
                  {
                    field: "destination",
                    headerName: "Destination",
                    width: 200,
                    filterable: false,
                    sortable: false,
                    valueGetter: (params) => {
                      return destinations[params.row.destination_id as number]
                        ?.location
                    },
                  },
                ]}
                rows={hotels as unknown as AdminHotelModel[]}
                onRowClick={(params) => {
                  window.open(
                    AppRoutes.getPath("HotelPage", {
                      hotelId: params.id.toString(),
                    }),
                    "_blank"
                  )
                }}
                disableSelectionOnClick
                disableColumnMenu
                density="compact"
                pageSize={50}
                pagination
                onFilterModelChange={(model) => {
                  if (model.items[0]) {
                    setTagsSelected({})
                    setFilters((filters) => {
                      return {
                        column: model.items[0].columnField,
                        operator: model.items[0].operatorValue,
                        value: model.items[0].value,
                        pareto: filters.pareto,
                      }
                    })
                    dispatch(
                      getHotelsForDataGrid(0, {
                        column: model.items[0].columnField,
                        operator: model.items[0].operatorValue,
                        value: model.items[0].value,
                        pareto: filters.pareto,
                      })
                    )
                  } else if (!model.items[0]) {
                    setTagsSelected({})
                    setFilters({
                      column: undefined,
                      operator: undefined,
                      value: undefined,
                    })
                  }
                }}
                rowsPerPageOptions={[]}
                onPageChange={(page) => {
                  if (
                    !hotels.filter((hotel) => {
                      if (hotel) {
                        return filterHotels(hotel, filters)
                      } else {
                        return false
                      }
                    })[(page + 1) * 50 + 50]
                  ) {
                    if (filters === "") {
                      dispatch(getHotelsForDataGrid((page + 1) * 50))
                    } else {
                      dispatch(getHotelsForDataGrid((page + 1) * 50, filters))
                    }
                  }
                }}
              />
            )}
          </Paper>
        </div>
      </div>
    </PageBase>
  )
}

let useToolbarStyles = makeStyles((theme) => ({
  toolbarButton: {
    // styles to match default toolbar buttons such as export
    "&:hover": {
      backgroundColor: "rgba(25, 118, 210, 0.04)",
    },
    fontWeight: 500,
    fontSize: "0.8125rem",
    lineHeight: "1.75",
    minWidth: "64px",
    padding: "4px 5px",
    borderRadius: "4px",
    color: theme.palette.primary.main,
  },
  searchBar: {
    marginLeft: "auto",
    marginRight: theme.spacing(3),
  },
  toolbarContainer: {
    gap: theme.spacing(1.5),
  },
}))
type HotelDataGridToolbarProps = {
  onFilterDestination: () => void
  onFilterTags: () => void
  onFilterPareto: () => void
}

function HotelDataGridToolbar(props: HotelDataGridToolbarProps) {
  let classes = useToolbarStyles()
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <Button
        onClick={props.onFilterDestination}
        className={classes.toolbarButton}>
        <LocationOn fontSize="small" />
        &nbsp; Filter by Destination
      </Button>
      {/* <Button onClick={props.onFilterTags} className={classes.toolbarButton}>
        <LocalOffer fontSize="small" />
        &nbsp; Filter by Lodging Tags
      </Button> */}
      <Button className={classes.toolbarButton} onClick={props.onFilterPareto}>
        <CheckCircleOutline fontSize="small" />
        &nbsp; Filter by Pareto Completion
      </Button>
    </GridToolbarContainer>
  )
}
