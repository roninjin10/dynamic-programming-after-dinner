/*





DYNAMIC PROGRAMMING !!!!!!


Recursion + Memoization


Richard Ernast Bellman.




Secretary of defense Wilson didn't like Math




Interviews





Saahil Sud AKA MaxDalury gets 50 of the top 100 places thanks to Dynamic Programming





See Knapsack problem






Fibinacci
*/

// SLOWWWWW  VERY SLOWWW

const fib = (n) => {
  if (n === 0 || n === 1) {
    return n
  }
  return fib(n-1) + fib(n-2)
}

//  FAST BECAUSE DYNAMIC PROGRAMMING!!!

const memoized = {
  0: 0,
  1: 0
}

const fibDynamicProg = (n) => {
  if (n in memoized) {
    return memoized[n]
  } 

  memoized[n] = fib(n-1) + fib(n-2)
  return memoized[n]
}



/*






Salary cap while getting the most fantasy points



This is really really hard to solve fast











*/
/*
 *  First set up constants such as the teams playing today
 *  how much salary we can spend on our team, and how many
 *  roster spots we have to work with.
 * 
 */

const BOSTON = 'BOSTON'
const CLEVELAND = 'NOT_DETROIT'
const TORONTO = 'LEBRONTO'
const PHILADELPHIA = 'TRUST_THE_PROCESS'

const SALARY_CAP = 600
const ROSTER_SPOTS = 9

const INVALID_LINEUP = 'INVALID_LINEUP'

/*
 *
 *  At the bottom of this file we invoke main which will find the optimal lineup and then console.log it.
 * 
 */

const main = () => console.log(optimizer())

/*
 *
 * Our FantasyLineup constructor creates an immutable fantasy object representing our current
 * fantasy roster.  Our goal is to create a FantasyLineup that we expect to score the most fantasyPoints
 * within the rules of the salary cap.
 * 
 */ 

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

/*
 *  FantasyLineup.total will return us the total of a specific stat for our entire lineup
 */

FantasyLineup.prototype.total = function(stat) {
  return this.roster.reduce((total, player) => total + player[stat], 0)
}

/*
 *  FantasyLineup.add will give us a new FantasyLineup with the new player added. 
 *  We do not want to change the old lineup.
 *  The FantasyLineup constructor will throw an error if the player violates the salary cap
 */

FantasyLineup.prototype.add = function(player) {
  return new FantasyLineup(this.salaryCap, this.rosterSpots, [...this.roster, player])
}

/*
 * FantasyLineup.combine will use a 2nd lineup to complete the first lineup.  THe importance of this 
 * will reveal itself later
 * 
 */

FantasyLineup.prototype.combine = function(fantasyLineup) {
  const newRoster = [...this.roster]
  const playersFrom = [...fantasyLineup.roster]

  while (newRoster.length < this.roster.rosterSpots) {
    newRoster.push(playersFrom.pop())
  }

  return new FantasyLineup(this.salaryCap, this.rosterSpots, newRoster)
}

/*
 * The memoizer is the most important part of dynamic programming.  It will reduce time complexity
 * via allowing us to remember when we have been in a similar spot before.  If we have the same amount of players left
 * and the same amount of salary left, even if our team is different the rest of our team will be the same.  
 * 
 * It doesn't matter how you got to your spot.  You must do the best with your situation regardless of your past.
 * This principle is very important to the memoizer and very important to our lives.
 * 
 * it uses 3 parameters in all it's functions:
 * 
 * 1. The number of players left to look at.
 * 2. The salary left to work with
 * 3. The number of roster spots left in our lineup.
 */


/*
 *  Our memoizer stores our memoized lineups in an object
 */

const Memoizer = function() {
  this.memoized = {}
}

/*
 *  Memoizer.createKey creates a unique string based on our situation
 */ 

Memoizer.prototype.createKey = function(playersLeft, salaryLeft, rosterSpotsLeft) {
  return `playersLeft: ${playersLeft} salaryLeft: ${salaryLeft} rosterSpots: ${rosterSpotsLeft}`
}

/*
 *  Memoizer.isMemoized returns a boolean based on if we have memoized this situation before
 */

Memoizer.prototype.isMemoized = function(playersLeft, salaryLeft, rosterSpotsLeft) {
  return this.memoized[this.createKey(playersLeft, salaryLeft, rosterSpotsLeft)] !== undefined
}

/*
 *  Memoizer.lineup returns the memoized lineup based on the situation
 */

Memoizer.prototype.lineup = function(playersLeft, salaryLeft, rosterSpotsLeft) {
  const key = this.createKey(playersLeft, salaryLeft, rosterSpotsLeft)
  return this.memoized[key]
}

Memoizer.prototype.memoize = function(playersLeft, salaryLeft, rosterSpotsLeft, lineup) {
  const key = this.createKey(playersLeft, salaryLeft, rosterSpotsLeft)
  this.memoized[key] = lineup
  return this
}

/*
 *  Now we create our Optimizer!!!!
 * 
 */
 
const optimizer = () => {
  /*
   *  first we set up our initial fantasy lineup which will just be an empty lineup with 9 empty roster spots and a $600 salary cap
   */
  const lineup = new FantasyLineup(SALARY_CAP, ROSTER_SPOTS)

  /*
   * We want a list of all our players in an array just for convenience
   */

  const pool = Object.keys(PLAYER_POOL)


  /*
   *  we need our memoizer to save us from doing the same calculations over and over again
   */

  let memoizer = new Memoizer()

  /*
   *  We need an inner function that will do RECURSION!!!
   * 
   * It will start with player 0 and move down the list of player 1 by 1 asking a question
   * 
   * Do we pick this player or do we pass?
   * 
   * But before it asks the question it makes sure it has never been in a similar situation before with our Memoizer
   * 
   * Then it sees how good it can do with both decisions and chooses the best one.
   * 
   */
  let recursion = 0

  const recursiveStep = (currentPoolIndex = 0, currentLineup = lineup) => {
    console.log(`recursion number ${++recursion}`)
    /*
     * First let's make sure our lineup isn't already complete!
     */
    if (currentLineup.isComplete) {
      return currentLineup
    
    /*
     *  If it's not complete we need to make sure that there are still players left to choose from!
     */
    
    } else if (currentPoolIndex >= pool.length) {
      return INVALID_LINEUP

    }
    /*
     *  Second let's optimize time complexity.
     * 
     *  WE will check our memoizer to see if we have been in this situation before
     */

    const playersLeft = pool.length - currentPoolIndex
    const salaryLeft = SALARY_CAP - currentLineup.salary
    const rosterSpotsLeft = ROSTER_SPOTS - currentLineup.roster.length

    const isMemoized = memoizer.isMemoized(playersLeft, salaryLeft, rosterSpotsLeft)
  
    /*
     *  If we have been here before we are going to go ahead and combine the lineups and return
     */
    if (isMemoized) {
      const memoized = memoizer.lineup(playersLeft, salaryLeft, rosterSpotsLeft)
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

/*
 * Our playerpool is below
 */

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