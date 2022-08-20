import {makeStyles, Tab, Tabs} from "@material-ui/core"
import {useEffect, useState} from "react"
import {useRouteMatch} from "react-router-dom"
import {ResourceNotFound} from "../../models"
import {WYSIWYGBlockRenderer} from "../../pages/attendee-site/AttendeeSitePage"
import LoadingPage from "../../pages/misc/LoadingPage"
import NotFound404Page from "../../pages/misc/NotFound404Page"
import {AppRoutes} from "../../Stack"
import {replaceDashes, useQuery} from "../../utils"
import {ImageUtils} from "../../utils/imageUtils"
import {
  useAttendeeLandingPage,
  useAttendeeLandingWebsiteName,
  useMyAttendee,
  useRetreat,
} from "../../utils/retreatUtils"
import AttendeeFlightTab from "../flights/AttendeeFlightTab"
import AppTabPanel from "../page/AppTabPanel"
import PageBody from "../page/PageBody"
import PageContainer from "../page/PageContainer"
import AttendeeFlightsDataGrid from "./AttendeeFlightsDataGrid"
import AttendeeSiteFooter from "./AttendeeSiteFooter"
import RetreatWebsiteHeader from "./RetreatWebsiteHeader"

let useStyles = makeStyles((theme) => ({
  bannerImg: {
    width: "100%",
    maxHeight: "325px",
    objectFit: "cover",
    [theme.breakpoints.down("sm")]: {
      minHeight: "130px",
    },
  },
  overallPage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
    maxWidth: 1100,
    margin: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(0.5),
    },
  },
  pageBody: {
    marginBottom: theme.spacing(3),
  },
  dataGridWrapper: {
    width: "65%",
    marginLeft: "auto",
    marginRight: "auto",
    height: "500px",
    [theme.breakpoints.down("sm")]: {
      width: "90%",
    },
  },
  flightTabWrapper: {
    width: "75%",
    marginLeft: "auto",
    marginRight: "auto",
    [theme.breakpoints.down("sm")]: {
      width: "90%",
    },
  },
}))
export default function AttendeeSiteFlightsPage() {
  let classes = useStyles()
  let {params} = useRouteMatch<{retreatName: string}>()
  let retreatName = params.retreatName
  let [website, websiteLoading] = useAttendeeLandingWebsiteName(
    replaceDashes(retreatName)
  )
  let [retreat, retreatLoading] = useRetreat(website?.retreat_id ?? -1)
  let [attendee] = useMyAttendee(
    retreat !== ResourceNotFound && retreat != null ? retreat.id : -1
  )
  let [tabQuery, setTabQuery] = useQuery("tab")
  let [tabValue, setTabValue] = useState<string | undefined>(undefined)
  let page = useAttendeeLandingPage(
    retreat !== ResourceNotFound && retreat && retreat.flights_page_id
      ? retreat?.flights_page_id
      : -1
  )
  useEffect(() => {
    let TABS = ["my-flight", "instructions", "group"]
    if (retreat !== ResourceNotFound && retreat?.hide_group_flights) {
      TABS.pop()
    }
    setTabValue(tabQuery && TABS.includes(tabQuery) ? tabQuery : "instructions")
  }, [tabQuery, setTabValue, retreat])

  return websiteLoading || retreatLoading || !retreat ? (
    <LoadingPage />
  ) : !website || retreat === ResourceNotFound ? (
    <NotFound404Page />
  ) : (
    <PageContainer>
      <PageBody>
        <div className={classes.pageBody}>
          <RetreatWebsiteHeader
            retreat={retreat}
            registrationPage={true}
            logo={
              website?.logo_image?.image_url ??
              ImageUtils.getImageUrl("logoIconTextTrans")
            }
            pageIds={website.page_ids}
            retreatName={retreatName}
            homeRoute={AppRoutes.getPath("AttendeeSiteHome", {
              retreatName: retreatName,
            })}
            selectedPage={"flights-page"}
          />
          {website.banner_image && (
            <img
              src={website.banner_image?.image_url}
              className={classes.bannerImg}
              alt="Banner"></img>
          )}
          <div className={classes.overallPage}>
            <Tabs
              value={tabValue}
              onChange={(e, newVal) =>
                setTabQuery(newVal === "instructions" ? null : newVal)
              }
              variant="fullWidth"
              indicatorColor="primary">
              <Tab value="instructions" label="Flight Instructions" />
              <Tab value="my-flight" label="My Flight" />
              {!retreat.hide_group_flights && (
                <Tab value="group" label="Group Flights" />
              )}
            </Tabs>
          </div>
          <AppTabPanel show={tabValue === "my-flight"}>
            <div className={classes.flightTabWrapper}>
              {attendee ? (
                <AttendeeFlightTab
                  attendee={attendee}
                  hideHeader
                  receiptRestricted={retreat.require_flight_receipts}
                />
              ) : (
                "Oops, looks like you are not an attendee on this retreat"
              )}
            </div>
          </AppTabPanel>
          {!retreat.hide_group_flights && (
            <AppTabPanel show={tabValue === "group"}>
              <div className={classes.dataGridWrapper}>
                <AttendeeFlightsDataGrid retreatId={retreat.id} />
              </div>
            </AppTabPanel>
          )}
          <AppTabPanel show={tabValue === "instructions"}>
            <div className={classes.overallPage}>
              {page?.block_ids[0] && (
                <WYSIWYGBlockRenderer blockId={page.block_ids[0]} />
              )}
            </div>
          </AppTabPanel>
        </div>
        <AttendeeSiteFooter />
      </PageBody>
    </PageContainer>
  )
}
