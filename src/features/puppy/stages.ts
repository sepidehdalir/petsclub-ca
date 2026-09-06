import { MAX_PLAUSIBLE_DAYS } from "@/features/puppy/age";
import type {
  BreedModifier,
  ProvinceModifier,
  PuppyStage,
  SeasonModifier,
  SizeGroupModifier,
} from "@/features/puppy/model";

/**
 * The Puppy Journey stage registry.
 *
 * One stage is implemented. That is deliberate: the milestone is a proof of
 * architecture, and a second stage written before the first has been reviewed
 * would double the correction cost of anything the first gets wrong.
 *
 * `roadmapStages` below carries the shape of the rest so the timeline can show
 * where a reader sits without pretending those pages exist. It is a hybrid
 * model — weekly, then monthly, then milestone ranges — for reasons set out
 * above the roadmap itself.
 */

export const elevenWeeks: PuppyStage = {
  slug: "11-weeks",
  ageMinDays: 77,
  ageMaxDays: 83,
  label: "11 weeks",
  title: "Your 11-Week-Old Puppy",
  deck:
    "A fortnight past the front door and deep in the window that closes soonest. What matters this week, what can wait, and the questions worth taking to the clinic.",
  metaDescription:
    "What matters at 11 weeks: the socialisation window, house-training, the second vaccine appointment, and what to ask your veterinarian.",
  mediaId: "puppy-eleven-weeks",
  mediaAlt:
    "A pale Labrador puppy sitting on a tiled floor, looking up — around the age this stage covers.",
  reviewBy: "2027-09-01",
  status: "in-review",

  sections: [
    {
      id: "this-week",
      title: "This week",
      summary: "Socialisation is the priority. Everything else can move around it.",
      body: [
        "Eleven weeks sits in an awkward and important place. Your puppy has been home two or three weeks, the novelty has worn off for everyone, and the sleep deprivation is usually at its worst. It is also the middle of the only developmental window that closes on a deadline.",
        "If you do one thing well this week, make it careful, low-intensity exposure to the world. House-training, chewing and lead work all improve with time and repetition. The socialisation window does not wait, and it will be largely shut before the vaccination series finishes.",
      ],
      points: [
        "Socialisation is the priority, and quality matters far more than quantity.",
        "Expect a second vaccine appointment around now — and ask when the series actually finishes.",
        "House-training is a schedule, not a lesson. Accidents at this age are normal.",
        "Biting is developmentally normal. Most spectacular biting is an overtired puppy.",
        "Alone-time practice happens daily, in seconds and minutes, before you need it.",
      ],
    },
    {
      id: "development",
      title: "Development",
      summary: "Physically capable, emotionally unfinished, and sleeping more than you think.",
      body: [
        "An eleven-week-old puppy is coordinated enough to get into genuine trouble and nowhere near old enough to make good decisions about it. Bladder capacity is still small, attention spans run in seconds rather than minutes, and the brain is doing most of its work asleep.",
        "This is also when many owners first notice a puppy hesitating at something it walked past cheerfully a week ago. Wariness appearing where there was none is a normal part of development rather than a sign anything has gone wrong. The response is more distance and less intensity, never more insistence.",
      ],
      guide: {
        slug: "bringing-home-a-puppy-first-30-days",
        label: "The first thirty days, week by week",
      },
    },
    {
      id: "training",
      title: "Training",
      summary: "Four things, five minutes at a time, several times a day.",
      body: [
        "Keep the list short. At this age, sessions of two to five minutes several times a day beat anything longer, and the goal is a puppy that finds training worth joining in with.",
      ],
      points: [
        "Name response: say the name, puppy looks, food appears. This becomes the recall you rely on for a decade.",
        "Being alone: seconds at first, built daily, long before you need to leave for real.",
        "Handling: paws, ears, mouth, collar, two minutes a day. Every vet and grooming visit for years is easier for it.",
        "Settling: rewarding the puppy for lying down and doing nothing is training, and it is the most under-practised thing on this list.",
      ],
      guide: {
        slug: "crate-training-a-puppy-in-canada",
        label: "Crate training, and why it is the same project as alone-time",
      },
    },
    {
      id: "socialisation",
      title: "Socialisation",
      summary: "The window is the first three months. It closes before the needles do.",
      body: [
        "The American Veterinary Society of Animal Behavior puts the primary socialisation period at the first three months of life, and holds that puppies should be socialised before they are fully vaccinated — on the reasoning that behavioural problems, not infectious disease, are the leading cause of death in dogs under three years old.",
        "So the question at eleven weeks is not whether to socialise but how to do it at low infection risk. Carry the puppy in busy places. Sit on a bench outside a shop. Use the car as a viewing platform with the doors open. Visit homes whose dogs you know are healthy and vaccinated.",
        "The measure of a good exposure is the puppy, not the tally. A puppy that will take food is under threshold and learning. A puppy that will not is over it, and the answer is always more distance rather than more exposure.",
      ],
      points: [
        "Cover categories rather than counting encounters — surfaces, sounds and handling get missed while people and dogs get overdone.",
        "Let the puppy choose the distance. Retreat is information, not failure.",
        "End while it is still going well. The last thing that happens is what gets remembered.",
        "Worth waiting on: dog parks, pet shop floors, and communal grass where many unknown dogs pass through.",
      ],
      guide: {
        slug: "puppy-socialisation-checklist",
        label: "What to actually expose a puppy to",
      },
    },
    {
      id: "feeding",
      title: "Feeding",
      summary: "Several small meals, the food it arrived on, changes made slowly.",
      body: [
        "Most puppies this age are on three or four meals a day. How much and how often is genuinely a question for your veterinarian rather than a chart, because it changes fast at this stage and depends on the food.",
        "Keep feeding whatever the puppy arrived eating unless there is a reason to change. If you do change, transition over at least a week by mixing increasing amounts of the new food in — an abrupt switch is a reliable way to produce a week of diarrhoea.",
      ],
      guide: {
        slug: "reading-a-canadian-pet-food-label",
        label: "What the label does and does not tell you",
      },
    },
    {
      id: "sleep",
      title: "Sleep",
      summary: "Far more than owners expect, and enforced rather than hoped for.",
      body: [
        "Puppies at this age sleep a great deal, and most will not take that sleep voluntarily in a busy room. A large share of what looks like a badly behaved puppy in the late afternoon is simply an overtired one.",
        "Enforced naps — crate or pen, door shut, somewhere quiet — are one of the highest-yield things available to you. Nights usually still involve a trip outside, kept boring and wordless, and those drop away over the coming weeks rather than on a particular day.",
      ],
    },
    {
      id: "teething",
      title: "Teething",
      summary: "Beginning around now. Manage it rather than train it away.",
      body: [
        "Adult teeth start moving through in the coming weeks, and chewing increases with them. This is not a behaviour problem and it does not respond to being told off.",
        "Provide things that are legal to chew, rotate them so they stay interesting, and manage the environment so the illegal options are not available. A frozen stuffed toy is genuinely useful at this age.",
        "Mouthing skin is separate and worth handling now: when teeth land on you, the fun stops for a moment — hands still, attention off, no drama — and then redirect onto something appropriate.",
      ],
    },
    {
      id: "grooming",
      title: "Grooming",
      summary: "Practice, not maintenance. You are training tolerance, not cleaning a dog.",
      body: [
        "There is very little to actually groom at eleven weeks, which is exactly why it is the right time. Brush for thirty seconds. Touch the feet. Hold a paw as though clipping a nail and give it back. Let the puppy hear clippers running without being clipped.",
        "A puppy that finds handling unremarkable becomes a dog that can be examined, brushed and treated without a fight for the next decade or more.",
      ],
    },
    {
      id: "exercise",
      title: "Exercise and activity",
      summary: "Short, frequent, and less than you would guess.",
      body: [
        "The exercise a puppy needs at this age is mostly mental. Nose work, food scattered in a room, short training sessions and exploring new surfaces tire a puppy far more reliably than distance does.",
        "Formal walks should be short. Growth plates are open, and repetitive forced exercise — long runs, cycling alongside, extended stairs — is the thing to avoid rather than movement in general. Free play at the puppy's own pace, where it can stop when it wants to, is the safer shape.",
      ],
    },
    {
      id: "veterinary-care",
      title: "Veterinary care",
      summary: "Likely an appointment this week or next. Go with questions.",
      body: [
        "Most puppies have a vaccination appointment somewhere around now, and it is worth treating as more than an injection. Bring the records that came with the puppy, and ask what the plan is rather than accepting a card.",
        "If you have not settled on a practice yet, that is the more urgent job — a clinic that already holds the history is worth more than one that is marginally closer, and the after-hours answer matters more than anything on the website.",
      ],
      guide: {
        slug: "finding-a-veterinarian-in-canada",
        label: "Choosing a practice before you need one",
      },
    },
    {
      id: "vaccine-questions",
      title: "Questions to discuss with your veterinarian",
      summary: "There is no single schedule. These are the questions that get you the right one.",
      body: [
        "Vaccination guidance is set by your puppy's age, its individual risk, where you live, what it will do, the specific product, and your veterinarian's assessment. This is not a schedule, and no article can responsibly give you one. It is the set of questions that turns an appointment into a plan.",
      ],
      points: [
        "Where is this puppy in its series now, and when will the series actually finish?",
        "Which vaccines are core for this puppy, and which depend on where we live and what it will do?",
        "Given our area, do you recommend leptospirosis, Lyme or Bordetella?",
        "What are the rabies requirements here, and when will you give it?",
        "Where can I safely socialise before the series is complete?",
        "What should I watch for this afternoon, and what number do I call after hours?",
      ],
      guide: {
        slug: "puppy-vaccination-schedule-in-canada",
        label: "Why it is a series, and what core actually means",
      },
    },
    {
      id: "parasite-prevention",
      title: "Parasite prevention",
      summary: "Regional and seasonal. What your puppy needs depends on where you are.",
      body: [
        "This is one of the few areas of pet care where the correct answer genuinely differs between two Canadian cities, and where an American article will mislead you. Fleas, ticks and heartworm each have different geography and different timing.",
        "Bring specifics to the appointment: where you live, whether there is a cottage or a farm in the picture, and whether the dog will hike, swim or spend time in long grass.",
      ],
      guide: {
        slug: "parasite-prevention-for-pets-in-canada",
        label: "Region and season, and what actually drives the timing",
      },
    },
    {
      id: "safety",
      title: "Safety",
      summary: "A mobile puppy with poor judgement and a new set of teeth.",
      body: [
        "The hazards change at this age because the puppy can now reach things it could not a fortnight ago. Get down to floor level again and look properly.",
      ],
      points: [
        "Cables, cords and phone chargers, which become interesting the moment teething starts.",
        "Anything small enough to swallow. Intestinal obstruction from a swallowed object is a genuine emergency and a genuine expense.",
        "Cleaning products, medication, and anything in the cupboard under the sink.",
        "Houseplants, and any bouquet that arrives in the house.",
        "Stairs and furniture height, where a fall is likelier than an owner expects.",
        "The gap behind the washing machine, which is where puppies go.",
      ],
    },
    {
      id: "red-flags",
      title: "When to call a veterinarian",
      summary: "Very young animals have less reserve. The threshold for phoning is low.",
      tone: "caution",
      body: [
        "A puppy that seems unwell can deteriorate faster than an adult dog, so the bar for making a phone call is deliberately low at this age. Telephone triage is a normal part of what a clinic does, it usually costs nothing, and the answer is one of three things: come now, come in the morning, or here is what to watch for.",
        "Contact your veterinary clinic — rather than waiting to see whether it settles — if a puppy will not eat, is repeatedly vomiting or has persistent diarrhoea, is unusually limp or unresponsive, is breathing with effort, has not urinated in an unusually long stretch, is straining without producing anything, or you have any reason to think it has swallowed something it should not have. Very small breeds can also become weak or wobbly if they go too long without food.",
        "After a vaccination appointment, contact the clinic straight away if you see swelling of the face or muzzle, hives, repeated vomiting or diarrhoea, difficulty breathing, weakness or collapse. Tell them which vaccine was given and when.",
        "This describes what to look for so you know when to call. It does not diagnose, and it is not a substitute for examining your puppy — only a veterinarian who has seen it can do that.",
      ],
      guide: {
        slug: "emergency-vet-visits-in-canada",
        label: "The hour of preparation that decides how the worst night goes",
      },
    },
    {
      id: "whats-next",
      title: "What's next",
      summary: "The window narrows, the teeth arrive, and the series finishes later than you think.",
      body: [
        "Over the next few weeks the socialisation window closes, teething moves from beginning to obvious, and the vaccination series reaches the dose that carries most of the weight — which lands later than most owners expect, past sixteen weeks rather than at twelve.",
        "The other thing that arrives, usually without warning, is adolescence. It is further off than eleven weeks but it is worth knowing it is coming, because a dog that seems to forget everything it learned at six or seven months is developmentally normal rather than broken.",
      ],
    },
  ],

  checklist: [
    { id: "socialise", label: "Plan this week's socialisation deliberately", detail: "Cover a category you have been neglecting — surfaces, sounds or handling." },
    { id: "vet", label: "Book or attend the next veterinary appointment", detail: "Take the records, and take the questions." },
    { id: "alone", label: "Practise alone-time daily", detail: "Seconds, then minutes. Before you need to leave for real." },
    { id: "handling", label: "Two minutes of handling practice a day" },
    { id: "chew", label: "Rotate chew items and check what is reachable at floor level" },
    { id: "naps", label: "Enforce naps rather than hoping for them" },
    { id: "microchip", label: "Confirm the microchip registration is in your name", detail: "Implanting and registering are two separate steps, and the second is the one that gets missed." },
    { id: "licence", label: "Check whether your municipality licenses at this age" },
    { id: "emergency", label: "Write down your after-hours emergency destination" },
  ],

  sources: [
    {
      label: "Position statement on puppy socialization — the first three months, and socialising before full vaccination",
      publisher: "American Veterinary Society of Animal Behavior",
      url: "https://avsab.org/puppy-socialization-position-statement/",
    },
    {
      label: "2022 AAHA Canine Vaccination Guidelines",
      publisher: "American Animal Hospital Association",
      url: "https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/",
    },
    {
      label: "2024 Guidelines for the Vaccination of Dogs and Cats",
      publisher: "World Small Animal Veterinary Association",
      url: "https://wsava.org/wp-content/uploads/2024/05/2024-Guidelines-for-the-Vaccination-of-Dogs-and-Cats.pdf",
    },
  ],

  resources: [
    {
      label: "Your provincial or territorial veterinary regulator, and what it licenses",
      publisher: "Canadian Veterinary Medical Association",
      url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
    },
  ],

  needsVerification: [
    "The developmental description (bladder capacity, attention span, sleep requirement) is written qualitatively and quotes no figure. Attach a source before any number is added — the 16–18 hours figure carried in the article library is still unsourced there too.",
    "That a second period of wariness commonly appears around this age is described as normal development. Widely reported in behaviour literature; source it before publication.",
    "That three to four meals a day is typical at eleven weeks — stated as what most puppies are on rather than as a recommendation. Confirm against a veterinary nutrition source or soften further.",
    "Teething timing is given as 'the coming weeks' rather than a week number, deliberately. Do not make it specific without a source.",
    "The growth-plate reasoning behind limiting repetitive forced exercise is stated generally and names no age or distance rule. Attach a source before it is made more specific.",
    "No vaccination schedule appears anywhere in this stage, by design. The section is questions only. Do not let a future edit turn the question list into a timetable.",
  ],
};

