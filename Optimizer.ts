const BOSTON = 'BOSTON'
const CLEVELAND = 'NOT_DETROIT'
const TORONTO = 'LEBRONTO'
const PHILADELPHIA = 'TRUST_THE_PROCESS'

const SALARY_CAP = 600
const ROSTER_SPOTS = 9

const INVALID_LINEUP_ERROR = new Error('INVALID_LINEUP')

/*
 *
 *  At the bottom of this file we invoke main which will find the optimal lineup and then console.log it.
 *
 */

const main = () => console.log(optimizer())

interface IPlayer {
  name: string
  salary: number
  projection: number
  team: string
}

class FantasyLineup {
  salaryCap: number
  rosterSpots: number
  roster: IPlayer[]
  salary: number
  projection: number
  isComplete: boolean

  constructor(salaryCap: number, rosterSpots: number, roster: IPlayer[] = []) {
    this.salaryCap = salaryCap
    this.rosterSpots = rosterSpots
    this.roster = roster

    this.salary = this.getTotal('salary')
    this.projection = this.getTotal('projection')
    this.isComplete = roster.length === rosterSpots

    if (this.salary > this.salaryCap) {
      throw new Error('exceeded salary cap!')
    }
    if (this.roster.length > this.rosterSpots) {
      throw new Error('too many players!')
    }
  }

  public add = (player: IPlayer): FantasyLineup => {
    return new FantasyLineup(this.salaryCap, this.rosterSpots, [...this.roster, player])
  }

  public combine = (fantasyLineup: FantasyLineup): FantasyLineup => {
    const newRoster = [
      ...this.roster,
      ...fantasyLineup.roster
    ].slice(0, this.rosterSpots)

    return new FantasyLineup(this.salaryCap, this.rosterSpots, newRoster)
  }

  private getTotal = (stat: string): number => {
    return this.roster.reduce((total, player) => total + player[stat], 0)
  }
}

class Memoizer {
  memoized = {}

  public createKey = (playersLeft: number, salaryLeft: number, rosterSpotsLeft: number): string => {
    return `playersLeft: ${playersLeft} salaryLeft: ${salaryLeft} rosterSpots: ${rosterSpotsLeft}`
  }

  public isMemoized = (playersLeft: number, salaryLeft: number, rosterSpotsLeft: number): boolean => {
    return this.getLineup(playersLeft, salaryLeft, rosterSpotsLeft) !== undefined
  }

  public getLineup = (playersLeft: number, salaryLeft: number, rosterSpotsLeft: number): FantasyLineup => {
    const key = this.createKey(playersLeft, salaryLeft, rosterSpotsLeft)
    return this.memoized[key]
  }

  public memoize = (playersLeft: number, salaryLeft: number, rosterSpotsLeft: number, lineup: FantasyLineup): Memoizer => {
    const key = this.createKey(playersLeft, salaryLeft, rosterSpotsLeft)
    this.memoized[key] = lineup
    return this
  }
}

const optimizer = (): FantasyLineup => {
  const lineup = new FantasyLineup(SALARY_CAP, ROSTER_SPOTS)
  const memoizer = new Memoizer()

  const pool: IPlayer[] = PLAYER_POOL

  const recursiveStep = (currentPoolIndex = 0, currentLineup = lineup) => {
    if (currentLineup.isComplete) {
      return currentLineup
    } else if (currentPoolIndex >= pool.length) {
      throw INVALID_LINEUP_ERROR
    }

    const PLAYERS_LEFT: number = pool.length - currentPoolIndex
    const SALARY_LEFT: number = SALARY_CAP - currentLineup.salary
    const ROSTER_SPOTS_LEFT = ROSTER_SPOTS - currentLineup.roster.length

    const isMemoized = memoizer.isMemoized(PLAYERS_LEFT, SALARY_LEFT, ROSTER_SPOTS_LEFT)

    /*
     *  If we have been here before we are going to go ahead and combine the lineups and return
     */
    if (IS_MEMOIZED) {
      const memoized = memoizer.lineup(PLAYERS_LEFT, SALARY_LEFT, ROSTER_SPOTS_LEFT)
      if (memoized.roster === INVALID_LINEUP) {
        return INVALID_LINEUP
      }
      const combinedLineup = currentLineup.combine(memoized)

      return combinedLineup
    }

    /*
     * If we get this far we have never been in this situation.
     *
     * We will take the current player and see what that gets us
     * To do this we just start looking at the next player
     *
     * We will pass on the current player and see what that gets us
     * To do this we will look at the next player only after adding the current one
     * to our lineup
     *
     * we will wrap this in a try and except block as adding the player might bring us
     * over the salary cap
     *
     * After we get both those lineups back we will see which lineup is better.
     *
     */

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

    /*
     * Now let's figure out which lineup we want
     *
     *  If one of our lineups is invalid we want the other one.
     * Note if both are invalid we return INVALID_LINEUP which is what we want.
     */

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

    /*
     * we found the optimal lineup!
     *
     * but before we return it we want to memoize it so we don't have to do the work again.
     */
    console.log('memoizing')

    memoizer.memoize(playersLeft, salaryLeft, rosterSpotsLeft, optimalLineup)

    return optimalLineup


     /*
      * We memoized the lineup so we will immediately return the answer if we are in a similar situation again.
      *
      * As this answer bubbles up through the call stack it will be memoized by every situation we were in to get here too.
      *
      * The time complexity without memoization is 2^n
      *
      * WIth memoization the time complexity is linear (n * W)
      *
      * W is the salary cap which in this case is 600
      *
      * N is the number of players in the player pool.
      */
  }
  const out = recursiveStep()
  console.log('FINISHED!')
  return out
}

