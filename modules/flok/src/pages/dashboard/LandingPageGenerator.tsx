import {
  Box,
  Drawer,
  IconButton,
  Link,
  makeStyles,
  Typography,
} from "@material-ui/core"
import {ArrowBack, Delete} from "@material-ui/icons"
import {push} from "connected-react-router"
import {useState} from "react"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"
import {useDispatch} from "react-redux"
import {
  Link as RouterLink,
  Route,
  RouteComponentProps,
  Switch,
  useRouteMatch,
} from "react-router-dom"
import AddPageForm from "../../components/attendee-site/AddPageForm"
import EditPageForm from "../../components/attendee-site/EditPageForm"
import EditWebsiteForm from "../../components/attendee-site/EditWebsiteForm"
import LandingPageEditForm from "../../components/attendee-site/LandingPageEditForm"
import LandingPageGeneratorNavTool from "../../components/attendee-site/LandingPageGeneratorNavTool"
import PageWebsiteLink from "../../components/attendee-site/PageWebsiteLink"
import SiteGoLiveButton from "../../components/attendee-site/SiteGoLiveButton"
import AppConfirmationModal from "../../components/base/ConfirmationModal"
import PageBody from "../../components/page/PageBody"
import {AppRoutes} from "../../Stack"
import {ApiAction} from "../../store/actions/api"
import {deletePage} from "../../store/actions/retreat"
import {
  useAttendeeLandingPage,
  useAttendeeLandingWebsite,
} from "../../utils/retreatUtils"
import RedirectPage from "../misc/RedirectPage"
import {useRetreat} from "../misc/RetreatProvider"
import CreateRetreatWebsite from "./CreateRetreatWebsite"

let useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    flex: 1,
    overflow: "hidden",
  },
  tabs: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    minWidth: "175px",
  },
  tab: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginRight: theme.spacing(1.5),
    cursor: "pointer",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  pageNav: {
    marginLeft: theme.spacing(2),
    display: "flex",
    flexDirection: "row",
  },
  pageTitleText: {
    paddingTop: theme.spacing(1.5),
    color: theme.palette.common.black,
  },
  pagesTitle: {
    paddingTop: theme.spacing(1.3),
  },
  toolbarPage: {
    padding: theme.spacing(2),
    minWidth: 300,
  },
  underline: {
    "&:hover": {
      textDecoration: "underline",
      textDecorationColor: theme.palette.primary,
    },
  },
  editWebsiteFormWrapper: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  pageTitleContainer: {
    display: "flex",
  },
  headerLink: {
    color: theme.palette.common.black,
  },
  topRightOptions: {display: "flex", alignItems: "center"},
  viewPageLink: {
    textDecoration: "none",
    "&:hover": {
      textDecoration: "none",
    },
  },
  toolbarPageFlexBox: {
    display: "flex",
  },
  navToolbarWrapper: {
    marginLeft: "8%",
    marginRight: "8%",
    marginTop: "30px",
  },
}))

export default function LandingPageGenerator() {
  let router = useRouteMatch<{
    retreatIdx: string
    currentPageIdx: string
  }>()
  let [retreat, retreatIdx] = useRetreat()
  let currentPageIdx = router.params.currentPageIdx
  let {path} = useRouteMatch()
  let config = path === AppRoutes.getPath("LandingPageGeneratorConfig")
  const classes = useStyles()
  let dispatch = useDispatch()
  let website = useAttendeeLandingWebsite(retreat.attendees_website_id ?? -1)
  let page = useAttendeeLandingPage(
    website?.page_ids[parseInt(currentPageIdx)]
      ? website.page_ids[parseInt(currentPageIdx)]
      : -1
  )

  if (!website || !website.page_ids[0]) {
    return <CreateRetreatWebsite />
  }
  if (
    !currentPageIdx ||
    parseInt(currentPageIdx) > website.page_ids.length - 1
  ) {
    return (
      <RedirectPage
        pageName="LandingPageGeneratorPage"
        pathParams={{
          retreatIdx: retreatIdx.toString(),
          currentPageIdx: "0",
        }}
      />
    )
  }
  return (
    <PageBody appBar>
      <Drawer
        anchor="right"
        open={config}
        onClose={() => {
          dispatch(
            push(
              AppRoutes.getPath("LandingPageGeneratorPage", {
                retreatIdx: retreatIdx.toString(),
                currentPageIdx: currentPageIdx,
              })
            )
          )
        }}>
        <Switch>
          <Route exact path={path}>
            <div className={classes.toolbarPage}>
              <div className={classes.toolbarPageFlexBox}>
                <Typography variant="h4" className={classes.pagesTitle}>
                  Pages
                </Typography>
              </div>
              {website.page_ids.map((pageId, index) => {
                return (
                  <PageWebsiteLink
                    websitePageIds={website?.page_ids}
                    pageIdx={index}
                    currentPageIdx={currentPageIdx}
                    retreatIdx={retreatIdx}
                  />
                )
              })}
              <Link
                className={classes.headerLink}
                component={RouterLink}
                to={AppRoutes.getPath(
                  "LandingPageGeneratorConfigWebsiteSettings",
                  {
                    retreatIdx: retreatIdx.toString(),
                    currentPageIdx: currentPageIdx,
                  }
                )}>
                <Typography
                  variant="h4"
                  className={`${classes.pagesTitle} ${classes.underline}`}>
                  Website Settings
                </Typography>
              </Link>
            </div>
          </Route>
          <Route path={AppRoutes.getPath("LandingPageGeneratorConfigAddPage")}>
            <div className={classes.toolbarPage}>
              <div className={classes.pageTitleContainer}>
                <Typography variant="h4" className={classes.pagesTitle}>
                  Add New Page
                </Typography>
              </div>

              <div>
                <AddPageForm
                  websiteId={website.id}
                  retreatIdx={retreatIdx}
                  websitePageIds={website.page_ids}
                />
              </div>
            </div>
          </Route>
          <Route
            path={AppRoutes.getPath(
              "LandingPageGeneratorConfigWebsiteSettings"
            )}>
            <div className={classes.toolbarPage}>
              <div className={classes.pageTitleContainer}>
                <IconButton
                  onClick={() => {
                    dispatch(
                      push(
                        AppRoutes.getPath("LandingPageGeneratorConfig", {
                          retreatIdx: retreatIdx.toString(),
                          currentPageIdx: currentPageIdx,
                        })
                      )
                    )
                  }}>
                  <ArrowBack fontSize="small" />
                </IconButton>
                <Typography variant="h4" className={classes.pagesTitle}>
                  Website Settings
                </Typography>
              </div>

              <div className={classes.editWebsiteFormWrapper}>
                <EditWebsiteForm
                  isLive={retreat.registration_live}
                  websiteId={website.id}
                  retreatIdx={retreatIdx}
                  currentPageIdx={currentPageIdx}
                />
              </div>
            </div>
          </Route>
          <Route
            path={AppRoutes.getPath("LandingPageGeneratorConfigPageSettings")}
            component={EditPageToolBar}></Route>
        </Switch>
      </Drawer>

      <Box>
        <div className={classes.root}>
          <div className={classes.header}>
            <Typography variant="h1">{retreat.company_name} Website</Typography>
            <SiteGoLiveButton
              retreatId={retreat.id}
              isLive={retreat.registration_live}
            />
          </div>
          <div className={classes.navToolbarWrapper}>
            {page && (
              <LandingPageGeneratorNavTool
                selectedPageIdx={parseInt(currentPageIdx)}
                retreatIdx={retreatIdx}
                pageIds={website.page_ids}
                selectedPage={page}
                website={website}
              />
            )}
          </div>

          {page && (
            <LandingPageEditForm
              pageIdx={page?.id}
              config={config}
              websitePageIds={website.page_ids}
            />
          )}
        </div>
      </Box>
    </PageBody>
  )
}

