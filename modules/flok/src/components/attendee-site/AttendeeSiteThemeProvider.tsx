import {createMuiTheme, CssBaseline, ThemeProvider} from "@material-ui/core"
import {PropsWithChildren} from "react"
import {useRouteMatch} from "react-router-dom"
import {FlokTheme} from "../../theme"
import {replaceDashes} from "../../utils"
import {useAttendeeLandingWebsiteName} from "../../utils/retreatUtils"

export default function AttendeeSiteThemeProvider(
  props: PropsWithChildren<{}>
) {
  let {params} = useRouteMatch<{retreatName: string}>()
  let retreatName = params.retreatName
  let [website] = useAttendeeLandingWebsiteName(replaceDashes(retreatName))
  return (
    <ThemeProvider
      theme={(theme: FlokTheme) =>
        createMuiTheme({
          ...theme,
          palette: {
            ...theme.palette,
            primary: {
              main: website?.primary_color ?? theme.palette.primary.main,
            },
            background: {
              default:
                website?.background_color ?? theme.palette.background.default,
            },
            text: {
              primary: website?.text_color ?? theme.palette.text.primary,
            },
          },
        })
      }>
      <CssBaseline />
      {props.children}
    </ThemeProvider>
  )
}
