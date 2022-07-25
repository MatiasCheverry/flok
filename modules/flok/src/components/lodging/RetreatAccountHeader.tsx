import {makeStyles} from "@material-ui/core"
import React from "react"
import {RetreatModel} from "../../models/retreat"
import {getRetreatName} from "../../utils/retreatUtils"
import AppTypography from "../base/AppTypography"

let useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    maxWidth: 300,
    [theme.breakpoints.down("sm")]: {
      maxWidth: 150,
    },
    overflow: "hidden",
  },
}))

type RetreatAccountHeaderProps = {
  retreat: RetreatModel
}
export default function RetreatAccountHeader(props: RetreatAccountHeaderProps) {
  let classes = useStyles(props)
  // let datesString: string | undefined = undefined
  // if (props.retreat.preferences_is_dates_flexible) {
  //   let dates: Date[] = []

  //   if (props.retreat.preferences_dates_exact_end) {
  //     let ds = props.retreat.preferences_dates_exact_end
  //       .split(/\D/)
  //       .map((s) => parseInt(s))
  //     if (ds.length >= 3) {
  //       ds[1] = ds[1] - 1
  //       dates.push(new Date(ds[0], ds[1], ds[2]))
  //     }
  //   }
  //   if (props.retreat.preferences_dates_exact_start) {
  //     let ds = props.retreat.preferences_dates_exact_start
  //       .split(/\D/)
  //       .map((s) => parseInt(s))
  //     if (ds.length >= 3) {
  //       ds[1] = ds[1] - 1
  //       dates.push(new Date(ds[0], ds[1], ds[2]))
  //     }
  //   }
  //   let dateStrings = dates.map((d, i) => {
  //     let dateOptions: Intl.DateTimeFormatOptions = {
  //       weekday: undefined,
  //       day: "numeric",
  //       month: "short",
  //       year: i + 1 === dates.length ? "numeric" : undefined,
  //     }
  //     return d.toLocaleDateString("en-US", dateOptions)
  //   })
  //   datesString = dateStrings.join(" - ")
  // } else {
  //   // is flexible dates
  //   let dateStrings: string[] = []
  //   if (props.retreat.preferences_dates_flexible_num_nights != null) {
  //     dateStrings.push(
  //       `${props.retreat.preferences_dates_flexible_num_nights} nights`
  //     )
  //   }
  //   if (
  //     props.retreat.preferences_dates_flexible_months &&
  //     props.retreat.preferences_dates_flexible_months.length
  //   ) {
  //     let max2Months = props.retreat.preferences_dates_flexible_months.slice(
  //       0,
  //       2
  //     )
  //     dateStrings.push(
  //       max2Months
  //         .map((mon, i) => {
  //           let [month, year] = mon.split("-")
  //           let val = month[0].toUpperCase() + month.slice(1, undefined)
  //           if (i + 1 === max2Months.length) {
  //             val += ` ${year}`
  //           }
  //           return val
  //         })
  //         .join(", ")
  //     )
  //     datesString = dateStrings.join(" in ")
  //   }
  // }

  return (
    <div className={classes.root}>
      <AppTypography variant="body1" fontWeight="bold" noWrap>
        {getRetreatName(props.retreat)}
      </AppTypography>
      {/* {datesString != null ? (
        <AppTypography variant="body1" noWrap>
          {datesString}
        </AppTypography>
      ) : undefined} */}
      {/*
      Disabling change button for now
      <AppTypography variant="body1">
        <Link
          href={
            AppRoutes.getPath("RetreatPreferencesFormPage", {
              retreatGuid: props.retreat.guid,
            }) +
            `?${new URLSearchParams({
              last: window.location.pathname + window.location.search,
            })}`
          }>
          Change
        </Link>
      </AppTypography> */}
    </div>
  )
}
