import {Button, makeStyles} from "@material-ui/core"
import {
  DataGrid,
  GridCellParams,
  GridColDef,
  GridSortModel,
  GridToolbar,
} from "@material-ui/data-grid"
import React, {useState} from "react"
import {useDispatch} from "react-redux"
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {getDateTimeString} from "../../utils"

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

export type PastItinerariesTableRow = {
  id: number
  name: string
  start_date: Date
  end_date: Date
  hotel_id: number
  nights: number
  team_size: number
  itinerary_link: string
  spotlight_img_id: number
  location_ids: string[]
}

type PastItinerariesTableProps = {
  rows: PastItinerariesTableRow[]
  onSelect: (id: number) => void
}

export default function PastItinerariesTable(props: PastItinerariesTableProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()
  function onViewItinerary(params: GridCellParams) {
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
          onClick={() => onViewItinerary(params)}>
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
      field: "name",
      headerName: "Name",
      width: 200,
    },
    {
      ...commonColDefs,
      renderCell: (params) => (
        <>{params.value ? (params.value as string[]).join(" | ") : undefined}</>
      ),
      field: "location_ids",
      headerName: "Locations",
      width: 250,
    },
    // {
    //   ...commonColDefs,
    //   field: "hotel_id",
    //   headerName: "Hotel",
    //   width: 200,
    // },
    {
      ...commonColDefs,
      field: "start_date",
      headerName: "Start Date",
      width: 125,
    },
    {
      ...commonColDefs,
      field: "end_date",
      headerName: "End Date",
      width: 125,
    },
    {
      ...commonColDefs,
      field: "nights",
      headerName: "Nights",
      width: 100,
    },
    {
      ...commonColDefs,
      field: "team_size",
      headerName: "Team Size",
      width: 125,
    },
    {
      ...commonColDefs,
      field: "itinerary_link",
      headerName: "Itinerary Link",
      width: 300,
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
