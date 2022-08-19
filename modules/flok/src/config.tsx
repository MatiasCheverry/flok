/* Config keys */
// Make sure any keys changed here are adjusted in the setup_config.sh script
export const APP_VERSION_KEY = "app_version"
export const SERVER_BASE_URL_KEY = "server_base_url"
export const IMAGES_BASE_URL_KEY = "images_base_url"
export const MIXPANEL_TOKEN_KEY = "mixpanel_token"
export const GOOGLE_API_KEY = "google_api_key"
export const GOOGLE_MAPS_ID_HOTEL_PAGE_KEY = "google_maps_id_hotel_page"
export const GOOGLE_TAG_MANAGER_ID_KEY = "google_tag_manager_id"
export const DASHBOARD_VERSION_KEY = "dashboard_version"
export const MAX_TASKS = "max_tasks"
export const IMAGE_SERVER_BASE_URL_KEY = "image_server_base_url"
export const DEFAULT_REGISTRATION_EMAIL_TEMPLATE =
  "default_registration_email_template"
export const DEFAULT_FLIGHTS_EMAIL_TEMPLATE = "default_flights_email_template"
type ConfigKey =
  | typeof APP_VERSION_KEY
  | typeof SERVER_BASE_URL_KEY
  | typeof IMAGES_BASE_URL_KEY
  | typeof MIXPANEL_TOKEN_KEY
  | typeof GOOGLE_API_KEY
  | typeof GOOGLE_MAPS_ID_HOTEL_PAGE_KEY
  | typeof GOOGLE_TAG_MANAGER_ID_KEY
  | typeof DASHBOARD_VERSION_KEY
  | typeof MAX_TASKS
  | typeof IMAGE_SERVER_BASE_URL_KEY
  | typeof DEFAULT_FLIGHTS_EMAIL_TEMPLATE
  | typeof DEFAULT_REGISTRATION_EMAIL_TEMPLATE

class Config {
  appConfig: {[key: string]: any}
  defaultConfig: {[key: string]: any} = {
    [APP_VERSION_KEY]: process.env.REACT_APP_VERSION,
    [MIXPANEL_TOKEN_KEY]: "BOGUS_KEY", // use default key to prevent error's from non-initialized mixpanel instance
    [GOOGLE_MAPS_ID_HOTEL_PAGE_KEY]: "209c3e9f6984bce3",
    [MAX_TASKS]: 10,
    [DEFAULT_FLIGHTS_EMAIL_TEMPLATE]: 1,
    [DEFAULT_REGISTRATION_EMAIL_TEMPLATE]: 1,
  }
  constructor() {
    this.appConfig = {}
    // Set url values passed in at runtime
    if (process.env.NODE_ENV === "development") {
      // When in development mode, comes from ENV_VAR
      let apiUrl = process.env.REACT_APP_API_URL
      if (apiUrl) {
        this.appConfig[SERVER_BASE_URL_KEY] = apiUrl
      } else {
        throw Error("Environment variable missing: REACT_APP_API_URL")
      }

      let imagesUrl = process.env.REACT_APP_IMAGES_URL
      if (imagesUrl) {
        this.appConfig[IMAGES_BASE_URL_KEY] = imagesUrl
      } else {
        throw Error("Environment variable missing: REACT_APP_IMAGES_URL")
      }

      let googleApiKey = process.env.REACT_APP_GOOGLE_API_KEY
      if (googleApiKey) {
        this.appConfig[GOOGLE_API_KEY] = googleApiKey
      } else {
        console.warn(
          "Missing Google API Key, Google functionality (maps, etc.) may be limited."
        )
      }

      Object.keys(process.env).forEach((envVar) => {
        if (envVar.toLowerCase().startsWith("react_app_")) {
          let key = envVar.toLowerCase().replace("react_app_", "")
          let val = process.env[envVar]
          this.appConfig[key] = val
        }
      })
    } else {
      // When in production, comes from config.js file at runtime
      let windowConfig = (window as any as {appConfig: any}).appConfig
      if (windowConfig) {
        this.appConfig = {
          ...windowConfig,
        }
      }
    }
  }
  get(configKey: ConfigKey): any {
    var val = this.appConfig[configKey]
    if (val === undefined) {
      val = this.defaultConfig[configKey]
    }
    return val
  }
  set(configKey: ConfigKey, configVal: any): void {
    /* Updates global app config object */
    this.appConfig[configKey] = configVal
  }
}

var config = new Config()
export default config

/**
 * Constants is very similiar to Config except these values are "hard-coded" into the app.
 * Where the Config class has the ability to dynamically set values (from runtime variables, a app-config api call, etc.)
 * Constants are "config" values that don't dynamically change without a code change. In this sense they
 * are basically a grouping of "constants" that might change over time, but not during runtime.
 */
export const Constants = {
  /**
   * maxHotelsSelected, minHotelsSelected:
   * When in the request hotel proposals step you...
   *  Can't select more hotels than max
   *  Can't move on to next step without min hotels selected
   */
  maxHotelsSelected: 10,
  minHotelsSelected: 3,

  /**
   * The key used to save a retreat GUID in local storage
   */
  localStorageRetreatIdxKey: "activeRetreatIdx",
  retreatBaseUrlVar: "%%RETREAT_BASE_URL%%",
  demoRetreatGuid: "a42ca459-3e72-4b3b-9a91-d11bf2763378",
  attendeeSitePathPrefix: "/sites",
}
