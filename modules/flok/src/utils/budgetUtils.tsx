export type BudgetBreakdownInputType = {
  trip_length: number
  experience_type: number
  avg_flight_cost: number
  num_attendees: number
  work_play_mix: string
  alcohol: string
  ground_transportation: string[]
  addons: string[]
}

export const BUDGET_TOOL_FLOK_RECOMENDATIONS: BudgetBreakdownInputType = {
  trip_length: 4,
  experience_type: 4,
  avg_flight_cost: 600,
  num_attendees: 100,
  work_play_mix: "Mix",
  alcohol: "Most nights",
  ground_transportation: [
    "Home to airport",
    "Airport to hotel",
    "Hotel to airport",
    "Airport to home",
  ],
  addons: ["COVID test", "Swag", "Photographer", "Onsite Coordinator"],
}

export const INITIAL_BUDGET_TOOL_VALUES: BudgetBreakdownInputType = {
  trip_length: 1,
  experience_type: 0,
  avg_flight_cost: 0,
  num_attendees: 0,
  work_play_mix: "Mix",
  alcohol: "No",
  ground_transportation: [],
  addons: [],
}

export type BudgetBreakdownType = {
  attendeeCost: number
  totalCost: number
  hotelPerNight: number
  flight: number
  ground_transport: {name: string; cost: number}[]
  meals: {name: string; cost: number; num: number}[]
  misc: {name: string; cost: number}[]
  activities?: {cost: number; num: number}
}

export const TestBudgetBreakdown = {
  attendeeCost: 5000,
  totalCost: 100000,
  hotelPerNight: 100,
  flight: 400,
  ground_transport: [
    {
      name: "Home to Airport",
      cost: 50,
    },
  ],
  meals: [
    {
      name: "Coffee",
      cost: 15,
      num: 3,
    },
    {
      name: "Breakfast",
      cost: 15,
      num: 1,
    },
    {
      name: "Lunch",
      cost: 15,
      num: 2,
    },
  ],
  misc: [
    {name: "AV", cost: 200},
    {name: "Swag", cost: 75},
  ],
  activities: {cost: 100, num: 3},
} as BudgetBreakdownType

export function getBudgetBreakdown(userInput: BudgetBreakdownInputType) {
  let meals = [
    {
      name: "Breakfast",
      cost:
        userInput.experience_type === 3
          ? 50
          : userInput.experience_type === 4
          ? 65
          : 75,
      num: userInput.trip_length - 1,
    },
    {
      name: "Lunch",
      cost:
        userInput.experience_type === 3
          ? 75
          : userInput.experience_type === 4
          ? 85
          : 95,
      num: userInput.trip_length - 2,
    },
    {
      name: "Dinner",
      cost:
        userInput.experience_type === 3
          ? 100
          : userInput.experience_type === 4
          ? 125
          : 150,
      num: userInput.trip_length - 1,
    },
    {
      name: "Coffee",
      cost:
        userInput.experience_type === 3
          ? 15
          : userInput.experience_type === 4
          ? 20
          : 25,
      num: userInput.trip_length - 1,
    },
  ]

  if (userInput.alcohol !== "No") {
    meals.push({
      name: "Alcohol",
      cost:
        userInput.experience_type === 3
          ? 45
          : userInput.experience_type === 4
          ? 60
          : 75,
      num: Math.ceil(
        (userInput.trip_length - 1) *
          (userInput.alcohol === "Most nights"
            ? 0.7
            : userInput.alcohol === "All nights"
            ? 1
            : 0.4)
      ),
    })
  }

  let ground_transport = userInput.ground_transportation.map((s) => ({
    name: s,
    cost:
      userInput.experience_type === 3
        ? 50
        : userInput.experience_type === 4
        ? 75
        : 100,
  }))

  let misc = userInput.addons.map((name) => {
    let obj = {name, cost: 0}
    switch (name) {
      case "Swag":
        obj.cost =
          userInput.experience_type === 3
            ? 50
            : userInput.experience_type === 4
            ? 100
            : 150
        break
      case "COVID tests":
        obj.cost = 50
        break
      case "Photographer":
        obj.cost =
          userInput.experience_type === 3
            ? 50
            : userInput.experience_type === 4
            ? 75
            : 100
        break
      case "Onsite Coordinator":
        obj.cost = 50
        break
      case "Facilitator":
        obj.cost = 150
        break
      case "Travel insurance":
        obj.cost = 200
    }
    return obj
  })
  let activities = {
    cost:
      userInput.experience_type === 3
        ? 100
        : userInput.experience_type === 4
        ? 150
        : 200,
    num: 0,
  }
  switch (userInput.work_play_mix) {
    case "All work":
      misc.push({name: "AV", cost: 250})
      break
    case "Mostly work":
      misc.push({name: "AV", cost: 225})
      activities.num = userInput.trip_length - 2
      break
    case "Mix":
      misc.push({name: "AV", cost: 200})
      activities.num = userInput.trip_length - 2
      break
    case "Mostly play":
      misc.push({name: "AV", cost: 100})
      activities.num = userInput.trip_length - 2
      break
    case "All play":
      activities.num = userInput.trip_length
      break
  }

  let hotelPerNight =
    userInput.experience_type === 3
      ? 200
      : userInput.experience_type === 4
      ? 350
      : 500

  let attendeeCost =
    activities.cost +
    meals.map((o) => o.cost * o.num).reduce((p, v) => p + v, 0) +
    (ground_transport.map((o) => o.cost) ?? [0]).reduce((p, v) => p + v, 0) +
    misc.map((o) => o.cost).reduce((p, v) => p + v, 0) +
    userInput.avg_flight_cost +
    hotelPerNight * (userInput.trip_length - 1)

  let totalCost = attendeeCost * userInput.num_attendees

  return {
    totalCost,
    attendeeCost,
    hotelPerNight,
    flight: userInput.avg_flight_cost,
    misc,
    meals,
    ground_transport,
    activities: userInput.work_play_mix === "All work" ? undefined : activities,
  } as BudgetBreakdownType
}
