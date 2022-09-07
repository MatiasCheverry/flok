import {Link, makeStyles} from "@material-ui/core"
import {useDispatch} from "react-redux"
import {
  Link as ReactRouterLink,
  RouteComponentProps,
  withRouter,
} from "react-router-dom"
import AppTypography from "../../components/base/AppTypography"
import AuthForm from "../../components/forms/AuthForm"
import PageContainer from "../../components/page/PageContainer"
import {AppRoutes} from "../../Stack"
import {postUserSignin} from "../../store/actions/user"
import {useQuery} from "../../utils"

let useStyles = makeStyles((theme) => ({
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
}))

type SigninPageProps = RouteComponentProps<{}>
function SigninPage(props: SigninPageProps) {
  let [nextQueryParam] = useQuery("next")
  let [attendeeSiteQueryParam] = useQuery("login-site")
  let [loginTypeQueryParam] = useQuery("login-type")
  let classes = useStyles(props)
  let dispatch = useDispatch()
  const handleLogin = (vals: {email: string; password: string}) => {
    if (nextQueryParam) {
      dispatch(postUserSignin(vals.email, vals.password, nextQueryParam))
    } else {
      dispatch(postUserSignin(vals.email, vals.password))
    }
  }
  return (
    <PageContainer>
      <div className={classes.body}>
        <div className={classes.modalFooterContainer}>
          <div className={classes.modal}>
            <AuthForm
              submitForm={handleLogin}
              submitText="Login"
              title="Welcome back!"
              forgotPassword
            />
          </div>
          <div className={classes.footer}>
            <AppTypography variant="body1">
              <Link
                color="inherit"
                underline="always"
                to={
                  loginTypeQueryParam === "attendee"
                    ? AppRoutes.getPath("AttendeeSignUpPage", {
                        retreatName: attendeeSiteQueryParam
                          ? attendeeSiteQueryParam
                          : "",
                      })
                    : AppRoutes.getPath("DeprecatedNewRetreatFormPage")
                }
                component={ReactRouterLink}>
                Don't have an account?
              </Link>
            </AppTypography>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
export default withRouter(SigninPage)
