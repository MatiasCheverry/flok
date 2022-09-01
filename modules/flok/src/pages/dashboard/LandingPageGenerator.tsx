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
import AppHeaderWithSettings from "../../components/base/AppHeaderWithSettings"
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
    currentPageId: string
  }>()
  let [retreat, retreatIdx] = useRetreat()
  let currentPageId = router.params.currentPageId
  let {path} = useRouteMatch()
  let config = path === AppRoutes.getPath("LandingPageGeneratorConfig")
  const classes = useStyles()
  let dispatch = useDispatch()
  let website = useAttendeeLandingWebsite(retreat.attendees_website_id ?? -1)
  let page = useAttendeeLandingPage(parseInt(currentPageId))

  if (!website || !website.page_ids[0]) {
    return <CreateRetreatWebsite />
  }
  if (!currentPageId) {
    return (
      <RedirectPage
        pageName="LandingPageGeneratorPage"
        pathParams={{
          retreatIdx: retreatIdx.toString(),
          currentPageId: website.page_ids[0].toString(),
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
                currentPageId: currentPageId,
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
              {website.page_ids.map((pageId) => {
                return (
                  <PageWebsiteLink
                    pageId={pageId}
                    currentPageId={currentPageId}
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
                    currentPageId: currentPageId,
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
                <AddPageForm websiteId={website.id} retreatIdx={retreatIdx} />
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
                          currentPageId: currentPageId,
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
                  currentPageId={currentPageId}
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
          <AppHeaderWithSettings
            primaryHeader="Attendees"
            secondaryHeader="Website"
            terciaryHeader="Create your dream landing page for your retreat attendees"
            onClickSettings={() => {
              if (page) {
                dispatch(
                  push(
                    AppRoutes.getPath("LandingPageGeneratorConfig", {
                      retreatIdx: retreatIdx.toString(),
                      currentPageId: page.id.toString(),
                    })
                  )
                )
              }
            }}
          />
          <div className={classes.navToolbarWrapper}>
            {page && (
              <LandingPageGeneratorNavTool
                retreatIdx={retreatIdx}
                pageIds={website.page_ids}
                selectedPage={page}
                website={website}
              />
            )}
          </div>

          {page && <LandingPageEditForm pageId={page?.id} config={config} />}
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
  pageId: string
  retreatIdx: string
  currentPageId: string
}>
function EditPageToolBar(props: EditPageToolBarProps) {
  let currentPageId = props.match.params.currentPageId
  let pageId = parseInt(props.match.params.pageId)
  let dispatch = useDispatch()
  let classes = useEditPageStyles()
  let [retreat, retreatIdx] = useRetreat()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  let page = useAttendeeLandingPage(pageId)
  let website = useAttendeeLandingWebsite(retreat.attendees_website_id ?? -1)
  async function handleDeletePage() {
    let deleteResult = (await dispatch(
      deletePage(pageId)
    )) as unknown as ApiAction
    if (!deleteResult.error) {
      setDeleteModalOpen(false)
      dispatch(
        push(
          AppRoutes.getPath("LandingPageGeneratorConfig", {
            retreatIdx: retreatIdx.toString(),
            currentPageId:
              deleteResult.meta.pageId.toString() === currentPageId
                ? website?.page_ids[0].toString() ?? currentPageId
                : currentPageId,
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
                    currentPageId: currentPageId,
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
          pageId={pageId}
          retreatIdx={retreatIdx.toString()}
          currentPageId={currentPageId}
        />
      </div>
    </div>
  )
}
