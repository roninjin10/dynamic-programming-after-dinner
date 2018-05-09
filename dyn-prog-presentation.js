const BOSTON = 'BOSTON'
const CLEVELAND = 'NOT_DETROIT'
const TORONTO = 'LEBRONTO'
const PHILADELPHIA = 'TRUST_THE_PROCESS'

const SALARY_CAP = 600
const ROSTER_SPOTS = 9

const INVALID_LINEUP = 'INVALID_LINEUP'

const main = () => console.log(optimizer())

const FantasyLineup = function(salaryCap, rosterSpots, roster = []) {
  this.salaryCap = salaryCap
  this.rosterSpots = rosterSpots
  
  this.roster = Object.freeze(roster)
  
  this.salary = this.total('salary')
  this.fantasyPoints = this.total('projection')
  
  this.isComplete = roster.length === rosterSpots
  
  Object.freeze(this)

  if (this.salary > this.salaryCap) {
    throw new Error('exceeded salary cap!')
  }
  
  if (this.roster.length > this.rosterSpots) {
    throw new Error('too many players!')
  }
}


FantasyLineup.prototype.total = function(stat) {
  return this.roster.reduce((total, player) => total + player[stat], 0)
}

FantasyLineup.prototype.add = function(player) {
  return new FantasyLineup(this.salaryCap, this.rosterSpots, [...this.roster, player])
}

FantasyLineup.prototype.combine = function(fantasyLineup) {
  const newRoster = [...this.roster]
  const playersFrom = [...fantasyLineup.roster]

  while (newRoster.length < this.roster.rosterSpots) {
    newRoster.push(playersFrom.pop())
  }

  return new FantasyLineup(this.salaryCap, this.rosterSpots, newRoster)
}

const Memoizer = function() {
  this.memoized = {}
}

Memoizer.prototype.createKey = function(playersLeft, salaryLeft, rosterSpotsLeft) {
  return `playersLeft: ${playersLeft} salaryLeft: ${salaryLeft} rosterSpots: ${rosterSpotsLeft}`
}

Memoizer.prototype.isMemoized = function(playersLeft, salaryLeft, rosterSpotsLeft) {
  return this.memoized[this.createKey(playersLeft, salaryLeft, rosterSpotsLeft)] !== undefined
}

Memoizer.prototype.lineup = function(playersLeft, salaryLeft, rosterSpotsLeft) {
  const key = this.createKey(playersLeft, salaryLeft, rosterSpotsLeft)
  return this.memoized[key]
}

Memoizer.prototype.memoize = function(playersLeft, salaryLeft, rosterSpotsLeft, lineup) {
  const key = this.createKey(playersLeft, salaryLeft, rosterSpotsLeft)
  this.memoized[key] = lineup
  return this
}

const optimizer = () => {
  const lineup = new FantasyLineup(SALARY_CAP, ROSTER_SPOTS)
  const pool = Object.keys(PLAYER_POOL)
  let memoizer = new Memoizer()

  let recursion = 0

  const recursiveStep = (currentPoolIndex = 0, currentLineup = lineup) => {
    if (currentLineup.isComplete) {
      return currentLineup
    
    } else if (currentPoolIndex >= pool.length) {
      return INVALID_LINEUP

    }

    const playersLeft = pool.length - currentPoolIndex
    const salaryLeft = SALARY_CAP - currentLineup.salary
    const rosterSpotsLeft = ROSTER_SPOTS - currentLineup.roster.length

    const isMemoized = memoizer.isMemoized(playersLeft, salaryLeft, rosterSpotsLeft)
  
    if (isMemoized) {
      const memoized = memoizer.lineup(playersLeft, salaryLeft, rosterSpotsLeft)
      if (memoized.roster === INVALID_LINEUP) {
        return INVALID_LINEUP
      }
      const combinedLineup = currentLineup.combine(memoized)

      return combinedLineup
    }

    let lineupIfPass = recursiveStep(currentPoolIndex + 1, currentLineup)

    
    let lineupIfTake 
    const currentPlayer = {name: pool[currentPoolIndex], ...PLAYER_POOL[pool[currentPoolIndex]]}
    let takePlayer
    try {
      takePlayer = currentLineup.add(currentPlayer)
      lineupIfTake = recursiveStep(currentPoolIndex + 1, takePlayer)
    }
    catch(err) {
      lineupIfTake = INVALID_LINEUP
    } 

    let optimalLineup

    if (lineupIfTake === INVALID_LINEUP) {
      optimalLineup = lineupIfPass
    } else if (lineupIfPass === INVALID_LINEUP) {
      optimalLineup = lineupIfTake
    
    } else {
      optimalLineup = lineupIfPass.fantasyPoints > lineupIfTake.fantasyPoints
        ? lineupIfPass
        : lineupIfTake
    }

    memoizer.memoize(playersLeft, salaryLeft, rosterSpotsLeft, optimalLineup)

    return optimalLineup
  
  }
  const out = recursiveStep()
  return out
}

