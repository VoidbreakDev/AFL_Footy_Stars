
import { MatchResult, MatchEvent, Team, PlayerProfile, Rivalry, PlayerInjury, PerformerStats, Position, Tactic, CultureType, PlayerPersonality, MatchContext } from '../types';
import { buildMatchContext, generateBattleReport, contextHighlightScore } from './matchEngineUtils';

export const INJURY_TYPES = [
  { name: "Hamstring Strain", weeks: 2 },
  { name: "Rolled Ankle", weeks: 1 },
  { name: "Concussion", weeks: 1 },
  { name: "ACL Tear", weeks: 10 }, // Season ender usually
  { name: "Calf Strain", weeks: 2 },
  { name: "Shoulder Dislocation", weeks: 4 }
];

export const PHRASES = {
    HIT_OUT: [
        'wins the tap cleanly!',
        'dominates the ruck contest',
        'gets first hands to it in the centre',
        'tips it to advantage with a powerful jump',
        'outmuscles the opposition ruckman',
        'gets the first hands out over the top',
        'taps it straight into the path of his onballer',
        'hits the ball back with venom',
        'gives his midfielders first use of the ball',
        'dominates the hitout from the centre bounce',
        'lands it cleanly, no one else near it',
        'controls the ruck contest with textbook timing'
    ],
    INTERCEPT: [
        'reads it brilliantly and intercepts!',
        'cuts off the kick with perfect positioning',
        'picks it off at full pace',
        'anticipates the play and takes the ball',
        'flies in for the intercept mark',
        'cuts across the corridor and picks it off',
        'reads the kick and bends in for the spoil',
        'takes the intercept on the chest and clears',
        'turns defence into attack with an intercept dash',
        'steals it in traffic with impeccable timing',
        'breaks the chain with that intercept spoil',
        'snaps the ball away from the contest and goes the other way'
    ],
    ONE_ON_ONE: [
        'wins the one-on-one contest!',
        'beats the defender with a quick step',
        'outmarks his opponent in the air',
        'uses his body well to take the ball',
        'wins the physical battle',
        'closes the space and wins the one-on-one mark',
        'gets his nose in front in the contest',
        'takes the strong overhead mark against his opponent',
        'wins the body-on-body duel and grabs it',
        'out-jumps the defender in the contest',
        'fends off the opponent and secures the ball',
        'holds his ground and claims the one-on-one win'
    ],
    ONE_ON_ONE_DEFENSIVE: [
        'locks down the opponent',
        'wins the defensive one-on-one',
        'forces the turnover with great pressure',
        'reads the play and denies the mark',
        'sticks the tackle and wins possession',
        'shoos his opponent into the boundary and nullifies the entry',
        'gets across the forward and spoils with strength',
        'keeps his man under the cloud and wins the spoil',
        'locks the forward out and forces the ball sideways',
        'reads the lead and breaks the contest cleanly',
        'shuts the forward down with a textbook one-on-one',
        'gets across the body and denies the mark'
    ],
    GOAL: [
        "bends it truly from the boundary!",
    "snaps on the run — no angle, no problem!",
    "takes the mark and drills the set shot.",
    "receives the handball and goals on the burst!",
    "marks strongly at the top of the square and converts.",
    "a dribble kick through traffic — screws between the posts!",
    "wheels onto the right foot and nails it.",
    "on the run from 40 out — perfect drop punt!",
    "a chest mark and a clean set shot — never in doubt.",
    "goals off the ground — it bounces through somehow!",
    "snaps truly from the pocket off two steps.",
    'from the pocket, a quick snap through the middle!'
    ],

    BEHIND: [
        "misses to the left.", "hits the post!", "touched off the boot.", "pushes it wide.", 
        "just scrapes the paint.", "fades late and misses.",
        "screws it to the right, just misses.",
        "rushes through for a behind — they'll take it.",
        "kicks under pressure, clips the post.",
        "a speculative snap, narrowly wide.",
        "from the boundary — not enough curl, just misses.",
        "a rushed behind — defender gets boot to ball.",
        "point to the left — unlucky given the angle.",
        "the set shot slides past on the right.",
        "a dropped chest mark leads to a scrambled behind.",
        "the snap from the pocket skews wide.",
        "floated on the wind and drifted right.",
    ],

    MARK: [
        "takes a strong mark!", "leaps high and takes the grab!", "holds on through the tackle!", 
        "a spectacular overhead mark!", "reads it perfectly and clunks it!",
        "soars above the pack in a marking contest!",
        "leads at full pace and takes the grab.",
        "holds on through heavy contact.",
        "takes a one-handed screamer at full stretch!",
        "times the leap perfectly, clean hands.",
        "a chest mark on the lead — textbook.",
        "contested grab through a thicket of arms.",
        "a pack mark grabbed on the third attempt.",
        "outstanding positioning from the pocket player.",
        "gloves it overhead — barely touched.",
        "high above the pack — total dominance.",
        "a courageous overhead in heavy traffic.",
    ],

    TACKLE: [
        "lays a crunching tackle!", "wraps him up beautifully!", "brings him to ground!",
        "a desperate lunging tackle pays off!", "smothers the kick — great pressure!",
        "brings them to ground with a textbook smother.",
        "chases 40 metres and pulls off the run-down tackle.",
        "wraps the arms at full pace.",
        "stands them up and strips the ball.",
        "smothers the kick — closed fist blocks it cold.",
        "trips them on the turn — free kick paid.",
        "cleans them up after the kick — they won't forget that.",
        "forces a holding infringement.",
        "a two-man tackle — neither team gets credit.",
        "tackles from behind — play on says the umpire.",
        "a shepherd leads to a soft holding call.",
    ],

    POSSESSION: [
        "gathers cleanly and kicks long", "handballs to a teammate", "dribbles through traffic",
        "reads the play and hits the target", "a quick handball chain starts here",
        "crumbs the contest and kicks long.",
        "reads the play two moves ahead.",
        "snaps out of traffic on the forward flank.",
        "takes the uncontested mark on the wing.",
        "picks up the ground ball under pressure.",
        "handballs on the run — perfectly timed.",
        "dribbles through the pack on his knees — incredible!",
        "a quick handball chain bypasses the press.",
        "leads to the open side and takes the kick.",
        "wins the loose ball at the contest boundary.",
        "a neat little banana off the outside of the boot.",
    ],

    TURNOVER: [
        "drops the ball under pressure", "kicks it out on the full", "handballs to nobody",
        "a poor decision — hands it back cheaply.",
        "boots it out on the full.",
        "dithers too long and is dispossessed.",
        "kicks across the body — intercepted.",
        "the handball is too high — no one gets near it.",
        "runs into traffic and drops the ball.",
        "chips it short — straight to the opposition.",
        "a hospital handball — nobody wanted that.",
        "rushed under pressure, straight to the opponent.",
        "tries to beat his man and loses it.",
    ],

    FREE_KICK: [
        "trips the player on the mark.",
        "ball in the back — free kick paid.",
        "the protected area is pinged — 50 metre penalty!",
        "milks a free kick and plays on immediately.",
        "contact high — the umpire doesn't hesitate.",
        "raking it in the back of the pack — obvious free.",
        "a deliberate out of bounds decision.",
        "prior opportunity adjudicated — holding the ball.",
        "the third time for high contact today — free kick.",
        "deliberate rushed behind — free kick on the goal line.",
        'standing in the mark — the tackler is penalised.',
        'play on called, but the free kick is paid back toward goal.',
    ],

    GENERIC: [
        "Both teams fighting for every contest.",
        "A real arm wrestle in the midfield.",
        "The coaches will be restless on the bench.",
        "Mistakes creeping in from both sides.",
        "A goal from here could change everything.",
        "The interchange bench is working overtime.",
        "The runner is sprinting onto the ground with instructions.",
        "This is the passage of play the season could turn on.",
        "Hard to separate these two teams right now.",
        "Pressure footy — every disposal under scrutiny.",
        "The scoreboard barely reflects how tight this is.",
        "Tags being applied — the game plan is being tested.",
    ],
};

const CROWD_PHRASES_BY_CULTURE: Partial<Record<CultureType, string[]>> = {
    STORIED_CLUB: [
        'The faithful roar their approval!',
        'A thunderous response from the loyal faithful!',
        'Tradition demands excellence — and they deliver!'
    ],
    UNDERDOG: [
        'The believers go wild!',
        'The crowd dares to dream big tonight!',
        "This is what they've been waiting for!"
    ],
    BIG_CITY: [
        'The big city crowd erupts!',
        'The city is right behind them!',
        'A packed house absolutely loving this!'
    ],
    PREMIERSHIP_HUNGRY: [
        'They want blood — and they get it!',
        'The hungry crowd demands excellence!',
        'This is what finals footy tastes like!'
    ],
    REBUILDING: [
        'A patient crowd beginning to believe...',
        'Signs of life from the rebuilding faithful.',
        'Small moments — but big hope here tonight.'
    ],
};

// 9 new filler pools
PHRASES.STOPPAGE = [
  "Ball up in the centre — both rucks competing hard.",
  "Throw-in at the boundary, bodies flying.",
  "Stoppage at the top of the square, packs forming.",
  "The umpire calls play on — both sides disputing it.",
  "A scrimmage breaks out near the goal square.",
  "Hard at the ball at the centre bounce.",
  "Multiple players down after a heavy contest.",
  "The ball is trapped at half-back — ball up called.",
  "Stoppage near the wing, both midfields flooding in.",
  "A boundary throw-in turns into a full pack contest.",
  "Neither team can break the deadlock at the stoppage.",
  "Whistle for the ball-up — defenders hold their shape.",
];

PHRASES.RUCK_CONTEST = [
  "The rucks go head-to-head at the centre bounce.",
  "A hitout to advantage — the midfield is off and running.",
  "Tap-out to the benefit of the forwards.",
  "Both big men leave the ground simultaneously.",
  "A controlled tap from the ruck sets up the play.",
  "The ruckman wins possession on the way down.",
  "A powerful contest at the ball-up — the crowd winces.",
  "Hitout directly to a running midfielder.",
  "The ruck wins despite being outweighed.",
  "Aerial battle in the centre — contested mark taken.",
  'a smash at the centre bounce, tap falls where he wants it.',
  'rucking brilliance — the hitout clears a path for the midfield.',
];

