/* Config keys */
// Make sure any keys changed here are adjusted in the setup_config.sh script
export const APP_VERSION_KEY = "app_version"
export const SERVER_BASE_URL_KEY = "server_base_url"
export const IMAGES_BASE_URL_KEY = "images_base_url"
export const IMAGE_SERVER_BASE_URL_KEY = "image_server_base_url"
export const FLOK_BASE_URL_KEY = "flok_base_url"
export const GOOGLE_API_KEY = "google_api_key"
type ConfigKey =
  | typeof APP_VERSION_KEY
  | typeof SERVER_BASE_URL_KEY
  | typeof IMAGES_BASE_URL_KEY
  | typeof IMAGE_SERVER_BASE_URL_KEY
  | typeof FLOK_BASE_URL_KEY
  | typeof GOOGLE_API_KEY

class Config {
  appConfig: {[key: string]: any}
  defaultConfig: {[key: string]: any} = {
    [APP_VERSION_KEY]: process.env.REACT_APP_VERSION,
    [FLOK_BASE_URL_KEY]: "https://app.goflok.com",
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
  localStorageRetreatGuidKey: "activeRetreatGuid",
}