export const stages: readonly PuppyStage[] = [elevenWeeks];

/* ------------------------------------------------------------- the roadmap */

/**
 * ## Why the roadmap is not a uniform grid of weeks
 *
 * The first version of this file stepped through puppyhood in weeks and then
 * gave up, lumping everything from five months to nine into a single bucket
 * labelled "6 months". Both halves of that were wrong, and wrong in opposite
 * directions.
 *
 * A puppy changes enormously between its eighth and twelfth weeks. The
 * socialisation window is closing, the vaccination series is mid-course,
 * house-training is being established, and the answer to "what should I be
 * doing" genuinely differs from one week to the next. A week is the right
 * unit there.
 *
 * By four months that has slowed. The difference between a sixteen-week-old
 * and a seventeen-week-old is not something anyone can write a distinct page
 * about without padding, and a reader who came back weekly would find the
 * same advice reworded. A month is the right unit.
 *
 * Through adolescence it slows again, and what matters stops being age at all
 * and starts being *events* — the second fear period, sexual maturity, growth
 * plates closing, the collapse of a recall that worked fine at six months.
 * Those do not land on a calendar, so the stages are ranges.
 *
 * So the cadence widens as development slows. That is the whole idea, and it
 * is a content decision before it is a data-modelling one.
 *
 * ## The rule about pages
 *
 * **A roadmap entry is not a page.** An entry exists so a reader can see
 * where they sit in a journey and where they are going. A *page* should exist
 * only where there is genuinely differentiated guidance and a distinct thing
 * a person is trying to find out — never because an interval elapsed. Thirteen
 * entries here must not become thirteen routes; `stages` stays a deliberate,
 * much shorter subset, and a test asserts that no route exists for a roadmap
 * slug that has not been written.
 */