PHRASES.DEFENSIVE_PRESSURE = [
  "Smother on the boot — ball goes back the other way.",
  "The press is working — three turnovers in a row now.",
  "Shepherd sends the opponent out of bounds.",
  "A body-on-body contest in the defensive 50, no give.",
  "The back line holds firm — nothing gets through.",
  "Spoil from the back pocket ends the scoring threat.",
  "Full-back takes the intercept and clears the danger.",
  "A brilliant spoil — the forward marks nothing.",
  "Defensive lockdown — five shots and nothing to show.",
  "Zone defence holding — the forward line is starved.",
  "Defensive 50 under siege but they hold the line.",
  'the back six are suffocating it, forcing errors.',
];

PHRASES.FORWARD_PRESSURE = [
  "The forwards are flooding inside 50 in waves.",
  "A desperate behind saves the goal — but only just.",
  "Three entries inside 50 in under a minute.",
  "Quick hands from the forward flank creates the chance.",
  "The centre clearance lands directly in the forward pocket.",
  "A banana from tight on the boundary — just misses.",
  "The full-forward holds his position superbly.",
  "Repeat inside-50 entries keeping the scoreboard ticking.",
  "A set shot from 35 metres — nerves in the crowd.",
  "Strong lead from the key forward, spoiled away.",
  "Forward craft on display — working the angle beautifully.",
  'forward pressure is relentless, the ball stays inside 50.',
];

PHRASES.MIDFIELD_BATTLE = [
  "Contested possessions flying in the guts.",
  "A handball chain breaks down the middle of the ground.",
  "Burst from the stoppage — three quick kicks in transition.",
  "The wing is outpacing everyone up the ground.",
  "A switchkick from CHB to the opposite flank opens the game.",
  "Midfield tags are working — the star is being blanketed.",
  "Transition footy at full pace — both ends scrambling.",
  "The handball chain unravels — ball spilled at half-back.",
  "Corridor opened — the kick finds a lead at the top of the square.",
  "Both midfields rotating quickly to cover the ground.",
  "A superb crumb from the pack, sidestep and goes forward.",
  'the midfield is grinding it out — every clearance is contested.',
];

PHRASES.CONDITIONS = [
  "The wet ball is making clean possession difficult.",
  "Wind at their backs this quarter — long kicks are floating.",
  "Into the breeze now — the kicking game is compromised.",
  "The turf is cutting up — footing is unreliable.",
  "A greasy ball slipping through fingers all day.",
  "The sun is a factor at this end — three dropped marks already.",
  "Wind swirling — neither team committing to the long kick.",
  "Heavy dew on the oval — the ball is like a bar of soap.",
  'the ground is heavy — the ball sticks on the boot.',
  'cloud cover is making it hard for the aerial ball to hang.',
  'the mud has made clean ball hard to find in the wet.',
  'a greasy breeze at this end — long kicks are drifting wide.',
];

PHRASES.ATMOSPHERE = [
  "The crowd has risen as one.",
  "Noise levels through the roof — you cannot hear yourself think.",
  "A stunned silence from the opposition supporters.",
  "The home crowd willing every kick to go straight.",
  "Away supporters finding something to cheer.",
  "A wave of nervous energy around the ground.",
  "The cheer squad is in full voice.",
  "Crowd on their feet — every contest feeling enormous.",
  "The coaches are animated on the bench.",
  "The interchange bench is buzzing with instruction.",
  "The roar when they take the mark is deafening.",
  'the stadium is suddenly electric as the momentum shifts.',
];

PHRASES.UMPIRE = [
  "Play on! — the umpire waves it through. Both benches dispute that.",
  "Fifty metre penalty — the full-forward is now on the goal square.",
  "The deliberate rushed behind is paid — free kick on the goal line.",
  "Umpire calls prior opportunity — free kick against.",
  "Protected zone infringement — 50 metres added.",
  "Holding the man — umpire reaches for the whistle.",
  "Ball up called after the ball becomes trapped in the pack.",
  "The umpires confer — a contentious holding decision.",
  "A throw adjudicated against the midfielder — opposition free.",
  'the high ball is called — free kick to the defender.',
  'point goes the other way after the umpire awards a holding free.',
  'advantage is paid, but the whistle is ready if the next contest breaks down.',
];

PHRASES.BRILLIANCE = [
  "Outrageous skill — the crowd simply cannot believe it.",
  "That is something very special. Replay that a hundred times.",
  "Pure instinct. The coaching staff are on their feet.",
  "What a footballer. That takes your breath away.",
  "The sort of skill that wins Brownlow votes on its own.",
  "A highlight reel moment — this will be replayed all week.",
  "That is why they call him dangerous every single week.",
  "He has separated himself from everyone on this ground today.",
  'a darting bounce that only he could have produced.',
  'the sort of play that separates the good from the great.',
  'a piece of skill that turns an ordinary passage into magic.',
  'a split-second decision that leaves defenders flat-footed.',
];

// 5 contextual state pools for selectContextualPhrase()
PHRASES.COMEBACK = [
  "They refuse to give in!",
  "Against all odds — they are back in this!",
  "The crowd cannot believe what they are seeing!",
  "Don't write this team off yet!",
  "A miraculous turn of events here!",
  "The momentum has completely shifted.",
  "This is the passage of play that will be remembered.",
];

PHRASES.BLOWOUT_HOME = [
  "The visitors are being completely overrun.",
  "This is turning into an embarrassment for the away side.",
  "The home side is putting on a clinic.",
  "There is no way back from here.",
  "A commanding performance from the home side.",
  "The scoreboard is a fair reflection of this contest.",
];

PHRASES.BLOWOUT_AWAY = [
  "The home side cannot live with the visitors today.",
  "This is one of the great away performances.",
  "The crowd has gone quiet at this venue.",
  "Total domination from the away team.",
  "A masterclass in away football.",
];

PHRASES.FINALS_TENSION = [
  "Finals football — every possession matters.",
  "The tension is absolutely palpable.",
  "Hearts in mouths for everyone involved.",
  "This is what they play all season for.",
  "You cannot take your eyes off this contest.",
  "No room for error at this time of year.",
  "Finals football — you either want it or you don't.",
];

PHRASES.LATE_PRESSURE = [
  "Clock is ticking — desperation setting in.",
  "Every inside-50 could be the last.",
  "Time is running out for the trailing team.",
  "The pressure is immense in these final minutes.",
  "This could come down to the very last kick.",
  "Deep into time-on — anything can happen.",
];

// Chain phrase templates (functions, not strings)
PHRASES.CHAIN_KICK_TO_GOAL = [
  (k: string, g: string) => `${k} finds ${g} on the lead — ${g} marks and goals!`,
  (k: string, g: string) => `A pinpoint kick inside 50 from ${k}, ${g} takes the mark and converts!`,
  (k: string, g: string) => `${k} threads it to ${g} who nails the set shot.`,
  (k: string, g: string) => `${k} with the precision kick to ${g} — it's a major!`,
  (k: string, g: string) => `${k} swings it long inside 50, ${g} flies for the mark and slots it.`,
  (k: string, g: string) => `A huge delivery by ${k} and ${g} is there to finish from close range.`,
  (k: string, g: string) => `${k} chips it into the corridor, ${g} gathers and drills the major.`,
  (k: string, g: string) => `${k} splits two defenders; ${g} is on the end of it and celebrates.`,
  (k: string, g: string) => `${k} with the dangerous inside-50 pass, ${g} sells the lead and nails it.`,
  (k: string, g: string) => `${k} drifts it into the pocket, ${g} takes the grab and boots it through.`,
  (k: string, g: string) => `${k} finds ${g} in the deep forward line — that's another six.`,
  (k: string, g: string) => `${k} sends ${g} into space inside 50, and ${g} finishes with ice in his veins.`,
];

PHRASES.CHAIN_HANDBALL_GOAL = [
  (h: string, g: string) => `${h} wins it from the stoppage, handballs to ${g} — GOAL!`,
  (h: string, g: string) => `Quick hands from ${h} finds ${g} in space. The snap is true!`,
  (h: string, g: string) => `${h} reads the play perfectly, ${g} receives and finishes coolly.`,
  (h: string, g: string) => `${h} flicks it out of the melee to ${g} who snaps it back through.`,
  (h: string, g: string) => `${h} delivers from the contest, ${g} steams onto it and bends it home.`,
  (h: string, g: string) => `From the bulk-up, ${h} frees up ${g} with a clever handball — goal!`,
  (h: string, g: string) => `${h} shifts the momentum with a quick handpass to ${g}, who storms clear and scores.`,
  (h: string, g: string) => `${h} breaks the stoppage with a smart handball, and ${g} nails the finish.`,
  (h: string, g: string) => `${h} sparks the run, ${g} takes the snap under pressure and gets it over the line.`,
  (h: string, g: string) => `A fast handball from ${h} to ${g} and the forward makes no mistake.`,
  (h: string, g: string) => `${h} finds ${g} on the burst out of traffic — the snap is perfect.`,
  (h: string, g: string) => `${h} threads the handball through the congestion, ${g} slams it home.`,
];

PHRASES.CHAIN_TACKLE_TURNOVER = [
  (t: string, v: string) => `${t} lays the tackle on ${v}! Holding the ball — opposition wins possession.`,
  (t: string, v: string) => `${v} is caught holding by ${t}. Free kick to the opposition.`,
  (t: string, v: string) => `${t} runs down ${v} from behind and wins the ball!`,
  (t: string, v: string) => `${t} closes in hard, ${v} loses the ball and the turnover is complete.`,
  (t: string, v: string) => `${t} forces the error from ${v} — the opposition sweeps in.`,
  (t: string, v: string) => `${t} brings ${v} down low, and ball-up goes the other way.`,
  (t: string, v: string) => `${t} drags ${v} into trouble, the umpire pays it, turnover gained.`,
  (t: string, v: string) => `${t} applies violent pressure, ${v} fumbles and the contest is lost.`,
  (t: string, v: string) => `A crunching tackle by ${t} on ${v} ends the move and flips possession.`,
  (t: string, v: string) => `${t} forces ${v} into a rushed disposal. The opposition pounces.`,
  (t: string, v: string) => `Under pressure from ${t}, ${v} spills it and the opposition claim it.`,
  (t: string, v: string) => `${t} sticks the tackle, ${v} is stranded and the ball is turned over.`,
];

