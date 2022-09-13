import { Button, makeStyles } from "@material-ui/core"
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridSortModel,
  GridToolbar
} from "@material-ui/data-grid"
import React, { useState } from "react"
import { useDispatch } from "react-redux"
import {
  RetreatAttendeesState,
  RetreatFlightsState,
  RetreatIntakeState,
  RetreatItineraryState,
  RetreatLodgingState
} from "../../models"
import { enqueueSnackbar } from "../../notistack-lib/actions"
import { getDateTimeString } from "../../utils"

let useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: theme.shadows[1],
    backgroundColor: theme.palette.common.white,
  },
  cell: {
    "&:hover": {
      textOverflow: "clip",
      overflow: "visible",
      whiteSpace: "nowrap",
      maxWidth: "unset !important",
      wordBreak: "break-all",
    },
  },
}))

export type RetreatsTableRow = {
  id: number
  companyName: string
  contactEmail: string
  numAttendees: number
  createdAt: Date
  intake_state: RetreatIntakeState
  lodging_state: RetreatLodgingState
  attendees_state: RetreatAttendeesState
  flights_state: RetreatFlightsState
  itinerary_state: RetreatItineraryState
}

type RetreatsTableProps = {
  rows: RetreatsTableRow[]
  onSelect: (id: number) => void
}

export default function RetreatsTable(props: RetreatsTableProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()
  function onViewRetreat(params: GridCellParams) {
    let rowIdAsString = params.getValue(params.id, "id")?.toString()
    let rowId = rowIdAsString ? parseInt(rowIdAsString) : null
    if (rowId != null && !isNaN(rowId)) {
      props.onSelect(rowId)
    } else {
      dispatch(enqueueSnackbar({message: "Something went wrong"}))
    }
  }
  const [sortModel, setSortModel] = useState<GridSortModel | undefined>([
    {
      field: "createdAt",
      sort: "desc",
    },
  ])
  const commonColDefs = {}
  const retreatsTableColumns: GridColDef[] = [
    {
      ...commonColDefs,
      field: "button",
      headerName: " ",
      width: 150,
      sortable: false,
      align: "center",
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => onViewRetreat(params)}>
          View
        </Button>
      ),
    },
    {
      ...commonColDefs,
      field: "id",
      headerName: "ID",
      width: 75,
    },
    {
      ...commonColDefs,
      field: "companyName",
      headerName: "Company",
      width: 200,
    },
    {
      ...commonColDefs,
      field: "numAttendees",
      headerName: "# Attendees",
      width: 100,
      hideSortIcons: false,
    },
    {
      ...commonColDefs,
      field: "contactEmail",
      headerName: "Email",
      width: 150,
    },
    {
      ...commonColDefs,
      field: "intake_state",
      headerName: "Intake State",
      width: 200,
    },
    {
      ...commonColDefs,
      field: "lodging_state",
      headerName: "Lodging State",
      width: 200,
    },
    {
      ...commonColDefs,
      field: "attendees_state",
      headerName: "Attendees State",
      width: 200,
    },
    {
      ...commonColDefs,
      field: "flights_state",
      headerName: "Flights State",
      width: 200,
    },
    {
      ...commonColDefs,
      field: "itinerary_state",
      headerName: "Itinerary State",
      width: 200,
    },
    {
      ...commonColDefs,
      field: "createdAt",
      headerName: "Created At",
      width: 250,
      type: "dateTime",
      valueFormatter: (params) => getDateTimeString(params.value as Date),
    },
  ]
  return (
    <DataGrid
      className={classes.root}
      classes={{cell: classes.cell}}
      sortModel={sortModel}
      onSortModelChange={() => setSortModel(undefined)}
      rows={props.rows}
      columns={retreatsTableColumns}
      components={{
        Toolbar: GridToolbar,
      }}
      disableSelectionOnClick
      disableColumnMenu
      density="compact"
      pageSize={50}
      pagination
      rowsPerPageOptions={[]}
    />
  )
}
