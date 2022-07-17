import {makeStyles} from "@material-ui/core"
import {useEffect} from "react"
import {useDispatch, useSelector} from "react-redux"
import {useRouteMatch} from "react-router-dom"
import RetreatWebsiteHeader from "../../components/attendee-site/RetreatWebsiteHeader"
import FormProvider from "../../components/forms/FormProvider"
import FormViewer from "../../components/forms/FormViewer"
import PageBody from "../../components/page/PageBody"
import PageContainer from "../../components/page/PageContainer"
import {ResourceNotFound} from "../../models"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {getUserHome} from "../../store/actions/user"
import {replaceDashes} from "../../utils"
import {ImageUtils} from "../../utils/imageUtils"
import {
  useAttendeeLandingWebsiteName,
  useMyAttendee,
  useRetreat,
} from "../../utils/retreatUtils"
import LoadingPage from "../misc/LoadingPage"
import NotFound404Page from "../misc/NotFound404Page"
import RedirectPage from "../misc/RedirectPage"

let useStyles = makeStyles((theme) => ({
  body: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
    maxWidth: 1100,
    margin: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(0.5),
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
}))

export default function AttendeeSiteFormPage() {
  let dispatch = useDispatch()
  let classes = useStyles()
  let {params} = useRouteMatch<{retreatName: string}>()
  let retreatName = params.retreatName
  let user = useSelector((state: RootState) => state.user)
  let [website, websiteLoading] = useAttendeeLandingWebsiteName(
    replaceDashes(retreatName)
  )
  let [retreat, retreatLoading] = useRetreat(website?.retreat_id ?? -1)
  let [attendee] = useMyAttendee(
    retreat !== ResourceNotFound && retreat != null ? retreat.id : -1
  )
  const titleTag = document.getElementById("titleTag")
  titleTag!.innerHTML = `${website?.name} | Attendee Registration`
  useEffect(() => {
    dispatch(getUserHome())
  }, [dispatch])
  if (user.loginStatus === "LOGGED_OUT" && website) {
    return (
      <RedirectPage
        pageName="AttendeeSignUpPage"
        pathParams={{retreatName: website.name}}
      />
    )
  }
  return websiteLoading || retreatLoading || !retreat ? (
    <LoadingPage />
  ) : !website || retreat === ResourceNotFound ? (
    <NotFound404Page />
  ) : (
    <PageContainer>
      <PageBody>
        <RetreatWebsiteHeader
          logo={
            website.logo_image?.image_url ??
            ImageUtils.getImageUrl("logoIconTextTrans")
          }
          pageIds={website.page_ids}
          retreatName={retreatName}
          homeRoute={AppRoutes.getPath("AttendeeSiteHome", {
            retreatName: retreatName,
          })}
          selectedPage={"form-page"}
          registrationLink={AppRoutes.getPath("AttendeeSiteFormPage")}
        />
        <div className={classes.overallPage}>
          <div className={classes.body}>
            {retreat.attendees_registration_form_id != null ? (
              <FormProvider formId={retreat.attendees_registration_form_id}>
                <FormViewer onSuccess={(formResponse) => {}} />
              </FormProvider>
            ) : (
              <div>Attendee registration isn't live yet</div>
            )}
          </div>
        </div>
      </PageBody>
    </PageContainer>
  )
}