const PLAYER_POOL = {

  LEBRON_JAMES: {
    salary: 145,
    projection: 68,
    team: CLEVELAND
  },

  JOEL_EMBIID: {
    salary: 103,
    projection: 48,
    team: PHILADELPHIA
  },

  BEN_SIMMONS: {
    salary: 98,
    projection: 39,
    team: PHILADELPHIA
  },

  TERRY_ROZIER: {
    salary: 89,
    projection: 38,
    team: BOSTON
  },

  DEMAR_DEROZAN: {
    salary: 87,
    projection: 36,
    team: TORONTO
  },
  
  KYLE_LOWRY: {
    salary: 83,
    projection: 40,
    team: TORONTO
  },
  
  KEVIN_LOVE: {
    salary: 78,
    projection: 38.5,
    team: CLEVELAND
  },
  
  JONAS_VALANCIUNAS: {
    salary: 74,
    projection: 30,
    team: TORONTO
  },
  
  AL_HORFORD: {
    salary: 72,
    projection: 37.5,
    team: BOSTON
  },
  
  JAYSON_TATUM: {
    salary: 70,
    projection: 34,
    team: BOSTON
  },
  
  BOB_COVINGTON: {
    salary: 67,
    projection: 25,
    team: PHILADELPHIA
  },
  
  DARIO_$ORICH: {
    salary: 65,
    projection: 31,
    team: PHILADELPHIA
  },
  
  MARCUS_SMART: {
    salary: 62,
    projection: 29,
    team: BOSTON
  },
  
  JJ_REDDICK: {
    salary: 59,
    projection: 28,
    team: PHILADELPHIA
  },
  
  JAYLEN_BROWN: {
    salary: 54,
    projection: 25,
    team: BOSTON
  },
  
  MARCUS_MORRIS: {
    salary: 50,
    projection: 23,
    team: BOSTON
  },
  
  SERGE_IBAKA: {
    salary: 47,
    projection: 21,
    team: TORONTO
  },
  
  KYLE_KORVER: {
    salary: 46,
    projection: 20,
    team: CLEVELAND
  },
  
  JR_SMITH: {
    salary: 45,
    projection: 19,
    team: CLEVELAND
  },
  
  ERSAN_ILYASOVA: {
    salary: 44,
    projection: 18,
    team: PHILADELPHIA
  },
  
  GEORGE_HILL: {
    salary: 43,
    projection: 18,
    team: CLEVELAND
  },
  
  RICHAUN_HOLMES: {
    salary: 40,
    projection: 18,
    team: PHILADELPHIA
  },
  
  TRISTAN_KARDASHIAN: {
    salary: 40,
    projection: 19,
    team: CLEVELAND
  },
  
  JEFF_GREEN: {
    salary: 40,
    projection: 18,
    team: CLEVELAND
  },
  
  MARCO_BELINELLI: {
    salary: 40,
    projection: 17,
    team: PHILADELPHIA
  },
  
  DELON_WRIGHT: {
    salary: 40,
    projection: 16,
    team: TORONTO
  },
  
  ARON_BAYNES: {
    salary: 39,
    projection: 15,
    team: BOSTON
  },
  
  FRED_VANVLEET: {
    salary: 38,
    projection: 15,
    team: TORONTO
  },
  
  PASCAL_SIAKAM: {
    salary: 38,
    projection: 14,
    team: TORONTO
  },
  
  OG_ANUNOBY: {
    salary: 37,
    projection: 14,
    team: TORONTO
  },
  
  CJ_MILES: {
    salary: 37,
    projection: 14,
    team: TORONTO
  },
  
  JAKOB_POELTL: {
    salary: 36,
    projection: 12,
    team: TORONTO
  },
  
  LARRY_NANCE_JR: {
    salary: 35,
    projection: 11,
    team: CLEVELAND
  },
  
  MARKELLE_FULTZ: {
    salary: 35,
    projection: 11,
    team: PHILADELPHIA
  },
  
  GREG_MONROE: {
    salary: 35,
    projection: 10,
    team: BOSTON
  },
 
  JORDAN_CLARKSON: {
    salary: 30,
    projection: 10,
    team: CLEVELAND
  }
}

main()