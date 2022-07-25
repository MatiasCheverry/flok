import notistackReducer from "../../notistack-lib/reducer"
import apiReducer from "./api"
import formReducer from "./form"
import lodgingReducer from "./lodging"
import retreatReducer from "./retreat"
import userReducer from "./user"

const reducers = {
  user: userReducer,
  notistack: notistackReducer,
  api: apiReducer,
  lodging: lodgingReducer,
  retreat: retreatReducer,
  form: formReducer,
}

export default reducers