/** How finely a phase is divided, and therefore what a stage in it means. */
export type StageCadence = "weekly" | "monthly" | "milestone" | "maturity";

export type JourneyPhaseId =
  | "early-puppy"
  | "early-development"
  | "adolescence"
  | "maturity";

export interface JourneyPhase {
  id: JourneyPhaseId;
  label: string;
  cadence: StageCadence;
  /** Shown under the phase label in the rail. One line, no hedging. */
  note: string;
}

export const journeyPhases: readonly JourneyPhase[] = [
  {
    id: "early-puppy",
    label: "Early puppy",
    cadence: "weekly",
    note: "Week by week, while things change that fast.",
  },
  {
    id: "early-development",
    label: "Early development",
    cadence: "monthly",
    note: "Month by month, once a week stops making a difference.",
  },
  {
    id: "adolescence",
    label: "Adolescence",
    cadence: "milestone",
    note: "By what happens, not by the calendar.",
  },
  {
    id: "maturity",
    label: "Maturity",
    cadence: "maturity",
    note: "When a dog stops being a puppy depends on how big it got.",
  },
];

export function findPhase(id: JourneyPhaseId): JourneyPhase {
  const phase = journeyPhases.find((p) => p.id === id);
  if (!phase) {
    throw new Error(`Unknown journey phase: ${id}`);
  }
  return phase;
}

