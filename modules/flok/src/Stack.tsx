import React from "react"
import {Route, Switch} from "react-router-dom"
import PageContainer from "./components/page/PageContainer"
import PageSidenav, {PageDemoSidenav} from "./components/page/PageSidenav"
import AttendeeCreateAccountPage from "./pages/attendee-site/AttendeeCreateAccountPage"
import AttendeeSiteFormPage from "./pages/attendee-site/AttendeeSiteFormPage"
import AttendeeSite from "./pages/attendee-site/AttendeeSitePage"
import AuthResetPage from "./pages/auth/AuthResetPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import SigninPage from "./pages/auth/SigninPage"
import AttendeePage from "./pages/dashboard/AttendeePage"
import AttendeesRegFormBuilderPage from "./pages/dashboard/AttendeeRegFormBuilderPage"
import AttendeesPage from "./pages/dashboard/AttendeesPage"
import BudgetEstimatePage from "./pages/dashboard/BudgetEstimatePage"
import RetreatBudgetPage from "./pages/dashboard/BudgetPage"
import FlightsPage from "./pages/dashboard/FlightsPage"
import ItineraryPage from "./pages/dashboard/ItineraryPage"
import LandingPageGenerator from "./pages/dashboard/LandingPageGenerator"
import LodgingContractPage from "./pages/dashboard/LodgingContractPage"
import LodgingPage from "./pages/dashboard/LodgingPage"
import LodgingProposalPage from "./pages/dashboard/LodgingProposalPage"
import LodgingProposalsPage from "./pages/dashboard/LodgingProposalsPage"
import RetreatHomePage from "./pages/dashboard/RetreatHomePage"
import DeprecatedNewRetreatFormPage from "./pages/deprecated/DeprecatedNewRetreatFormPage"
import DeprecatedProposalPage from "./pages/deprecated/DeprecatedProposalPage"
import DeprecatedProposalsListPage from "./pages/deprecated/DeprecatedProposalsListPage"
import DeprecatedRetreatPreferencesFormPage from "./pages/deprecated/DeprecatedRetreatPreferencesFormPage"
import HomeRoutingPage from "./pages/HomeRoutingPage"
import NotFound404Page from "./pages/misc/NotFound404Page"
import ProtectedRoute from "./pages/misc/ProtectedRoute"
import RetreatProvider from "./pages/misc/RetreatProvider"
import PretripHomePage from "./pages/pretrip/PretripHomePage"
import PretripProposalPage from "./pages/pretrip/PretripProposalPage"
import PretripProposalsPage from "./pages/pretrip/PretripProposalsPage"

export type FlokPageName = keyof typeof AppRoutes.pages

