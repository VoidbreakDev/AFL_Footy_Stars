import { LeagueTier, Position, AvatarConfig } from "./types";

export const INITIAL_ATTRIBUTE_POINTS = 15;
export const MAX_ATTRIBUTE_LEVEL = 99;

export const TEAM_NAMES_LOCAL = [
  "Mudcrabs", "Bushrangers", "Magpies", "Tigers", "Blues", "Demons", "Lions", "Hawks"
];

export const TEAM_NAMES_AFL = [
  "Collingwood", "Carlton", "Essendon", "Richmond", "Hawthorn", "Geelong", "Sydney", "Brisbane"
];

export const POSITIONS = [
  Position.FORWARD,
  Position.MIDFIELDER,
  Position.DEFENDER,
  Position.RUCK
];

// Hybrid System Configuration
export const PRESET_AVATARS: AvatarConfig[] = [
  { faceId: "Liam" },    
  { faceId: "Nolan" },   
  { faceId: "Felix" },   
  { faceId: "Jack" },    
  { faceId: "Aneka" },   
  { faceId: "Leo" },     
  { faceId: "Max" },     
  { faceId: "Christopher" }, 
  { faceId: "Caleb" },   
  { faceId: "Aiden" },   
  { faceId: "Easton" },  
  { faceId: "Wyatt" },   
];

// Helper to construct the URL
export const getFaceUrl = (faceId: string) => {
    return `https://api.dicebear.com/9.x/micah/svg?seed=${faceId}&radius=50&backgroundColor=transparent`;
}

export const STARTING_AGE = 18;
export const RETIREMENT_AGE = 35;

export const SEASON_LENGTH = 14; 

// --- STADIUM ASSETS ---
export const STADIUM_TEMPLATES = {
    [LeagueTier.LOCAL]: {
        suffixes: ["Oval", "Park", "Reserve", "Rec Ground", "Paddock"],
        minCap: 200,
        maxCap: 3000,
        types: ['OVAL']
    },
    [LeagueTier.STATE]: {
        suffixes: ["Arena", "Showgrounds", "Oval", "Sportsplex", "Center"],
        minCap: 5000,
        maxCap: 15000,
        types: ['OVAL', 'BOUTIQUE']
    },
    [LeagueTier.NATIONAL]: {
        suffixes: ["Stadium", "Colosseum", "G", "Dome", "Arena"],
        minCap: 30000,
        maxCap: 100000,
        types: ['BOUTIQUE', 'COLOSSEUM']
    }
};

