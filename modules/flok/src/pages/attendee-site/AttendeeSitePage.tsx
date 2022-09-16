import {makeStyles} from "@material-ui/core"
import {useRouteMatch} from "react-router-dom"
import AttendeeSiteFooter from "../../components/attendee-site/AttendeeSiteFooter"
import SitePage from "../../components/attendee-site/page/SitePage"
import RetreatWebsiteHeader from "../../components/attendee-site/RetreatWebsiteHeader"
import PageBody from "../../components/page/PageBody"
import PageContainer from "../../components/page/PageContainer"
import {ResourceNotFound} from "../../models"
import {AppRoutes} from "../../Stack"
import {replaceDashes} from "../../utils"
import {ImageUtils} from "../../utils/imageUtils"
import {
  useAttendeeLandingPageName,
  useAttendeeLandingWebsiteName,
  useRetreat,
} from "../../utils/retreatUtils"
import LoadingPage from "../misc/LoadingPage"
import NotFound404Page from "../misc/NotFound404Page"

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
    maxWidth: 800,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    margin: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(0.5),
    },
  },
}))

export default function AttendeeSite() {
  let router = useRouteMatch<{retreatName: string; pageName: string}>()
  let {retreatName, pageName} = router.params
  let [website, websiteLoading] = useAttendeeLandingWebsiteName(
    replaceDashes(retreatName)
  )
  let classes = useStyles()
  let [retreat, retreatLoading] = useRetreat(website?.retreat_id ?? -1)
  let [page, pageLoading] = useAttendeeLandingPageName(
    website?.id ?? 0,
    replaceDashes(pageName ?? "home")
  )
  const titleTag = document.getElementById("titleTag")
  titleTag!.innerHTML = `${website?.name} | ${page?.title}`
  if (retreat && retreat !== ResourceNotFound && retreat.id === 1791) {
    window.location.replace("https://croallhands2022.com/")
    return <LoadingPage />
  }
  return websiteLoading || pageLoading || retreatLoading ? (
    <LoadingPage />
  ) : !page || !website || !retreat || retreat === ResourceNotFound ? (
    <NotFound404Page />
  ) : (
    <PageContainer>
      <PageBody>
        <RetreatWebsiteHeader
          retreat={retreat}
          logo={
            website.logo_image?.image_url ??
            ImageUtils.getImageUrl("logoIconTextTrans")
          }
          pageIds={website.page_ids}
          retreatName={retreatName}
          selectedPage={pageName ?? "home"}
          registrationLink={AppRoutes.getPath("AttendeeSiteFormPage")}
        />
        {website.banner_image && (
          <img
            src={website.banner_image?.image_url}
            className={classes.bannerImg}
            alt="Banner"></img>
        )}
        <div className={classes.overallPage}>
          <SitePage pageId={page.id} />
        </div>
        <AttendeeSiteFooter />
      </PageBody>
    </PageContainer>
  )
}