PHRASES.CHAIN_RUCK_CLEARANCE = [
  (r: string, m: string) => `${r} wins the tap to ${m} who bursts out of the stoppage.`,
  (r: string, m: string) => `Dominant ruck work from ${r}, ${m} collects at ground level and drives forward.`,
  (r: string, m: string) => `${r} with the clean hitout, ${m} leads up and takes possession.`,
  (r: string, m: string) => `${r} times it perfectly, ${m} reads it and clears the stoppage wide.`,
  (r: string, m: string) => `Another dominant tap from ${r}, ${m} surges forward with purpose.`,
  (r: string, m: string) => `${r} feeds ${m} cleanly, and ${m} springs the counterattack.`,
  (r: string, m: string) => `${r} plants it to ${m} — the midfielder kicks it out of stoppage easily.`,
  (r: string, m: string) => `${r} wins the hitout, ${m} collects and flicks it into space.`,
  (r: string, m: string) => `A brilliant tap from ${r} to ${m}, who then booted the clearance long.`,
  (r: string, m: string) => `${r} gives ${m} first use, and ${m} breaks the play open immediately.`,
  (r: string, m: string) => `${r} delivers the ruck tap and ${m} clears the ball with a sweeping kick.`,
  (r: string, m: string) => `${r} gives the midfield first use, ${m} clears with a sweeping kick.`,
];

PHRASES.CHAIN_INTERCEPT_FORWARD = [
  (d: string, f: string) => `${d} intercepts brilliantly and finds ${f} on the wing with a laser kick.`,
  (d: string, f: string) => `${d} reads it perfectly — turns defence into attack, ${f} leads up strongly.`,
  (d: string, f: string) => `A stunning intercept from ${d}, immediately moving forward to ${f}.`,
  (d: string, f: string) => `A brilliant reading by ${d}, and ${f} is the target to launch the next chain.`,
  (d: string, f: string) => `${d}'s intercept is deadly, hitting ${f} on the run at the wing.`,
  (d: string, f: string) => `${d} cuts the passage off, then hits ${f} on the deck with a perfect pass.`,
  (d: string, f: string) => `From defence to attack in one moment — ${d} to ${f} and the game opens up.`,
  (d: string, f: string) => `${d} pinches the ball and immediately finds ${f} leading into space.`,
  (d: string, f: string) => `${d} snatches the intercept and sends it long to ${f} on the wing.`,
  (d: string, f: string) => `A key intercept from ${d}, switching it to ${f} for the transition.`,
  (d: string, f: string) => `${d} breaks it up defensively, then hits ${f} with a slick cross-field ball.`,
  (d: string, f: string) => `${d} sniffs the intercept, and ${f} is there to keep the ball moving forward.`,
];

PHRASES.CHAIN_SYNERGY_POSITIVE = [
  (a: string, b: string) => `Pure instinct between ${a} and ${b} — the combination looks almost telepathic.`,
  (a: string, b: string) => `${a} and ${b} have been combining brilliantly all day — another smooth exchange.`,
  (a: string, b: string) => `The understanding between ${a} and ${b} is a real weapon for this team.`,
  (a: string, b: string) => `Time and again ${a} finds ${b} — it's like they share the same brain.`,
  (a: string, b: string) => `${a} and ${b} link up again — that sort of relationship wins matches.`,
  (a: string, b: string) => `You can see the trust between ${a} and ${b} every time they trade it.`,
  (a: string, b: string) => `${a} anticipates ${b}'s run before it even starts. Beautiful teamwork.`,
  (a: string, b: string) => `That interplay between ${a} and ${b} is pure telepathy.`,
  (a: string, b: string) => `${a} and ${b} executed that with all the precision of a practiced pair.`,
  (a: string, b: string) => `When ${a} and ${b} are involved, the ball just seems to find the right option.`,
  (a: string, b: string) => `${a} feeds ${b} in a flash — their chemistry is the real difference today.`,
  (a: string, b: string) => `Another picture-perfect sequence from ${a} and ${b}, and the crowd loves it.`,
];

PHRASES.CHAIN_SYNERGY_NEGATIVE = [
  (a: string, b: string) => `A miscommunication — ${a} and ${b} both called for the ball and neither got it.`,
  (a: string, b: string) => `${a} expected the handball from ${b} but it never came. Opportunity wasted.`,
  (a: string, b: string) => `${a} and ${b} are not on the same page today — the coach won't be happy.`,
  (a: string, b: string) => `${a} was looking for ${b}, but the handball went the wrong way.`,
  (a: string, b: string) => `That was poor awareness from ${a} and ${b} — they weren't in sync.`,
  (a: string, b: string) => `${a} and ${b} collided in confusion, and the opposition got away with it.`,
  (a: string, b: string) => `${a} hesitated and ${b} was left exposed. That cost them momentum.`,
  (a: string, b: string) => `The wrong option from ${a}, ${b} couldn't cover the mistake.`,
  (a: string, b: string) => `${a} tried to force it to ${b} and the move broke down completely.`,
  (a: string, b: string) => `${a} and ${b} had the wrong eyes — it cut the play off dead.`,
  (a: string, b: string) => `They are not reading each other today; ${a} and ${b} keep misfiring.`,
  (a: string, b: string) => `A sloppy handball from ${a} to ${b}, and the chain just falls apart.`,
];

PHRASES.RIVALRY_BUILDUP = {
  Low:    [
    (o: string) => `${o} has had run-ins with our player before — both well aware of each other today.`,
    (o: string) => `A subplot to watch: a quiet rivalry with ${o}. History between these two.`,
  ],
  Medium: [
    (o: string) => `${o} and our player are at each other today — this rivalry is heating up.`,
    (o: string) => `The umpires are keeping a close eye on these two. A clear flashpoint.`,
  ],
  High:   [
    (o: string) => `There is genuine anger between our player and ${o}. The crowd loves it.`,
    (o: string) => `${o} has had a word — and it has not gone unnoticed.`,
  ],
  Heated: [
    (o: string) => `These two are at boiling point — the officials have been warned.`,
    (o: string) => `Absolute hatred on that field between our player and ${o}. This WILL spill over.`,
  ],
};

PHRASES.RIVALRY_RESOLUTION = {
  playerWon: [
    (o: string) => `Got the better of ${o} today — the rivalry points go our way.`,
    (o: string) => `A statement performance against ${o}. Won't be forgotten.`,
  ],
  oppWon: [
    (o: string) => `${o} had the last laugh. The rivalry heats up another notch.`,
    (o: string) => `${o} controlled this matchup. A response will be needed.`,
  ],
  even: [
    (o: string) => `Honours even today against ${o}. This rivalry is far from over.`,
  ],
};

// --- HELPER: Generate unique MM:SS timestamps for a quarter ---
/**
 * Pre-generates unique, chronologically ordered MM:SS timestamps for a quarter.
 * Slots are spread evenly across 20 minutes with ±1 minute of natural jitter.
 * Seconds are randomised (3–56) so no event lands on the artificial :00 mark.
 *
 * Usage:
 *   const slots = generateQuarterTimestamps(26); // over-allocate above target
 *   let slotIdx = 0;
 *   const nextTime = () => slots[slotIdx++] ?? '20:00';
 */
const generateQuarterTimestamps = (count: number): string[] => {
  if (count === 0) return [];

  const slotSize = 20 / count;
  const minutes: number[] = [];

  for (let i = 0; i < count; i++) {
    const base   = Math.floor(i * slotSize) + 1;
    const jitter = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
    minutes.push(Math.max(1, Math.min(20, base + jitter)));
  }

  // Ensure strictly ascending — no two events at the same minute
  for (let i = 1; i < minutes.length; i++) {
    if (minutes[i] <= minutes[i - 1]) {
      minutes[i] = minutes[i - 1] + 1;
    }
  }

  // Append random seconds (3–56) — never :00 (too artificial) and never :59 (ambiguous)
  return minutes.map(m => {
    const seconds = Math.floor(Math.random() * 54) + 3;
    return `${Math.min(20, m)}:${String(seconds).padStart(2, '0')}`;
  });
};

// --- HELPER: Simulate CPU Match with realistic scoring ---
export const simulateCPUMatch = (homeTeam: Team, awayTeam: Team): MatchResult => {
    // Calculate team rating differential to influence scoring
    const homeRating = homeTeam.players.reduce((sum, p) => sum + p.rating, 0) / Math.max(1, homeTeam.players.length);
    const awayRating = awayTeam.players.reduce((sum, p) => sum + p.rating, 0) / Math.max(1, awayTeam.players.length);
    const ratingDiff = homeRating - awayRating;

    // Use normal-ish distribution via sum of randoms (Central Limit Theorem approximation)
    // Typical AFL scores: 70-110 total, ~10-16 goals, 8-14 behinds
    const randomNormal = (mean: number, std: number): number => {
        let sum = 0;
        for (let i = 0; i < 6; i++) sum += Math.random();
        return Math.round(mean + (sum - 3) * std);
    };

    // Base goals: mean ~12, std ~3 (range roughly 5-20)
    // Rating differential shifts the mean by ~0.3 goals per point of rating diff
    const homeGoalMean = 12 + ratingDiff * 0.3;
    const awayGoalMean = 12 - ratingDiff * 0.3;

    const homeGoals = Math.max(2, randomNormal(homeGoalMean, 3));
    const awayGoals = Math.max(2, randomNormal(awayGoalMean, 3));

    // Behinds: mean ~8, std ~3 (roughly 0.6-0.8 behinds per goal, realistic AFL ratio)
    const homeBehinds = Math.max(1, randomNormal(8 + homeGoals * 0.3, 3));
    const awayBehinds = Math.max(1, randomNormal(8 + awayGoals * 0.3, 3));

    const hTotal = homeGoals * 6 + homeBehinds;
    const aTotal = awayGoals * 6 + awayBehinds;

    return {
        homeScore: { goals: homeGoals, behinds: homeBehinds, total: hTotal, quarters: [] },
        awayScore: { goals: awayGoals, behinds: awayBehinds, total: aTotal, quarters: [] },
        winnerId: hTotal > aTotal ? homeTeam.id : aTotal > hTotal ? awayTeam.id : null,
        playerStats: { goals: 0, behinds: 0, disposals: 0, tackles: 0, votes: 0 },
        summary: "Simulated Match",
        timeline: [],
        topPerformers: []
    };
};

