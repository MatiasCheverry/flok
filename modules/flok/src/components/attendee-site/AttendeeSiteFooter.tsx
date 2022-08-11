import {makeStyles} from "@material-ui/core"
import AppLogo from "../base/AppLogo"
import AppTypography from "../base/AppTypography"

let useStyles = makeStyles((theme) => ({
  footer: {
    width: "100%",
    display: "flex",
    minHeight: "100px",
  },
  footerContent: {
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: "auto",
    marginBottom: "auto",
    display: "flex",
    gap: 3,
  },
  footerText: {marginTop: 3},
}))

export default function AttendeeSiteFooter() {
  let classes = useStyles()
  return (
    <div className={classes.footer}>
      <div className={classes.footerContent}>
        <AppTypography className={classes.footerText}>Made with</AppTypography>
        <a href="https://goflok.com/">
          <AppLogo noBackground height={20} withText />
        </a>
      </div>
    </div>
  )
}