/**
 * A point on the journey, whether or not it has been written.
 *
 * Day ranges are inclusive on both ends and must tile the span with no gap
 * and no overlap — a test enforces it, because a gap here is a reader who
 * resolves to nothing and a overlap is a reader who resolves to two things.
 *
 * Month boundaries use the mean calendar month of 30.44 days rather than
 * 4-week blocks, so "four months old" means what an owner means by it. The
 * weekly phase ends at day 90 and the monthly phase opens at day 91, which is
 * exactly thirteen weeks — the two schemes meet without a seam.
 */
export interface RoadmapStage {
  slug: string;
  label: string;
  phase: JourneyPhaseId;
  ageMinDays: number;
  ageMaxDays: number;
  /**
   * Whether this stage's boundary is genuinely a function of adult size.
   *
   * True only for maturity, where it is a real effect rather than a caveat: a
   * toy breed is structurally and behaviourally adult long before a giant
   * breed is. We do not yet have sourced per-size boundaries, so one
   * conservative boundary is used for everyone and this flag marks the place
   * where a size-aware answer belongs once it can be cited. It changes no
   * behaviour today, and it is deliberately not a promise to the reader.
   */
  boundaryVariesBySize?: true;
}

export const roadmapStages: readonly RoadmapStage[] = [
  // Early puppy — weekly. Starts at eight weeks because that is when most
  // puppies come home; anything earlier is the breeder's week, not the
  // owner's, and resolves to no stage rather than a guessed one.
  { slug: "8-weeks", label: "8 weeks", phase: "early-puppy", ageMinDays: 56, ageMaxDays: 62 },
  { slug: "9-weeks", label: "9 weeks", phase: "early-puppy", ageMinDays: 63, ageMaxDays: 69 },
  { slug: "10-weeks", label: "10 weeks", phase: "early-puppy", ageMinDays: 70, ageMaxDays: 76 },
  { slug: "11-weeks", label: "11 weeks", phase: "early-puppy", ageMinDays: 77, ageMaxDays: 83 },
  { slug: "12-weeks", label: "12 weeks", phase: "early-puppy", ageMinDays: 84, ageMaxDays: 90 },

  // Early development — monthly, on mean-calendar-month boundaries.
  { slug: "3-months", label: "3 months", phase: "early-development", ageMinDays: 91, ageMaxDays: 121 },
  { slug: "4-months", label: "4 months", phase: "early-development", ageMinDays: 122, ageMaxDays: 152 },
  { slug: "5-months", label: "5 months", phase: "early-development", ageMinDays: 153, ageMaxDays: 182 },
  { slug: "6-months", label: "6 months", phase: "early-development", ageMinDays: 183, ageMaxDays: 212 },

  // Adolescence — paired months, because the things that define this period
  // arrive on their own schedule and not on a monthly one.
  { slug: "7-8-months", label: "7–8 months", phase: "adolescence", ageMinDays: 213, ageMaxDays: 273 },
  { slug: "9-10-months", label: "9–10 months", phase: "adolescence", ageMinDays: 274, ageMaxDays: 334 },
  { slug: "11-12-months", label: "11–12 months", phase: "adolescence", ageMinDays: 335, ageMaxDays: 395 },

  // Maturity — the terminal entry, and the one whose boundary is a lie for
  // both ends of the size range. See `boundaryVariesBySize`.
  {
    slug: "young-adult",
    label: "Young adult",
    phase: "maturity",
    ageMinDays: 396,
    ageMaxDays: MAX_PLAUSIBLE_DAYS,
    boundaryVariesBySize: true,
  },
];

