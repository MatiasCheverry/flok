import {Button, Dialog, Link, makeStyles} from "@material-ui/core"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import {push} from "connected-react-router"
import {useState} from "react"
import {useDispatch} from "react-redux"
import {
  Link as ReactRouterLink,
  RouteComponentProps,
  withRouter,
} from "react-router-dom"
import AddDestinationModal from "../components/lodging/AddDestinationModal"
import HotelSelectModal from "../components/lodging/HotelSelectModal"
import NewHotelForm from "../components/lodging/NewHotelForm"
import PageBase from "../components/page/PageBase"
import {AppRoutes} from "../Stack"

let useStyles = makeStyles((theme) => ({
  body: {
    flex: "1 1 auto",
    width: "100%",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
  },
  tabs: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  table: {
    flex: 1,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  link: {
    "&:hover": {
      textDecoration: "none",
    },
  },
  linkBox: {
    marginLeft: theme.spacing(1),
  },
}))

type LodgingContentPageProps = RouteComponentProps<{}>

function HotelsPage(props: LodgingContentPageProps) {
  let classes = useStyles(props)
  let dispatch = useDispatch()

  let [hotelSearchOpen, setHotelSearchOpen] = useState(false)
  let [newHotelOpen, setNewHotelOpen] = useState(false)
  let [addDestinationModalOpen, setAddDestinationModalOpen] = useState(false)

  return (
    <PageBase>
      <div className={classes.body}>
        <Typography variant="h1" paragraph>
          Lodging Content
        </Typography>
        <Typography variant="body1" component="div">
          Select a hotel in order to:
          <ul>
            <li>
              edit hotel data such as airport distance, name, destination, etc.
            </li>
            <li>add/remove hotel images</li>
            <li>add/edit default proposals (aka proposals database)</li>
          </ul>
        </Typography>
        <Box display="flex">
          <Button
            color="primary"
            variant="contained"
            onClick={() => setHotelSearchOpen(true)}>
            Select hotel
          </Button>
          {hotelSearchOpen && (
            <HotelSelectModal
              submitText="Select"
              onSubmit={(hotelId) =>
                dispatch(
                  push(
                    AppRoutes.getPath("HotelPage", {
                      hotelId: hotelId.toString(),
                    })
                  )
                )
              }
              onClose={() => setHotelSearchOpen(false)}
            />
          )}
          <Box ml={1} clone>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => setNewHotelOpen(true)}>
              Add a new hotel
            </Button>
          </Box>
          <Box ml={1} clone>
            <Button
              color="primary"
              variant="outlined"
              onClick={() => {
                setAddDestinationModalOpen(true)
              }}>
              Add a new destination
            </Button>
          </Box>
          <Box clone className={classes.linkBox}>
            <Link
              className={classes.link}
              component={ReactRouterLink}
              to={AppRoutes.getPath("HotelsListPage")}>
              <Button color="primary" variant="outlined">
                View Hotels List
              </Button>
            </Link>
          </Box>
        </Box>
        {newHotelOpen && (
          <Dialog open={newHotelOpen} onClose={() => setNewHotelOpen(false)}>
            <Box p={2}>
              <NewHotelForm />
            </Box>
          </Dialog>
        )}
        <AddDestinationModal
          open={addDestinationModalOpen}
          onClose={() => {
            setAddDestinationModalOpen(false)
          }}
        />
      </div>
    </PageBase>
  )
}

export default withRouter(HotelsPage)
