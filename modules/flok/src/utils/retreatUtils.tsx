import {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux"
import {Constants} from "../config"
import {ResourceNotFound} from "../models"
import {RetreatModel, RetreatToTask} from "../models/retreat"
import {RootState} from "../store"
import {
  getAttendee,
  getBlock,
  getMyAttendee,
  getPage,
  getPageByName,
  getRetreat,
  getRetreatAttendees,
  getRetreatByGuid,
  getWebsite,
  getWebsiteByName,
} from "../store/actions/retreat"

export function useRetreatAttendees(retreatId: number) {
  let dispatch = useDispatch()
  let attendeesList = useSelector(
    (state: RootState) => state.retreat.retreatAttendees[retreatId]
  )
  let attendeesObject = useSelector((state: RootState) => {
    return state.retreat.attendees
  })
  let attendees = (attendeesList ? attendeesList : []).map(
    (id) => attendeesObject[id]
  )
  let [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadAttendees() {
      setLoading(true)
      dispatch(getRetreatAttendees(retreatId))
      setLoading(false)
    }
    if (!attendeesList) {
      loadAttendees()
    }
  }, [attendeesList, dispatch, retreatId])
  return [attendees, loading] as const
}

/**
 * Deprecated
 * @param retreatGuid
 * @returns
 */
export function useRetreatByGuid(retreatGuid: string) {
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(false)
  let retreat = useSelector(
    (state: RootState) => state.retreat.retreatsByGuid[retreatGuid]
  )
  useEffect(() => {
    async function loadRetreat() {
      setLoading(true)
      dispatch(getRetreatByGuid(retreatGuid))
      setLoading(false)
    }
    if (!retreat) {
      loadRetreat()
    }
  }, [retreat, dispatch, retreatGuid])
  return [retreat, loading] as const
}

export function parseRetreatTask(task: RetreatToTask, baseUrl: string) {
  let parsedTask = {...task}
  if (task.link) {
    parsedTask.link = task.link.replaceAll(Constants.retreatBaseUrlVar, baseUrl)
  }
  if (task.description) {
    parsedTask.description = task.description.replaceAll(
      Constants.retreatBaseUrlVar,
      baseUrl
    )
  }
  return parsedTask
}

export function useAttendeeLandingWebsite(websiteId: number) {
  let website = useSelector((state: RootState) => {
    return state.retreat.websites[websiteId]
  })
  let dispatch = useDispatch()
  useEffect(() => {
    if (!website) {
      dispatch(getWebsite(websiteId))
    }
  }, [website, dispatch, websiteId])

  return website
}

export function useAttendeeLandingPage(pageId: number) {
  let dispatch = useDispatch()
  let page = useSelector((state: RootState) => {
    return state.retreat.pages[pageId]
  })
  useEffect(() => {
    if (!page) {
      dispatch(getPage(pageId))
    }
  }, [page, dispatch, pageId])

  return page
}
export function useAttendeeLandingPageBlock(blockId: number) {
  let dispatch = useDispatch()
  let block = useSelector((state: RootState) => {
    return state.retreat.blocks[blockId]
  })
  useEffect(() => {
    if (!block) {
      dispatch(getBlock(blockId))
    }
  }, [block, dispatch, blockId])

  return block
}

export function useAttendeeLandingPageName(
  websiteId: number,
  pageName: string
) {
  let dispatch = useDispatch()
  let [loading, setLoading] = useState(true)
  let page = useSelector((state: RootState) => {
    return Object.values(state.retreat.pages).find(
      (page) => page?.title.toLowerCase() === pageName.toLowerCase()
    )
  })

  useEffect(() => {
    async function loadPage() {
      setLoading(true)
      await dispatch(getPageByName(websiteId, pageName))
      setLoading(false)
    }
    if (!page) {
      loadPage()
    } else {
      setLoading(false)
    }
  }, [page, dispatch, pageName, websiteId])

  return [page, loading] as const
}

export function useAttendeeLandingWebsiteName(websiteName: string) {
  let [loading, setLoading] = useState(true)
  let website = useSelector((state: RootState) => {
    return Object.values(state.retreat.websites).find(
      (website) => website?.name.toLowerCase() === websiteName.toLowerCase()
    )
  })
  let dispatch = useDispatch()
  useEffect(() => {
    async function loadWebsite() {
      setLoading(true)
      await dispatch(getWebsiteByName(websiteName))
      setLoading(false)
    }
    if (!website) {
      loadWebsite()
    } else {
      setLoading(false)
    }
  }, [website, dispatch, websiteName])

  return [website, loading] as const
}

export function useMyAttendee(retreatId: number) {
  let dispatch = useDispatch()
  let attendeeId = useSelector((state: RootState) => {
    return state.user.myAttendeeByRetreat[retreatId]
  })
  useEffect(() => {
    if (attendeeId == null) {
      dispatch(getMyAttendee(retreatId))
    }
  }, [retreatId, dispatch, attendeeId])

  let attendee = useSelector((state: RootState) => {
    if (attendeeId != null) return state.retreat.attendees[attendeeId]
  })
  useEffect(() => {
    if (attendeeId != null && attendee == null) {
      dispatch(getAttendee(attendeeId))
    }
  }, [attendeeId, attendee, dispatch])

  return [attendee]
}

export function useRetreat(retreatId: number) {
  let [loading, setLoading] = useState(true)
  let retreat = useSelector((state: RootState) => {
    if (state.retreat.retreats[retreatId] !== ResourceNotFound) {
      return state.retreat.retreats[retreatId]
    }
  })
  let dispatch = useDispatch()
  useEffect(() => {
    async function loadRetreat() {
      setLoading(true)
      await dispatch(getRetreat(retreatId))
      setLoading(false)
    }
    if (!retreat) {
      loadRetreat()
    } else {
      setLoading(false)
    }
  }, [retreat, dispatch, retreatId])

  return [retreat, loading] as const
}

export function getRetreatName(retreat: RetreatModel) {
  if (retreat.retreat_name != null) {
    return retreat.retreat_name
  } else return `${retreat.company_name}'s Retreat`
}
