import {
  Button,
  Chip,
  Drawer,
  FormControlLabel,
  FormGroup,
  makeStyles,
  Switch,
  Typography,
} from "@material-ui/core"
import {Email} from "@material-ui/icons"
import {push} from "connected-react-router"
import {useEffect} from "react"
import {useDispatch} from "react-redux"
import {useRouteMatch} from "react-router-dom"
import LandingPageEditForm from "../../components/attendee-site/LandingPageEditForm"
import AppHeaderWithSettings from "../../components/base/AppHeaderWithSettings"
import AppMoreInfoIcon from "../../components/base/AppMoreInfoIcon"
import PageBody from "../../components/page/PageBody"
import {AppRoutes} from "../../Stack"
import {ApiAction} from "../../store/actions/api"
import {
  patchRetreat,
  postFlightsLive,
  postTemplatedPage,
} from "../../store/actions/retreat"
import {theme} from "../../theme"
import {useRetreat} from "../misc/RetreatProvider"

let useStyles = makeStyles((theme) => ({
  addBtn: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },
  section: {
    margin: theme.spacing(2),
    "& > *:not(:first-child)": {
      paddingLeft: theme.spacing(1),
    },
    flex: 1,
  },
  headerIcon: {
    marginRight: theme.spacing(1),
    verticalAlign: "top",
    "&.todo": {
      color: theme.palette.error.main,
    },
    "&.next": {
      color: theme.palette.warning.main,
    },
    "&.completed": {
      color: theme.palette.success.main,
    },
  },
  infoChip: {
    borderColor: theme.palette.text.secondary,
    color: theme.palette.text.secondary,
  },
  successChip: {
    backgroundColor: theme.palette.success.main,
    height: 35,
    textTransform: "uppercase",
  },
  warningChip: {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
  },
  dataGrid: {
    backgroundColor: theme.palette.common.white,
    "&.MuiDataGrid-root .MuiDataGrid-cell:focus": {
      outline: "none",
    },
  },
  dataGridRow: {
    cursor: "pointer",
  },
  dataGridWrapper: {
    height: "90%",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    minHeight: 300,
    width: "100%",
  },
  successChipLabel: {
    color: theme.palette.common.white,
    ...theme.typography.body2,
    fontWeight: theme.typography.fontWeightBold,
  },
}))
export default function FlightsOptionsPage() {
  let classes = useStyles()
  let dispatch = useDispatch()
  let [retreat, retreatIdx] = useRetreat()
  let {path} = useRouteMatch()
  let config = path === AppRoutes.getPath("RetreatFlightsOptionsConfig")
  useEffect(() => {
    console.log(retreat)
  }, [retreat])
  return (
    <PageBody appBar>
      <div className={classes.section}>
        <Drawer
          anchor="right"
          open={config}
          onClose={() => {
            dispatch(
              push(
                AppRoutes.getPath("RetreatFlightsOptionsPage", {
                  retreatIdx: retreatIdx.toString(),
                })
              )
            )
          }}>
          <div
            style={{
              padding: theme.spacing(2),
              display: "flex",
              flexDirection: "column",
            }}>
            <Typography variant="h4">Flights Settings</Typography>
            {retreat.flights_live ? (
              <Chip
                size="medium"
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: theme.spacing(2),
                  marginBottom: theme.spacing(2),
                }}
                className={classes.successChip}
                label="Flights page active"
                classes={{label: classes.successChipLabel}}
              />
            ) : (
              <Button
                variant="contained"
                color="primary"
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginTop: theme.spacing(2),
                  marginBottom: theme.spacing(2),
                }}
                onClick={async () => {
                  let response = (await dispatch(
                    postFlightsLive(retreat.id)
                  )) as unknown as ApiAction
                  console.log(response.payload?.response?.message)
                }}>
                Go live with flights?
              </Button>
            )}
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    defaultChecked={retreat.hide_group_flights}
                    onChange={(e, checked) => {
                      dispatch(
                        patchRetreat(retreat.id, {
                          hide_group_flights: checked,
                        })
                      )
                    }}
                  />
                }
                label="Hide Group Flights?"
              />
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    defaultChecked={retreat.require_flight_receipts}
                    onChange={(e, checked) => {
                      dispatch(
                        patchRetreat(retreat.id, {
                          require_flight_receipts: checked,
                        })
                      )
                    }}
                  />
                }
                label="Require Flight Receipts?"
              />
            </FormGroup>
            <Button
              variant="outlined"
              color="primary"
              style={{marginTop: theme.spacing(2)}}
              href={AppRoutes.getPath("EmailTemplatePage", {
                retreatIdx: retreatIdx.toString(),
                templateName: "Flights",
              })}>
              <Email fontSize="small" /> Edit Email Template
            </Button>
          </div>
        </Drawer>
        <div style={{marginBottom: theme.spacing(2)}}>
          <AppHeaderWithSettings
            primaryHeader="Attendees"
            secondaryHeader="Flights"
            terciaryHeader="Alter the flight booking instructions for your team"
            onClickSettings={() => {
              dispatch(
                push(
                  AppRoutes.getPath("RetreatFlightsOptionsConfig", {
                    retreatIdx: retreatIdx.toString(),
                  })
                )
              )
            }}
          />
        </div>
        {retreat.flights_page_id ? (
          <LandingPageEditForm
            pageId={retreat.flights_page_id}
            config={config}
          />
        ) : (
          <div style={{display: "flex", alignItems: "center"}}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                dispatch(
                  postTemplatedPage({
                    title: "Flights",
                    type: "FLIGHTS",
                    retreat_id: retreat.id,
                  })
                )
              }}>
              Create Flights Page?
            </Button>
            <AppMoreInfoIcon
              tooltipText={
                "Don't worry, this page will not be accessable by attendees until you go live with flights from within the flights settings "
              }
            />
          </div>
        )}
      </div>
    </PageBody>
  )
}
