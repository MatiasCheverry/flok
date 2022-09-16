import {
  Box,
  Collapse,
  Icon,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core"
import {
  AddOutlined,
  DirectionsCarOutlined,
  ExpandLess,
  ExpandMore,
  FlightOutlined,
  KingBedOutlined,
  LocalActivityOutlined,
  LocalDiningOutlined,
} from "@material-ui/icons"
import {Fragment, useState} from "react"
import {
  BudgetBreakdownInputType,
  BudgetBreakdownType,
} from "../../utils/budgetUtils"
import AppTypography from "../base/AppTypography"

let useStyles = makeStyles((theme) => ({
  expandableRow: {
    "& > *": {borderBottom: "unset"},
  },
  tableRow: {
    "& > :first-child": {
      "& > :first-child": {
        height: 30,
      },
      width: 12,
    },
    "& > *": {
      whiteSpace: "nowrap",
      fontSize: "1rem",
    },
  },
  breakdownHeaderRow: {
    display: "flex",
    justifyContent: "flex-start",
  },
  expandableRowName: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    "& > *": {
      whiteSpace: "nowrap",
    },
  },
  subBreakdown: {
    marginLeft: theme.spacing(20),
    marginRight: theme.spacing(20),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    borderRadius: 5,
    backgroundColor: theme.palette.background.default,
  },
  overview: {
    marginBottom: theme.spacing(2),
  },
}))

let currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

function BudgetRow(props: {
  name: string | JSX.Element
  cost: number
  subRows: {name: string; middle?: string; end?: string}[]
}) {
  let classes = useStyles(props)
  let [open, setOpen] = useState(false)

  return (
    <Fragment>
      <TableRow className={classes.expandableRow}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}>
            {open ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </TableCell>
        <TableCell>
          <AppTypography fontWeight="bold" noWrap>
            {props.name}
          </AppTypography>
        </TableCell>
        <TableCell></TableCell>
        <TableCell>
          <AppTypography>{currencyFormatter.format(props.cost)}</AppTypography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{padding: 0}} colSpan={4}>
          <Collapse in={open} timeout="auto">
            <Box className={classes.subBreakdown}>
              <Table>
                {props.subRows.map((obj) => (
                  <TableRow>
                    <TableCell>
                      <AppTypography fontWeight="bold">
                        {obj.name}
                      </AppTypography>
                    </TableCell>
                    <TableCell>
                      <AppTypography>{obj.middle}</AppTypography>
                    </TableCell>
                    <TableCell>
                      <AppTypography>{obj.end}</AppTypography>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}

export default function BudgetBreakdownView(props: {
  breakdown: BudgetBreakdownType
  breakdownInput: BudgetBreakdownInputType
}) {
  let classes = useStyles(props)
  return (
    <div>
      <div className={classes.overview}>
        <div className={classes.breakdownHeaderRow}>
          <AppTypography variant="h3">Per Attendee Cost:</AppTypography>{" "}
          <AppTypography variant="h3" color="primary" fontWeight="bold">
            &nbsp;{currencyFormatter.format(props.breakdown.attendeeCost)}
          </AppTypography>
        </div>
        <div className={classes.breakdownHeaderRow}>
          <AppTypography variant="h3">Total Cost: </AppTypography>
          <AppTypography variant="h3" color="primary" fontWeight="bold">
            &nbsp;{currencyFormatter.format(props.breakdown.totalCost)}
          </AppTypography>
        </div>
      </div>
      <AppTypography variant="h3" fontWeight="bold">
        Per Attendee Breakdown
      </AppTypography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className={classes.tableRow}>
              <TableCell>
                <div></div>
              </TableCell>
              <TableCell>
                <AppTypography fontWeight="bold">Category</AppTypography>
              </TableCell>
              <TableCell></TableCell>
              <TableCell>
                <AppTypography fontWeight="bold">Subtotal</AppTypography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow className={classes.tableRow}>
              <TableCell>
                <div></div>
              </TableCell>
              <TableCell>
                <AppTypography fontWeight="bold">
                  <Icon fontSize="small">
                    <KingBedOutlined />
                  </Icon>{" "}
                  Accomodation
                </AppTypography>
              </TableCell>
              <TableCell>
                {`${currencyFormatter.format(
                  props.breakdown.hotelPerNight
                )} per night x ${props.breakdownInput.trip_length - 1} nights`}
              </TableCell>
              <TableCell>
                {`${currencyFormatter.format(
                  props.breakdown.hotelPerNight *
                    (props.breakdownInput.trip_length - 1)
                )}`}
              </TableCell>
            </TableRow>
            <TableRow className={classes.tableRow}>
              <TableCell>
                <div></div>
              </TableCell>
              <TableCell>
                <AppTypography fontWeight="bold">
                  <Icon>
                    <FlightOutlined />
                  </Icon>{" "}
                  Flights
                </AppTypography>
              </TableCell>
              <TableCell>{`${currencyFormatter.format(
                props.breakdown.flight
              )} per flight`}</TableCell>
              <TableCell>{`${currencyFormatter.format(
                props.breakdown.flight
              )}`}</TableCell>
            </TableRow>
            {props.breakdown.activities && (
              <TableRow className={classes.tableRow}>
                <TableCell>
                  <div></div>
                </TableCell>
                <TableCell>
                  <AppTypography fontWeight="bold">
                    <Icon>
                      <LocalActivityOutlined />
                    </Icon>{" "}
                    Activities
                  </AppTypography>
                </TableCell>
                <TableCell>
                  {currencyFormatter.format(props.breakdown.activities.cost)} x{" "}
                  {props.breakdown.activities.num} activities
                </TableCell>
                <TableCell>
                  {currencyFormatter.format(
                    props.breakdown.activities.cost *
                      props.breakdown.activities.num
                  )}
                </TableCell>
              </TableRow>
            )}
            <BudgetRow
              name={
                <>
                  <Icon>
                    <DirectionsCarOutlined />
                  </Icon>{" "}
                  Ground Transport
                </>
              }
              cost={props.breakdown.ground_transport
                .map((o) => o.cost)
                .reduce((p, c) => p + c, 0)}
              subRows={props.breakdown.ground_transport.map((obj) => ({
                name: obj.name,
                end: currencyFormatter.format(obj.cost) + " per person",
              }))}
            />
            <BudgetRow
              name={
                <>
                  <Icon>
                    <LocalDiningOutlined />
                  </Icon>{" "}
                  Meals
                </>
              }
              cost={props.breakdown.meals
                .map((obj) => obj.cost * obj.num)
                .reduce((p, v) => p + v, 0)}
              subRows={props.breakdown.meals.map((obj) => ({
                name: obj.name,
                middle: `${currencyFormatter.format(obj.cost)} x ${obj.num}`,
                end: currencyFormatter.format(obj.cost * obj.num),
              }))}
            />
            <BudgetRow
              name={
                <>
                  <Icon>
                    <AddOutlined />
                  </Icon>{" "}
                  Miscellaneous
                </>
              }
              cost={props.breakdown.misc
                .map((obj) => obj.cost)
                .reduce((p, v) => p + v, 0)}
              subRows={props.breakdown.misc.map((obj) => ({
                name: obj.name,
                end: currencyFormatter.format(obj.cost) + " per person",
              }))}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