const PLAYER_POOL: IPlayer[] = [
  {
    name: 'LEBRON_JAMES',
    salary: 145,
    projection: 68,
    team: CLEVELAND
  },
  {
    name: 'JOEL_EMBIID',
    salary: 103,
    projection: 48,
    team: PHILADELPHIA
  },
  {
    name: 'BEN_SIMMONS',
    salary: 98,
    projection: 39,
    team: PHILADELPHIA
  },
  {
    name: 'TERRY_ROZIER',
    salary: 89,
    projection: 38,
    team: BOSTON
  },

  {
    name: 'DEMAR_DEROZAN',
    salary: 87,
    projection: 36,
    team: TORONTO
  },

  {
    name: 'KYLE_LOWRY',
    salary: 83,
    projection: 40,
    team: TORONTO
  },

  {
    name: 'KEVIN_LOVE',
    salary: 78,
    projection: 38.5,
    team: CLEVELAND
  },

  {
    name: 'JONAS_VALANCIUNAS',
    salary: 74,
    projection: 30,
    team: TORONTO
  },

  {
    name: 'AL_HORFORD',
    salary: 72,
    projection: 37.5,
    team: BOSTON
  },

  {
    name: 'JAYSON_TATUM',
    salary: 70,
    projection: 34,
    team: BOSTON
  },

  {
    name: 'BOB_COVINGTON',
    salary: 67,
    projection: 25,
    team: PHILADELPHIA
  },

  {
    name: 'DARIO_$ORICH',
    salary: 65,
    projection: 31,
    team: PHILADELPHIA
  },

  {
    name: 'MARCUS_SMART',
    salary: 62,
    projection: 29,
    team: BOSTON
  },

  {
    name: 'JJ_REDDICK',
    salary: 59,
    projection: 28,
    team: PHILADELPHIA
  },

  {
    name: 'JAYLEN_BROWN',
    salary: 54,
    projection: 25,
    team: BOSTON
  },

  {
    name: 'MARCUS_MORRIS',
    salary: 50,
    projection: 23,
    team: BOSTON
  },

  {
    name: 'SERGE_IBAKA',
    salary: 47,
    projection: 21,
    team: TORONTO
  },

  {
    name: 'KYLE_KORVER',
    salary: 46,
    projection: 20,
    team: CLEVELAND
  },

  {
    name: 'JR_SMITH',
    salary: 45,
    projection: 19,
    team: CLEVELAND
  },

  {
    name: 'ERSAN_ILYASOVA',
    salary: 44,
    projection: 18,
    team: PHILADELPHIA
  },

  {
    name: 'GEORGE_HILL',
    salary: 43,
    projection: 18,
    team: CLEVELAND
  },

  {
    name: 'RICHAUN_HOLMES',
    salary: 40,
    projection: 18,
    team: PHILADELPHIA
  },

  {
    name: 'TRISTAN_KARDASHIAN',
    salary: 40,
    projection: 19,
    team: CLEVELAND
  },

  {
    name: 'JEFF_GREEN',
    salary: 40,
    projection: 18,
    team: CLEVELAND
  },

  {
    name: 'MARCO_BELINELLI',
    salary: 40,
    projection: 17,
    team: PHILADELPHIA
  },

  {
    name: 'DELON_WRIGHT',
    salary: 40,
    projection: 16,
    team: TORONTO
  },

  {
    name: 'ARON_BAYNES',
    salary: 39,
    projection: 15,
    team: BOSTON
  },

  {
    name: 'FRED_VANVLEE',
    salary: 38,
    projection: 15,
    team: TORONTO
  },

  {
    name: 'PASCAL_SIAKAM',
    salary: 38,
    projection: 14,
    team: TORONTO
  },

  {
    name: 'OG_ANUNOBY',
    salary: 37,
    projection: 14,
    team: TORONTO
  },

  {
    name: 'CJ_MILES',
    salary: 37,
    projection: 14,
    team: TORONTO
  },

  {
    name: 'JAKOB_POELTL',
    salary: 36,
    projection: 12,
    team: TORONTO
  },

  {
    name: 'LARRY_NANCE_JR',
    salary: 35,
    projection: 11,
    team: CLEVELAND
  },

  {
    name: 'MARKELLE_FULTZ',
    salary: 35,
    projection: 11,
    team: PHILADELPHIA
  },

  {
    name: 'GREG_MONROE',
    salary: 35,
    projection: 10,
    team: BOSTON
  },

  {
    name: 'JORDAN_CLARKSON',
    salary: 30,
    projection: 10,
    team: CLEVELAND
  }
]

main()