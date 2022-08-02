import {
  Breadcrumbs,
  Button,
  CircularProgress,
  Link,
  makeStyles,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {
  Link as ReactRouterLink,
  RouteComponentProps,
  withRouter,
} from "react-router-dom"
import AppLoadingScreen from "../components/base/AppLoadingScreen"
import AppTabPanel from "../components/base/AppTabPanel"
import AppTypography from "../components/base/AppTypography"
import HotelImageForm from "../components/lodging/HotelmageForm"
import HotelProfileForm from "../components/lodging/HotelProfileForm"
import PageBase from "../components/page/PageBase"
import HotelProposalForm from "../components/retreats/HotelProposalForm"
import {AppRoutes} from "../Stack"
import {RootState} from "../store"
import {
  getHotelDetails,
  postHotelTemplateProposal,
  putHotelTemplateProposal,
} from "../store/actions/admin"
import {useQuery} from "../utils"

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
    height: 0,
  },
  tabs: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  tab: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  fullPageTab: {
    flex: "1 1 auto",
    height: 0,
  },
}))

type HotelPageProps = RouteComponentProps<{hotelId: string}>

function HotelPage(props: HotelPageProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()
  let hotelId = parseInt(props.match.params.hotelId)

  let hotel = useSelector(
    (state: RootState) => state.admin.hotelsDetails[hotelId]
  )
  let [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadHotel() {
      setLoading(true)
      await dispatch(getHotelDetails(hotelId))
      setLoading(false)
    }
    if (!hotel) {
      loadHotel()
    }
  }, [dispatch, hotel, hotelId])

  let [tabQuery, setTabQuery] = useQuery("tab")
  let [tabValue, setTabValue] = useState<string | undefined>(undefined)
  useEffect(() => {
    const TABS = ["profile", "proposal", "images"]
    setTabValue(tabQuery && TABS.includes(tabQuery) ? tabQuery : "profile")
  }, [tabQuery, setTabValue])

  let [loadingCreateProposal, setLoadingCreateProposal] = useState(false)
  async function createTemplateProposal() {
    setLoadingCreateProposal(true)
    dispatch(postHotelTemplateProposal(hotelId, {}))
    setLoadingCreateProposal(false)
  }

  return (
    <PageBase>
      {loading ? <AppLoadingScreen /> : undefined}
      <div className={classes.body}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            to={AppRoutes.getPath("HotelsPage")}
            component={ReactRouterLink}>
            Hotels
          </Link>
          <Link
            color="inherit"
            to={AppRoutes.getPath("HotelsListPage")}
            component={ReactRouterLink}>
            Hotels List
          </Link>
          <AppTypography color="textPrimary">{hotel?.name}</AppTypography>
        </Breadcrumbs>
        <Typography variant="h1">{hotel?.name}</Typography>
        {!hotel && !loading ? (
          <Typography>There was an error loading the hotel.</Typography>
        ) : undefined}
        {hotel && (
          <>
            <Tabs
              className={classes.tabs}
              value={tabValue}
              onChange={(e, newVal) =>
                setTabQuery(newVal === "profile" ? null : newVal)
              }
              variant="fullWidth"
              indicatorColor="primary">
              <Tab value="profile" label="Hotel profile" />
              <Tab value="images" label="Hotel images" />
              <Tab value="proposal" label="Template proposal" />
            </Tabs>
            <AppTabPanel show={tabValue === "profile"} className={classes.tab}>
              <HotelProfileForm hotel={hotel} />
            </AppTabPanel>
            <AppTabPanel
              show={tabValue === "images"}
              className={`${classes.tab} ${classes.fullPageTab}`}
              renderDom="on-shown">
              <HotelImageForm hotel={hotel} />
            </AppTabPanel>
            <AppTabPanel show={tabValue === "proposal"} className={classes.tab}>
              <Typography variant="h2">Lodging Proposal</Typography>
              <Typography variant="body1">
                The following template proposal is copied to every proposal
                created for this hotel.
              </Typography>
              <Typography variant="body1">
                ** Some fields are disabled because they are expected to be
                filled in on a per-retreat basis.
              </Typography>
              {hotel.template_proposal ? (
                <HotelProposalForm
                  proposal={hotel.template_proposal}
                  onSave={(values) =>
                    dispatch(putHotelTemplateProposal(hotelId, values))
                  }
                  isProposalTemplate
                />
              ) : (
                <>
                  <Typography variant="body1" paragraph></Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={createTemplateProposal}
                    disabled={loadingCreateProposal}>
                    {loadingCreateProposal ? (
                      <CircularProgress size="inherit" />
                    ) : (
                      "Create template proposal?"
                    )}
                  </Button>
                </>
              )}
            </AppTabPanel>
          </>
        )}
      </div>
    </PageBase>
  )
}

export default withRouter(HotelPage)
