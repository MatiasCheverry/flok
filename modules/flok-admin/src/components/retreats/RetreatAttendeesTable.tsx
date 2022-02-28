import {Button, Chip, makeStyles} from "@material-ui/core"
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridSortModel,
  GridToolbar,
} from "@material-ui/data-grid"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {
  RetreatAttendeeFlightStatusOptions,
  RetreatAttendeeInfoStatusOptions,
} from "../../models"
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {theme} from "../../theme"

function DietList(prefString: string) {
  if (!prefString) {
    return <></>
  }
  return prefString.split(",").map((s) => (
    <Chip
      size="small"
      label={s}
      style={{
        margin: "1px 2px",
        backgroundColor: theme.palette.primary.main,
        color: "white",
        cursor: "pointer",
      }}
    />
  ))
}

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

export type RetreatAttendeesTableRow = {
  id: number
  name: string
  email: string
  city: string
  dietaryPrefs: string
  notes: string
  infoStatus: string
  flightStatus: string
}

type RetreatAttendeesTableProps = {
  rows: RetreatAttendeesTableRow[]
  onSelect: (id: number) => void
  onTravelSelect: (id: number) => void
}

export default function RetreatAttendeesTable(
  props: RetreatAttendeesTableProps
) {
  let classes = useStyles(props)
  let dispatch = useDispatch()

  function onView(params: GridCellParams, flight: boolean) {
    let rowIdAsString = params.getValue(params.id, "id")?.toString()
    let rowId = rowIdAsString ? parseInt(rowIdAsString) : null
    if (rowId != null && !isNaN(rowId)) {
      flight ? props.onTravelSelect(rowId) : props.onSelect(rowId)
    } else {
      dispatch(enqueueSnackbar({message: "Something went wrong"}))
    }
  }

  const [sortModel, setSortModel] = useState<GridSortModel | undefined>([])
  const commonColDefs = {}
  const retreatsTableColumns: GridColDef[] = [
    {
      ...commonColDefs,
      field: "attendeeButton",
      headerName: " ",
      width: 150,
      sortable: false,
      align: "center",
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => onView(params, false)}>
          View Attendee
        </Button>
      ),
    },
    {
      ...commonColDefs,
      field: "travelButton",
      headerName: " ",
      width: 150,
      sortable: false,
      align: "center",
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => onView(params, true)}>
          View Flights
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
      field: "name",
      headerName: "Name",
      width: 200,
    },
    {
      ...commonColDefs,
      field: "email",
      headerName: "Email Address",
      width: 200,
    },
    {
      ...commonColDefs,
      field: "city",
      headerName: "City",
      width: 200,
    },
    {
      ...commonColDefs,
      field: "dietaryPrefs",
      headerName: "Dietary Preferences",
      width: 200,
      renderCell: (params) => {
        if (!params.value) {
          return <></>
        }
        return (params.value as string).split(",").map((s) => (
          <Chip
            size="small"
            label={s}
            style={{
              margin: 1,
              backgroundColor: theme.palette.primary.main,
              color: "white",
              cursor: "pointer",
            }}
          />
        ))
      },
    },
    {
      ...commonColDefs,
      field: "notes",
      headerName: "Notes",
      width: 200,
    },
    {
      ...commonColDefs,
      field: "infoStatus",
      headerName: "Info Status",
      width: 150,
      type: "singleSelect",
      valueOptions: RetreatAttendeeInfoStatusOptions,
    },
    {
      ...commonColDefs,
      field: "flightStatus",
      headerName: "Flight Status",
      width: 150,
      type: "singleSelect",
      valueOptions: RetreatAttendeeFlightStatusOptions,
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
