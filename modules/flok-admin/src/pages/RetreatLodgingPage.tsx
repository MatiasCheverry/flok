import {Breadcrumbs, Link, makeStyles, Tab, Tabs} from "@material-ui/core"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {
  Link as ReactRouterLink,
  RouteComponentProps,
  withRouter,
} from "react-router-dom"
import AppTabPanel from "../components/base/AppTabPanel"
import AppTypography from "../components/base/AppTypography"
import SiteInspectionForm from "../components/lodging/SiteInspectionForm"
import PageBase from "../components/page/PageBase"
import RetreatHotelContractForm from "../components/retreats/RetreatHotelContractForm"
import RetreatLodgingDetails from "../components/retreats/RetreatLodgingDetails"
import RetreatStateTitle from "../components/retreats/RetreatStateTitle"
import ViewRFPTab from "../components/retreats/ViewRFPTab"
import {AppRoutes} from "../Stack"
import {RootState} from "../store"
import {getRetreatDetails} from "../store/actions/admin"
import {useQuery} from "../utils"

let useStyles = makeStyles((theme) => ({
  body: {
    flex: "1 1 auto",
    width: "100%",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
  },
}))

type RetreatLodgingPageProps = RouteComponentProps<{
  retreatId: string
}>

function RetreatLodgingPage(props: RetreatLodgingPageProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()
  let retreatId = parseInt(props.match.params.retreatId) || -1 // -1 for an id that will always return 404

  let [tabQuery, setTabQuery] = useQuery("tab")
  let [tabValue, setTabValue] = useState<string | undefined>(undefined)
  useEffect(() => {
    const TABS = ["proposals", "contract", "site-inspection", "rfp"]
    setTabValue(tabQuery && TABS.includes(tabQuery) ? tabQuery : "proposals")
  }, [tabQuery, setTabValue])

  // Get retreat data
  let retreat = useSelector((state: RootState) => {
    return state.admin.retreatsDetails[retreatId]
  })

  useEffect(() => {
    if (!retreat) {
      dispatch(getRetreatDetails(retreatId))
    }
  }, [retreat, dispatch, retreatId])

  let [delayLoad, setDelayLoad] = useState(true)
  useEffect(() => {
    if (delayLoad) {
      setDelayLoad(false)
    }
  }, [delayLoad])
  return (
    <PageBase>
      <div className={classes.body}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            to={AppRoutes.getPath("RetreatsPage")}
            component={ReactRouterLink}>
            All Retreats
          </Link>
          <Link
            color="inherit"
            to={AppRoutes.getPath("RetreatPage", {
              retreatId: retreatId.toString(),
            })}
            component={ReactRouterLink}>
            {retreat?.company_name}
          </Link>
          <AppTypography color="textPrimary">Lodging</AppTypography>
        </Breadcrumbs>
        {retreat && <RetreatStateTitle retreat={retreat} type="lodging" />}{" "}
        <Tabs
          indicatorColor="primary"
          centered
          value={tabValue}
          onChange={(e, newVal) =>
            setTabQuery(newVal === "proposals" ? null : newVal)
          }>
          <Tab value={"proposals"} label="Proposals" />
          <Tab value={"contract"} label="Contract" />
          <Tab value={"site-inspection"} label="Site Inspection" />
          <Tab value="rfp" label="View RFP" />
        </Tabs>
        <AppTabPanel show={tabValue === "proposals"} renderDom="always">
          {retreat && <RetreatLodgingDetails retreat={retreat} />}
        </AppTabPanel>
        <AppTabPanel show={tabValue === "contract"} renderDom="always">
          {retreat && <RetreatHotelContractForm retreat={retreat} />}
        </AppTabPanel>
        <AppTabPanel show={tabValue === "site-inspection"} renderDom="always">
          {retreat && <SiteInspectionForm retreat={retreat} />}
        </AppTabPanel>
        <AppTabPanel show={tabValue === "rfp"} renderDom="always">
          <ViewRFPTab retreatId={retreatId} />
        </AppTabPanel>
      </div>
    </PageBase>
  )
}

export default withRouter(RetreatLodgingPage)