/** The roadmap grouped for rendering, phases in order, empty phases dropped. */
export function roadmapByPhase(): readonly { phase: JourneyPhase; stages: RoadmapStage[] }[] {
  return journeyPhases
    .map((phase) => ({
      phase,
      stages: roadmapStages.filter((stage) => stage.phase === phase.id),
    }))
    .filter((group) => group.stages.length > 0);
}

export function findStage(slug: string): PuppyStage | null {
  return stages.find((stage) => stage.slug === slug) ?? null;
}

/** The implemented stage covering an age in days, or `null`. */
export function stageForDays(days: number): PuppyStage | null {
  return stages.find((s) => days >= s.ageMinDays && days <= s.ageMaxDays) ?? null;
}

/** The roadmap entry covering an age, implemented or not. */
export function roadmapStageForDays(days: number): RoadmapStage | null {
  return roadmapStages.find((s) => days >= s.ageMinDays && days <= s.ageMaxDays) ?? null;
}

/* --------------------------------------------------------------- modifiers */

export const sizeGroupModifiers: readonly SizeGroupModifier[] = [
  {
    sizeGroup: "large",
    stageSlug: "11-weeks",
    sectionId: "exercise",
    body: [
      "A large-breed puppy has considerably more growing left to do than a small one, and it will finish later — which makes the restraint on repetitive forced exercise matter more here, not less. Free play and short exploratory walks are the right shape; distance running, cycling alongside and repeated stairs are the things to keep off the list for many months yet.",
    ],
  },
  {
    sizeGroup: "giant",
    stageSlug: "11-weeks",
    sectionId: "exercise",
    body: [
      "Giant breeds grow for longer than anything else and carry more weight while doing it. Everything said about limiting repetitive forced exercise applies for longer — well past the point at which the dog looks fully grown. Free play at the puppy's own pace remains the safest shape.",
    ],
  },
  {
    sizeGroup: "toy",
    stageSlug: "11-weeks",
    sectionId: "feeding",
    body: [
      "Very small puppies have little in reserve and can become weak or wobbly if they go too long between meals. Meal frequency is worth raising specifically at your next appointment rather than assuming a general schedule applies.",
    ],
  },
];