// --- MILESTONE THRESHOLDS ---
export const MILESTONES = {
  MATCHES: [1, 50, 100, 150, 200, 250, 300, 350, 400],
  GOALS: [1, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
  DISPOSALS: [500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000],
  TACKLES: [100, 250, 500, 750, 1000]
};

// --- NAME GENERATION DATA ---
export const FIRST_NAMES = [
  "Aaron", "Adam", "Adrian", "Aidan", "Alex", "Alexander", "Ali", "Angus", "Anthony", "Archie",
  "Austin", "Bailey", "Ben", "Benjamin", "Blake", "Beau", "Billy", "Bradley", "Brandon", "Brayden",
  "Brodie", "Bryce", "Caleb", "Callum", "Cameron", "Charles", "Charlie", "Christian", "Christopher",
  "Cody", "Connor", "Cooper", "Corey", "Daniel", "Darcy", "David", "Declan", "Dominic", "Dylan",
  "Edward", "Eli", "Elijah", "Ethan", "Felix", "Finn", "Fletcher", "Flynn", "Gabriel", "George",
  "Hamish", "Harrison", "Harry", "Harvey", "Hayden", "Heath", "Henry", "Hudson", "Hugh", "Hugo",
  "Isaac", "Jack", "Jackson", "Jacob", "Jaeger", "Jake", "James", "Jared", "Jasper", "Jaxon",
  "Jayden", "Jeremy", "Jesse", "Jett", "Joel", "John", "Jonathon", "Jordan", "Joseph", "Josh",
  "Joshua", "Jude", "Julian", "Kade", "Kai", "Kane", "Kieren", "Kyle", "Lachlan", "Lance",
  "Leo", "Levi", "Lewis", "Liam", "Lincoln", "Lochie", "Lucas", "Luke", "Marcus", "Mark",
  "Mason", "Matthew", "Max", "Michael", "Mitchell", "Nathan", "Nathaniel", "Nicholas", "Noah",
  "Oliver", "Oscar", "Owen", "Patrick", "Paul", "Peter", "Philip", "Quinn", "Reece", "Rhys",
  "Richard", "Riley", "Robert", "Rory", "Ryan", "Sam", "Samuel", "Scott", "Sebastian", "Seth",
  "Simon", "Sonny", "Spencer", "Stefan", "Steven", "Taj", "Tate", "Thomas", "Timothy", "Toby",
  "Todd", "Tom", "Travis", "Trent", "Tyler", "Will", "William", "Xavier", "Zac", "Zachary"
];

export const LAST_NAMES = [
  "Abbott", "Adams", "Allen", "Anderson", "Andrews", "Armstrong", "Atkins", "Bailey", "Baker", "Barker",
  "Barnes", "Barrett", "Barry", "Bartlett", "Bates", "Bell", "Bennett", "Berry", "Black", "Bond",
  "Boyd", "Bradley", "Brennan", "Brooks", "Brown", "Bryant", "Buckley", "Burgess", "Burns", "Burton",
  "Butler", "Byrne", "Cameron", "Campbell", "Carey", "Carr", "Carroll", "Carter", "Casey", "Chapman",
  "Clark", "Clarke", "Cole", "Coleman", "Collins", "Connolly", "Cook", "Cooper", "Costello", "Cox",
  "Craig", "Crawford", "Cross", "Cunningham", "Curtis", "Dalton", "Daly", "Daniels", "Davidson", "Davies",
  "Davis", "Dawson", "Day", "Dean", "Delaney", "Dennis", "Dixon", "Dodd", "Donnelly", "Douglas",
  "Doyle", "Duffy", "Duncan", "Dunn", "Dwyer", "Edwards", "Elliott", "Ellis", "Evans", "Farrell",
  "Ferguson", "Fisher", "Fitzgerald", "Fleming", "Fletcher", "Flynn", "Ford", "Foster", "Fowler", "Fox",
  "Francis", "Fraser", "Freeman", "Fuller", "Gallagher", "Gardiner", "Garrett", "George", "Gibson", "Gilbert",
  "Giles", "Gill", "Glover", "Gorman", "Graham", "Grant", "Gray", "Green", "Gregory", "Griffin",
  "Griffiths", "Hall", "Hamilton", "Hammond", "Hansen", "Harding", "Hardy", "Harper", "Harris", "Harrison",
  "Hart", "Harvey", "Hawkins", "Hayes", "Haynes", "Healy", "Henderson", "Henry", "Higgins", "Hill",
  "Hogan", "Holland", "Holmes", "Hopkins", "Horton", "Howard", "Howe", "Hughes", "Hunt", "Hunter",
  "Hurley", "Hutchinson", "Jackson", "James", "Jamieson", "Jenkins", "Jennings", "Johns", "Johnson", "Johnston",
  "Jones", "Jordan", "Joyce", "Kane", "Kavanagh", "Keane", "Kearney", "Kelly", "Kennedy", "Kenny",
  "Kerr", "King", "Knight", "Lambert", "Lane", "Lang", "Larkin", "Lawrence", "Lawson", "Leahy",
  "Lee", "Lewis", "Lloyd", "Long", "Lynch", "Lyons", "MacDonald", "MacKay", "Madden", "Maguire",
  "Mahoney", "Malone", "Mann", "Manning", "Marshall", "Martin", "Mason", "Matthews", "May", "McCarthy",
  "McDonald", "McGrath", "McGuire", "McIntosh", "McKay", "McKenzie", "McLean", "McMahon", "McMillan", "McNamara",
  "McNeil", "McPherson", "Mead", "Meyer", "Miles", "Miller", "Mills", "Mitchell", "Molloy", "Montgomery",
  "Moore", "Morgan", "Morris", "Morrison", "Morrow", "Morton", "Moss", "Muir", "Mullins", "Murphy",
  "Murray", "Myers", "Nash", "Neil", "Nelson", "Newman", "Newton", "Nicholls", "Nicholson", "Nolan",
  "Norman", "Norris", "Norton", "O'Brien", "O'Connell", "O'Connor", "O'Donnell", "O'Keeffe", "O'Leary", "O'Neill",
  "O'Reilly", "O'Shea", "O'Sullivan", "Oliver", "Olsen", "Osborne", "Owen", "Page", "Palmer", "Parker",
  "Parsons", "Paterson", "Patrick", "Patterson", "Payne", "Pearce", "Pearson", "Perry", "Peters", "Peterson",
  "Phillips", "Pike", "Pitt", "Porter", "Potter", "Powell", "Power", "Price", "Pryor", "Quinn",
  "Ralph", "Ramsay", "Randall", "Read", "Reardon", "Reed", "Reid", "Reilly", "Reynolds", "Richards",
  "Richardson", "Riley", "Rioli", "Ritchie", "Roberts", "Robertson", "Robinson", "Robson", "Roche", "Rodgers",
  "Rogers", "Rose", "Ross", "Rowe", "Russell", "Ryan", "Salmon", "Saunders", "Savage", "Schmidt",
  "Schultz", "Scott", "Sharp", "Shaw", "Sheahan", "Shepherd", "Sheridan", "Short", "Simmons", "Simpson",
  "Sims", "Sinclair", "Skinner", "Slater", "Small", "Smart", "Smith", "Smyth", "Spence", "Spencer",
  "Stanley", "Steele", "Stephens", "Stephenson", "Stevens", "Stevenson", "Stewart", "Stone", "Sullivan", "Sutherland",
  "Sutton", "Swan", "Sweeney", "Tait", "Taylor", "Thomas", "Thompson", "Thomson", "Thornton", "Tierney",
  "Tobin", "Todd", "Tucker", "Turner", "Vaughan", "Wade", "Walker", "Wall", "Wallace", "Walsh",
  "Walters", "Ward", "Warner", "Warren", "Waters", "Watson", "Watt", "Watts", "Webb", "Webster",
  "Wells", "West", "Wheeler", "White", "Whitehead", "Wilkins", "Wilkinson", "Williams", "Williamson", "Willis",
  "Wills", "Wilson", "Winter", "Wise", "Wood", "Woods", "Wright", "Yates", "Young"
];