export class AppRoutes {
  static deprecatedPages = {
    RetreatFiltersPage: "",
    DestinationPage: "",
    DestinationsListPage: "",
    HotelsListPage: "",
    HotelPage: "",
  }
  static pages = {
    ...AppRoutes.deprecatedPages,
    HomeRoutingPage: "/",

    SigninPage: "/login",
    ForgotPasswordPage: "/forgot-password",
    PasswordResetPage: "/reset-password",
    // NewRetreatFormPage: "/getting-started",

    // DASHBOARD
    RetreatHomePage: "/r/:retreatIdx",

    RetreatLodgingPage: "/r/:retreatIdx/lodging",
    RetreatLodgingProposalsPage: "/r/:retreatIdx/lodging/proposals",
    RetreatLodgingProposalPage: "/r/:retreatIdx/lodging/proposals/:hotelGuid", // no sidebar
    RetreatLodgingContractPage: "/r/:retreatIdx/lodging/contract", // no sidebar

    RetreatAttendeesPage: "/r/:retreatIdx/attendees",
    RetreatAttendeePage: "/r/:retreatIdx/attendees/:attendeeId/profile",
    RetreatAttendeeFlightsPage: "/r/:retreatIdx/attendees/:attendeeId/flights",
    RetreatAttendeesRegFormBuilderPage: "/r/:retreatIdx/attendees/registration",

    // AttendeelLanding page
    LandingPageGeneratorHome: "/r/:retreatIdx/attendees/landing",
    LandingPageGeneratorPage: "/r/:retreatIdx/attendees/landing/:currentPageId",
    LandingPageGeneratorConfig:
      "/r/:retreatIdx/attendees/landing/:currentPageId/config",
    LandingPageGeneratorConfigWebsiteSettings:
      "/r/:retreatIdx/attendees/landing/:currentPageId/config/website-settings",
    LandingPageGeneratorConfigPageSettings:
      "/r/:retreatIdx/attendees/landing/:currentPageId/config/page-settings/:pageId",
    LandingPageGeneratorConfigAddPage:
      "/r/:retreatIdx/attendees/landing/:currentPageId/config/add-page",

    RetreatFlightsPage: "/r/:retreatIdx/flights",

    RetreatBudgetPage: "/r/:retreatIdx/budget",
    RetreatBudgetEstimatePage: "/r/:retreatIdx/budget/estimate",
    RetreatItineraryPage: "/r/:retreatIdx/itinerary",

    // Not in sidebar yet
    AttendeeSiteHome: "/sites/:retreatName",
    AttendeeSitePage: "/sites/:retreatName/:pageName",
    AttendeeSiteFormPage: "/sites/:retreatName/form-page",
    AttendeeSignUpPage: "/sites/:retreatName/sign-up",

    // PRETRIP DEMO
    PretripHomePage: "/r/demo",
    PretripLodgingProposalsPage: "/r/demo/lodging/proposals",
    PretripLodgingProposalPage: "/r/demo/lodging/proposals/:hotelGuid",
    PretripBudgetEstimatorPage: "/r/demo/lodging/budget/estimate",

    // TODO, remove once dashboard release
    DeprecatedNewRetreatFormPage: "/getting-started",
    DeprecatedRetreatPreferencesFormPage: "/r/:retreatGuid/preferences",
    DeprecatedProposalsListPage: "/r/:retreatGuid/proposals",
    DeprecatedProposalPage: "/r/:retreatGuid/proposals/:hotelGuid",
  }

  static getPath(
    name: FlokPageName,
    pathParams: {[key: string]: string} = {},
    queryParams: {[key: string]: string} = {}
  ): string {
    let path = this.pages[name]
    Object.keys(pathParams).forEach((key) => {
      let value = pathParams[key]
      let toReplace = ":" + key
      path = path.replace(toReplace, value)
    })
    if (Object.keys(queryParams).length > 0) {
      path += "?"
    }
    let queryString = new URLSearchParams(queryParams).toString()
    path += queryString

    return path
  }
}

