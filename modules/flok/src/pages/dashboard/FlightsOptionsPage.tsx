import {
  Button,
  Drawer,
  FormControlLabel,
  FormGroup,
  makeStyles,
  Switch,
  Typography,
} from "@material-ui/core"
import {Email} from "@material-ui/icons"
import {push} from "connected-react-router"
import {useDispatch} from "react-redux"
import {useRouteMatch} from "react-router-dom"
import {FlightsGoLiveButton} from "../../components/attendee-site/GoLiveButtons"
import SitePage from "../../components/attendee-site/page/SitePage"
import AppHeaderWithSettings from "../../components/base/AppHeaderWithSettings"
import AppMoreInfoIcon from "../../components/base/AppMoreInfoIcon"
import PageBody from "../../components/page/PageBody"
import {AppRoutes} from "../../Stack"
import {patchRetreat, postTemplatedPage} from "../../store/actions/retreat"
import {theme} from "../../theme"
import {titleToNavigation} from "../../utils"
import {useAttendeeLandingWebsite} from "../../utils/retreatUtils"
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
  configDrawer: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    "& > *:not(:first-child)": {
      marginTop: theme.spacing(1),
    },
  },
}))
export default function FlightsOptionsPage() {
  let classes = useStyles()
  let dispatch = useDispatch()
  let [retreat, retreatIdx] = useRetreat()
  let {path} = useRouteMatch()
  let config = path === AppRoutes.getPath("RetreatFlightsOptionsConfig")
  let website = useAttendeeLandingWebsite(retreat.attendees_website_id ?? -1)

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
          <div className={classes.configDrawer}>
            <Typography variant="h4">Flights Settings</Typography>
            <FlightsGoLiveButton
              isLive={!!retreat.flights_live}
              retreatId={retreat.id}
            />
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
            viewPageLink={
              website
                ? AppRoutes.getPath("AttendeeSitePage", {
                    retreatName: titleToNavigation(website.name),
                    pageName: "flights",
                  })
                : undefined
            }
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
          <SitePage pageId={retreat.flights_page_id} editable />
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