let useEditPageStyles = makeStyles((theme) => ({
  pagesTitle: {
    paddingTop: theme.spacing(1.3),
  },
  toolbarPage: {
    padding: theme.spacing(2),
    minWidth: 300,
  },
  editWebsiteFormWrapper: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  pageTitleContainer: {
    display: "flex",
  },
  pageSettingsContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}))

type EditPageToolBarProps = RouteComponentProps<{
  pageIdx: string
  retreatIdx: string
  currentPageIdx: string
}>
function EditPageToolBar(props: EditPageToolBarProps) {
  let currentPageIdx = props.match.params.currentPageIdx
  let pageIdx = parseInt(props.match.params.pageIdx)
  let [retreat, retreatIdx] = useRetreat()
  let website = useAttendeeLandingWebsite(retreat.attendees_website_id ?? -1)
  let pageId = website?.page_ids[pageIdx]
  let dispatch = useDispatch()
  let classes = useEditPageStyles()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  let page = useAttendeeLandingPage(pageId ?? -1)

  async function handleDeletePage() {
    let deleteResult = (await dispatch(
      deletePage(pageId ?? -1)
    )) as unknown as ApiAction
    if (!deleteResult.error) {
      let deleteIdx = website?.page_ids
        ? website.page_ids.indexOf(deleteResult.meta.pageId)
        : -1
      console.log(deleteIdx)
      setDeleteModalOpen(false)
      dispatch(
        push(
          AppRoutes.getPath("LandingPageGeneratorConfig", {
            retreatIdx: retreatIdx.toString(),
            currentPageIdx:
              deleteIdx.toString() === currentPageIdx
                ? "0"
                : deleteIdx > parseInt(currentPageIdx)
                ? currentPageIdx
                : (parseInt(currentPageIdx) - 1).toString(),
          })
        )
      )
    }
  }

  return (
    <div className={classes.toolbarPage}>
      <AppConfirmationModal
        open={deleteModalOpen}
        title="Delete Page?"
        text="Are you sure you wish to delete this page?  This action cannot be undone."
        onClose={() => setDeleteModalOpen(false)}
        onSubmit={handleDeletePage}
      />
      <div className={classes.pageSettingsContainer}>
        <div className={classes.pageTitleContainer}>
          <IconButton
            onClick={() => {
              dispatch(
                push(
                  AppRoutes.getPath("LandingPageGeneratorConfig", {
                    retreatIdx: retreatIdx.toString(),
                    currentPageIdx: currentPageIdx,
                  })
                )
              )
            }}>
            <ArrowBack fontSize="small" />
          </IconButton>
          <Typography variant="h4" className={classes.pagesTitle}>
            Page Settings
          </Typography>
        </div>
        {page?.title.toLowerCase() !== "home" && (
          <IconButton onClick={() => setDeleteModalOpen(true)}>
            <Delete />
          </IconButton>
        )}
      </div>
      <div className={classes.editWebsiteFormWrapper}>
        <EditPageForm
          pageId={pageId ?? -1}
          retreatIdx={retreatIdx.toString()}
          currentPageIdx={currentPageIdx}
        />
      </div>
    </div>
  )
}
