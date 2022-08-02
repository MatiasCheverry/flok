import React from "react"
import {Route, Switch} from "react-router-dom"
import HomePage from "./pages/HomePage"
import HotelPage from "./pages/HotelPage"
import HotelsListPage from "./pages/HotelsListPage"
import HotelsPage from "./pages/HotelsPage"
import RetreatAttendeePage from "./pages/RetreatAttendeePage"
import RetreatAttendeesPage from "./pages/RetreatAttendeesPage"
import RetreatFlightsPage from "./pages/RetreatFlightsPage"
import RetreatLodgingPage from "./pages/RetreatLodgingPage"
import RetreatPage from "./pages/RetreatPage"
import RetreatSalesIntakePage from "./pages/RetreatSalesIntakePage"
import RetreatsPage from "./pages/RetreatsPage"
import RetreatTasksPage from "./pages/RetreatTasksPage"
import TaskPage from "./pages/TaskPage"
import TasksPage from "./pages/TasksPage"
import UsersPage from "./pages/UsersPage"

type FlokRoute = {
  name: string
  component: JSX.Element
  path: string | string[]
  loginStatus?:
    | ("UNKNOWN" | "LOGGED_IN" | "LOGGED_OUT")[]
    | "UNKNOWN"
    | "LOGGED_IN"
    | "LOGGED_OUT"
}

export class AppRoutes {
  static routes: FlokRoute[] = [
    {name: "HomePage", component: <HomePage />, path: "/"},
    {name: "TasksPage", component: <TasksPage />, path: "/tasks"},
    {
      name: "TaskPage",
      component: <TaskPage />,
      path: "/tasks/:taskId",
    },
    {name: "RetreatsPage", component: <RetreatsPage />, path: "/retreats"},
    {
      name: "RetreatPage",
      component: <RetreatPage />,
      path: "/retreats/:retreatId",
    },
    {
      name: "RetreatSalesIntakePage",
      component: <RetreatSalesIntakePage />,
      path: "/retreats/:retreatId/sales-intake",
    },
    {
      name: "RetreatLodgingPage",
      component: <RetreatLodgingPage />,
      path: "/retreats/:retreatId/lodging",
    },
    {
      name: "RetreatAttendeesPage",
      component: <RetreatAttendeesPage />,
      path: "/retreats/:retreatId/attendees",
    },
    {
      name: "RetreatAttendeePage",
      component: <RetreatAttendeePage />,
      path: "/retreats/:retreatId/attendees/:attendeeId",
    },
    {
      name: "RetreatFlightsPage",
      component: <RetreatFlightsPage />,
      path: "/retreats/:retreatId/flights",
    },
    {
      name: "RetreatFlightPage",
      component: <RetreatAttendeesPage />,
      path: "/retreats/:retreatId/flight/:attendeeId",
    },
    {
      name: "RetreatTasksPage",
      component: <RetreatTasksPage />,
      path: "/retreats/:retreatId/tasks",
    },
    {
      name: "HotelsPage",
      component: <HotelsPage />,
      path: "/hotels",
    },
    {
      name: "HotelsListPage",
      component: <HotelsListPage />,
      path: "/hotels/list",
    },
    {
      name: "HotelPage",
      component: <HotelPage />,
      path: "/hotels/:hotelId",
    },
    {
      name: "AllUsersPage",
      component: <UsersPage />,
      path: "/users",
    },

    // {
    //   name: "UserPage",
    //   component: <UserPage />,
    //   path: "/users/:userId",
    // },
    {
      name: "RetreatUsersPage",
      component: <UsersPage />,
      path: "/retreats/:retreatId/users",
    },
    // {
    //   name: "RetreatUserPage",
    //   component: <UserPage />,
    //   path: "/retreats/:retreatId/users/:userId",
    // },
  ]
  static getRoutes(routes: FlokRoute[]): JSX.Element[] {
    return routes.map((route) => (
      <Route
        path={route.path}
        key={route.name}
        exact
        render={() => route.component}></Route>
    ))
  }

  static getPath(
    name: string,
    pathParams: {[key: string]: string} = {}
  ): string {
    let route: {path: string; name: string}[] = (
      this.routes as {path: string; name: string}[]
    ).filter((route) => route.name.toLowerCase() === name.toLowerCase())
    if (route.length !== 1) {
      throw Error("Can't get path for route named: " + name)
    }
    let _path = route[0].path
    let path: string
    if (Array.isArray(_path)) {
      path = _path[0]
    } else {
      path = _path
    }
    Object.keys(pathParams).forEach((key) => {
      let value = pathParams[key]
      let toReplace = ":" + key
      path = path.replace(toReplace, value)
    })
    return path
  }
}

export default function Stack() {
  return <Switch>{AppRoutes.getRoutes(AppRoutes.routes)}</Switch>
}
