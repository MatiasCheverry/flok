import {makeStyles, Tab, Tabs} from "@material-ui/core"
import {push} from "connected-react-router"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {useRouteMatch} from "react-router-dom"
import {ResourceNotFound} from "../../models"
import {SampleLockedAttendees} from "../../models/retreat"
import LoadingPage from "../../pages/misc/LoadingPage"
import NotFound404Page from "../../pages/misc/NotFound404Page"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {getUserHome} from "../../store/actions/user"
import {replaceDashes, useQuery} from "../../utils"
import {ImageUtils} from "../../utils/imageUtils"
import {
  useAttendeeLandingPage,
  useAttendeeLandingWebsiteName,
  useMyAttendee,
  useRetreat,
  useRetreatAttendees,
} from "../../utils/retreatUtils"
import AttendeeFlightTab from "../flights/AttendeeFlightTab"
import AppTabPanel from "../page/AppTabPanel"
import PageBody from "../page/PageBody"
import PageContainer from "../page/PageContainer"
import AttendeeFlightsDataGrid from "./AttendeeFlightsDataGrid"
import AttendeeSiteFooter from "./AttendeeSiteFooter"
import {BlockRenderer} from "./blocks/Blocks"
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

  let [attendeeViewQuery] = useQuery("view")
  let dispatch = useDispatch()
  let user = useSelector((state: RootState) => state.user.user)
  let loginStatus = useSelector((state: RootState) => state.user.loginStatus)
  let [loadingUser, setLoadingUser] = useState(true)
  useEffect(() => {
    async function gatherUser() {
      if (loginStatus === "UNKNOWN" || !user) {
        setLoadingUser(true)
        await dispatch(getUserHome())
        setLoadingUser(false)
      } else {
        setLoadingUser(false)
      }
    }
    gatherUser()
  }, [dispatch, loginStatus, user])

  let isRmc =
    retreat &&
    retreat !== ResourceNotFound &&
    user?.retreat_ids &&
    user.retreat_ids.indexOf(retreat.id) !== -1

  let demo =
    isRmc && retreat && retreat !== ResourceNotFound && !retreat?.flights_live

  let [attendeeTravelInfo] = useRetreatAttendees(
    retreat && retreat !== ResourceNotFound ? retreat.id : -1
  )
  function compareLists(list1: number[], list2: number[]) {
    let shared = false
    list1.forEach((num) => {
      if (shared === true) {
        return
      } else if (list2.indexOf(num) !== -1) {
        shared = true
      }
    })
    return shared
  }
  let isAttendee =
    user &&
    compareLists(
      user.attendee_ids,
      attendeeTravelInfo.map((attendee) => attendee.id)
    )

  if (!loadingUser && loginStatus !== "LOGGED_IN") {
    dispatch(
      push(
        AppRoutes.getPath(
          "SigninPage",
          {
            retreatName: retreatName,
          },
          {
            next: encodeURIComponent(
              AppRoutes.getPath("AttendeeSiteFlightsPage", {
                retreatName: retreatName,
              })
            ),
            "login-type": "attendee",
          }
        )
      )
    )
  }
  if (
    !loadingUser &&
    ((retreat &&
      retreat !== ResourceNotFound &&
      !retreat.flights_live &&
      !isRmc) ||
      (isRmc &&
        attendeeViewQuery === "attendee" &&
        retreat &&
        retreat !== ResourceNotFound &&
        !retreat.flights_live))
  ) {
    dispatch(
      push(
        AppRoutes.getPath(
          "AttendeeSitePage",
          {
            retreatName: retreatName,
            pageName: "home",
          },
          !attendeeViewQuery ? {} : {view: "attendee"}
        )
      )
    )
  }
  return websiteLoading || retreatLoading || !retreat || loadingUser ? (
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
            selectedPage={"flights"}
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
              {!retreat.hide_group_flights && (isRmc || isAttendee) && (
                <Tab value="group" label="Group Flights" />
              )}
            </Tabs>
          </div>
          <AppTabPanel show={tabValue === "my-flight"}>
            <div className={classes.flightTabWrapper}>
              {attendee || demo ? (
                <AttendeeFlightTab
                  demo={demo}
                  attendee={attendee ?? SampleLockedAttendees[0]}
                  hideHeader
                  receiptRestricted={retreat.require_flight_receipts}
                />
              ) : (
                "Oops, looks like you are not an attendee on this retreat"
              )}
            </div>
          </AppTabPanel>
          {!retreat.hide_group_flights && (isRmc || isAttendee) && (
            <AppTabPanel show={tabValue === "group"}>
              <div className={classes.dataGridWrapper}>
                <AttendeeFlightsDataGrid
                  retreatId={retreat.id}
                  demo={!retreat.flights_live}
                />
              </div>
            </AppTabPanel>
          )}
          <AppTabPanel show={tabValue === "instructions"}>
            <div className={classes.overallPage}>
              {page?.block_ids ? (
                page.block_ids.map((blockId) => (
                  <BlockRenderer blockId={blockId} />
                ))
              ) : (
                <div>
                  Your flight booking instructions will be rendered here once
                  you have created them in the dashboard
                </div>
              )}
            </div>
          </AppTabPanel>
        </div>
        <AttendeeSiteFooter />
      </PageBody>
    </PageContainer>
  )
}