export const breedModifiers: readonly BreedModifier[] = [
  {
    breedSlug: "poodle",
    stageSlug: "11-weeks",
    sectionId: "grooming",
    body: [
      "A coat like this will need professional grooming for the whole of the dog's life, which makes the handling practice at this age unusually valuable. Book a first grooming appointment now — many groomers offer a short introductory visit with no full groom — so the first real one is not also the first time the puppy has been on a table.",
    ],
  },
  {
    breedSlug: "bernese-mountain-dog",
    stageSlug: "11-weeks",
    sectionId: "grooming",
    body: [
      "A heavy double coat is coming. Brushing now is about tolerance rather than tidiness, and starting before there is much to brush is the whole point.",
    ],
  },
  {
    breedSlug: "french-bulldog",
    stageSlug: "11-weeks",
    sectionId: "exercise",
    body: [
      "Flat-faced breeds cool themselves less effectively than others, because panting is how a dog sheds heat and a shortened airway does it less well. That changes warm-weather planning specifically: exercise at the ends of the day, keep sessions short, and treat heat as a more serious constraint than you would for another breed.",
    ],
  },
];

/**
 * Province modifiers.
 *
 * Only two topics change the answer for an eleven-week-old puppy in a way that
 * is both verified and material, and both are rabies. Every other province
 * renders nothing here — which is the honest outcome and the point of the
 * design. Licensing thresholds are municipal rather than provincial, so they
 * are handled in the checklist and the licensing guide rather than pretended
 * to be a provincial fact.
 */