// --- MAIN SIMULATION ENGINE ---
export const calculateMatchOutcome = (
    homeTeam: Team,
    awayTeam: Team,
    player: PlayerProfile,
    currentRound: number,
    tactic: Tactic = 'BALANCED'
): MatchResult => {
      // Identify Player's Team ID for later
      const isHome = player.contract.clubName === homeTeam.name;
      const playerTeamId = isHome ? homeTeam.id : awayTeam.id;
      const playerTeamCulture = (isHome ? homeTeam : awayTeam).culture as CultureType | undefined;

      // Player name helpers — used by chain events and synergy/rivalry commentary
      const playerTeamPlayers = (isHome ? homeTeam : awayTeam).players;
      const opponentPlayers   = (isHome ? awayTeam : homeTeam).players;

      // Returns a random teammate's name (never the user player's own name)
      const pickTeammate = (): string => {
        const filtered = playerTeamPlayers.filter(p => p.name !== player.name);
        if (filtered.length === 0) return playerTeamPlayers[0]?.name ?? 'A teammate';
        return filtered[Math.floor(Math.random() * filtered.length)].name;
      };

      // Returns a random opponent player's name
      const pickOpponent = (): string => {
        if (opponentPlayers.length === 0) return 'An opponent';
        return opponentPlayers[Math.floor(Math.random() * opponentPlayers.length)].name;
      };

      // Identify if there is an active (non-resolved) rivalry against today's opponent
      const opponentTeamName = isHome ? awayTeam.name : homeTeam.name;
      const activeRivalry = player.rivalries?.find(
        r => r.club === opponentTeamName && !r.resolved
      );

      // -- TACTIC MODIFIERS --
      let playerScoringBonus = 0;
      let opponentScoringPenalty = 0;
      let extraEnergyCost = 0;

      switch (tactic) {
          case 'ATTACK':
              playerScoringBonus = 0.2;
              extraEnergyCost = 5;
              break;
          case 'DEFENSIVE':
              opponentScoringPenalty = 0.15;
              playerScoringBonus = -0.10;
              extraEnergyCost = -3;
              break;
          case 'PRESS':
              opponentScoringPenalty = 0.20;
              extraEnergyCost = 10;
              break;
          default:
              break;
      }

      // -- 0. MORALE CHECK --
      // High morale (>80) gives slight boost, Low morale (<40) gives slight nerf
      let moraleMultiplier = 1.0;
      if (player.morale > 80) moraleMultiplier = 1.1;
      else if (player.morale < 40) moraleMultiplier = 0.85;

      // -- 0.5 PERSONALITY MODIFIER --
      const personality = player.personality as PlayerPersonality | undefined;
      let personalityInjuryMod = 0; // Negative = reduced injury risk
      let consistencyMod = 0; // How much variance in performance
      let tacklingBonus = 0;
      let bigGameBonus = 0; // Bonus in important matches
      let energyDrainMod = 0; // Extra energy drain

      switch (personality) {
          case 'PROFESSIONAL':
              consistencyMod = 0.8; // More consistent (reduces variance)
              personalityInjuryMod = -0.005; // Lower injury risk
              break;
          case 'FLAIR':
              consistencyMod = 1.3; // More variance (brilliant or poor)
              personalityInjuryMod = 0.008; // Higher injury risk
              break;
          case 'WARRIOR':
              tacklingBonus = 2; // Extra tackles per game
              bigGameBonus = 1; // Better in big games
              energyDrainMod = 3; // Uses more energy
              break;
          case 'LEADER':
              bigGameBonus = 1;
              consistencyMod = 0.9;
              break;
          case 'ENIGMA':
              consistencyMod = 1.5; // Maximum variance
              break;
          default:
              break;
      }

      // -- 0.6 MATCH-DAY PRESSURE SYSTEM --
      // Identify if this is a high-pressure match
      let pressureLevel = 0; // 0 = normal, 1 = elevated, 2 = high, 3 = extreme
      const isFinals = currentRound > 14;
      const isGrandFinal = currentRound === 16;
      const isDerby = player.rivalries?.some(r => r.club === (isHome ? awayTeam.name : homeTeam.name));
      const isReturnFromInjury = player.injury && player.injury.weeksRemaining === 1;

      if (isGrandFinal) pressureLevel = 3;
      else if (isFinals) pressureLevel = 2;
      else if (isDerby) pressureLevel = 2;
      else if (isReturnFromInjury) pressureLevel = 1;

      // Pressure affects performance based on personality
      // LEADER and PROFESSIONAL handle pressure well; FLAIR and ENIGMA struggle
      let pressureModifier = 0;
      if (pressureLevel > 0) {
          const pressureWeight = pressureLevel * 0.03; // 3% per level
          switch (personality) {
              case 'LEADER':
                  pressureModifier = pressureWeight * 1.5; // Thrives under pressure
                  break;
              case 'PROFESSIONAL':
                  pressureModifier = pressureWeight * 0.5; // Slight boost
                  break;
              case 'WARRIOR':
                  pressureModifier = pressureWeight * (bigGameBonus > 0 ? 1.2 : 0.3);
                  break;
              case 'FLAIR':
                  pressureModifier = -pressureWeight * 0.8; // Struggles under pressure
                  break;
              case 'ENIGMA':
                  // 50/50 — either brilliant or terrible
                  pressureModifier = Math.random() > 0.5 ? pressureWeight * 1.5 : -pressureWeight * 1.5;
                  break;
              default:
                  pressureModifier = -pressureWeight * 0.3; // Average player slightly shrinks
                  break;
          }
      }

      // -- TEAM BATTLE ENGINE --
      // Build match context from the three pre-match battles.
      // Pass pressureLevel (already computed above) so the context stays in sync.
      const matchCtx: MatchContext = buildMatchContext(
        homeTeam,
        awayTeam,
        player,
        pressureLevel,
        player.teamChemistry,
        undefined
      );
      const battleReport: string[] = generateBattleReport(matchCtx, homeTeam.name, awayTeam.name);

      // Translate battle outcomes into scoring probability modifiers.
      // These accumulate ON TOP OF the tactic modifiers already set above.

      // 1. Team quality differential — stronger team scores slightly more
      let teamQualityModifier = matchCtx.ratingDifferential * 0.004; // ±0.02 per 5-point diff
      if (!isHome) teamQualityModifier *= -1;  // flip perspective for away player

      // 2. Contested possession winner gets a clearance/inside-50 rate bonus
      const possessionBonus =
        matchCtx.contestedPossessionWinner === (isHome ? 'HOME' : 'AWAY') ? 0.06 :
        matchCtx.contestedPossessionWinner === 'EVEN' ? 0 :
        -0.04;

      // 3. Chemistry synergy — the wire between chemistryUtils and simulationUtils
      // Converts the ±20 synergyDelta into a ±0.20 scoring probability modifier
      const chemistryBonus = isHome
        ? matchCtx.synergyDelta / 100
        : -matchCtx.synergyDelta / 100;

      // Apply all to the existing playerScoringBonus
      playerScoringBonus += teamQualityModifier + possessionBonus + chemistryBonus;

      // 4. Defence advantage reduces opponent scoring rate
      if (matchCtx.defenceAdvantage === (isHome ? 'HOME' : 'AWAY')) {
        opponentScoringPenalty += 0.08;   // our defence is better — they score less
      } else if (matchCtx.defenceAdvantage === (isHome ? 'AWAY' : 'HOME')) {
        opponentScoringPenalty -= 0.04;   // opponent defence is better — we score less
      }

      // -- 1. INJURY SETUP (rolled per-quarter, not upfront) --
      let injuryData: PlayerInjury | undefined = undefined;
      let injuryQuarter = 0; // 0 = No injury
      const baseInjuryRisk = 0.015 + personalityInjuryMod; // personality-adjusted base risk

      // Helper: compute per-quarter injury risk based on fatigue, contact, and pressure
      const computeQuarterInjuryRisk = (
        fatigueMod: number,       // current fatigue multiplier 0.65–1.0 (lower = more fatigued)
        contactCount: number,     // number of TACKLE + FREE_KICK events generated this quarter
        pressureRating: number    // 0–3 from matchCtx
      ): number => {
        const fatigueFactor  = 1 + (1 - fatigueMod) * 1.5;   // up to 1.53× at zero energy
        const contactFactor  = 1 + contactCount * 0.003;       // +0.3% per contact event
        const pressureFactor = 1 + pressureRating * 0.01;      // +1% per pressure level
        return baseInjuryRisk * fatigueFactor * contactFactor * pressureFactor;
      };

      // -- FATIGUE DECAY MODEL --
      // Computes a per-quarter performance multiplier based on starting energy.
      // At full energy all four quarters run at 1.0.
      // At zero energy the multiplier floor is 0.65 — the player still contributes but fades.
      // Personality affects how fast the player tires:
      //   PROFESSIONAL / LEADER — slowest decay
      //   WARRIOR / FLAIR        — fastest decay
      const computeQuarterFatigueMods = (
        startingEnergy: number,
        personality: PlayerPersonality | undefined
      ): number[] => {
        const decayRates: Partial<Record<string, number>> = {
          PROFESSIONAL: 0.011,
          LEADER:       0.012,
          ENIGMA:       0.014,
          FLAIR:        0.015,
          WARRIOR:      0.017,
        };
        const decayRate = decayRates[personality ?? ''] ?? 0.013;

        const mods: number[] = [];
        let energy = Math.max(0, Math.min(100, startingEnergy));

        for (let q = 1; q <= 4; q++) {
          // Performance multiplier: 1.0 at full energy, 0.65 at zero
          mods.push(0.65 + (energy / 100) * 0.35);

          // Energy cost increases each quarter (accumulating fatigue)
          // Quarter 1: ~11–16, Quarter 2: ~14–19, Quarter 3: ~17–22, Quarter 4: ~20–25
          const quarterCost = 8 + (q * 3) + Math.floor(Math.random() * 6);
          energy = Math.max(0, energy - quarterCost);
        }

        return mods;
      };

      const quarterFatigueMods = computeQuarterFatigueMods(player.energy, personality);

      // Approximate total energy used (for return in MatchResult.energyUsed)
      // More accurate than the flat random cost used previously
      const approxEnergyUsed = Math.min(
        player.energy,
        Math.round(quarterFatigueMods.reduce((sum, mod) => sum + (1 - mod) * 60, 0))
      );

      // -- 2. DECIDE PLAYER STATS FIRST --
      // Base Calculations
      let pDisposalsRaw = Math.floor(Math.random() * 15) + (player.attributes.stamina / 8) + (player.attributes.speed / 8) + (player.attributes.handball / 10);
      let pGoalsRaw = player.position === Position.FORWARD
          ? Math.floor(Math.random() * 4) + (player.attributes.kicking > 50 ? 1 : 0) + (player.attributes.goalSense / 20)
          : Math.floor(Math.random() * 1.5) + (player.attributes.goalSense / 40);
      let pBehindsRaw = Math.floor(Math.random() * 3);
      let pTacklesRaw = Math.floor(Math.random() * 4) + (player.attributes.tackling / 10) + tacklingBonus;

      // Apply consistency modifier (reduces or increases variance from random)
      if (consistencyMod !== 0) {
          const baseVariance = 7.5; // Half of Math.random() * 15
          const disposalsVariance = baseVariance * consistencyMod;
          pDisposalsRaw = Math.floor(Math.random() * disposalsVariance * 2) + (player.attributes.stamina / 8) + (player.attributes.speed / 8) + (player.attributes.handball / 10);
      }

      // Apply Morale Multiplier
      let pDisposals = Math.floor(pDisposalsRaw * (moraleMultiplier + pressureModifier));
      let pGoals = Math.floor(pGoalsRaw * (moraleMultiplier + pressureModifier));
      let pBehinds = Math.floor(pBehindsRaw);
      let pTackles = Math.floor(pTacklesRaw * (moraleMultiplier + pressureModifier));

      // Apply tactic scoring bonus/penalty to player goals
      if (playerScoringBonus !== 0) {
          pGoals = Math.max(0, Math.round(pGoals * (1 + playerScoringBonus)));
      }

      // Reduce stats if injured
      if (injuryQuarter > 0) {
          const playTimeRatio = (injuryQuarter - 0.5) / 4; 
          pDisposals = Math.floor(pDisposals * playTimeRatio);
          pGoals = Math.floor(pGoals * playTimeRatio);
          pBehinds = Math.floor(pBehinds * playTimeRatio);
          pTackles = Math.floor(pTackles * playTimeRatio);
      }
      
      const pStats = {
          disposals: Math.floor(pDisposals),
          goals: Math.floor(pGoals),
          behinds: pBehinds,
          tackles: Math.floor(pTackles),
          votes: 0, // Will be calculated in Brownlow 3-2-1 system
          // Extended stats
          effectiveDisposals: 0,
          ineffectiveDisposals: 0,
          kicks: 0,
          handballs: 0,
          marks: 0,
          contendedPossessions: 0,
          inside50s: 0,
          clearances: 0,
          hitOuts: 0,
          brownlowVotes3: 0,
          brownlowVotes2: 0,
          brownlowVotes1: 0,
      };

      let timeline: MatchEvent[] = [];

      // In-match energy tracking
      let inMatchEnergy = Math.max(0, Math.min(100, player.energy));

      let homeGoals = 0; let homeBehinds = 0;
      let awayGoals = 0; let awayBehinds = 0;

      // Track player stats distribution
      let remainingPlayerGoals = pStats.goals;
      let remainingPlayerBehinds = pStats.behinds;
      let remainingPlayerDisposals = pStats.disposals;
      let remainingPlayerTackles = pStats.tackles;

      // -- MOMENTUM SYSTEM --
      // Tracks which team is "on top" — consecutive scoring events build momentum
      // Momentum affects scoring probability for the next quarter
      let homeMomentum = 0; // -10 to +10, positive = home advantage
      let homeConsecutiveScores = 0;
      let awayConsecutiveScores = 0;

      // Returns a contextually appropriate GENERIC phrase based on current match state.
      // Parameters:
      //   quarter          — current quarter (1–4)
      //   scoreDiff        — approximate score difference (positive = player's team leading)
      //   momentum         — homeMomentum value at this point in the quarter (-10 to +10)
      //   isFinals         — whether this is a finals match
      //   minuteInQuarter  — approximate minute into the quarter (from the nextTime() call)
      const selectContextualPhrase = (
        quarter: number,
        scoreDiff: number,
        momentum: number,
        isFinals: boolean,
        minuteInQuarter: number
      ): string => {
        const absScore       = Math.abs(scoreDiff);
        const isLastQuarter  = quarter === 4;
        const isLateGame     = minuteInQuarter >= 16;

        // Finals tension takes priority
        if (isFinals && Math.random() < 0.35) {
          return PHRASES.FINALS_TENSION[Math.floor(Math.random() * PHRASES.FINALS_TENSION.length)];
        }

        // Late Q4, within a kick — maximum tension
        if (isLastQuarter && isLateGame && absScore <= 18) {
          return PHRASES.LATE_PRESSURE[Math.floor(Math.random() * PHRASES.LATE_PRESSURE.length)];
        }

        // Blowout — different flavour depending on who's winning
        if (absScore > 48) {
          const pool = scoreDiff > 0 ? PHRASES.BLOWOUT_HOME : PHRASES.BLOWOUT_AWAY;
          return pool[Math.floor(Math.random() * pool.length)];
        }

        // Comeback — team was behind but momentum is swinging back
        if (momentum < -4 && scoreDiff > 0) {
          return PHRASES.COMEBACK[Math.floor(Math.random() * PHRASES.COMEBACK.length)];
        }

        // Default — culture-specific crowd phrase or generic
        const culturePhrases = playerTeamCulture
          ? CROWD_PHRASES_BY_CULTURE[playerTeamCulture]
          : undefined;
        const pool = culturePhrases?.length
          ? culturePhrases
          : PHRASES.ATMOSPHERE.length > 0
            ? PHRASES.ATMOSPHERE
            : PHRASES.GENERIC;
        return pool[Math.floor(Math.random() * pool.length)];
      };

      // -- 3. GENERATE QUARTER BY QUARTER --
      for(let q=1; q<=4; q++) {
          
          // Pre-generate unique MM:SS timestamps for this quarter
          // Over-allocate to 26 slots — unused slots are simply not consumed
          const quarterTimeSlots = generateQuarterTimestamps(26);
          let timeSlotIdx = 0;
          const nextTime = (): string =>
            quarterTimeSlots[timeSlotIdx++] ?? `${Math.min(20, timeSlotIdx)}:30`;

          // If injured in previous quarter, player does nothing
          const playerActive = injuryQuarter === 0 || q <= injuryQuarter;

          const events: MatchEvent[] = [];
          const minutes = 20;
          
          // Apply fatigue modifier for this quarter
          const fatigueMod = quarterFatigueMods[q - 1]; // 0.65–1.0 for this quarter
          
          // --- PLAYER EVENTS ---
          if (playerActive) {
              // Goals
              let qPlayerGoals = 0;
              if (remainingPlayerGoals > 0) {
                 qPlayerGoals = Math.random() > 0.5 ? 1 : 0;
                 if (q === 4 || q === injuryQuarter) qPlayerGoals = remainingPlayerGoals; 
                 else if (qPlayerGoals > remainingPlayerGoals) qPlayerGoals = remainingPlayerGoals;
                 remainingPlayerGoals -= qPlayerGoals;
              }

              // Behinds
               let qPlayerBehinds = 0;
               if (remainingPlayerBehinds > 0) {
                  qPlayerBehinds = Math.random() > 0.7 ? 1 : 0;
                  if (q === 4 || q === injuryQuarter) qPlayerBehinds = remainingPlayerBehinds;
                  remainingPlayerBehinds -= qPlayerBehinds;
               }
               
               // Disposals
                const baseQDisposals = Math.floor(remainingPlayerDisposals / Math.max(1, (injuryQuarter || 5) - q));
                const qDisposals     = Math.floor(baseQDisposals * fatigueMod);
                const qKeyDisposals = Math.ceil(qDisposals * 0.3);
                remainingPlayerDisposals -= qDisposals;

                // Tackles
                let qTackles = 0;
                if (remainingPlayerTackles > 0) {
                    qTackles = Math.random() > 0.5 ? 1 : 0;
                    const qTacklesAdjusted = Math.floor(qTackles * fatigueMod);
                    remainingPlayerTackles -= qTacklesAdjusted;
                    qTackles = qTacklesAdjusted;
                }

              // Add Player Events
              for(let i=0; i<qPlayerGoals; i++) {
                  events.push({ quarter: q, time: nextTime(), description: `${player.name} ${PHRASES.GOAL[Math.floor(Math.random()*PHRASES.GOAL.length)]}`, type: 'GOAL', isPlayerInvolved: true, teamId: playerTeamId });
                  if(isHome) homeGoals++; else awayGoals++;
                  // Goals count as effective disposal
                  pStats.effectiveDisposals++;
                  pStats.inside50s++;
              }
              for(let i=0; i<qPlayerBehinds; i++) {
                events.push({ quarter: q, time: nextTime(), description: `${player.name} ${PHRASES.BEHIND[Math.floor(Math.random()*PHRASES.BEHIND.length)]}`, type: 'BEHIND', isPlayerInvolved: true, teamId: playerTeamId });
                if(isHome) homeBehinds++; else awayBehinds++;
                pStats.inside50s++;
              }
              for(let i=0; i<qKeyDisposals; i++) {
                events.push({ quarter: q, time: nextTime(), description: `${player.name} ${PHRASES.POSSESSION[Math.floor(Math.random()*PHRASES.POSSESSION.length)]}`, type: 'POSSESSION', isPlayerInvolved: true, teamId: playerTeamId });
                // Disposal effectiveness: 60-80% effective based on kicking/handball
                const effectiveChance = (player.attributes.kicking + player.attributes.handball) / 200;
                if (Math.random() < effectiveChance) {
                    pStats.effectiveDisposals++;
                } else {
                    pStats.ineffectiveDisposals++;
                }
                // Split between kicks and handballs
                if (Math.random() < 0.6) {
                    pStats.kicks++;
                } else {
                    pStats.handballs++;
                }
              }
              for(let i=0; i<qTackles; i++) {
                events.push({ quarter: q, time: nextTime(), description: `${player.name} ${PHRASES.TACKLE[Math.floor(Math.random()*PHRASES.TACKLE.length)]}`, type: 'TACKLE', isPlayerInvolved: true, teamId: playerTeamId });
                pStats.contendedPossessions++;
              }

              // Track marks from position-specific events
              if (player.position === Position.FORWARD || player.position === Position.MIDFIELDER) {
                  const markChance = player.attributes.marking / 150;
                  if (Math.random() < markChance) {
                      pStats.marks++;
                      events.push({ quarter: q, time: nextTime(), description: `${player.name} takes a contested mark!`, type: 'MARK', isPlayerInvolved: true, teamId: playerTeamId });
                  }
              } else if (player.position === Position.DEFENDER) {
                  const markChance = player.attributes.marking / 120; // Defenders mark more
                  if (Math.random() < markChance) {
                      pStats.marks++;
                      events.push({ quarter: q, time: nextTime(), description: `${player.name} intercepts with a mark!`, type: 'MARK', isPlayerInvolved: true, teamId: playerTeamId });
                  }
              }

              // Clearances from stoppages (roughly 30% of disposals)
              pStats.clearances = (pStats.clearances ?? 0) + Math.floor(qDisposals * 0.3);

               // INJURY EVENT
               if (injuryQuarter === q && injuryData) {
                   events.push({
                       quarter: q,
                       time: nextTime(),
                       description: `${player.name} has gone down clutching their leg! Looks like a ${injuryData.name}. They are being helped off the ground.`,
                       type: 'INJURY',
                       isPlayerInvolved: true,
                       teamId: playerTeamId
                   });
               }

              // Position-specific event (once per quarter, 40% chance)
              if (Math.random() < 0.4) {
                  switch (player.position) {
                      case Position.FORWARD: {
                          const roll = (player.attributes.goalSense + player.attributes.marking) / 200;
                          if (Math.random() < roll) {
                              events.push({ quarter: q, time: nextTime(), description: `${player.name} ${PHRASES.ONE_ON_ONE[Math.floor(Math.random()*PHRASES.ONE_ON_ONE.length)]}`, type: 'ONE_ON_ONE', isPlayerInvolved: true, teamId: playerTeamId });
                          }
                          break;
                      }
                      case Position.DEFENDER: {
                          const roll = (player.attributes.tackling + player.attributes.marking) / 200;
                          if (Math.random() < roll) {
                              events.push({ quarter: q, time: nextTime(), description: `${player.name} ${PHRASES.INTERCEPT[Math.floor(Math.random()*PHRASES.INTERCEPT.length)]}`, type: 'INTERCEPT', isPlayerInvolved: true, teamId: playerTeamId });
                          } else {
                              events.push({ quarter: q, time: nextTime(), description: `${player.name} ${PHRASES.ONE_ON_ONE_DEFENSIVE[Math.floor(Math.random()*PHRASES.ONE_ON_ONE_DEFENSIVE.length)]}`, type: 'ONE_ON_ONE_DEFENSIVE', isPlayerInvolved: true, teamId: playerTeamId });
                          }
                          break;
                      }
                      case Position.RUCK: {
                          const roll = (player.attributes.stamina + player.attributes.marking) / 200;
                          if (Math.random() < roll) {
                              events.push({ quarter: q, time: nextTime(), description: `${player.name} ${PHRASES.HIT_OUT[Math.floor(Math.random()*PHRASES.HIT_OUT.length)]}`, type: 'HIT_OUT', isPlayerInvolved: true, teamId: playerTeamId });
                              pStats.hitOuts += Math.floor(Math.random() * 5) + 8; // 8-12 hit outs per quarter
                          }
                          break;
                      }
                      default:
                          break; // MIDFIELDER already well covered by POSSESSION events
                  }
              }
          }

          // Per-quarter energy cost (applies regardless of active/injured)
          const quarterCost = Math.max(0, (10 + Math.floor(Math.random() * 11)) + extraEnergyCost + Math.floor(energyDrainMod / 4));
          inMatchEnergy = Math.max(0, inMatchEnergy - quarterCost);
           // totalEnergyUsed is replaced by approxEnergyUsed from the fatigue model

          // --- TEAM/FILLER EVENTS ---
          const currentEventCount = events.length;
          // -- DYNAMIC INJURY RISK CHECK (per quarter) --
          // Only rolls if the player has not already been injured this match
          if (!injuryData && playerActive) {
            // Count contact events already generated for this quarter
            const contactThisQuarter = events.filter(
              e => e.type === 'TACKLE' || e.type === 'FREE_KICK'
            ).length;

            const quarterRisk = computeQuarterInjuryRisk(
              fatigueMod,
              contactThisQuarter,
              matchCtx.pressureRating
            );

            if (Math.random() < quarterRisk) {
              const injType = INJURY_TYPES[Math.floor(Math.random() * INJURY_TYPES.length)];
              injuryData = { name: injType.name, weeksRemaining: injType.weeks };
              injuryQuarter = q;

              events.push({
                quarter: q,
                time: nextTime(),
                description: `${player.name} has gone down clutching their leg! Looks like a ${injType.name}. They are being helped off the ground.`,
                type: 'INJURY',
                isPlayerInvolved: true,
                teamId: playerTeamId,
              });
            }
          }

          // --- FILLER / CHAIN EVENT GENERATION ---
          // Target: 18–24 events per quarter (up from 12–15)
          const targetEventCount = Math.floor(Math.random() * 7) + 18;
          const fillerNeeded     = Math.max(0, targetEventCount - events.length);

          // Running score diff for contextual phrase selection
          const currentPlayerScore = isHome
            ? homeGoals * 6 + homeBehinds
            : awayGoals * 6 + awayBehinds;
          const currentOppScore = isHome
            ? awayGoals * 6 + awayBehinds
            : homeGoals * 6 + homeBehinds;
          let runningScoreDiff = currentPlayerScore - currentOppScore;

          let fillerGenerated = 0;

          while (fillerGenerated < fillerNeeded) {
            // ── CHAIN EVENT (30% chance, only if budget remains for 2 events) ──
            const isChainedPlay = Math.random() < 0.30 && fillerGenerated < fillerNeeded - 1;

            if (isChainedPlay) {
              const chainRoll = Math.random();

              if (chainRoll < 0.28) {
                // KICK-TO-GOAL CHAIN
                const kicker    = Math.random() < 0.40 ? player.name : pickTeammate();
                const scorer    = pickTeammate();
                const templates = PHRASES.CHAIN_KICK_TO_GOAL as Array<(k: string, g: string) => string>;
                const tpl       = templates[Math.floor(Math.random() * templates.length)];

                events.push({
                  quarter: q, time: nextTime(),
                  description: `${kicker} drives it long inside 50.`,
                  type: 'POSSESSION', isPlayerInvolved: kicker === player.name, teamId: playerTeamId,
                });
                events.push({
                  quarter: q, time: nextTime(),
                  description: tpl(kicker, scorer),
                  type: 'GOAL', isPlayerInvolved: scorer === player.name, teamId: playerTeamId,
                });
                if (isHome) homeGoals++; else awayGoals++;
                runningScoreDiff += 6;
                fillerGenerated += 2;

              } else if (chainRoll < 0.52) {
                // TACKLE-TURNOVER CHAIN
                const tackler    = pickOpponent();
                const victim     = Math.random() < 0.50 ? player.name : pickTeammate();
                const templates  = PHRASES.CHAIN_TACKLE_TURNOVER as Array<(t: string, v: string) => string>;
                const tpl        = templates[Math.floor(Math.random() * templates.length)];
                const oppTeamId  = isHome ? awayTeam.id : homeTeam.id;
                const followType = Math.random() < 0.35 ? 'GOAL' : 'POSSESSION';

                events.push({
                  quarter: q, time: nextTime(),
                  description: tpl(tackler, victim),
                  type: 'TACKLE', isPlayerInvolved: victim === player.name, teamId: oppTeamId,
                });
                events.push({
                  quarter: q, time: nextTime(),
                  description: followType === 'GOAL'
                    ? `${tackler} converts the opportunity — GOAL!`
                    : `${tackler} wins it and drives forward under pressure.`,
                  type: followType as MatchEvent['type'], isPlayerInvolved: false, teamId: oppTeamId,
                });
                if (followType === 'GOAL') {
                  if (isHome) awayGoals++; else homeGoals++;
                  runningScoreDiff -= 6;
                }
                fillerGenerated += 2;

              } else if (chainRoll < 0.72) {
                // RUCK-CLEARANCE CHAIN
                const ruckman = playerTeamPlayers.find(p => p.subPosition === 'RUCK')?.name ?? pickTeammate();
                const mid     = pickTeammate();
                const templates = PHRASES.CHAIN_RUCK_CLEARANCE as Array<(r: string, m: string) => string>;
                const tpl     = templates[Math.floor(Math.random() * templates.length)];

                events.push({
                  quarter: q, time: nextTime(),
                  description: tpl(ruckman, mid),
                  type: 'HIT_OUT',
                  isPlayerInvolved: ruckman === player.name || mid === player.name,
                  teamId: playerTeamId,
                });
                fillerGenerated += 1;

              } else {
                // INTERCEPT-TO-FORWARD CHAIN
                const def = playerTeamPlayers.find(p =>
                  p.subPosition === 'HBF' || p.subPosition === 'FB'
                )?.name ?? pickTeammate();
                const fwd = pickTeammate();
                const templates = PHRASES.CHAIN_INTERCEPT_FORWARD as Array<(d: string, f: string) => string>;
                const tpl = templates[Math.floor(Math.random() * templates.length)];

                events.push({
                  quarter: q, time: nextTime(),
                  description: tpl(def, fwd),
                  type: 'INTERCEPT',
                  isPlayerInvolved: def === player.name || fwd === player.name,
                  teamId: playerTeamId,
                });
                fillerGenerated += 1;
              }

            } else {
              // ── SINGLE FILLER EVENT — expanded type distribution ──
              const isHomeEvent  = Math.random() > 0.5;
              const actingTeam   = isHomeEvent ? homeTeam : awayTeam;
              const actingTeamId = actingTeam.id;

              const teammates    = actingTeam.players.filter(p => p.name !== player.name);
              const randomPlayer = teammates[Math.floor(Math.random() * teammates.length)];
              const actorName    = randomPlayer ? randomPlayer.name : actingTeam.name;

              // Rating-aware goal threshold (v1.5 — replaces fixed 0.25)
              const isOpponentEvent      = actingTeam.id !== playerTeamId;
              const opponentRatingBonus  = (matchCtx.ratingDifferential * -0.003);
              const baseOpponentThreshold = 0.25 + (isHome ? opponentRatingBonus : -opponentRatingBonus);
              const goalThreshold = isOpponentEvent
                ? Math.max(0.04, baseOpponentThreshold * (1 - opponentScoringPenalty))
                : Math.max(0.10, 0.25 + (isHome ? -opponentRatingBonus : opponentRatingBonus) + playerScoringBonus * 0.5);

              // Momentum adjustment (±0.05 max)
              const momentumAdj = homeMomentum * 0.005;
              const adjustedGoalThreshold = isHomeEvent
                ? goalThreshold + momentumAdj
                : goalThreshold - momentumAdj;

              const typeRoll = Math.random();
              let type: MatchEvent['type'] = 'GENERIC';
              let desc = '';

              if (typeRoll < adjustedGoalThreshold) {
                // GOAL
                type = 'GOAL';
                desc = `${actorName} ${PHRASES.GOAL[Math.floor(Math.random() * PHRASES.GOAL.length)]}`;
                if (isHomeEvent) homeGoals++; else awayGoals++;
                runningScoreDiff += isHomeEvent === isHome ? 6 : -6;
                if (isHomeEvent) { homeConsecutiveScores++; awayConsecutiveScores = 0; }
                else             { awayConsecutiveScores++;  homeConsecutiveScores = 0; }

              } else if (typeRoll < adjustedGoalThreshold + 0.12) {
                // BEHIND
                type = 'BEHIND';
                desc = `${actorName} ${PHRASES.BEHIND[Math.floor(Math.random() * PHRASES.BEHIND.length)]}`;
                if (isHomeEvent) homeBehinds++; else awayBehinds++;

              } else if (typeRoll < 0.42) {
                // CONTESTED — MARK, TACKLE, or STOPPAGE
                const r = Math.random();
                if (r < 0.35) {
                  type = 'MARK';
                  desc = `${actorName} ${PHRASES.MARK[Math.floor(Math.random() * PHRASES.MARK.length)]}`;
                } else if (r < 0.70) {
                  type = 'TACKLE';
                  desc = `${actorName} ${PHRASES.TACKLE[Math.floor(Math.random() * PHRASES.TACKLE.length)]}`;
                } else {
                  type = 'GENERIC';
                  desc = PHRASES.STOPPAGE[Math.floor(Math.random() * PHRASES.STOPPAGE.length)];
                }

              } else if (typeRoll < 0.50) {
                // RUCK CONTEST
                type = 'HIT_OUT';
                desc = PHRASES.RUCK_CONTEST[Math.floor(Math.random() * PHRASES.RUCK_CONTEST.length)];

              } else if (typeRoll < 0.58) {
                // TURNOVER
                type = 'TURNOVER';
                desc = `${actorName} ${PHRASES.TURNOVER[Math.floor(Math.random() * PHRASES.TURNOVER.length)]}`;

              } else if (typeRoll < 0.64) {
                // FREE KICK
                type = 'FREE_KICK';
                desc = `${actorName} ${PHRASES.FREE_KICK[Math.floor(Math.random() * PHRASES.FREE_KICK.length)]}`;

              } else if (typeRoll < 0.74) {
                // POSSESSION / TRANSITION / FORWARD PRESSURE
                type = 'POSSESSION';
                const r = Math.random();
                if (r < 0.40)      desc = `${actorName} ${PHRASES.POSSESSION[Math.floor(Math.random() * PHRASES.POSSESSION.length)]}`;
                else if (r < 0.70) desc = PHRASES.MIDFIELD_BATTLE[Math.floor(Math.random() * PHRASES.MIDFIELD_BATTLE.length)];
                else               desc = PHRASES.FORWARD_PRESSURE[Math.floor(Math.random() * PHRASES.FORWARD_PRESSURE.length)];

              } else if (typeRoll < 0.82) {
                // DEFENSIVE PRESSURE
                type = 'GENERIC';
                desc = PHRASES.DEFENSIVE_PRESSURE[Math.floor(Math.random() * PHRASES.DEFENSIVE_PRESSURE.length)];

              } else if (typeRoll < 0.87) {
                // UMPIRE MOMENT
                type = 'FREE_KICK';
                desc = PHRASES.UMPIRE[Math.floor(Math.random() * PHRASES.UMPIRE.length)];

              } else if (typeRoll < 0.91 && (currentRound <= 6 || currentRound >= 11)) {
                // CONDITIONS (early/late season only — rounds 1–6 and 11+)
                type = 'GENERIC';
                desc = PHRASES.CONDITIONS[Math.floor(Math.random() * PHRASES.CONDITIONS.length)];

              } else if (typeRoll < 0.96) {
                // ATMOSPHERE / CROWD (culture-aware)
                type = 'GENERIC';
                const minuteApprox = parseInt(quarterTimeSlots[Math.max(0, timeSlotIdx - 1)]?.split(':')[0] ?? '10');
                desc = selectContextualPhrase(q, runningScoreDiff, homeMomentum, isFinals, minuteApprox);

              } else {
                // BRILLIANCE (rare ~4%) — replaces the old hardcoded one-liner
                type = 'GENERIC';
                desc = `UNBELIEVABLE! ${actorName} — ${PHRASES.BRILLIANCE[Math.floor(Math.random() * PHRASES.BRILLIANCE.length)]}`;
              }

              events.push({
                quarter: q, time: nextTime(),
                description: desc, type,
                isPlayerInvolved: false, teamId: actingTeamId,
              });
              fillerGenerated += 1;
            }
          }

          // -- SYNERGY COMMENTARY EVENT --
          // Fires at most once per match, in Q2 or later, when the player has a BEST_MATE
          // or an ENEMY/RIVAL teammate relationship.
          const hasFiredSynergy = timeline.some(e =>
            e.description.includes('telepathic') || e.description.includes('miscommunication') ||
            e.description.includes('same page')
          );

          if (!hasFiredSynergy && q >= 2 && player.teammates && Math.random() < 0.25) {
            const bestMate = player.teammates.find(t => t.status === 'BEST_MATE');
            const negRel   = player.teammates.find(t => t.status === 'ENEMY' || t.status === 'RIVAL');

            if (negRel && Math.random() < 0.40) {
              const templates = PHRASES.CHAIN_SYNERGY_NEGATIVE as Array<(a: string, b: string) => string>;
              const tpl = templates[Math.floor(Math.random() * templates.length)];
              events.push({
                quarter: q, time: nextTime(),
                description: tpl(player.name, negRel.name),
                type: 'GENERIC', isPlayerInvolved: true, teamId: playerTeamId,
              });
            } else if (bestMate) {
              const templates = PHRASES.CHAIN_SYNERGY_POSITIVE as Array<(a: string, b: string) => string>;
              const tpl = templates[Math.floor(Math.random() * templates.length)];
              events.push({
                quarter: q, time: nextTime(),
                description: tpl(player.name, bestMate.name),
                type: 'POSSESSION', isPlayerInvolved: true, teamId: playerTeamId,
              });
            }
          }

          // Sort events by time (no longer needed with chronological generation)
          // events.sort((a,b) => parseInt(a.time) - parseInt(b.time));
          timeline = [...timeline, ...events];

          // -- RIVALRY COMMENTARY EVENTS --
          // Quarter 1 rivalry buildup
          if (q === 1 && activeRivalry) {
            const intensity = activeRivalry.intensity as keyof typeof PHRASES.RIVALRY_BUILDUP;
            const pool      = PHRASES.RIVALRY_BUILDUP[intensity] ?? PHRASES.RIVALRY_BUILDUP.Low;
            const buildupPhrases = pool as Array<(o: string) => string>;
            const tpl = buildupPhrases[Math.floor(Math.random() * buildupPhrases.length)];

            events.push({
              quarter: 1, time: nextTime(),
              description: tpl(activeRivalry.opponentName),
              type: 'RIVALRY', isPlayerInvolved: true, teamId: playerTeamId,
            });
          }

          // Quarter 4 rivalry resolution
          if (q === 4 && activeRivalry) {
            const playerTeamTotalScore = isHome
              ? homeGoals * 6 + homeBehinds
              : awayGoals * 6 + awayBehinds;
            const opponentTotalScore = isHome
              ? awayGoals * 6 + awayBehinds
              : homeGoals * 6 + homeBehinds;

            let resPool: Array<(o: string) => string>;
            if (playerTeamTotalScore > opponentTotalScore) {
              resPool = PHRASES.RIVALRY_RESOLUTION.playerWon as Array<(o: string) => string>;
            } else if (opponentTotalScore > playerTeamTotalScore) {
              resPool = PHRASES.RIVALRY_RESOLUTION.oppWon as Array<(o: string) => string>;
            } else {
              resPool = PHRASES.RIVALRY_RESOLUTION.even as Array<(o: string) => string>;
            }

            const tpl = resPool[Math.floor(Math.random() * resPool.length)];
            events.push({
              quarter: 4, time: nextTime(),
              description: tpl(activeRivalry.opponentName),
              type: 'RIVALRY', isPlayerInvolved: true, teamId: playerTeamId,
            });
          }

          // -- END OF QUARTER MOMENTUM CALCULATION --
          // Calculate momentum based on quarter scoring
          const homeQGoals = events.filter(e => e.type === 'GOAL' && e.teamId === homeTeam.id).length;
          const awayQGoals = events.filter(e => e.type === 'GOAL' && e.teamId === awayTeam.id).length;
          const qGoalDiff = homeQGoals - awayQGoals;

          // Momentum shifts based on quarter performance + consecutive scores
          const consecutiveBonus = Math.max(homeConsecutiveScores, awayConsecutiveScores) * 0.5;
          if (homeConsecutiveScores > awayConsecutiveScores) {
              homeMomentum = Math.min(10, homeMomentum + qGoalDiff * 0.8 + consecutiveBonus);
          } else if (awayConsecutiveScores > homeConsecutiveScores) {
              homeMomentum = Math.max(-10, homeMomentum + qGoalDiff * 0.8 - consecutiveBonus);
          } else {
              homeMomentum = Math.max(-10, Math.min(10, homeMomentum + qGoalDiff * 0.8));
          }

          // Decay momentum slightly each quarter (regression to mean)
          homeMomentum *= 0.85;

          // Add crowd momentum phrase if significant
          if (Math.abs(homeMomentum) > 4 && playerTeamCulture) {
              const crowdPhrases = CROWD_PHRASES_BY_CULTURE[playerTeamCulture] || PHRASES.GENERIC;
              const momentumPhrase = homeMomentum > 0
                  ? crowdPhrases[Math.floor(Math.random() * crowdPhrases.length)]
                  : 'The momentum has swung against them.';
              timeline.push({
                  quarter: q,
                  time: '20:00',
                  description: momentumPhrase,
                  type: 'GENERIC',
                  isPlayerInvolved: false,
                  teamId: playerTeamId
              });
          }
      }

      // Normalise kicks + handballs to sum exactly to pStats.disposals
      const kh = (pStats.kicks ?? 0) + (pStats.handballs ?? 0);
      if (kh > 0 && kh !== pStats.disposals) {
        const ratio       = pStats.disposals / kh;
        pStats.kicks      = Math.round((pStats.kicks ?? 0) * ratio);
        pStats.handballs  = pStats.disposals - pStats.kicks;
      }

      // Forward position stat multiplier — moved BEFORE Brownlow voting
      if (player.position === Position.FORWARD && pStats.goals > 0) {
        pStats.goals = Math.round(pStats.goals * 1.1);
      }

      // Calculate quarter-by-quarter scores from timeline events
      const hQScores: number[] = [];
      const aQScores: number[] = [];

      let runningHGoals = 0; let runningHBehinds = 0;
      let runningAGoals = 0; let runningABehinds = 0;

      for(let q=1; q<=4; q++) {
         const qEvents = timeline.filter(e => e.quarter === q);
         qEvents.forEach(e => {
             if(e.type === 'GOAL') {
                 const isHomeGoal = e.teamId === homeTeam.id;
                 if (isHomeGoal) runningHGoals++; else runningAGoals++;
             } else if (e.type === 'BEHIND') {
                 const isHomeBehind = e.teamId === homeTeam.id;
                 if (isHomeBehind) runningHBehinds++; else runningABehinds++;
             }
         });
         hQScores.push((runningHGoals * 6) + runningHBehinds);
         aQScores.push((runningAGoals * 6) + runningABehinds);
      }

      // Use the event-generated scores as the source of truth
      // The recounted scores should match, but we verify and use the timeline version for consistency
      const finalHomeGoals = homeGoals;
      const finalHomeBehinds = homeBehinds;
      const finalAwayGoals = awayGoals;
      const finalAwayBehinds = awayBehinds;

      // Rivalry Check
      let newRivalry: Rivalry | undefined;
      if (pStats.tackles > 4 || pStats.disposals > 25) {
          const opponent = homeTeam.id === player.contract.clubName ? awayTeam : homeTeam;
          if (Math.random() > 0.8) {
              newRivalry = {
                  opponentName: `Opponent #${Math.floor(Math.random() * 10) + 1}`,
                  club: opponent.name,
                  reason: `Intense battle in Round ${currentRound}`,
                  intensity: 'Medium'
              };
               timeline.push({
                   quarter: 4,
                   time: "19:00", // intentional late-quarter rivalry marker — not using nextTime()
                   description: `${player.name} gets into a scuffle with ${newRivalry.opponentName}! A rivalry is born.`,
                   type: 'RIVALRY',
                   isPlayerInvolved: true,
                   teamId: playerTeamId
               });
          }
      }

      // -- 4. GENERATE "OFFICIAL" BOX SCORE --
      const topPerformers: PerformerStats[] = [];

      // Fisher-Yates shuffle for unique random selection
      const shuffle = <T>(arr: T[]): T[] => {
          const a = [...arr];
          for (let i = a.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
      };

      // Determine Goal Budgets (use the scores from event generation)
      let homeGoalBudget = finalHomeGoals;
      let awayGoalBudget = finalAwayGoals;

      // User Stats
      topPerformers.push({
          name: player.name,
          teamId: playerTeamId,
          goals: pStats.goals,
          disposals: pStats.disposals,
          isUser: true
      });

      // Deduct User Goals from their team's budget
      if (isHome) homeGoalBudget -= pStats.goals;
      else awayGoalBudget -= pStats.goals;

      // Ensure budget isn't negative (safeguard)
      homeGoalBudget = Math.max(0, homeGoalBudget);
      awayGoalBudget = Math.max(0, awayGoalBudget);

      // Distribute goals among count players — all budget is assigned (no discard)
      const distributeGoals = (budget: number, count: number): number[] => {
          const distribution = new Array(count).fill(0);
          for (let i = 0; i < budget; i++) {
              distribution[Math.floor(Math.random() * count)]++;
          }
          return distribution;
      };

      // Add 4 UNIQUE teammates with stats based on their actual ratings
      const allTeammates = isHome ? homeTeam.players : awayTeam.players;
      const filteredTeammates = allTeammates.filter(p => p.name !== player.name);
      const pickedTeammates = shuffle(filteredTeammates).slice(0, 4);
      const teamBudget = isHome ? homeGoalBudget : awayGoalBudget;
      const teamGoalDist = distributeGoals(teamBudget, pickedTeammates.length);

      pickedTeammates.forEach((p, i) => {
          // Generate disposals based on player rating (higher rated = more disposals)
          const baseDisposals = Math.floor(Math.random() * 10) + 12; // 12-21
          const ratingBonus = Math.floor((p.rating - 50) / 10); // -3 to +4 based on rating
          const teammateDisposals = Math.max(5, baseDisposals + ratingBonus);

          topPerformers.push({
              name: p.name,
              teamId: playerTeamId,
              goals: teamGoalDist[i],
              disposals: teammateDisposals,
              isUser: false
          });
      });

      // Add 4 UNIQUE opponents with stats based on their actual ratings
      const oppPlayers = isHome ? awayTeam.players : homeTeam.players;
      const oppTeamId = isHome ? awayTeam.id : homeTeam.id;
      const pickedOpps = shuffle(oppPlayers).slice(0, 4);
      const oppBudget = isHome ? awayGoalBudget : homeGoalBudget;
      const oppGoalDist = distributeGoals(oppBudget, pickedOpps.length);

      pickedOpps.forEach((p, i) => {
          const baseDisposals = Math.floor(Math.random() * 10) + 12;
          const ratingBonus = Math.floor((p.rating - 50) / 10);
          const oppDisposals = Math.max(5, baseDisposals + ratingBonus);

          topPerformers.push({
              name: p.name,
              teamId: oppTeamId,
              goals: oppGoalDist[i],
              disposals: oppDisposals,
              isUser: false
          });
      });

      const hTotal = (finalHomeGoals * 6) + finalHomeBehinds;
      const aTotal = (finalAwayGoals * 6) + finalAwayBehinds;

      // -- BROWNLOW 3-2-1 VOTE CALCULATION --
      // Calculate performance score for all top performers
      const allScores = topPerformers.map(p => {
          // For non-user players, simulate tackles and marks based on their random disposals
          const simTackles = p.isUser ? pStats.tackles : Math.floor(p.disposals * 0.15);
          const simMarks = p.isUser ? (pStats.marks || 0) : Math.floor(p.disposals * 0.08);
          const simGoals = p.goals;

          return {
              name: p.name,
              teamId: p.teamId,
              isUser: p.isUser,
              // Brownlow scoring: goals=4, disposals=1, tackles=2, marks=1
              score: simGoals * 4 + p.disposals * 1 + simTackles * 2 + simMarks * 1
          };
      });

      // Sort by score descending
      allScores.sort((a, b) => b.score - a.score);

      // Assign 3-2-1 votes to top 3 (only if they have a positive score)
      if (allScores.length >= 1 && allScores[0].score > 0) {
          if (allScores[0].isUser) pStats.brownlowVotes3 = 3;
      }
      if (allScores.length >= 2 && allScores[1].score > 0) {
          if (allScores[1].isUser) pStats.brownlowVotes2 = 2;
      }
      if (allScores.length >= 3 && allScores[2].score > 0) {
          if (allScores[2].isUser) pStats.brownlowVotes1 = 1;
      }

      pStats.votes = pStats.brownlowVotes3 + pStats.brownlowVotes2 + pStats.brownlowVotes1;

      // -- PERFORMANCE GRADE --
      // Calculate performance grade based on position expectations
      const getPerformanceGrade = (stats: typeof pStats, position: Position): string => {
          let score = 0;
          const disposals = stats.disposals;
          const goals = stats.goals;
          const tackles = stats.tackles;

          // Base score from disposals (40% weight)
          if (disposals >= 35) score += 40;
          else if (disposals >= 28) score += 35;
          else if (disposals >= 22) score += 30;
          else if (disposals >= 18) score += 25;
          else if (disposals >= 14) score += 20;
          else if (disposals >= 10) score += 15;
          else score += 10;

          // Position-specific scoring
          switch (position) {
              case Position.FORWARD:
                  if (goals >= 5) score += 35;
                  else if (goals >= 3) score += 25;
                  else if (goals >= 2) score += 15;
                  else if (goals >= 1) score += 10;
                  break;
              case Position.MIDFIELDER:
                  if (disposals >= 30) score += 20; // Already counted but bonus
                  if (tackles >= 8) score += 20;
                  else if (tackles >= 5) score += 15;
                  else if (tackles >= 3) score += 10;
                  break;
              case Position.DEFENDER:
                  if (tackles >= 6) score += 20;
                  if ((stats.marks || 0) >= 4) score += 20;
                  else if ((stats.marks || 0) >= 2) score += 10;
                  break;
              case Position.RUCK:
                  if ((stats.hitOuts || 0) >= 30) score += 25;
                  if ((stats.marks || 0) >= 3) score += 15;
                  break;
          }

          // Brownlow bonus
          if (stats.votes >= 3) score += 10;
          else if (stats.votes >= 2) score += 5;

          // Disposal effectiveness bonus
          const totalDisposals = (stats.effectiveDisposals || 0) + (stats.ineffectiveDisposals || 0);
          if (totalDisposals > 0) {
              const effectiveness = (stats.effectiveDisposals || 0) / totalDisposals;
              if (effectiveness > 0.75) score += 5;
              else if (effectiveness < 0.5) score -= 5;
          }

          // Convert score to grade
          if (score >= 90) return 'A+';
          if (score >= 80) return 'A';
          if (score >= 70) return 'A-';
          if (score >= 60) return 'B+';
          if (score >= 50) return 'B';
          if (score >= 40) return 'B-';
          if (score >= 30) return 'C+';
          if (score >= 20) return 'C';
          if (score >= 10) return 'C-';
          return 'D';
      };

      pStats.performanceGrade = getPerformanceGrade(pStats, player.position);

       return {
           homeScore: { goals: finalHomeGoals, behinds: finalHomeBehinds, total: hTotal, quarters: hQScores },
           awayScore: { goals: finalAwayGoals, behinds: finalAwayBehinds, total: aTotal, quarters: aQScores },
           winnerId: hTotal > aTotal ? homeTeam.id : aTotal > hTotal ? awayTeam.id : null,
           playerStats: pStats,
           summary: battleReport.join(' '),   // human-readable battle summary
           timeline,
           newRivalry,
           playerInjury: injuryData,
           topPerformers,
           energyUsed: approxEnergyUsed,      // from fatigue model — replaces totalEnergyUsed
           tactic,
           matchContext: matchCtx,            // NEW — optional field added to MatchResult in types.ts
           battleReport,                      // NEW — optional field added to MatchResult in types.ts
       };
};
