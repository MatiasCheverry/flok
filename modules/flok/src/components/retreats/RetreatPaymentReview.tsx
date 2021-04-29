import {Box, Divider, makeStyles, Paper, Popper} from "@material-ui/core"
import {blue} from "@material-ui/core/colors"
import {InfoRounded, KeyboardArrowLeftRounded} from "@material-ui/icons"
import {useRef, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {RetreatProposal} from "../../models/retreat"
import {deleteSelectedProposal} from "../../store/actions/retreat"
import RetreatGetters from "../../store/getters/retreat"
import {RetreatUtils} from "../../utils/retreatUtils"
import AppButton from "../base/AppButton"
import AppImage from "../base/AppImage"
import AppList, {AppListItem} from "../base/AppList"
import AppTypography from "../base/AppTypography"
import AppRetreatProposalCard from "./AppRetreatProposalCard"
import RetreatDetailsFilter from "./RetreatDetailsFilter"

const FLOK_FEE: number = 250
const FLOK_DISCOUNT: number = 0.5

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  note: {
    backgroundColor: blue[50],
  },
}))

type RetreatPaymentReviewProps = {
  proposal: RetreatProposal
  numEmployees: number
  numNights: number
  updateNumEmployees: (newVal: number) => void
}

export default function RetreatPaymentReview(props: RetreatPaymentReviewProps) {
  const classes = useStyles(props)
  let dispatch = useDispatch()
  let anchorRef = useRef<HTMLDivElement | null>(null)
  let userRetreat = useSelector(RetreatGetters.getRetreat)
  let [proposalCardActive, setProposalCardActive] = useState(false)

  return (
    <Paper elevation={1} className={classes.root}>
      <Box
        display="flex"
        alignItems="center"
        flexWrap="wrap"
        justifyContent="center">
        <Box width={350} height="100%" margin={2}>
          <Box position="absolute" paddingLeft={2} paddingTop={2}>
            <AppButton
              variant="contained"
              fullWidth
              onClick={() => {
                if (userRetreat)
                  dispatch(deleteSelectedProposal(userRetreat.id))
              }}>
              <KeyboardArrowLeftRounded fontSize="inherit" />
              go back to proposals
            </AppButton>
          </Box>
          <Box height="100%">
            <AppImage alt="test" img={props.proposal.imageUrl} />
          </Box>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          width={"50%"}
          minWidth={475}
          paddingLeft={3}
          paddingRight={3}
          paddingBottom={1}>
          <AppList>
            <AppListItem
              header={
                <AppTypography variant="h2">
                  {props.proposal.title}
                </AppTypography>
              }
            />
            <Divider />
            <AppListItem
              header={
                <Box>
                  <RetreatDetailsFilter
                    guests={props.numEmployees}
                    onUpdate={props.updateNumEmployees}
                    size="small"
                  />
                </Box>
              }
              body={
                <AppTypography italic variant="body2">
                  $
                  {RetreatUtils.getProposalEstimate(
                    props.proposal,
                    props.numEmployees,
                    props.numNights
                  ).toLocaleString()}{" "}
                  total trip estimate{" "}
                  <span
                    ref={anchorRef}
                    onMouseEnter={() => setProposalCardActive(true)}
                    onMouseLeave={() => setProposalCardActive(false)}>
                    <InfoRounded fontSize="inherit" />
                  </span>
                  <Popper
                    open={proposalCardActive}
                    anchorEl={anchorRef.current}
                    onMouseLeave={() => setProposalCardActive(false)}>
                    <AppRetreatProposalCard
                      accomodationCost={props.proposal.lodgingCost}
                      flightCost={props.proposal.flightsCost}
                      imgUrl={props.proposal.imageUrl}
                      numNights={props.numNights}
                      numPeople={props.numEmployees}
                      onSelect={() => undefined}
                      otherCost={props.proposal.otherCost}
                      title={props.proposal.title}
                      summary
                    />
                  </Popper>
                </AppTypography>
              }
            />
            <Divider />
            <AppListItem
              header={
                <AppTypography variant="body1">Flok planning fee</AppTypography>
              }
              subheader={
                <AppTypography
                  variant="body2"
                  color={
                    "textSecondary"
                  }>{`${props.numEmployees} employees x $${FLOK_FEE} per person`}</AppTypography>
              }
              body={
                <AppTypography>
                  ${(FLOK_FEE * props.numEmployees).toLocaleString()}
                </AppTypography>
              }
            />
            <AppListItem
              header={
                <AppTypography variant="body1">
                  {FLOK_DISCOUNT * 100}% discount on Flok fee
                </AppTypography>
              }
              body={
                <AppTypography>
                  -$
                  {(
                    FLOK_DISCOUNT *
                    (props.numEmployees * FLOK_FEE)
                  ).toLocaleString()}
                </AppTypography>
              }
            />
            <Divider />
            <AppListItem
              header={
                <AppTypography bold variant="body1">
                  What you pay now
                </AppTypography>
              }
              body={
                <AppTypography bold>
                  $
                  {(
                    props.numEmployees * FLOK_FEE -
                    FLOK_DISCOUNT * (props.numEmployees * FLOK_FEE)
                  ).toLocaleString()}
                </AppTypography>
              }
            />
          </AppList>
          <Box padding={1} width="100%">
            <Paper classes={{root: classes.note}}>
              <Box padding={2}>
                <AppTypography variant="body1" bold>
                  Note:
                </AppTypography>
                <AppTypography variant="body1">
                  1) This fee is fully refundable <br />
                  2) You can continue to add or subtract employees, Flok will
                  adjust your price according the final number of retreat
                  attendees
                </AppTypography>
              </Box>
            </Paper>
          </Box>
          <Box paddingLeft={1} paddingRight={1} marginBottom={1} marginTop={1}>
            <AppButton
              onClick={() => undefined}
              variant="contained"
              color="primary"
              fullWidth>
              Pay ${" "}
              {(
                props.numEmployees * FLOK_FEE -
                FLOK_DISCOUNT * (props.numEmployees * FLOK_FEE)
              ).toLocaleString()}{" "}
              now
            </AppButton>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
