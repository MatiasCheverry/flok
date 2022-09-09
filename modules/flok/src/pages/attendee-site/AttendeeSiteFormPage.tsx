import {createMuiTheme, makeStyles} from "@material-ui/core"
import {Alert} from "@material-ui/lab"
import {push} from "connected-react-router"
import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {useRouteMatch} from "react-router-dom"
import AttendeeSiteFooter from "../../components/attendee-site/AttendeeSiteFooter"
import RetreatWebsiteHeader from "../../components/attendee-site/RetreatWebsiteHeader"
import FormProvider from "../../components/forms/FormProvider"
import FormResponseViewer from "../../components/forms/FormResponseViewer"
import FormViewer from "../../components/forms/FormViewer"
import PageBody from "../../components/page/PageBody"
import PageContainer from "../../components/page/PageContainer"
import {ResourceNotFound} from "../../models"
import {enqueueSnackbar} from "../../notistack-lib/actions"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {ApiAction} from "../../store/actions/api"
import {postAttendeeRegRequest} from "../../store/actions/retreat"
import {getUserHome} from "../../store/actions/user"
import {replaceDashes, useQuery} from "../../utils"
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
  successAlert: {
    margin: theme.spacing(1),
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
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: website?.primary_color ?? "#4b51ff",
      },
      background: {
        default: website?.background_color ?? "#FFA500",
      },
      text: {
        primary: "#ff0000",
      },
    },
  })
  let [retreat, retreatLoading] = useRetreat(website?.retreat_id ?? -1)
  let [attendee] = useMyAttendee(
    retreat !== ResourceNotFound && retreat != null ? retreat.id : -1
  )
  const titleTag = document.getElementById("titleTag")
  titleTag!.innerHTML = `${website?.name} | Attendee Registration`

  let [loadingUser, setLoadingUser] = useState(false)
  let loginStatus = useSelector((state: RootState) => state.user.loginStatus)
  useEffect(() => {
    async function gatherUser() {
      if (loginStatus === "UNKNOWN" || !user.user) {
        setLoadingUser(true)
        await dispatch(getUserHome())
        setLoadingUser(false)
      }
    }
    gatherUser()
  }, [dispatch, loginStatus, user.user])

  let [attendeeViewQuery] = useQuery("view")
  if (user.loginStatus === "LOGGED_OUT" && website) {
    return (
      <RedirectPage
        pageName="AttendeeSignUpPage"
        pathParams={{retreatName: website.name}}
      />
    )
  }

  let isRmc =
    retreat &&
    retreat !== ResourceNotFound &&
    user.user?.retreat_ids &&
    user.user.retreat_ids.indexOf(retreat.id) !== -1

  if (
    !loadingUser &&
    ((retreat &&
      retreat !== ResourceNotFound &&
      !retreat.registration_live &&
      !isRmc) ||
      (isRmc &&
        attendeeViewQuery === "attendee" &&
        retreat &&
        retreat !== ResourceNotFound &&
        !retreat.registration_live))
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
  return websiteLoading || retreatLoading || !retreat ? (
    <LoadingPage />
  ) : !website || retreat === ResourceNotFound ? (
    <NotFound404Page />
  ) : (
    <PageContainer>
      <PageBody>
        <RetreatWebsiteHeader
          retreat={retreat}
          registrationPage={true}
          logo={
            website.logo_image?.image_url ??
            ImageUtils.getImageUrl("logoIconTextTrans")
          }
          pageIds={website.page_ids}
          retreatName={retreatName}
          selectedPage={"registration"}
          registrationLink={AppRoutes.getPath("AttendeeSiteFormPage")}
        />
        <div className={classes.overallPage}>
          <div className={classes.body}>
            {retreat.attendees_registration_form_id != null ? (
              <FormProvider formId={retreat.attendees_registration_form_id}>
                {attendee && attendee.registration_form_response_id ? (
                  <>
                    {/* Customizable hack for Cro Metrics. Don't repeat this */}
                    {attendee.retreat_id === 1791 ? (
                      <Alert color="success" className={classes.successAlert}>
                        Thank you {attendee.first_name} for registering for the
                        2022 Cro Metrics All Hands! We can't wait to see you in
                        Douglasville, Georgia.
                        <br />
                        <br />
                        If you indicated that you are flying, someone from the
                        Planning Team will be reaching out to help book your
                        flight. Please have your travel information handy such
                        as frequent flyer or known traveler account numbers.
                        <br />
                        <br />
                        Be sure to join the #flok-crometrics-all channel for
                        more updates and to get hyped up about the event.
                        <br />
                        <br />
                        Get ready for Cro Metrics, IRL.
                      </Alert>
                    ) : (
                      <Alert color="success" className={classes.successAlert}>
                        Congrats! You've successfully registered for this event.
                        <br />
                        <br />
                        Check out your registration submission below. Please
                        reach out to the Flok team if you need to update any of
                        the following responses.
                      </Alert>
                    )}
                    <FormResponseViewer
                      formResponseId={attendee.registration_form_response_id}
                    />
                  </>
                ) : (
                  <FormViewer
                    onSuccess={async (formResponse) => {
                      if (attendee) {
                        let response = (await dispatch(
                          postAttendeeRegRequest(attendee?.id, formResponse.id)
                        )) as unknown as ApiAction
                        if (!response.error) {
                          dispatch(
                            enqueueSnackbar({
                              message:
                                "Successfully registered for the retreat",
                              options: {
                                variant: "success",
                              },
                            })
                          )
                        } else {
                          dispatch(
                            enqueueSnackbar({
                              message: "Something Went Wrong",
                              options: {
                                variant: "error",
                              },
                            })
                          )
                        }
                        return response
                      } else {
                        dispatch(
                          enqueueSnackbar({
                            message:
                              "Oops, you haven't been added as an attendee for this retreat.",
                            options: {
                              variant: "error",
                            },
                          })
                        )
                      }
                    }}
                  />
                )}
              </FormProvider>
            ) : (
              <div>Attendee registration isn't live yet</div>
            )}
          </div>
        </div>
        <AttendeeSiteFooter />
      </PageBody>
    </PageContainer>
  )
}