export default function Stack() {
  return (
    <Switch>
      {/* Non authenticated routes */}
      <Route
        path={AppRoutes.getPath("HomeRoutingPage")}
        exact
        component={HomeRoutingPage}
      />
      <Route
        path={AppRoutes.getPath("DeprecatedNewRetreatFormPage")}
        exact
        component={DeprecatedNewRetreatFormPage}
      />
      <Route
        path={AppRoutes.getPath("DeprecatedRetreatPreferencesFormPage")}
        exact
        component={DeprecatedRetreatPreferencesFormPage}
      />
      <Route
        path={AppRoutes.getPath("DeprecatedProposalsListPage")}
        exact
        component={DeprecatedProposalsListPage}
      />
      <Route
        path={AppRoutes.getPath("DeprecatedProposalPage")}
        exact
        component={DeprecatedProposalPage}
      />
      {/* Authentication routes */}
      <Route
        path={AppRoutes.getPath("SigninPage")}
        exact
        component={SigninPage}
      />
      <Route
        path={AppRoutes.getPath("PasswordResetPage")}
        exact
        component={AuthResetPage}
      />
      <Route
        path={AppRoutes.getPath("ForgotPasswordPage")}
        exact
        component={ForgotPasswordPage}
      />
      <Route exact path={AppRoutes.getPath("AttendeeSiteFormPage")}>
        <AttendeeSiteFormPage />
      </Route>
      <Route
        path={[AppRoutes.getPath("AttendeeSiteFormPage")]}
        exact
        component={AttendeeSiteFormPage}
      />
      <Route
        path={[AppRoutes.getPath("AttendeeSignUpPage")]}
        exact
        component={AttendeeCreateAccountPage}
      />
      <Route
        path={[
          AppRoutes.getPath("AttendeeSiteHome"),
          AppRoutes.getPath("AttendeeSitePage"),
        ]}
        exact
        component={AttendeeSite}
      />
      {/* Dashboard routes */}
      <Route path="/r/demo">
        <PageContainer>
          <PageDemoSidenav />
          <Switch>
            <Route exact path={AppRoutes.getPath("PretripHomePage")}>
              <PretripHomePage />
            </Route>
            <Route
              exact
              path={AppRoutes.getPath("PretripLodgingProposalsPage")}>
              <PretripProposalsPage />
            </Route>
            <Route exact path={AppRoutes.getPath("PretripLodgingProposalPage")}>
              <PretripProposalPage />
            </Route>

            <Route exact path={AppRoutes.getPath("PretripBudgetEstimatorPage")}>
              <BudgetEstimatePage />
            </Route>
          </Switch>
        </PageContainer>
      </Route>

      {/* Dashboard routes */}
      <ProtectedRoute path="/r/:retreatIdx">
        <RetreatProvider>
          <PageContainer>
            <PageSidenav />
            {/* Overview */}
            <Switch>
              <Route exact path={AppRoutes.getPath("RetreatHomePage")}>
                <RetreatHomePage />
              </Route>

              {/* Lodging */}
              <Route exact path={AppRoutes.getPath("RetreatLodgingPage")}>
                <LodgingPage />
              </Route>
              <Route
                exact
                path={AppRoutes.getPath("RetreatLodgingProposalsPage")}>
                <LodgingProposalsPage />
              </Route>
              <Route
                exact
                path={AppRoutes.getPath("RetreatLodgingProposalPage")}>
                <LodgingProposalPage />
              </Route>
              <Route
                exact
                path={AppRoutes.getPath("RetreatLodgingContractPage")}>
                <LodgingContractPage />
              </Route>

              {/* Attendees */}
              <Route exact path={AppRoutes.getPath("RetreatAttendeesPage")}>
                <AttendeesPage />
              </Route>
              <Route
                exact
                path={AppRoutes.getPath("RetreatAttendeesRegFormBuilderPage")}>
                <AttendeesRegFormBuilderPage />
              </Route>
              <Route exact path={AppRoutes.getPath("RetreatAttendeePage")}>
                <AttendeePage />
              </Route>
              <Route
                exact
                path={AppRoutes.getPath("RetreatAttendeeFlightsPage")}>
                <AttendeePage />
              </Route>
              <Route
                path={[
                  AppRoutes.getPath("LandingPageGeneratorConfig"),
                  AppRoutes.getPath("LandingPageGeneratorPage"),
                  AppRoutes.getPath("LandingPageGeneratorHome"),
                ]}
                component={LandingPageGenerator}
              />

              {/* Flights */}
              <Route exact path={AppRoutes.getPath("RetreatFlightsPage")}>
                <FlightsPage />
              </Route>

              {/* Budget */}
              <Route
                exact
                path={AppRoutes.getPath("RetreatBudgetEstimatePage")}>
                <BudgetEstimatePage />
              </Route>
              <Route exact path={AppRoutes.getPath("RetreatBudgetPage")}>
                <RetreatBudgetPage />
              </Route>
              {/* Itinerary */}
              <Route exact path={AppRoutes.getPath("RetreatItineraryPage")}>
                <ItineraryPage />
              </Route>
              <Route path={"*"} component={NotFound404Page} />
            </Switch>
          </PageContainer>
        </RetreatProvider>
      </ProtectedRoute>
      <Route path={"*"} component={NotFound404Page} />
    </Switch>
  )
}
