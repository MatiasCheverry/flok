import {makeStyles} from "@material-ui/core"
import {RawDraftContentState} from "draft-js"
import draftToHtml from "draftjs-to-html"
import {useRouteMatch} from "react-router-dom"
import RetreatWebsiteHeader from "../../components/attendee-site/RetreatWebsiteHeader"
import PageBody from "../../components/page/PageBody"
import PageContainer from "../../components/page/PageContainer"
import {fromPathStr} from "../../utils"
import {
  useAttendeeLandingPageBlock,
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
    maxWidth: 1100,
    margin: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      margin: theme.spacing(0.5),
    },
  },
}))

export default function AttendeeSite() {
  let router = useRouteMatch<{retreatName: string; pageName: string}>()
  let {retreatName, pageName} = router.params
  let classes = useStyles()
  let [website, websiteLoading] = useAttendeeLandingWebsiteName(
    fromPathStr(retreatName)
  )
  let [retreat, retreatLoading] = useRetreat(website?.retreat_id || -1)
  let [page, pageLoading] = useAttendeeLandingPageName(
    website?.id ?? 0,
    fromPathStr(pageName ?? "home")
  )
  const titleTag = document.getElementById("titleTag")
  titleTag!.innerHTML = `${website?.name} | ${page?.title}`
  return websiteLoading || pageLoading || retreatLoading ? (
    <LoadingPage />
  ) : !page || !website || !retreat || retreat === "RESOURCE_NOT_FOUND" ? (
    <NotFound404Page />
  ) : (
    <PageContainer>
      <PageBody>
        <RetreatWebsiteHeader
          retreat={retreat}
          website={website}
          selectedPage={pageName ?? "home"}
        />
        {website.banner_image && (
          <img
            src={website.banner_image?.image_url}
            className={classes.bannerImg}
            alt="Banner"></img>
        )}
        <div className={classes.overallPage}>
          {page?.block_ids[0] && (
            <WYSIWYGBlockRenderer blockId={page.block_ids[0]} />
          )}
        </div>
      </PageBody>
    </PageContainer>
  )
}

let useBlockRendererStyles = makeStyles((theme) => ({
  websiteBody: {
    width: "75%",
    "& > *:not(:first-child)": {
      margin: "1em 0",
    },
    "& > *:not(:first-child) > *:not(:first-child)": {
      margin: "1em 0",
    },
  },
}))

type WYSIWYGBlockRendererProps = {
  blockId: number
}
function WYSIWYGBlockRenderer(props: WYSIWYGBlockRendererProps) {
  let block = useAttendeeLandingPageBlock(props.blockId)
  let classes = useBlockRendererStyles()
  return block?.content ? (
    <div
      dangerouslySetInnerHTML={{
        __html: draftToHtml(block!.content as unknown as RawDraftContentState),
      }}
      className={classes.websiteBody}></div>
  ) : (
    <></>
  )
}
