import {
  Button,
  Link,
  makeStyles,
  TextField,
  TextFieldProps,
  Typography,
} from "@material-ui/core"
import {Alert} from "@material-ui/lab"
import {useFormik} from "formik"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {Link as ReactRouterLink, useRouteMatch} from "react-router-dom"
import AppLoadingScreen from "../../components/base/AppLoadingScreen"
import AppLogo from "../../components/base/AppLogo"
import AppTypography from "../../components/base/AppTypography"
import PageContainer from "../../components/page/PageContainer"
import {AppRoutes} from "../../Stack"
import {ApiAction} from "../../store/actions/api"
import {postAttendeePasswordReset} from "../../store/actions/user"
import {fromPathStr} from "../../utils"
import {useAttendeeLandingWebsiteName} from "../../utils/retreatUtils"

const useStyles = makeStyles((theme) => ({
  title: {
    marginBottom: theme.spacing(0.5),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: -theme.spacing(1),
    "& > *": {
      marginTop: theme.spacing(1),
    },
  },
  submitRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footer: {
    marginTop: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(2),
    border: "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: 5,
    boxShadow: theme.shadows[1],
    textAlign: "center",
  },
  modal: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: 5,
    boxShadow: theme.shadows[1],
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  modalFooterContainer: {
    margin: "auto",
    maxWidth: 500,
    width: "90%",
  },
  body: {
    overflow: "auto",
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  responseMessage: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}))

export default function AttendeeCreateAccountPage() {
  let dispatch = useDispatch()
  let classes = useStyles()
  let router = useRouteMatch<{retreatName: string}>()
  let {retreatName} = router.params
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<"success" | "error" | undefined>(
    undefined
  )
  let [website] = useAttendeeLandingWebsiteName(fromPathStr(retreatName))
  let formik = useFormik({
    initialValues: {
      email: "",
    },
    onSubmit: async (values) => {
      if (website) {
        setLoading(true)
        let apiResponse = (await dispatch(
          postAttendeePasswordReset(values.email, website.retreat_id)
        )) as unknown as ApiAction
        setLoading(false)
        setResponse(apiResponse.error ? "error" : "success")
      }
    },
  })
  const commonTextFieldProps: TextFieldProps = {
    variant: "standard",
    fullWidth: true,
  }
  return (
    <PageContainer>
      <div className={classes.body}>
        {loading && <AppLoadingScreen />}
        <div className={classes.modalFooterContainer}>
          <div className={classes.modal}>
            <>
              <div className={classes.title}>
                <AppLogo height={50} noBackground withText />
                <AppTypography variant="h3">Attendee Sign Up</AppTypography>
                <Typography>
                  Sign up here to access your account to sign up for your
                  retreat, fill out details and give flight information
                </Typography>
              </div>
              {response === "error" && (
                <Alert severity="error" className={classes.responseMessage}>
                  Oops something went wrong. Check with your RMC that you have
                  been added to the retreat with this email.
                </Alert>
              )}
              {response === "success" && (
                <Alert severity="success" className={classes.responseMessage}>
                  Awesome! Check your email to proceed.
                </Alert>
              )}
              <form onSubmit={formik.handleSubmit}>
                <TextField
                  id="email"
                  name="email"
                  label="Email"
                  required
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.email && formik.errors.email ? true : false
                  }
                  helperText={
                    formik.touched.email && formik.errors.email
                      ? formik.errors.email
                      : " "
                  }
                  {...commonTextFieldProps}
                />
                <div className={classes.submitRow}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    style={{marginTop: 12}}
                    disabled={response === "success" || loading}>
                    Submit
                  </Button>
                </div>
              </form>
            </>
          </div>
          <div className={classes.footer}>
            <AppTypography variant="body1">
              <Link
                color="inherit"
                underline="always"
                to={AppRoutes.getPath(
                  "SigninPage",
                  {
                    retreatName: retreatName,
                  },
                  {
                    next: encodeURIComponent(
                      AppRoutes.getPath("AttendeeSiteFormPage", {
                        retreatName: retreatName,
                      })
                    ),
                    "login-type": "attendee",
                  }
                )}
                component={ReactRouterLink}>
                Already have an account?
              </Link>
            </AppTypography>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
