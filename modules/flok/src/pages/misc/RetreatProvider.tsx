import {push} from "connected-react-router"
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react"
import {useDispatch, useSelector} from "react-redux"
import {useRouteMatch} from "react-router-dom"
import {ResourceNotFound} from "../../models"
import {RetreatModel} from "../../models/retreat"
import {AppRoutes} from "../../Stack"
import {RootState} from "../../store"
import {getRetreat} from "../../store/actions/retreat"
import WrongSignInPage from "../auth/WrongSignInPage"
import LoadingPage from "./LoadingPage"

const RetreatContext = createContext<
  {retreat: RetreatModel; retreatIdx: number} | undefined
>(undefined)

export function useRetreat() {
  const retreatContext = useContext(RetreatContext)
  if (retreatContext === undefined) {
    throw Error("useRetreat must be used within a RetreatProvider")
  }
  return [retreatContext.retreat, retreatContext.retreatIdx] as const
}

export default function RetreatProvider(props: PropsWithChildren<{}>) {
  let dispatch = useDispatch()
  let router = useRouteMatch<{
    retreatIdx: string
  }>()
  let user = useSelector((state: RootState) => state.user.user)
  if (!user) {
    throw Error("retreat provider needs to be in a ProtectedRoute")
  }
  let retreatIdx = parseInt(router.params.retreatIdx)
  let [retreatId, setRetreatId] = useState(
    !isNaN(retreatIdx) && retreatIdx >= 0
      ? user.retreat_ids[retreatIdx]
      : undefined
  )

  useEffect(() => {
    setRetreatId(
      !isNaN(retreatIdx) && retreatIdx >= 0
        ? user!.retreat_ids[retreatIdx]
        : undefined
    )
  }, [retreatIdx, user])

  let retreat = useSelector((state: RootState) => {
    if (retreatId != null) {
      return state.retreat.retreats[retreatId]
    }
  })

  useEffect(() => {
    if (retreatIdx !== 0 && retreatId === undefined) {
      dispatch(push(AppRoutes.getPath("RetreatHomePage", {retreatIdx: "0"})))
    } else if (retreat === undefined) {
      dispatch(getRetreat(retreatId!))
    }
  }, [retreatIdx, dispatch, retreat, retreatId])

  return retreatId === undefined ? (
    <WrongSignInPage attendeeIds={user.attendee_ids} />
  ) : retreat === ResourceNotFound ? (
    <div>Retreat not found</div>
  ) : retreat === undefined ? (
    <LoadingPage />
  ) : (
    <RetreatContext.Provider value={{retreat, retreatIdx}}>
      {props.children}
    </RetreatContext.Provider>
  )
}
