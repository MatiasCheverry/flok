import {makeStyles, Typography, TypographyProps} from "@material-ui/core"
import clsx from "clsx"

let useStyles = makeStyles((theme) => ({
  root: {
    fontWeight: (props: AppTypographyProps) => {
      switch (props.fontWeight) {
        case "light":
          return theme.typography.fontWeightLight
        case "regular":
          return theme.typography.fontWeightRegular
        case "medium":
          return theme.typography.fontWeightMedium
        case "bold":
          return theme.typography.fontWeightBold
        default:
          return undefined
      }
    },
    fontStyle: (props: AppTypographyProps) =>
      props.italic ? "italic" : undefined,
    textDecoration: (props: AppTypographyProps) =>
      props.underline ? "underline" : "none",
    textTransform: (props: AppTypographyProps) =>
      props.uppercase ? "uppercase" : undefined,
  },
}))

interface AppTypographyProps extends TypographyProps {
  fontWeight?: "light" | "regular" | "medium" | "bold"
  italic?: boolean
  underline?: boolean
  uppercase?: boolean
}

export default function AppTypography(props: AppTypographyProps) {
  let classes = useStyles(props)
  let {fontWeight, italic, underline, children, ...otherProps} = props
  return (
    <Typography
      {...otherProps}
      className={clsx(classes.root, otherProps.className)}>
      {props.children}
    </Typography>
  )
}
