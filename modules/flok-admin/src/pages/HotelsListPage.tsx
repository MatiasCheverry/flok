import {CircularProgress, makeStyles, Paper} from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from "@material-ui/data-grid"
import {push} from "connected-react-router"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import PageBase from "../components/page/PageBase"
import {AdminHotelModel} from "../models"
import {AppRoutes} from "../Stack"
import {RootState} from "../store"
import {getHotelsForDataGrid} from "../store/actions/admin"
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

  let hotels = useSelector((state: RootState) =>
    Object.values(state.admin.hotels).filter((hotel) => hotel)
  )
  let totalRows = useSelector(
    (state: RootState) => state.admin.hotelsDataGridTotal
  )
  let [filters, setFilters] = useState<{
    column?: string
    operator?: string
    value?: string
  }>({column: undefined, operator: undefined, value: undefined})
  let [destinations, destinationsLoading] = useDestinations()

  useEffect(() => {
    async function getInititialHotels() {
      setLoadingHotels(true)
      await dispatch(getHotelsForDataGrid())
      setLoadingHotels(false)
    }
    getInititialHotels()
  }, [dispatch])
  return (
    <PageBase>
      <div className={classes.body}>
        <Typography variant="h1" paragraph>
          Hotels List
        </Typography>

        <div>
          <Paper className={classes.dataGridPaper}>
            {loadingHotels || destinationsLoading ? (
              <CircularProgress className={classes.loadingSpinner} />
            ) : (
              <DataGrid
                components={{
                  Toolbar: HotelDataGridToolbar,
                }}
                rowCount={totalRows}
                columns={[
                  {
                    field: "name",
                    headerName: "Name",
                    width: 250,
                    sortable: false,
                  },
                  {
                    field: "num_rooms",
                    headerName: "Rooms",
                    width: 150,
                    sortable: false,
                  },
                  {
                    field: "airport_travel_time",
                    headerName: "Airport Travel Time",
                    width: 200,
                    sortable: false,
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
                    sortable: false,
                    valueGetter: (params) => {
                      return destinations[params.row.destination_id as number]
                        ?.location
                    },
                  },
                ]}
                rows={hotels as unknown as AdminHotelModel[]}
                onRowClick={(params) => {
                  dispatch(
                    push(
                      AppRoutes.getPath("HotelPage", {
                        hotelId: params.id.toString(),
                      })
                    )
                  )
                }}
                disableSelectionOnClick
                disableColumnMenu
                density="compact"
                pageSize={50}
                pagination
                onFilterModelChange={(model) => {
                  if (model.items[0]) {
                    setFilters({
                      column: model.items[0].columnField,
                      operator: model.items[0].operatorValue,
                      value: model.items[0].value,
                    })
                    dispatch(
                      getHotelsForDataGrid(0, {
                        column: model.items[0].columnField,
                        operator: model.items[0].operatorValue,
                        value: model.items[0].value,
                      })
                    )
                  } else if (!model.items[0]) {
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

function HotelDataGridToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
    </GridToolbarContainer>
  )
}