export const provinceModifiers: readonly ProvinceModifier[] = [
  {
    provinces: ["ON"],
    stageSlug: "11-weeks",
    sectionId: "vaccine-questions",
    heading: "In Ontario, rabies vaccination is a legal requirement",
    kind: "legal",
    body: [
      "Under Ontario's rabies immunization regulation, dogs, cats and ferrets over three months of age must be vaccinated against rabies — indoor animals included. Your puppy is approaching that threshold now.",
      "A first vaccination is followed by a booster within one year, and then every one to three years depending on the product used. There are fines for non-compliance. This is a legal obligation rather than a veterinary recommendation, and it is worth raising at your next appointment so the timing is planned rather than discovered.",
    ],
    sources: [
      {
        label: "Rabies and your pets — the provincial vaccination requirement",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/page/rabies-pets",
      },
    ],
  },
  {
    provinces: ["BC"],
    stageSlug: "11-weeks",
    sectionId: "vaccine-questions",
    heading: "In British Columbia, rabies vaccination is recommended rather than required",
    kind: "guidance",
    body: [
      "The BC Centre for Disease Control recommends rabies vaccination for pets; provincial law does not compel it. That is a genuine difference from provinces such as Ontario, where it is a legal requirement — and it is the reason advice written for one province does not transfer to another.",
      "Recommended is not the same as optional. Rabies also comes up when boarding, when travelling, and if a dog is ever exposed or involved in a bite incident, so it is worth an explicit conversation rather than an assumption.",
    ],
    sources: [
      {
        label: "Rabies — vaccination is recommended in British Columbia, not legally required",
        publisher: "BC Centre for Disease Control",
        url: "https://www.bccdc.ca/health-info/diseases-conditions/rabies",
      },
    ],
  },
];

/**
 * Seasonal modifiers.
 *
 * Two seasons genuinely change what an eleven-week-old puppy's week looks
 * like. Spring and autumn do not, and get nothing rather than an adjective.
 */
export const seasonModifiers: readonly SeasonModifier[] = [
  {
    season: "winter",
    stageSlug: "11-weeks",
    sectionId: "this-week",
    heading: "A winter puppy",
    body: [
      "House-training in snow is a different job. Shovel and maintain a small toilet patch close to the door before the puppy needs it — a puppy in deep snow will not toilet, it will simply stand there — and dress to stand outside with it, because standing at the door in socks is how a trip gets cut short at exactly the wrong moment.",
      "Socialisation is harder in winter and needs compensating for deliberately. Fewer people are outdoors and nobody lingers, so invite visitors to you, use the car as a viewing platform, and do more sound work indoors. The upside is a category a summer puppy will not meet until it is much less flexible: snow, ice, salt, boots, shovels and people muffled to the eyes.",
    ],
    guide: { slug: "winter-dog-care-in-canada", label: "Winter care, paws and road salt" },
  },
  {
    season: "summer",
    stageSlug: "11-weeks",
    sectionId: "this-week",
    heading: "A summer puppy",
    body: [
      "Heat is the constraint this season rather than cold, and it is the more dangerous of the two because it gives less warning. Walk at the ends of the day, test pavement with the back of your hand before committing to a route, and never leave a puppy in a parked car for any length of time.",
      "The season also changes the parasite conversation. Tick and mosquito exposure is at its height, which makes the prevention discussion at your next appointment more immediate than it would be in February.",
    ],
    guide: { slug: "summer-heat-safety-for-dogs-in-canada", label: "Heat, pavement and wildfire smoke" },
  },
];
