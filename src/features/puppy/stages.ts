import type { PuppyAge } from "@/features/puppy/age";
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

export const nineToElevenWeeks: PuppyStage = {
  slug: "9-11-weeks",
  label: "9–11 weeks",
  title: "Your 9 to 11-Week-Old Puppy",
  deck:
    "Past the front door and deep in the window that closes soonest. What matters across these three weeks, what can wait, and the questions worth taking to the clinic.",
  metaDescription:
    "What matters between nine and eleven weeks: the socialisation window, house-training, the vaccine appointments, and what to ask your veterinarian.",
  mediaId: "puppy-eleven-weeks",
  mediaAlt:
    "A pale yellow Labrador puppy sitting on a tiled floor indoors, ears soft, looking up and slightly past the camera.",
  reviewBy: "2027-09-01",
  indexable: true,
  status: "in-review",

  sections: [
    {
      id: "this-week",
      title: "Where you are now",
      summary: "Socialisation is the priority. Everything else can move around it.",
      body: [
        "These three weeks sit in an awkward and important place. The puppy has been home a little while, the novelty has worn off for everyone, and the sleep deprivation is usually at its worst. This is also the middle of the only developmental window that closes on a deadline.",
        "One stage covers all three weeks because the advice genuinely does not change much between them, and we would rather say so than invent a difference. What changes is how much of it you have got through. If you do one thing well, make it careful, low-intensity exposure to the world — house-training, chewing and lead work all improve with time and repetition, and the socialisation window does not wait. It will be largely shut before the vaccination series finishes.",
      ],
      points: [
        "Socialisation is the priority, and quality matters far more than quantity.",
        "Expect a vaccine appointment somewhere in here — and ask when the series actually finishes.",
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
        "A puppy of this age is coordinated enough to get into genuine trouble and nowhere near old enough to make good decisions about it. Bladder capacity is still small, attention spans run in seconds rather than minutes, and the brain is doing most of its work asleep. Those things ease gradually across these three weeks rather than on any particular day.",
        "This is also the period when many owners first notice a puppy hesitating at something it walked past cheerfully a week earlier. What the evidence supports is narrower than the folklore around it: a puppy's readiness to approach something unfamiliar is highest very early \u2014 McEvoy and colleagues put the peak at roughly three to five weeks \u2014 and declines from there, which is the same shift that closes the socialisation window. The Merck Veterinary Manual describes attraction to unfamiliar people decreasing and avoidance responses becoming more pronounced from about twelve weeks. Neither is a stage with dates on it, and how much of it shows varies from puppy to puppy.",
        "So hesitation here is worth reading as the window narrowing rather than as something going wrong, and the response is more distance and less intensity, never more insistence. What is not ordinary is fear that arrives suddenly, keeps getting worse, or comes with a puppy that is off in itself \u2014 pain and illness can present as a behaviour change at any age. That is a call to your veterinarian, and where it persists, to a qualified behaviour professional alongside them.",
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
        "So the question at this age is not whether to socialise but how to do it at low infection risk. Carry the puppy in busy places. Sit on a bench outside a shop. Use the car as a viewing platform with the doors open. Visit homes whose dogs you know are healthy and vaccinated.",
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
      title: "Chewing and mouthing",
      summary: "Constant, sharp, and not a behaviour problem. Manage it rather than train it away.",
      body: [
        "A puppy this age explores with its mouth and chews a great deal, and the deciduous teeth it is doing it with are needle-sharp. That is not teething — the permanent teeth are still months away — and it is not disobedience either. It does not respond to being told off.",
        "Provide things that are legal to chew, rotate them so they stay interesting, and manage the environment so the illegal options are not available. A frozen stuffed toy is genuinely useful at this age.",
        "Mouthing skin is separate and worth handling now: when teeth land on you, the fun stops for a moment — hands still, attention off, no drama — and then redirect onto something appropriate.",
      ],
    },
    {
      id: "grooming",
      title: "Grooming",
      summary: "Practice, not maintenance. You are training tolerance, not cleaning a dog.",
      body: [
        "There is very little to actually groom at this age, which is exactly why it is the right time. Brush for thirty seconds. Touch the feet. Hold a paw as though clipping a nail and give it back. Let the puppy hear clippers running without being clipped.",
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
        "Most puppies have at least one vaccination appointment somewhere in these three weeks, and it is worth treating as more than an injection. Bring the records that came with the puppy, and ask what the plan is rather than accepting a card.",
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
      summary: "A puppy can dehydrate faster than an adult dog. The threshold for phoning is low.",
      tone: "caution",
      body: [
        "A puppy needs proportionally more fluid than an adult dog and can move from mild dehydration to something more serious faster, so anything draining fluid or stopping a puppy eating \u2014 repeated vomiting, persistent diarrhoea, refusing meals \u2014 is worth a call sooner than the same thing would be in an adult. That, rather than any general rule that young dogs are frailer, is why the bar for making a phone call is deliberately low at this age. Telephone triage is a normal part of what a clinic does, it usually costs nothing, and the answer is one of three things: come now, come in the morning, or here is what to watch for.",
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
        "At twelve weeks the socialisation window closes and the vaccination series reaches the dose that carries most of the weight — which lands later than most owners expect, past sixteen weeks rather than at twelve. Many owners are told at an appointment around twelve weeks that the puppy is finished. It is not.",
        "The other thing that arrives, usually without warning, is adolescence. It is a long way from here but it is worth knowing it is coming, because a dog that seems to forget everything it learned at six or seven months is developmentally normal rather than broken.",
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
      label: "Pediatric patients need proportionally more fluid than adults and can progress rapidly from mild dehydration to hypovolaemia; hypoglycaemia and electrolyte disturbance are the companion concerns",
      publisher: "Lee JA, Cohn LA, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017 (PMID 27939859)",
      url: "https://doi.org/10.1016/j.cvsm.2016.09.010",
    },
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
    {
      label: "Dental development of dogs — permanent teeth appear at around four to five months, complete by about seven",
      publisher: "Merck Veterinary Manual",
      url: "https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/dental-development-of-dogs",
    },
    {
      label:
        "Canine Socialisation: A Narrative Systematic Review \u2014 the tendency to approach unfamiliar stimuli peaks at about three to five weeks and declines thereafter",
      publisher: "McEvoy, Baqueiro Espinosa, Crump and Arnott, Animals (2022)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9655304/",
    },
    {
      label:
        "Social behaviour of dogs \u2014 through the juvenile period, attraction to unfamiliar people decreases and avoidance responses are heightened",
      publisher: "Merck Veterinary Manual",
      url: "https://www.merckvetmanual.com/behavior/behavior-of-dogs/social-behavior-of-dogs",
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
    "RESOLVED \u2014 NARROWED, 2026-09-06. This stage previously said a young dog \u201chas less reserve than an adult and can deteriorate faster\u201d (and equivalents). No source was found for that as a general physiological claim and it is no longer asserted. What replaced it is the one mechanism that is sourced: Lee JA and Cohn LA, \u201cFluid Therapy for Pediatric Patients\u201d, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017, PMID 27939859, verified 2026-09-06, which states that \u201cpediatric patients have a higher fluid requirement compared with adults and can rapidly progress from mild dehydration to hypovolemia\u201d and that pediatric fluid therapy \u201cmust address hydration, vascular fluid volume, electrolyte disturbances, or hypoglycemia\u201d. Hoskins JD, PMID 10390787, anchors the pediatric window at birth to about six months, which covers every stage carrying this wording. LIMITATION \u2014 fluid and glucose only, not reserve across every organ system, and not a claim that illness in general progresses faster. The red-flag list and the threshold for phoning are unchanged; only the explanation is.",
    "STANDING GUARDRAIL \u2014 Do not generalise pediatric dehydration/metabolic evidence into a blanket claim that young dogs have lower physiological reserve across all illness or deteriorate faster in every emergency. The claim is licensed for fluid loss and, as a named veterinary concern, hypoglycaemia \u2014 nothing wider.",
    "STANDING GUARDRAIL \u2014 The neonatal evidence (Merck, Management of the Neonate in Dogs and Cats: first 21 days, no thermoregulation until four weeks, absent glucose reserves and minimal gluconeogenesis) must NOT be applied to these stages. Every Journey stage begins at eight weeks or later, well past the neonatal period. Do not introduce immature thermoregulation, neonatal glucose reserves or neonatal fasting physiology into any stage.",
    "British Columbia is a *positive* claim only, as of 2026-09-06. The BCCDC page was read and says verbatim that rabies vaccines are available for cats, dogs and ferrets and that \u201cyour pets should be vaccinated, and their immunizations should be kept up to date\u201d. The earlier copy went further and said provincial law does not compel vaccination \u2014 a negative legal claim, and no authoritative source could be found that states it. Proving the absence of a law is a different exercise from reading one, and the BCCDC page, the BC Rabies Guidance for Veterinarians and the CVBC summary table were all retrieved and none of them says it. The copy now states what BCCDC recommends, says plainly that we are not presenting a province-wide legal requirement, and explicitly leaves municipal, travel, import and bite-investigation rules open. Do not restore the stronger wording without a named statute or regulation.",
    "The developmental description (bladder capacity, attention span, sleep requirement) is written qualitatively and quotes no figure. Attach a source before any number is added — the 16–18 hours figure carried in the article library is still unsourced there too.",
    "The wariness claim was rewritten and sourced on 2026-09-06. The unsourced version said new wariness in this window is 'a normal part of development'; nothing found supports that as a claim about nine to eleven weeks specifically. What is sourced is the trajectory: McEvoy et al. 2022 put the peak tendency to approach novelty at three to five weeks with a decline after it, and Merck places heightened avoidance from about twelve weeks. Both are attributed, both are framed as a gradual shift rather than a stage, individual variation is stated, and a physical cause is named. No fear-period or fear-stage language appears, and none may be added \u2014 the differentiation gate found no peer-reviewed basis for one at any age.",
    "That three to four meals a day is typical at this age — stated as what most puppies are on rather than as a recommendation. Confirm against a veterinary nutrition source or soften further.",
    "This stage deliberately makes no claim about permanent teeth. Merck places the start of permanent eruption at around four to five months, so at nine to eleven weeks a puppy is chewing with its deciduous teeth and nothing is being replaced. Do not reintroduce eruption language here.",
    "The growth-plate reasoning behind limiting repetitive forced exercise is stated generally and names no age or distance rule. Attach a source before it is made more specific.",
    "No vaccination schedule appears anywhere in this stage, by design. The section is questions only. Do not let a future edit turn the question list into a timetable.",
    "This stage covers three weeks because the differentiation gate found no sourceable developmental difference between them. If one is later found, it belongs in this register before it appears in the prose.",
  ],
};


/**
 * Twelve weeks.
 *
 * The differentiation gate approved this stage on one argument, and the page
 * has to earn it: twelve weeks is where owners are widely told the puppy is
 * finished, and it is not. The appointment that often lands around now reads
 * like a finish line. The primary series usually is not over, the
 * socialisation window is closing rather than open, and the teeth are about
 * to become the dominant fact of everyone's life.
 *
 * So the spine of this stage is a correction, not a continuation. Where the
 * 9–11 week stage says *the window is open, get going*, this one says *time
 * is short, and you are not as protected as you have been told*. Sections that
 * would only restate the previous stage are shorter here, or absent.
 */
export const twelveWeeks: PuppyStage = {
  slug: "12-weeks",
  label: "12 weeks",
  title: "Your 12-Week-Old Puppy",
  deck:
    "The week a lot of owners are told the puppy is finished. The series usually is not over, the socialisation window is closing rather than open, and the chewing is getting worse before it gets better.",
  metaDescription:
    "What matters at 12 weeks: why your puppy is probably not fully vaccinated yet, what socialisation is left, teething, first walks, and what to ask your veterinarian.",
  mediaId: "puppy-twelve-weeks",
  mediaAlt:
    "A husky-type puppy in a plain harness sitting on a paved street, lead slack, looking straight at the camera.",
  reviewBy: "2027-09-01",
  indexable: true,
  status: "in-review",

  sections: [
    {
      id: "this-week",
      title: "Where you are now",
      summary: "Your puppy feels finished. It is not, and this is the week that matters most.",
      body: [
        "Something changes for owners at twelve weeks. The puppy sleeps through more of the night, has fewer accidents, looks less like a toy and more like a dog, and often has an appointment around now that feels conclusive. A great many people leave that appointment believing the job is done.",
        "It is the opposite. Twelve weeks is the point at which two clocks run out at once. The socialisation window is closing rather than open, and the vaccination series — for most puppies — is not finished and will not be for several more weeks. Those two facts pull in opposite directions, which is exactly why this age needs thinking about rather than coasting through.",
      ],
      points: [
        "A vaccine appointment around twelve weeks is very rarely the last one.",
        "The socialisation window is closing. What has not been covered by now is harder to cover later.",
        "Chewing gets heavier. It is a physical need, not a training problem.",
        "Short lead walks usually become reasonable around now — short being the operative word.",
        "Confidence is arriving faster than judgement. Both are normal; only one is useful.",
      ],
      guide: {
        slug: "pet-licensing-across-canada",
        label: "Municipal licensing, and the age it usually starts",
      },
    },
    {
      id: "development",
      title: "Development",
      summary: "Confident, coordinated, and not yet resilient. Those are three different things.",
      body: [
        "A twelve-week-old is a noticeably more capable animal than it was three weeks ago. It can climb what it could not climb, hold attention for slightly longer, and go longer between toilet trips. Owners respond to that by treating it more like a small dog and less like an infant, which is reasonable and also where the trouble starts.",
        "Confidence at this age runs ahead of resilience. A puppy that marches up to something startling is not necessarily coping with it; it may simply not have learned yet that it could go badly. The gap between the two is why a bad experience now — a dog that pins it, a child that will not let go, a slippery vet table — lands harder than the same experience would at six months. Bold and robust are not synonyms.",
      ],
    },
    {
      id: "training",
      title: "Training",
      summary: "The same short sessions, with real progression in what they contain.",
      body: [
        "The format does not change: a few minutes at a time, several times a day, ending while the puppy still wants more. What changes is what goes into them. At nine weeks the job was to establish that training happens at all. At twelve, four things are worth building deliberately.",
      ],
      points: [
        "Name response with something else going on. Not a busy street — the other end of your own kitchen while someone is cooking. Adding a little competition now is what makes it hold up later.",
        "Recall as a game, never a command. Run away and let the puppy chase you. Pay it enormously every single time. Do not use the word when you cannot make it happen, and do not use it to end anything fun.",
        "Lead work at home first. A harness, a slack lead, and a hallway. Reward the position you want rather than correcting the one you do not. The street is the exam, not the lesson.",
        "Settling on a mat, on cue, while life happens around it. This is the single most useful thing you can teach an adolescent dog, and it is far easier to teach now.",
      ],
      guide: {
        slug: "loose-leash-walking-and-recall",
        label: "Lead work and recall, built properly",
      },
    },
    {
      id: "socialisation",
      title: "Socialisation",
      summary: "The window is closing. What is left is triage, and quality decides it.",
      body: [
        "The American Veterinary Society of Animal Behavior places the primary socialisation period in the first three months of life. Twelve weeks is the end of that, not the middle. This is the last stretch in which new experiences land as cheaply as they ever will, and the honest framing is triage: what has this puppy not met yet, and which of those gaps will matter most.",
        "The instinct at this point is to do more. That is the wrong correction. An exposure the puppy cannot cope with does not bank a positive experience — it banks the opposite, and a single bad encounter at this age can outweigh a dozen good ones. More encounters at a distance the puppy can handle beats more encounters.",
        "It is also worth being precise about what socialisation is not. Standing a frightened puppy in a crowd is exposure, not socialisation. A dog park is not socialisation; it is a room full of strangers with no supervision and unknown vaccination status. The pet shop floor and the communal patch of grass by the building door carry the same problem — high traffic, unknown dogs, and a puppy whose series is not finished. Those are the shortcuts that look productive and are not.",
      ],
      points: [
        "Audit rather than tally. Surfaces, sounds, handling and being alone are the categories that get skipped while people and dogs get overdone.",
        "Novel surfaces are cheap and high-value: metal grates, wet grass, gravel, stairs, a wobbly board, a vet-clinic floor.",
        "Book a well-run puppy class rather than an informal meet-up. A class that requires proof of vaccination and supervises play is doing the risk management for you.",
        "Sit outside somewhere busy and feed the puppy while the world goes past. Watching is socialisation. Joining in is optional.",
        "Ask your veterinarian what the actual disease picture looks like where you live — parvovirus prevalence is local, and so is the right balance between risk and exposure.",
      ],
      guide: {
        slug: "puppy-socialisation-checklist",
        label: "What to actually expose a puppy to, and how to read the puppy",
      },
    },
    {
      id: "teething",
      title: "Chewing",
      summary: "This is the section that will matter most over the next month.",
      body: [
        "Chewing typically gets heavier from here, and it is worth being clear about what is and is not happening. The permanent teeth are not through yet — Merck puts the start of that at around four to five months — so what you are dealing with now is a puppy that investigates with its mouth and has a great deal of energy for it.",
        "Two things follow. First, chewing is not disobedience — a puppy cannot be trained out of a physical need. Manage the environment so the wrong options are not reachable, keep a rotation of things that are legal to chew so they stay interesting, and use cold: a wet flannel frozen into a twist, or a stuffed toy from the freezer, does more for a sore mouth than any correction.",
        "Second, mouthing you has to stop being funny. At nine weeks it was tolerable. At twelve it hurts, at six months it will do damage, and the household that laughed at it will be the one asking why the dog still does it. When teeth land on skin, everything stops — hands still, attention off, no drama — and then a legal chew appears.",
        "On what to give: hardness is worth asking your veterinarian about directly. Chews that do not give at all are a common cause of fractured teeth, and \u201cnatural\u201d is not the same as safe.",
      ],
      guide: {
        slug: "dental-care-for-dogs-and-cats",
        label: "The mouth you are going to be looking after for a decade",
      },
    },
    {
      id: "feeding",
      title: "Feeding",
      summary: "Usually one fewer meal, and a question that arrives too early.",
      body: [
        "Most puppies move from four meals a day to three somewhere in this period. How and when is a question for your veterinarian rather than a chart — it depends on the food, the breed and the individual animal.",
        "Two things commonly surprise owners here. Appetite can dip while teething, which is usually unremarkable on its own and worth a phone call if it lasts or comes with anything else. And the question of when to move to adult food arrives far earlier than the answer: growth finishes much later in a large dog than a small one, and switching early is a genuine risk rather than a saving. Ask rather than guess.",
      ],
      guide: {
        slug: "reading-a-canadian-pet-food-label",
        label: "What the label does and does not tell you",
      },
    },
    {
      id: "sleep",
      title: "Sleep",
      summary: "Nights are consolidating. The daytime nap still has to be enforced.",
      body: [
        "Most puppies are sleeping longer stretches at night by now, and the small-hours toilet trip is on its way out — gradually, and not on a particular date. Keep those trips boring and wordless for as long as they last.",
        "Daytime is where owners relax too early. A twelve-week-old still needs a great deal of sleep and still will not take it voluntarily in a busy room. The difference is that overtiredness has started to look like defiance rather than chaos: a puppy that ignores you, grabs at clothing and cannot settle at five in the afternoon is usually not being difficult, it is exhausted.",
      ],
      guide: {
        slug: "crate-training-a-puppy-in-canada",
        label: "Using a crate for rest rather than containment",
      },
    },
    {
      id: "grooming",
      title: "Grooming",
      summary: "Short, but this is when the first professional appointment gets booked.",
      body: [
        "Keep the two-minute handling practice going — feet, ears, mouth, collar — because it is still the cheapest investment available. What is new at twelve weeks is that for many coats this is when the first professional appointment should be arranged, and it should be booked as an introduction rather than a haircut: a short, positive visit that ends before anything goes wrong.",
      ],
    },
    {
      id: "exercise",
      title: "Exercise and activity",
      summary: "Yes to walks. Short ones, led by the nose rather than the distance.",
      body: [
        "\u201cCan we go for walks now\u201d is the question of this age, and the answer is a qualified yes once your veterinarian is content with where the puppy is in its series and where you plan to go. But a walk at twelve weeks is not the walk you have in mind. Ten minutes of sniffing one hedge is a better outing than a kilometre of pavement, and it will tire the puppy more.",
        "The constraint worth understanding is repetition rather than movement. Growth plates are open, and it is repetitive forced exercise — jogging alongside you, cycling, long stair sessions, throwing a ball until the puppy drops — that is worth avoiding. Free movement at the puppy's own pace, where it can stop when it wants to, is a different thing entirely and is good for it.",
        "Mental work is still doing most of the tiring. Scatter feeding, a rolled towel with kibble in it, and five minutes of training will empty a puppy more reliably than distance ever will.",
      ],
    },
    {
      id: "veterinary-care",
      title: "Veterinary care",
      summary: "Go with the record and a list. This appointment sets up the next two months.",
      body: [
        "There is usually an appointment around now, and the useful version of it is a conversation rather than an injection. Take the record that came with the puppy and everything since — dates, products, batch numbers if you have them — because the plan from here depends on what has actually been given and when.",
        "It is also the appointment at which to raise the administrative things that cluster at three months: whether your municipality licenses at this age, whether the microchip registration is genuinely in your name, and what the practice's after-hours arrangement is. None of those are interesting until the evening you need them."
      ],
      guide: {
        slug: "finding-a-veterinarian-in-canada",
        label: "Choosing a practice before you need one",
      },
    },
    {
      id: "vaccine-questions",
      title: "Questions to discuss with your veterinarian at 12 weeks",
      summary: "Why twelve weeks almost never means finished, and what to ask instead.",
      tone: "caution",
      body: [
        "This is the misunderstanding this stage exists to correct, so it is worth being exact about the reasoning rather than just asserting the conclusion.",
        "A puppy is born with antibodies from its mother. They protect it early on and, at the same time, block a vaccine from taking effect. They fade — but on a schedule that varies between litters and between puppies in one litter, and that nobody can see from the outside. That is why the puppy series is a series: not one dose repeated for emphasis, but a set of attempts spaced a few weeks apart so that whenever the window opens for that individual animal, a dose lands in it.",
        "The consequence is that the last dose is the one carrying most of the weight, and it comes later than most people expect. The American Animal Hospital Association recommends continuing the series until the puppy is older than sixteen weeks, and prefers eighteen to twenty weeks where distemper or parvovirus risk is high. The World Small Animal Veterinary Association puts the final dose at sixteen weeks or older. On either reading, a dose given at twelve weeks is a step in the series rather than the end of it.",
        "What that does not mean is that there is a schedule this page can hand you. Which vaccines, at what spacing, and when the series ends depends on what your puppy has already had, where you live, what it will do, the specific products your clinic uses, and your veterinarian's assessment of the animal in front of them. That is a plan, and only they can write it. What follows is how to come away with one.",
      ],
      points: [
        "Where exactly is my puppy in its series, and how many doses are left?",
        "On what date will the series actually be complete — and what should I do differently until then?",
        "Which vaccines are core for this puppy, and which depend on where we live and what it will do?",
        "Given our area, do you recommend leptospirosis, Lyme or Bordetella?",
        "What are the rabies requirements where we live, and when will you give it?",
        "Do you follow the newer advice for a further dose at around six months, or the twelve-month booster?",
        "Where can I safely socialise between now and the end of the series?",
        "What should I watch for this afternoon, and what number do I call after hours?",
      ],
      guide: {
        slug: "puppy-vaccination-schedule-in-canada",
        label: "Why it is a series, what core means, and how the provinces differ",
      },
    },
    {
      id: "parasite-prevention",
      title: "Parasite prevention",
      summary: "Now a full-season plan rather than a first conversation.",
      body: [
        "Many preventive products carry a minimum age or weight, and a twelve-week-old has often just crossed one or both — which is why this conversation tends to become concrete at this appointment rather than the last one. It is also the point at which the puppy starts genuinely going outside, so the exposure being planned for is real rather than hypothetical.",
        "Two things are worth settling now rather than in June. Heartworm prevention is seasonal in most of Canada and the start date is set by the local mosquito season, not by the calendar month you happened to ask. And tick season is longer than most people assume at both ends — it does not begin in summer, and it does not end with the first frost. Ask what the season looks like where you actually live, and get the start and stop dates written on the record.",
      ],
      guide: {
        slug: "parasite-prevention-for-pets-in-canada",
        label: "Region and season, and what actually drives the timing",
      },
    },
    {
      id: "safety",
      title: "Safety",
      summary: "The teeth change the hazard list, and the front door becomes one.",
      body: [
        "Two things shift at twelve weeks. Chewing escalates, which makes swallowing something the most likely serious accident of the next few months. And the puppy starts going out, which introduces hazards that were not on the list at all a fortnight ago.",
      ],
      points: [
        "Anything small enough to swallow, now that everything goes in the mouth. Intestinal obstruction is a genuine emergency and a genuine expense — socks, corn cobs, stones, string and the stuffing out of a toy are the usual culprits.",
        "Cables and cords, which become far more interesting once the gums are sore.",
        "The front door and the car door. A puppy that is confident enough to go out is confident enough to bolt, and this is the age at which the first escape usually happens.",
        "Car travel itself: a puppy loose in a footwell is a hazard to itself and to the driver.",
        "Stairs and furniture, where the puppy is now bold enough to jump down from things it should not.",
        "Anything toxic within reach of a taller, more determined animal than you had last month.",
      ],
    },
    {
      id: "red-flags",
      title: "When to call a veterinarian",
      summary: "The threshold stays low, and two new things belong on the list.",
      tone: "caution",
      body: [
        "A puppy needs proportionally more fluid than an adult dog and can move from mild dehydration to something more serious faster, so repeated vomiting, persistent diarrhoea or a refusal to eat earns a call sooner than it would in a grown dog. That is what keeps the bar for making a phone call deliberately low \u2014 not a broader claim that everything is more dangerous in a young dog. Telephone triage is a normal part of what a clinic does, it usually costs nothing, and the answer is one of three things: come now, come in the morning, or here is what to watch for.",
        "Contact your veterinary clinic — rather than waiting to see whether it settles — if a puppy will not eat, is repeatedly vomiting or has persistent diarrhoea, is unusually limp or unresponsive, is breathing with effort, has not urinated in an unusually long stretch, is straining without producing anything, or you have any reason to think it has swallowed something it should not have. Very small breeds can also become weak or wobbly if they go too long without food.",
        "Two things are more likely at this age specifically. If there is any chance a foreign object has been swallowed, that is a call rather than a wait-and-see, and it does not need to be accompanied by any other sign. And if the puppy is limping after a walk or a fall, or is reluctant to put weight on a leg, have it looked at rather than resting it and hoping — a young skeleton is not a small adult one.",
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
      summary: "The series finishes, the window shuts, and a decision starts forming.",
      body: [
        "Between here and sixteen weeks the two clocks finish running. The socialisation window closes — after which new things are still learnable, but they cost more effort and more repetition — and the vaccination series reaches its final dose, which is the one that matters most and the point at which the risk calculation for where you go genuinely changes.",
        "After that, adolescence. It arrives around six or seven months and it is not a training failure: a dog that appears to forget everything it knew is doing something developmentally normal, and the work you put in now is what it comes back to on the other side.",
        "The other thing that starts forming in this period is the neutering conversation. It is not a decision for twelve weeks, and the timing has moved considerably in recent years — particularly for larger breeds — so it is worth knowing the shape of it well before anyone asks you for an answer.",
      ],
      guide: {
        slug: "spaying-and-neutering-in-canada",
        label: "Why the timing question has changed",
      },
    },
  ],

  checklist: [
    { id: "series", label: "Ask when the vaccination series actually finishes", detail: "Get a date, not a reassurance. It is very rarely today." },
    { id: "audit", label: "Audit socialisation rather than counting it", detail: "List what has been missed — surfaces, sounds, handling — and plan the gaps." },
    { id: "class", label: "Look into a well-run puppy class", detail: "One that checks vaccination records and supervises play." },
    { id: "chews", label: "Set up the chew rotation before you need it", detail: "Including something from the freezer." },
    { id: "walks", label: "Start short lead walks, led by the nose" },
    { id: "recall", label: "Play recall daily, and never use the word to end fun" },
    { id: "settle", label: "Teach settling on a mat while life goes on around it" },
    { id: "licence", label: "Check whether your municipality licenses at three months" },
    { id: "record", label: "Photograph the vaccination record and keep it somewhere you will find it" },
  ],

  sources: [
    {
      label: "Pediatric patients need proportionally more fluid than adults and can progress rapidly from mild dehydration to hypovolaemia; hypoglycaemia and electrolyte disturbance are the companion concerns",
      publisher: "Lee JA, Cohn LA, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017 (PMID 27939859)",
      url: "https://doi.org/10.1016/j.cvsm.2016.09.010",
    },
    {
      label: "Position statement on puppy socialization — the first three months, and socialising before full vaccination",
      publisher: "American Veterinary Society of Animal Behavior",
      url: "https://avsab.org/puppy-socialization-position-statement/",
    },
    {
      label: "2022 AAHA Canine Vaccination Guidelines — continuing the initial series past sixteen weeks",
      publisher: "American Animal Hospital Association",
      url: "https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/",
    },
    {
      label: "2024 Guidelines for the Vaccination of Dogs and Cats — final puppy dose at sixteen weeks or older",
      publisher: "World Small Animal Veterinary Association",
      url: "https://wsava.org/wp-content/uploads/2024/05/2024-Guidelines-for-the-Vaccination-of-Dogs-and-Cats.pdf",
    },
    {
      label: "Dental development of dogs — permanent teeth appear at around four to five months, complete by about seven",
      publisher: "Merck Veterinary Manual",
      url: "https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/dental-development-of-dogs",
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
    "RESOLVED \u2014 NARROWED, 2026-09-06. This stage previously said a young dog \u201chas less reserve than an adult and can deteriorate faster\u201d (and equivalents). No source was found for that as a general physiological claim and it is no longer asserted. What replaced it is the one mechanism that is sourced: Lee JA and Cohn LA, \u201cFluid Therapy for Pediatric Patients\u201d, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017, PMID 27939859, verified 2026-09-06, which states that \u201cpediatric patients have a higher fluid requirement compared with adults and can rapidly progress from mild dehydration to hypovolemia\u201d and that pediatric fluid therapy \u201cmust address hydration, vascular fluid volume, electrolyte disturbances, or hypoglycemia\u201d. Hoskins JD, PMID 10390787, anchors the pediatric window at birth to about six months, which covers every stage carrying this wording. LIMITATION \u2014 fluid and glucose only, not reserve across every organ system, and not a claim that illness in general progresses faster. The red-flag list and the threshold for phoning are unchanged; only the explanation is.",
    "STANDING GUARDRAIL \u2014 Do not generalise pediatric dehydration/metabolic evidence into a blanket claim that young dogs have lower physiological reserve across all illness or deteriorate faster in every emergency. The claim is licensed for fluid loss and, as a named veterinary concern, hypoglycaemia \u2014 nothing wider.",
    "STANDING GUARDRAIL \u2014 The neonatal evidence (Merck, Management of the Neonate in Dogs and Cats: first 21 days, no thermoregulation until four weeks, absent glucose reserves and minimal gluconeogenesis) must NOT be applied to these stages. Every Journey stage begins at eight weeks or later, well past the neonatal period. Do not introduce immature thermoregulation, neonatal glucose reserves or neonatal fasting physiology into any stage.",
    "British Columbia is a *positive* claim only, as of 2026-09-06. The BCCDC page was read and says verbatim that rabies vaccines are available for cats, dogs and ferrets and that \u201cyour pets should be vaccinated, and their immunizations should be kept up to date\u201d. The earlier copy went further and said provincial law does not compel vaccination \u2014 a negative legal claim, and no authoritative source could be found that states it. Proving the absence of a law is a different exercise from reading one, and the BCCDC page, the BC Rabies Guidance for Veterinarians and the CVBC summary table were all retrieved and none of them says it. The copy now states what BCCDC recommends, says plainly that we are not presenting a province-wide legal requirement, and explicitly leaves municipal, travel, import and bite-investigation rules open. Do not restore the stronger wording without a named statute or regulation.",
    "Ontario's threshold was verified against the primary regulation on 2026-09-06: R.R.O. 1990, Reg. 567 (Rabies Immunization) under the Health Protection and Promotion Act, consolidation period from 2023-07-01, last amendment O. Reg. 67/23. Section 1 reads \u201ca cat, dog or ferret three months of age or over\u201d, so the anniversary day itself is inside the duty and the resolver's `today >= anniversary` test is correct. The regulation defines the threshold in calendar months and nowhere in days, so nothing here converts it into one \u2014 twelve weeks is 84 days and three calendar months is never 84 days. Reimmunisation is s. 3 (by the date on the certificate) and s. 6 (i) and (l) (that date carries the product monograph interval); the \u201cwithin a year, then every one to three years\u201d shape and the fines warning are the province\u2019s plain-language guidance rather than the regulation, and are attributed as such. Re-check before publication if the currency date moves.",
    "The socialisation window closing around twelve weeks follows the AVSAB position statement's first-three-months framing and is sourced. Do not let a future edit turn 'closing' into a hard cut-off date — the statement does not say that.",
    "The final-dose ages (AAHA past sixteen weeks, preferring eighteen to twenty in high-risk settings; WSAVA sixteen weeks or older) are sourced and must stay attributed to the body that says them. This section must never become a schedule.",
    "The permanent teeth are explicitly described as not yet through, attributed to Merck. Chewing is described as getting heavier without a cause being asserted. Do not reintroduce a replacement or eruption claim at this age.",
    "That hard chews are a common cause of fractured teeth is stated qualitatively and directed to the veterinarian. Source it before it is made stronger or given examples.",
    "The move from four meals to three is stated as what most puppies do, not as a recommendation. Confirm against a veterinary nutrition source or soften further.",
    "That growth finishes later in large breeds, and that switching to adult food early carries risk, is stated generally with no age or weight. Attach a source before it is made specific.",
    "The growth-plate reasoning behind limiting repetitive forced exercise names no age, distance or rule, exactly as in the previous stage. Do not make it specific without a source.",
    "That heartworm prevention is seasonal in most of Canada and that tick activity extends beyond summer at both ends is stated qualitatively, with no months and no regions, and directs the reader to their own veterinarian. The linked parasite article carries the sourced detail; do not add dates here without one.",
    "That a first grooming appointment belongs around this age is a practice convention rather than a sourced claim. It is framed as an introduction rather than a requirement; keep it that way or source it.",
  ],
};


/**
 * Eight weeks.
 *
 * The arrival stage, with one framing constraint that shapes everything: it
 * must not assume the puppy came home today, or at all. Most do arrive around
 * this age; some arrive at ten weeks, some at four months, and a rescue puppy
 * may have an estimated birthday rather than a known one. So the page speaks
 * to *whoever is at eight weeks*, and says "if your puppy has just come home"
 * rather than "today you brought your puppy home".
 *
 * ## What this is not
 *
 * It is not a second copy of "Bringing Home a Puppy: The First 30 Days". That
 * article is a chronological plan for a month, read once, largely in advance.
 * This is decision support for the week you are in — and, more than any other
 * stage, a list of things *not* to do. The dominant error at eight weeks is
 * doing too much: changing the food, inviting everyone round, starting a
 * training programme, and reading a socialisation checklist on day two.
 *
 * Two things here appear nowhere else in the Journey: setting a baseline, so
 * that a change in a puppy you have known for four days is noticeable at all;
 * and auditing what the breeder or rescue actually handed over, which is a
 * different job from the paperwork checklist in the article.
 */
export const eightWeeks: PuppyStage = {
  slug: "8-weeks",
  label: "8 weeks",
  title: "Your 8-Week-Old Puppy",
  deck:
    "The week to do less than you think. What matters in the first days, what can wait weeks, and what not to change at all while a puppy is settling.",
  metaDescription:
    "What matters at 8 weeks: the first days home, toilet routine, sleep, keeping the food the same, booking the first vet visit, and what is normal while a puppy settles.",
  mediaId: "puppy-eight-weeks",
  mediaAlt:
    "A small, cream-coloured puppy in a plain collar lying settled in a soft bed indoors, with a pen panel just visible behind it.",
  reviewBy: "2027-09-01",
  indexable: true,
  status: "in-review",

  sections: [
    {
      id: "this-week",
      title: "Where you are now",
      summary: "Almost everything can wait. Four things cannot.",
      body: [
        "Eight weeks is the age most puppies come home, though not all — some arrive later, and a rescue puppy may have an estimated birthday rather than a known one. If yours has just arrived, this is the settling week. If it arrived a fortnight ago, or has not arrived yet, most of what follows still applies; it is written around the puppy's age rather than around a moving day.",
        "The single most useful thing to know is that you are not behind. Almost everything written about training a puppy starts later than this, and a week spent establishing safety, a toilet routine and enough sleep is not a week lost. It is the foundation the rest is built on, and skipping it is what makes the next month harder.",
      ],
      points: [
        "Safety first: a puppy this size can reach, swallow and fall further than you expect.",
        "A toilet routine on a clock, not on a hunch.",
        "Sleep, enforced rather than hoped for.",
        "The same food it was already eating, in the same amounts, for now.",
        "Everything else — obedience, walks, the socialisation programme — can wait a week or two without cost.",
      ],
    },
    {
      id: "first-days",
      title: "The first 24 to 72 hours",
      summary: "Make the world small. Then leave it small for a few days.",
      body: [
        "If the puppy has just arrived, the useful instinct is restraint. It has left its mother, its litter and the only place it has known, on the same day, and its capacity to take in anything new is spent. One or two rooms, the same few people, and a quiet evening will do more than anything you could actively teach.",
        "Two things are worth doing on the first day and they are both very small. Take the puppy to the toilet spot before it goes into the house, and start saying its name in exchange for food — a few times a day, no more. Everything else on any list you have read can begin later this week or next.",
        "The other thing to do in these days is watch. You are establishing what normal looks like for this particular animal: how much it eats, how it sleeps, how it moves, what its stools look like, how it behaves when it is tired. Nobody can tell you what is normal for your puppy, and in a week's time that baseline is the thing that makes a change noticeable.",
      ],
      points: [
        "Resist visitors for a few days. There will be plenty of time, and a queue of strangers is not socialisation.",
        "Some puppies eat nothing the first evening. Many are unsettled the first two nights. Both are common.",
        "Loose stools after a move are common and usually settle. Watch them rather than treating them, and see the red-flag section below.",
        "Do not correct anything yet. There is nothing to correct that a routine will not fix in a fortnight.",
      ],
      guide: {
        slug: "bringing-home-a-puppy-first-30-days",
        label: "The whole first month, week by week",
      },
    },
    {
      id: "development",
      title: "What an eight-week-old actually is",
      summary: "Very little capacity, in every direction, and that is the design.",
      body: [
        "An eight-week-old puppy has a bladder that holds almost nothing, an attention span measured in seconds, and no experience of anything. It cannot be disobedient, because it does not yet know what is being asked. Nearly everything an owner reads as a behaviour problem in this fortnight is a puppy that is tired, needs the toilet, or has not yet been taught the thing it is being blamed for not knowing.",
        "It also sleeps enormously, and will not take that sleep voluntarily if there is anything at all going on. Most of the developmental work at this age happens while it is asleep, which makes protecting sleep a more productive use of the week than any training session.",
      ],
    },
    {
      id: "toilet-training",
      title: "Toilet training, from nothing",
      summary: "A schedule you keep, not a lesson the puppy learns.",
      body: [
        "This is the one thing worth being systematic about in week one, and it is systematic in a very boring way. Take the puppy out on a schedule rather than when it looks like it needs to go: after waking, after eating, after playing, and every hour or so in between while it is awake.",
        "Go outside with it every time, without exception. You cannot reward something you did not see, and a puppy sent out alone will often come back in and then go. Reward outdoors, immediately, while you are still outside — not once you are back in the kitchen, which rewards coming inside.",
        "Accidents are not failures and they are not the puppy's fault; at this age they are information about the schedule. Clean with an enzymatic cleaner, say nothing, and shorten the interval. Punishing an accident teaches a puppy to toilet where you cannot see it, which is a far worse problem than the one you started with.",
      ],
    },
    {
      id: "sleep",
      title: "Sleep and settling",
      summary: "The first nights are hard, and they are supposed to be.",
      body: [
        "Expect the first two or three nights to be bad, and plan for them rather than being surprised. A puppy that can hear and smell you settles much faster than one shut away, so the crate or pen next to the bed for the first few weeks is worth the inconvenience.",
        "Night toilet trips are part of this age. Keep them boring and wordless — out, toilet, back in, no play, no conversation — and they fall away over the coming weeks rather than on any particular night.",
        "Daytime naps matter as much as nights and get skipped more often. A puppy that is frantic, mouthy and impossible in the late afternoon is almost always overtired rather than badly behaved, and the answer is a dark quiet space and a closed door.",
      ],
      guide: {
        slug: "crate-training-a-puppy-in-canada",
        label: "Introducing a crate properly, over four weeks",
      },
    },
    {
      id: "feeding",
      title: "Feeding",
      summary: "Change nothing. This is the strongest advice on the page.",
      body: [
        "Keep feeding exactly what the puppy was already eating, in the same amounts and at the same frequency, unless your veterinarian tells you otherwise. Ask the breeder or rescue what it was on and buy some before the puppy arrives if you can.",
        "The reason is simple and worth stating plainly: a puppy that has just moved house is already dealing with a great deal, and an abrupt diet change on top of that is a reliable way to produce several days of diarrhoea. That is unpleasant for everyone and it also removes your ability to tell whether something else is wrong — you cannot read a change in the stools of a puppy whose food you changed yesterday.",
        "If you do want to change the food, do it later, once the puppy has settled, and transition gradually by mixing increasing proportions of the new food in over at least a week. How much and how often at this age is a question for your veterinarian rather than for a chart or a bag, because it changes quickly and depends on the food.",
      ],
      guide: {
        slug: "reading-a-canadian-pet-food-label",
        label: "What the label does and does not tell you",
      },
    },
    {
      id: "training",
      title: "Training",
      summary: "Almost nothing, on purpose.",
      body: [
        "This is the lightest training section in the Journey, deliberately. The goal at eight weeks is that people are good to be around — not that the puppy acquires behaviours.",
      ],
      points: [
        "Name: say it, the puppy looks, food appears. Ten seconds, a few times a day. Never use it to tell the puppy off.",
        "The toilet routine above. That is the week's project.",
        "Reward settling whenever it happens by itself.",
      ],
    },
    {
      id: "socialisation",
      title: "Socialisation",
      summary: "It starts in your house, and it starts gently.",
      body: [
        "Socialisation at this age is not an outing. It is the house: floors of different textures, the washing machine, the kettle, the doorbell, a coat going on, someone in a hat. A puppy that meets those calmly in its first fortnight has done real work.",
        "Quality matters more than volume here more than anywhere. One person who sits on the floor and lets the puppy approach in its own time is worth more than five who pick it up. If the puppy retreats, that is information rather than failure, and the answer is more distance rather than more encouragement.",
        "The wider programme — where to go, what to cover, how to manage infection risk while the vaccination series is unfinished — starts properly over the next few weeks and is a project of its own. Ask your veterinarian what the disease picture looks like where you live before planning any of it.",
      ],
      guide: {
        slug: "puppy-socialisation-checklist",
        label: "What to expose a puppy to, and how to read the puppy",
      },
    },
    {
      id: "grooming",
      title: "Handling",
      summary: "Thirty seconds a day, and it pays for a decade.",
      body: [
        "There is nothing to groom yet, which is exactly why this is the moment. Touch a paw and give it back. Look at an ear. Lift a lip. Each one brief, each one followed by something good, and stop long before the puppy wants you to.",
        "A dog that finds being handled unremarkable can be examined, brushed, medicated and treated for the rest of its life without a fight. That is bought here, cheaply, in the week when nothing else is being asked.",
      ],
    },
    {
      id: "veterinary-care",
      title: "The first appointment",
      summary: "Book it early. It is a health check as much as anything.",
      body: [
        "If the puppy has just arrived, a first appointment in the first week or so is the right shape — partly to establish care with a practice before you need one urgently, and partly because a health check early on is worth having on record. Availability varies a great deal between clinics and between parts of the country, so book before you need it.",
        "Take everything the breeder or rescue gave you, and go with questions rather than expectations. If you have not chosen a practice yet, that is this week's more urgent job: a clinic that already holds the history is worth more than one that is marginally closer, and the after-hours arrangement matters more than anything on the website.",
      ],
      guide: {
        slug: "finding-a-veterinarian-in-canada",
        label: "Choosing a practice before you need one",
      },
    },
    {
      id: "vaccine-questions",
      title: "Questions to discuss with your veterinarian at this age",
      summary: "Start from the record you were given, not from a schedule.",
      body: [
        "Puppies arrive having had different things done to them. Some have had a first vaccine from the breeder, some have not, and some come with paperwork that is hard to read. What matters is not what a schedule says should have happened, but what actually did — so the first conversation starts with the record rather than with a plan.",
        "There is no single schedule, and no article can responsibly give you one: what your puppy needs depends on its age, its existing record, where you live, what it will do, the specific products your clinic uses, and your veterinarian's assessment. These are the questions that turn an appointment into a plan.",
      ],
      points: [
        "Can you look at these records and tell me what has actually been given, and when?",
        "Where is my puppy in the primary series now, and when will the series finish?",
        "Which vaccines are core here, and which depend on where we live and what the dog will do?",
        "Where can I safely socialise before the series is complete, given the disease picture in this area?",
        "What parasite prevention does this puppy need here, and when does it start?",
        "Can you confirm the microchip number against these papers and check it scans?",
        "What should I watch for while it settles, and what number do I call after hours?",
      ],
      guide: {
        slug: "puppy-vaccination-schedule-in-canada",
        label: "Why it is a series, and what core actually means",
      },
    },
    {
      id: "parasite-prevention",
      title: "Parasite prevention",
      summary: "Mostly a question to ask, and a record to check.",
      body: [
        "Most puppies have been wormed before they come home, often more than once, and the record should say what was used and when. That is the thing to bring to the appointment — restarting a course unnecessarily is as unhelpful as missing one.",
        "Beyond worming, what a puppy needs depends on where it lives and what it will do, and genuinely differs between two Canadian cities. Most flea, tick and heartworm products also carry a minimum age or weight that an eight-week-old may not have reached yet, so this is often a conversation about what happens next month rather than a prescription today.",
      ],
      guide: {
        slug: "parasite-prevention-for-pets-in-canada",
        label: "Region and season, and what actually drives the timing",
      },
    },
    {
      id: "safety",
      title: "Safety",
      summary: "Get down on the floor and look again. Then look behind things.",
      body: [
        "A puppy this small is both more fragile and more mobile than people expect, and the hazards are the ones at its eye level rather than yours.",
      ],
      points: [
        "Anything small enough to swallow. This is the most likely serious accident of the first months and it does not need to be a chew toy — socks, stones, string and coins all qualify.",
        "Cables and phone chargers at floor level.",
        "The cupboard under the sink, houseplants, and any bouquet that arrives in the house.",
        "Stairs, balconies and furniture. A fall from a sofa is a real injury at this size.",
        "The gap behind and under appliances, which is where a puppy goes and where you cannot reach it.",
        "Doors, gates and the car. A puppy that has not learned the front door is a boundary will treat it as an opening.",
        "Other pets in the house, supervised properly rather than left to work it out.",
      ],
    },
    {
      id: "paperwork",
      title: "Records, identification and licensing",
      summary: "An audit of what you were handed, and what is missing.",
      body: [
        "This is a different job from a to-do list: it is checking that what you were given is complete and that what is registered is registered to you. Do it in the first fortnight, while whoever you got the puppy from is still easy to contact.",
      ],
      points: [
        "The vaccination record: what was given, on what date, and which product. Photograph it.",
        "Worming and any other treatment, with dates.",
        "The microchip number — and whether the registration has actually been transferred into your name with your current phone number. Implanting and registering are two separate steps, and the second is the one that gets missed.",
        "An identification tag on a collar the puppy wears, with a phone number on it.",
        "Whether your municipality licenses dogs, and from what age. Requirements and deadlines differ from city to city.",
        "Insurance, if you are going to buy it: policies exclude pre-existing conditions, so the timing relative to that first appointment matters.",
      ],
      guide: {
        slug: "pet-licensing-across-canada",
        label: "What licensing involves, and how much it varies",
      },
    },
    {
      id: "red-flags",
      title: "Settling in, or something wrong",
      summary: "Some of this fortnight's alarming things are normal. Some are not.",
      tone: "caution",
      body: [
        "Settling produces a lot of behaviour that worries new owners and does not need to. A puppy that eats little on the first evening, is unsettled for the first two or three nights, has softer stools for a day or two after the move, hides under furniture, or sleeps a great deal more than you expected is usually doing something ordinary.",
        "What separates that from a problem is duration and company: whether it persists, and whether anything else has come with it. A puppy this age needs proportionally more fluid than an adult dog and can become dehydrated faster, so anything keeping fluid going out or food from going in is worth a call sooner than it would be in an adult. That is why the threshold for phoning is deliberately low, rather than any broader claim about young dogs. Telephone triage is a normal part of what a clinic does, it usually costs nothing, and the answer is one of three things: come now, come in the morning, or here is what to watch for.",
        "Contact your veterinary clinic — rather than waiting to see whether it settles — if a puppy will not eat at all, is repeatedly vomiting or has persistent or bloody diarrhoea, is unusually limp or unresponsive, is breathing with effort, has not urinated in an unusually long stretch, is straining without producing anything, or you have any reason to think it has swallowed something it should not have. Very small breeds can also become weak or wobbly if they go too long without food, which is a reason to phone rather than to wait for the morning.",
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
      summary: "The settling week ends, and the socialisation clock starts running.",
      body: [
        "Over the next two or three weeks the routine starts to hold, the nights lengthen, and the emphasis shifts from settling to building. That is when the socialisation programme begins in earnest, when alone-time practice needs to be deliberate rather than incidental, and when short training sessions become genuinely useful.",
        "It is worth knowing that the socialisation window does not wait for the vaccination series to finish, which is the single most important piece of timing in a puppy's first year. Nothing about that needs acting on this week. It does mean the settling period is a few days, not a few months.",
      ],
    },
  ],

  checklist: [
    { id: "food", label: "Keep the food exactly as it was", detail: "Same brand, same amount, same frequency. Change it later, gradually, if at all." },
    { id: "toilet", label: "Put the toilet trips on a schedule", detail: "After waking, eating and playing, and hourly in between while awake. Go outside too." },
    { id: "vet", label: "Book the first veterinary appointment", detail: "Early, and before you need one urgently. Take every piece of paper you were given." },
    { id: "baseline", label: "Learn what normal looks like for this puppy", detail: "Appetite, sleep, stools, energy. In a week it is what makes a change visible." },
    { id: "proof", label: "Puppy-proof at floor level, then look behind things" },
    { id: "naps", label: "Enforce daytime naps rather than hoping for them" },
    { id: "chip", label: "Transfer the microchip registration into your name", detail: "Implanting and registering are two separate steps." },
    { id: "records", label: "Photograph the vaccination and worming records" },
    { id: "emergency", label: "Write down your after-hours emergency clinic and its number" },
  ],

  sources: [
    {
      label: "Pediatric patients need proportionally more fluid than adults and can progress rapidly from mild dehydration to hypovolaemia; hypoglycaemia and electrolyte disturbance are the companion concerns",
      publisher: "Lee JA, Cohn LA, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017 (PMID 27939859)",
      url: "https://doi.org/10.1016/j.cvsm.2016.09.010",
    },
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
  ],

  resources: [
    {
      label: "Your provincial or territorial veterinary regulator, and what it licenses",
      publisher: "Canadian Veterinary Medical Association",
      url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
    },
  ],

  needsVerification: [
    "RESOLVED \u2014 NARROWED, 2026-09-06. This stage previously said a young dog \u201chas less reserve than an adult and can deteriorate faster\u201d (and equivalents). No source was found for that as a general physiological claim and it is no longer asserted. What replaced it is the one mechanism that is sourced: Lee JA and Cohn LA, \u201cFluid Therapy for Pediatric Patients\u201d, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017, PMID 27939859, verified 2026-09-06, which states that \u201cpediatric patients have a higher fluid requirement compared with adults and can rapidly progress from mild dehydration to hypovolemia\u201d and that pediatric fluid therapy \u201cmust address hydration, vascular fluid volume, electrolyte disturbances, or hypoglycemia\u201d. Hoskins JD, PMID 10390787, anchors the pediatric window at birth to about six months, which covers every stage carrying this wording. LIMITATION \u2014 fluid and glucose only, not reserve across every organ system, and not a claim that illness in general progresses faster. The red-flag list and the threshold for phoning are unchanged; only the explanation is.",
    "STANDING GUARDRAIL \u2014 Do not generalise pediatric dehydration/metabolic evidence into a blanket claim that young dogs have lower physiological reserve across all illness or deteriorate faster in every emergency. The claim is licensed for fluid loss and, as a named veterinary concern, hypoglycaemia \u2014 nothing wider.",
    "STANDING GUARDRAIL \u2014 The neonatal evidence (Merck, Management of the Neonate in Dogs and Cats: first 21 days, no thermoregulation until four weeks, absent glucose reserves and minimal gluconeogenesis) must NOT be applied to these stages. Every Journey stage begins at eight weeks or later, well past the neonatal period. Do not introduce immature thermoregulation, neonatal glucose reserves or neonatal fasting physiology into any stage.",
    "No national claim is made about a legal minimum age for sale, transfer or separation from the dam. Only Quebec is named, from the regulation itself — see the province modifier. Do not generalise it to other provinces without the same standard of source, and do not restate it as a rule about selling: the section quoted governs separation from the mother.",
    "That most puppies come home around eight weeks is stated as a convention rather than a rule, and the page is written so it does not depend on the reader having just arrived home.",
    "The description of what an eight-week-old is capable of — bladder capacity, attention span, sleep requirement — is qualitative and quotes no figure. The 16–18 hours figure carried in the article library is still unsourced there; do not import it.",
    "That loose stools and reduced appetite are common in the days after a move is stated as common rather than expected, and is paired with the red-flag list rather than standing alone. Source it before it is stated more strongly.",
    "That an abrupt diet change commonly causes gastrointestinal upset is stated qualitatively with no mechanism and no timeframe. Attach a veterinary nutrition source before it is made more specific.",
    "That most puppies are wormed before homing is stated as usual practice rather than a guarantee, and directs the reader to the record. Confirm against a veterinary parasitology source or soften.",
    "That many parasite products carry a minimum age or weight is stated generally, with no product, dose or threshold named. It must stay that way.",
    "No vaccination schedule appears anywhere in this stage, by design. The section is questions only, and the first question is about reading the record the reader already has. Do not let a future edit turn it into a timetable.",
  ],
};


/**
 * Three months — the thirteenth to seventeenth week.
 *
 * ## What this stage is for
 *
 * Twelve weeks says *do not mistake this milestone for the end*. Three months
 * says *stop adding, and start repeating*. The distinction is real and it is
 * the whole reason this page exists: the first month home is about collecting
 * experiences, and this month is about turning them into behaviour that holds
 * up somewhere other than the kitchen.
 *
 * The other thing that happens here and nowhere else: for most puppies the
 * primary vaccination series actually finishes inside this stage. The final
 * dose lands at sixteen weeks or later, which is day 112 or beyond — inside
 * the thirteen-to-seventeen-week span. So this is the stage that gets to say
 * what changes when it is over, which the 12-week stage could only point at.
 *
 * ## The naming rule
 *
 * The stage opens on day 91, and a reader can arrive here a day or two before
 * their own three-calendar-month anniversary. So the prose says "around three
 * months" and "at this stage" and never asserts that the reader's puppy is
 * exactly three months old — that claim belongs to `journeyHeadlineAge`,
 * which checks the calendar before making it.
 */
export const threeMonths: PuppyStage = {
  slug: "3-months",
  label: "3 months",
  title: "Your 3-Month-Old Puppy",
  deck:
    "Around three months, the job changes. The first weeks were about collecting experiences; this month is about repeating them until they hold up somewhere other than your kitchen.",
  metaDescription:
    "What matters around three months: consolidating training, generalising to new places, the end of the vaccination series, managing heavy chewing, and building the habits that carry into adolescence.",
  mediaId: "puppy-three-months",
  mediaAlt:
    "A leggy young dog in a plain yellow harness sitting on grass, ears up, looking attentively upwards.",
  reviewBy: "2027-09-01",
  // Held from wave one. This and `/puppy/12-weeks` are the highest-overlap
  // pair in the series and compete for one query \u2014 to a searcher, twelve
  // weeks and three months are the same puppy. 12-weeks goes first because it
  // owns the maternal-antibody explanation. Revisit once Search Console shows
  // which URL is actually selected.
  indexable: false,
  status: "in-review",

  sections: [
    {
      id: "this-week",
      title: "Where you are now",
      summary: "Stop adding. Start repeating.",
      body: [
        "Somewhere around three months the useful advice inverts. Up to now the instruction has been to keep adding — more surfaces, more sounds, more people, more of the world while it is cheap to absorb. From here the return on adding drops sharply, and the return on repeating rises just as sharply.",
        "That is not a smaller job. A puppy that will sit in your kitchen and not in your hallway has not learned to sit; it has learned a kitchen. Turning what it knows in one place into something it can do in five is most of the work of this month, and it is the part almost everyone skips in favour of teaching something new.",
      ],
      points: [
        "Practise what the puppy already knows, in more places, rather than teaching more things.",
        "The primary vaccination series usually finishes during this stage — later than most people expect.",
        "Chewing is heavy, and heaviest is still ahead. It is a physical need, not a training problem.",
        "House-training progress is uneven, and going backwards for a few days is normal.",
        "Alone-time practice gets quietly dropped around now, and that is how it becomes a problem later.",
      ],
    },
    {
      id: "development",
      title: "Development",
      summary: "More capable, more confident, and still unable to generalise.",
      body: [
        "The puppy that arrives at three months is noticeably more able than the one that arrived at twelve weeks: better coordinated, longer attention, better bladder control, more willing to venture away from you. It also looks enough like a small dog that people start expecting it to behave like one.",
        "The gap that matters here is generalisation. A very young animal learns behaviours attached to the place, the posture, the smell and the person that were present when it learned them. It is not withholding a skill it has when the context changes; it genuinely does not yet have the skill in that context. \u201cHe knows it, he is just being stubborn\u201d is the most common and most costly misreading of this age, and it usually leads to pressure being applied where practice was needed.",
      ],
    },
    {
      id: "training",
      title: "Training foundations",
      summary: "The same short sessions, in harder places. Nothing here is reliable yet.",
      body: [
        "This is the biggest section on the page, because it is the work of the month. Sessions stay short — a few minutes, several times a day, ending while the puppy still wants more. What changes is the place you do it in and the competition you do it against.",
        "The useful mental model is a bank. Every repetition that goes well is a deposit, and behaviour holds up under pressure later in proportion to what was banked now. Nothing on this list is reliable at three months, none of it should be tested where it matters, and treating any of it as finished is how it comes apart at seven months.",
      ],
      points: [
        "Generalise deliberately. Take one known behaviour and run it in five places this week: kitchen, hallway, garden, doorstep, front path. Expect it to fall apart in each new one and to rebuild in a few repetitions. That is the process working, not failing.",
        "Add distraction in rungs, not leaps. Someone walking past inside the house, then a person at a distance outdoors, then a person nearer. If the puppy cannot take food, the rung is too high — go back one.",
        "Recall stays a game and never a command. Run away, let the puppy chase, pay it extravagantly every time. Never call to end something enjoyable, never call when you cannot make it happen, and never call twice.",
        "Lead work moves outdoors, briefly. Reward the position you want rather than correcting the one you do not. Two minutes of good practice on the drive beats twenty minutes of pulling on a walk.",
        "Settle on a mat, on cue, while life goes on around it. Of everything here this is the one that pays most during adolescence, and it is easiest to build now.",
        "Keep alone-time on the calendar. It is the first thing to lapse once a routine feels settled, and separation problems are far cheaper to prevent than to treat.",
        "Handling continues as cooperation rather than restraint: a paw offered and given back, a brief look in an ear, ending before the puppy wants it to.",
      ],
      guide: {
        slug: "loose-leash-walking-and-recall",
        label: "Lead work and recall, built properly",
      },
    },
    {
      id: "toilet-training",
      title: "House-training progress",
      summary: "Better, then worse, then better. Extend the routine rather than retiring it.",
      body: [
        "Most puppies are noticeably drier by three months, and most owners respond by relaxing the schedule — at which point the accidents come back and it feels like a regression. Usually it is not: it is the routine being withdrawn before the habit was finished.",
        "Extend rather than stop. Lengthen the intervals gradually, keep going outside with the puppy so you can still reward what you actually saw, and keep the reward outdoors and immediate. Supervision matters more than instruction at this stage; a puppy loose in an unwatched room is being set up to fail.",
        "Accidents remain information rather than misbehaviour. A cluster of them usually points at a change — a longer stretch alone, a new room, a stretch of bad weather, or an interval that grew too fast. Punishment teaches a puppy to go where you are not looking, which is a worse problem than the one you started with. A sudden and genuine loss of house-training, especially with straining or frequency, is a veterinary question rather than a training one.",
      ],
    },
    {
      id: "socialisation",
      title: "Socialisation",
      summary: "From collecting experiences to deepening them.",
      body: [
        "The primary socialisation period the American Veterinary Society of Animal Behavior describes runs through the first three months, so this stage sits at its far edge. That does not mean socialisation stops. It means the cheap part is over: new things still register, they simply need more repetitions and more care to land well.",
        "So the emphasis moves from variety to depth. A puppy that has met a bus once has met a bus; a puppy that has watched buses from a bench on six calm occasions has an opinion about buses. Repetition at a distance the puppy can handle is what turns exposure into confidence, and it is worth far more now than another novel category.",
        "The quality rule holds and matters more, not less. One calm experience where the puppy chose to approach and could have left is worth more than an afternoon of being carried through a crowd. Where you can safely go still depends on where your puppy is in its vaccination series and on the disease picture where you live, which remains a conversation with your veterinarian rather than a rule this page can give you.",
      ],
      guide: {
        slug: "puppy-socialisation-checklist",
        label: "What to expose a puppy to, and how to read the puppy",
      },
    },
    {
      id: "teething",
      title: "Chewing",
      summary: "Heavy, about to get heavier, and not a behaviour problem.",
      body: [
        "Chewing is substantial at this age and the part driven by teething has not started yet. Merck puts the appearance of the permanent teeth at around four to five months, with the full set in by about seven, so what is ahead of you is more of this rather than less. No amount of instruction will train it away — a household that treats it as disobedience will spend the next few months losing an argument.",
        "The work is management rather than correction. Keep a rotation of things that are legal to chew so they stay interesting, put the illegal options out of reach rather than relying on supervision, and use cold — a wet flannel frozen into a twist, or a stuffed toy from the freezer — because it helps a sore mouth in a way nothing else on the list does.",
        "Two things are worth separating. Chewing is normal; swallowing is the risk. The most likely serious accident of the next few months is an object going down rather than being chewed, so what the puppy chews should be too large to swallow and should be checked as it wears down. On hardness, ask your veterinarian directly: chews that do not give at all are a recognised cause of fractured teeth, and \u201cnatural\u201d is not a synonym for safe.",
        "Mouthing you should now be firmly on its way out. Teeth on skin ends the fun for a moment — hands still, attention off, no drama — then a legal chew appears. Consistency across everyone in the house matters more than what any one person does.",
      ],
      guide: {
        slug: "dental-care-for-dogs-and-cats",
        label: "The mouth you are looking after for the next decade",
      },
    },
    {
      id: "feeding",
      title: "Feeding",
      summary: "Usually three meals, and a bag of training currency you already own.",
      body: [
        "Most puppies are on three meals a day through this period. How much is a question for your veterinarian rather than a chart — it changes quickly, it depends on the food, and it is one of the more useful things to ask at an appointment where the puppy is being weighed anyway.",
        "The useful idea at this stage is that meals are training currency. A portion of the daily food, delivered by hand during two-minute sessions or scattered for the puppy to find, does more work than the same food in a bowl — it buys repetitions, it slows eating down, and it costs nothing extra.",
        "It is too early for adult food. Growth finishes much later in a large dog than a small one, and moving early is a genuine risk rather than a saving; ask when, rather than deciding when.",
      ],
      guide: {
        slug: "reading-a-canadian-pet-food-label",
        label: "What the label does and does not tell you",
      },
    },
    {
      id: "sleep",
      title: "Sleep and settling",
      summary: "Still a great deal, and still not taken voluntarily.",
      body: [
        "Nights are usually consolidated by now, or close to it. Daytime sleep is the part that quietly erodes: the puppy is more interesting to be around, more able to join in, and gets offered more to do — and an overtired three-month-old looks like a rude one rather than a frantic one.",
        "Keep enforced rest in the day, and treat the late-afternoon collapse into biting and grabbing as the sleep signal it almost always is. Settling is also a trainable behaviour rather than only a state, which is what makes the mat work in the training section worth the effort.",
      ],
      guide: {
        slug: "crate-training-a-puppy-in-canada",
        label: "Using a crate for rest rather than containment",
      },
    },
    {
      id: "exercise",
      title: "Exercise and activity",
      summary: "Longer than last month, shorter than you are being told.",
      body: [
        "Outings can grow a little, and the shape matters more than the length. A walk where the puppy sets the pace and stops to sniff does more for it than one where it is kept moving, and sniffing tires a young dog far more reliably than distance.",
        "The constraint remains repetition rather than movement. Growth plates are open, and it is repetitive forced exercise — running alongside a bicycle, long stair sessions, throwing a ball until the puppy stops — that is worth avoiding. Free movement at the puppy's own pace is a different thing and is good for it.",
        "Most of the tiring is still mental. Five minutes of training, a scattered handful of kibble, or a new surface to investigate will empty a three-month-old more thoroughly than an extra kilometre.",
      ],
    },
    {
      id: "grooming",
      title: "Handling and grooming",
      summary: "Short, and now with something to actually do.",
      body: [
        "There is more coat than there was a month ago and, for some, the beginning of a change in it. Keep the sessions brief and cooperative: brush for a minute, hold a paw as though clipping and give it back, look in an ear, stop early. What you are training is a dog that finds handling unremarkable, not a groomed puppy.",
        "If a professional groomer is in this dog's future, keep the visits going as introductions rather than waiting until the coat requires one. The appointment that goes badly is almost always the first one that was needed rather than chosen.",
      ],
    },
    {
      id: "veterinary-care",
      title: "Veterinary care",
      summary: "Often the appointment where the series finishes. Go with the record.",
      body: [
        "There is usually at least one appointment in this stage, and for many puppies it is the one that completes the primary vaccination series. Take the record and everything added since, because what happens next depends on what has actually been given rather than on what a schedule says should have been.",
        "It is a good appointment for the unglamorous questions too: weight and growth, what the puppy should be eating and how much, when parasite prevention starts or changes, and whether there is anything in the mouth worth keeping an eye on before the permanent teeth arrive.",
      ],
      guide: {
        slug: "finding-a-veterinarian-in-canada",
        label: "Choosing a practice before you need one",
      },
    },
    {
      id: "vaccine-questions",
      title: "Questions to discuss with your veterinarian around this stage",
      summary: "Many puppies are still mid-series here. Some finish during it.",
      tone: "caution",
      body: [
        "Whether your puppy is still in its primary series at this stage depends on when it started and how the doses have been spaced, which is why this is a conversation rather than a schedule. What is generally true is that the series ends later than most owners expect: the American Animal Hospital Association recommends continuing until the puppy is older than sixteen weeks, and prefers eighteen to twenty weeks where distemper or parvovirus risk is high, and the World Small Animal Veterinary Association puts the final dose at sixteen weeks or older.",
        "Sixteen weeks falls inside this stage for most puppies, which makes it the point at which the practical answer to \u201cwhere can we safely go\u201d genuinely changes. It is worth asking for that in the form of a date rather than a reassurance, and asking explicitly what you should do differently once it has passed.",
      ],
      points: [
        "Where is my puppy in the series now, and how many doses are left?",
        "On what date do you consider the series complete?",
        "What changes about where I can take this puppy once it is?",
        "Which vaccines here are decided by where we live and what the dog will do?",
        "Given our area, do you recommend leptospirosis, Lyme or Bordetella?",
        "Do you follow the newer advice for a further dose at around six months?",
        "What parasite prevention should be running now, and when does it change?",
        "What are the rabies requirements where we live, and when will you give it?",
      ],
      guide: {
        slug: "puppy-vaccination-schedule-in-canada",
        label: "Why it is a series, and what core actually means",
      },
    },
    {
      id: "parasite-prevention",
      title: "Parasite prevention",
      summary: "By now this should be a plan with dates rather than a question.",
      body: [
        "By three months most puppies have crossed the age or weight thresholds that products carry, and the conversation moves from \u201cwhen can we start\u201d to \u201cwhat is the plan for this year\u201d. Ask for it in that form: what, from when, until when, and what to do if a dose is missed.",
        "The answer is local. Heartworm prevention is seasonal in most of Canada and its start date follows the mosquito season where you live rather than the calendar; tick activity runs longer at both ends of the year than most people assume. A puppy that will hike, swim, visit a cottage or spend time in long grass has a different plan from one that will not.",
      ],
      guide: {
        slug: "parasite-prevention-for-pets-in-canada",
        label: "Region and season, and what actually drives the timing",
      },
    },
    {
      id: "safety",
      title: "Safety",
      summary: "Taller, bolder, and chewing everything. The list changes accordingly.",
      body: [
        "The hazards move up and outwards at this age. A three-month-old can reach surfaces it could not last month, is confident enough to try things it would previously have avoided, and is putting more in its mouth than at any other point so far.",
      ],
      points: [
        "Swallowed objects, which remain the most likely serious accident of this period. Socks, stones, corn cobs, string and the stuffing out of a toy are the usual culprits.",
        "Counters, coffee tables and anything left at nose height, which is now higher than it was.",
        "The front door and the car door. Confidence arrives before road sense does.",
        "Car travel with the puppy secured rather than loose.",
        "Stairs and jumping down from furniture, which a bolder puppy now does without being lifted.",
        "Long grass, standing water and wildlife faeces on outings, which is a parasite question as much as a safety one.",
      ],
    },
    {
      id: "red-flags",
      title: "When to call a veterinarian",
      summary: "The threshold stays low, and three things belong on the list at this age.",
      tone: "caution",
      body: [
        "A dog this age needs proportionally more fluid than an adult and can progress from mild dehydration to something more serious faster, so repeated vomiting, persistent diarrhoea or poor intake earns a call sooner than the same thing would in a grown dog. That, rather than a general rule about young dogs, is what keeps the bar for making a phone call deliberately low. Telephone triage is a normal part of what a clinic does, it usually costs nothing, and the answer is one of three things: come now, come in the morning, or here is what to watch for.",
        "Contact your veterinary clinic — rather than waiting to see whether it settles — if a puppy will not eat, is repeatedly vomiting or has persistent diarrhoea, is unusually limp or unresponsive, is breathing with effort, has not urinated in an unusually long stretch, is straining without producing anything, or you have any reason to think it has swallowed something it should not have.",
        "Three things are more likely at this age specifically. A swallowed object is a call rather than a wait-and-see, and does not need to be accompanied by any other sign. Limping, or reluctance to put weight on a leg, after a walk or a fall should be looked at rather than rested and hoped over. And a genuine loss of house-training, particularly with straining, frequency or blood, is a medical question before it is a training one.",
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
      summary: "The series ends, and adolescence starts forming on the horizon.",
      body: [
        "The two things that close out this period are the end of the vaccination series and a puppy that is visibly less puppy-shaped. The first changes where you can go; the second changes what people expect of the dog, usually faster than the dog changes.",
        "Adolescence is the thing worth knowing is coming. It arrives around six or seven months and it is not a training failure — a dog that appears to forget what it knew is doing something developmentally ordinary. The reinforcement banked in this month is what it comes back to on the other side, which is the argument for doing the unglamorous repetition now rather than teaching something new.",
      ],
    },
  ],

  checklist: [
    { id: "generalise", label: "Take one known behaviour to five new places this week", detail: "Expect it to fall apart in each, and to rebuild in a few repetitions." },
    { id: "series", label: "Ask for the date the vaccination series will be complete", detail: "And what changes about where you can go once it is." },
    { id: "alone", label: "Keep alone-time practice on the calendar", detail: "It is the first thing to lapse once the routine feels settled." },
    { id: "chews", label: "Set up a chew rotation and check items for wear", detail: "Too large to swallow, and ask about hardness." },
    { id: "recall", label: "Play recall daily, and never use the word to end fun" },
    { id: "mat", label: "Build settling on a mat while the household carries on" },
    { id: "house", label: "Extend the toilet schedule rather than retiring it" },
    { id: "parasite", label: "Get parasite prevention written down as dates, not intentions" },
    { id: "meals", label: "Spend part of the daily food on training rather than the bowl" },
  ],

  sources: [
    {
      label: "Pediatric patients need proportionally more fluid than adults and can progress rapidly from mild dehydration to hypovolaemia; hypoglycaemia and electrolyte disturbance are the companion concerns",
      publisher: "Lee JA, Cohn LA, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017 (PMID 27939859)",
      url: "https://doi.org/10.1016/j.cvsm.2016.09.010",
    },
    {
      label: "Position statement on puppy socialization — the first three months, and socialising before full vaccination",
      publisher: "American Veterinary Society of Animal Behavior",
      url: "https://avsab.org/puppy-socialization-position-statement/",
    },
    {
      label: "2022 AAHA Canine Vaccination Guidelines — continuing the initial series past sixteen weeks",
      publisher: "American Animal Hospital Association",
      url: "https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/",
    },
    {
      label: "2024 Guidelines for the Vaccination of Dogs and Cats — final puppy dose at sixteen weeks or older",
      publisher: "World Small Animal Veterinary Association",
      url: "https://wsava.org/wp-content/uploads/2024/05/2024-Guidelines-for-the-Vaccination-of-Dogs-and-Cats.pdf",
    },
    {
      label: "Dental development of dogs — permanent teeth appear at around four to five months, complete by about seven",
      publisher: "Merck Veterinary Manual",
      url: "https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/dental-development-of-dogs",
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
    "RESOLVED \u2014 NARROWED, 2026-09-06. This stage previously said a young dog \u201chas less reserve than an adult and can deteriorate faster\u201d (and equivalents). No source was found for that as a general physiological claim and it is no longer asserted. What replaced it is the one mechanism that is sourced: Lee JA and Cohn LA, \u201cFluid Therapy for Pediatric Patients\u201d, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017, PMID 27939859, verified 2026-09-06, which states that \u201cpediatric patients have a higher fluid requirement compared with adults and can rapidly progress from mild dehydration to hypovolemia\u201d and that pediatric fluid therapy \u201cmust address hydration, vascular fluid volume, electrolyte disturbances, or hypoglycemia\u201d. Hoskins JD, PMID 10390787, anchors the pediatric window at birth to about six months, which covers every stage carrying this wording. LIMITATION \u2014 fluid and glucose only, not reserve across every organ system, and not a claim that illness in general progresses faster. The red-flag list and the threshold for phoning are unchanged; only the explanation is.",
    "STANDING GUARDRAIL \u2014 Do not generalise pediatric dehydration/metabolic evidence into a blanket claim that young dogs have lower physiological reserve across all illness or deteriorate faster in every emergency. The claim is licensed for fluid loss and, as a named veterinary concern, hypoglycaemia \u2014 nothing wider.",
    "STANDING GUARDRAIL \u2014 The neonatal evidence (Merck, Management of the Neonate in Dogs and Cats: first 21 days, no thermoregulation until four weeks, absent glucose reserves and minimal gluconeogenesis) must NOT be applied to these stages. Every Journey stage begins at eight weeks or later, well past the neonatal period. Do not introduce immature thermoregulation, neonatal glucose reserves or neonatal fasting physiology into any stage.",
    "British Columbia is a *positive* claim only, as of 2026-09-06. The BCCDC page was read and says verbatim that rabies vaccines are available for cats, dogs and ferrets and that \u201cyour pets should be vaccinated, and their immunizations should be kept up to date\u201d. The earlier copy went further and said provincial law does not compel vaccination \u2014 a negative legal claim, and no authoritative source could be found that states it. Proving the absence of a law is a different exercise from reading one, and the BCCDC page, the BC Rabies Guidance for Veterinarians and the CVBC summary table were all retrieved and none of them says it. The copy now states what BCCDC recommends, says plainly that we are not presenting a province-wide legal requirement, and explicitly leaves municipal, travel, import and bite-investigation rules open. Do not restore the stronger wording without a named statute or regulation.",
    "This stage opens on day 91, which can precede a reader's own three-calendar-month anniversary by a day or two. All public prose says 'around three months' or 'at this stage' and never asserts the reader's puppy is exactly three months old. Do not let an edit introduce that claim — the headline is the only place a month is named, and it checks the calendar first.",
    "The final-dose ages (AAHA past sixteen weeks, preferring eighteen to twenty in high-risk settings; WSAVA sixteen weeks or older) are sourced and must stay attributed. That sixteen weeks usually falls inside this stage is arithmetic on those figures, not a separate claim. This section must never become a schedule.",
    "That the primary socialisation period runs through the first three months follows the AVSAB position statement and is sourced. The claim that learning continues afterwards with more repetition is stated qualitatively and is not in that statement; soften or source it before it is made stronger.",
    "That generalisation is poor at this age, and that behaviour learned in one context does not transfer, is described qualitatively with no mechanism and no figures. It is well established in learning theory; attach a source before it is stated as a finding.",
    "Permanent eruption is attributed to Merck (around four to five months, complete by about seven) and is explicitly placed *after* this stage. Chewing at three months is described as heavy without a cause being asserted. No eruption order, tooth count or peak-chewing age appears, and none should be added without a source.",
    "That hard chews are a recognised cause of fractured teeth is stated qualitatively and directed to the veterinarian. Source it before naming products or examples.",
    "Three meals a day is stated as what most puppies are on rather than as a recommendation, and quantity is deferred to the veterinarian. No amounts, no calories, no breed-specific figures appear.",
    "That growth finishes later in large breeds and that moving to adult food early carries risk is stated generally with no age, weight or breed. Attach a source before it is made specific.",
    "The growth-plate reasoning behind limiting repetitive forced exercise names no age, distance or rule, exactly as in the earlier stages.",
    "Heartworm seasonality and the length of tick activity are stated qualitatively with no months and no regions, and direct the reader to their own veterinarian. The linked parasite article carries the sourced detail.",
  ],
};


/**
 * Four to five months.
 *
 * ## Why one stage covers three months
 *
 * Two differentiation gates reached this independently. The first looked for
 * a four-month page and found nothing separating month four from month five.
 * The second assessed six months on its own and found that roughly two thirds
 * of such a page would have repeated this one.
 *
 * The reason is that the things that actually happen here run across the whole
 * span rather than landing in a particular month. Merck puts the appearance of
 * the permanent teeth at around four to five months and completion at about
 * seven. The neutering decision runs from four to six by size and only becomes
 * a date at six, and then only for smaller dogs. And the freedom that follows
 * the end of the vaccination series simply continues.
 *
 * What six months does bring is one genuine addition — WSAVA's advice to
 * consider revaccinating at or after 26 weeks rather than waiting until 12 to
 * 16 months. That is a section, not a stage, and it lives in
 * `vaccine-questions` below.
 *
 * The stage therefore describes *progression across a phase* rather than
 * pretending everything happens at once.
 *
 * ## The spine
 *
 * **The world opens and the teeth arrive.** Those are the two things that are
 * true here and nowhere earlier, and both are sourced. Three months was about
 * consolidation; this is about what happens when a consolidated puppy is let
 * out into more of the world with a mouth that hurts.
 *
 * ## What this stage must not do
 *
 * It must not introduce adolescence. Asher et al. place the adolescent
 * trainability dip at eight months and describe five months as
 * *pre*-adolescence, so a puppy here is before the phase, not in it. Normal
 * variability at four months is not "stubbornness" and is not a recall
 * collapse. It also carries no "second fear period" language: the gate found
 * no peer-reviewed basis for it at any age.
 */
export const fourToSixMonths: PuppyStage = {
  slug: "4-6-months",
  label: "4–6 months",
  title: "Your 4 to 6-Month-Old Puppy",
  deck:
    "Two things arrive together: more of the world, once your veterinarian says the series is finished, and the permanent teeth. Across these three months one of them gets easier and the other does not.",
  metaDescription:
    "What matters from four to six months: broader outings once the vaccination series is complete, permanent teeth arriving and finishing, training in harder places, the neutering decision, and the booster conversation that comes back around six months.",
  mediaId: "puppy-four-five-months",
  mediaAlt:
    "A young black-and-white dog in a plain harness standing on a paved park path, looking out across the grass.",
  reviewBy: "2027-09-01",
  indexable: true,
  status: "in-review",

  sections: [
    {
      id: "this-week",
      title: "Where you are now",
      summary: "The world opens and the teeth arrive — then, slowly, settle.",
      body: [
        "Two things change at the start of this period and they pull in opposite directions. For most puppies the primary vaccination series is finished or finishing, which — once your veterinarian confirms it — opens up where you can reasonably go. And the permanent teeth start coming through, which makes a puppy that was already chewing considerably worse to live with.",
        "This stage covers three months rather than one because that is how long those two things take to play out. Around four months the chewing is at its most destructive and the world is newly available. By six it is a different animal: the mouth is nearly finished, the outings are routine, and two conversations have usually come back round — whether this dog is being neutered and when, and whether your clinic wants a further vaccine dose now rather than at a year old.",
        "None of it is adolescence. That is still ahead, and the work you put in here is what it draws on.",
      ],
      points: [
        "Ask your veterinarian to confirm the series is complete rather than assuming it from a date.",
        "Chewing gets worse before it gets better. Manage it; do not try to train it away.",
        "Practise in harder places, not harder exercises.",
        "House-training is usually good and not usually finished.",
        "The neutering conversation starts here and, for a smaller dog, usually concludes here. The answer depends on size.",
        "Towards six months there is often a second vaccination conversation. It is a decision, not a formality.",
      ],
    },
    {
      id: "development",
      title: "Development",
      summary: "More confident, more opinionated, and still learning by context.",
      body: [
        "A puppy of this age is physically much more capable and noticeably more independent. It will go further from you, investigate more on its own account, and show clearer preferences about what it does and does not want to do. Curiosity outruns judgement by a wide margin, which is why the recall work in this period matters more than it feels like it does.",
        "Learning is still strongly tied to context. A behaviour that is solid in the garden may be absent on a pavement with a bin lorry going past, and that is a gap in practice rather than a refusal. Reading it as defiance is the most common mistake of this age and it leads to pressure being applied where repetition was needed.",
        "This is not adolescence. The research that describes a dip in trainability during adolescence places it at around eight months and treats five months as the phase before it, so a puppy here is on the near side of that. What you are seeing is a confident young dog with incomplete generalisation, not a teenager.",
      ],
    },
    {
      id: "teething",
      title: "Permanent teeth and chewing",
      summary: "The physical fact that defines this phase, and the one that ends during it.",
      body: [
        "This is the period the chewing has been building towards. The Merck Veterinary Manual puts the appearance of the permanent teeth at around four to five months, with all of them present by about seven — so what you are dealing with now has a physical cause, a known trajectory, and an end.",
        "That changes the job from correction to management, and it changes puppy-proofing. A four-month-old can reach higher, is more determined, and has a mouth that wants pressure on it. Go round the house again at the new height: chair legs, table edges, remote controls, shoes left by the door, cables that were previously out of reach and are not any more.",
        "Give the mouth somewhere legal to go. Keep a rotation so items stay interesting, and use cold — a wet flannel frozen into a twist, or a stuffed toy from the freezer — which does more for a sore mouth than anything you can say. On what to give, the useful conversation is with your veterinarian rather than a shelf: hardness is the thing to ask about, because chews that do not give at all are a recognised cause of fractured teeth, and \u201cnatural\u201d is not a synonym for safe.",
        "Chewing is normal; swallowing is the risk, and it does not go away because the puppy is older. Anything given should be too large to swallow and should be taken away as it wears down. Losing a baby tooth, a spot of blood on a toy, or finding nothing at all are all ordinary. What is worth a veterinary look is a mouth that seems painful rather than itchy, or a tooth that is broken rather than shed.",
        "The other end of this is worth knowing about, because it arrives inside this stage. Merck puts the full set of permanent teeth in place by about seven months, so by six the process is progressing towards completion rather than finished — the chewing usually eases before the last teeth are through. If a baby tooth is still firmly in place alongside the adult tooth replacing it by around this point, that is worth raising rather than waiting on. It is a common thing for a veterinarian to look at, and if a dog is going to be anaesthetised for neutering anyway, the two are sometimes dealt with in the same event. That is a conversation to have rather than an expectation to arrive with.",
      ],
      guide: {
        slug: "dental-care-for-dogs-and-cats",
        label: "The mouth you are looking after for the next decade",
      },
    },
    {
      id: "socialisation",
      title: "Socialisation and outings",
      summary: "More access, once it is confirmed — and access is not the same as exposure.",
      body: [
        "Do not assume the series is complete because a certain number of weeks have passed. Ask, get an answer, and ask what it changes: whether the whole world is now reasonable, or whether there are still places your veterinarian would avoid given the disease picture where you live.",
        "Once you have that, widen deliberately rather than all at once. Neighbourhood pavements, a quiet high street, a café terrace, a car park, a bus stop, gravel and metal grates and wet grass — the value is in the variety of surfaces and situations, not in the number of dogs met. Increase complexity a rung at a time and keep the sessions short enough that the puppy is still enjoying itself when you leave.",
        "The thing to resist is the shortcut. A dog park is not socialisation; it is a crowd of strangers with no supervision, and for a four-month-old with no reliable recall it is a way to acquire a problem rather than prevent one. Structured interaction — a known adult dog with good manners, a well-run class — teaches far more than volume does. One calm experience the puppy could have walked away from is worth an afternoon of being carried through a crowd.",
      ],
      guide: {
        slug: "puppy-socialisation-checklist",
        label: "What to expose a puppy to, and how to read the puppy",
      },
    },
    {
      id: "training",
      title: "Training",
      summary: "Same behaviours, harder rooms. Nothing here is reliable yet.",
      body: [
        "The list does not get longer at this age; the conditions get harder. Everything below is work you have already started, moved somewhere it has not worked before, and none of it is finished — a puppy that performs beautifully on the drive is not a dog you can trust off-lead at the park.",
      ],
      points: [
        "Recall against real distraction, on a long line, so that you never call a recall you cannot back up. Pay it enormously, every time, and never call to end something the puppy is enjoying.",
        "Lead work on actual pavements. Two good minutes at the end of the road beats twenty minutes of pulling, and rewarding the position you want beats correcting the one you do not.",
        "Settling away from home — outside a shop, at a café table, in the car. It is the most transferable thing you can teach and the least practised.",
        "Impulse-control foundations, in their simplest form: waiting a beat before the door opens, before the bowl goes down, before the lead comes off. Short, boring, and enormously useful later.",
        "Handling that stays cooperative: a paw offered rather than taken, ended before the puppy wants it to end. The mouth needs looking at more often now, so it is worth being easy.",
        "One set of rules across the household. A puppy can learn any rule and cannot learn four versions of it, and this is the age where inconsistency starts to show.",
      ],
      guide: {
        slug: "loose-leash-walking-and-recall",
        label: "Lead work and recall, built properly",
      },
    },
    {
      id: "toilet-training",
      title: "House-training",
      summary: "Usually good. Usually not finished.",
      body: [
        "Most puppies are reliable for long stretches by now, which is exactly when the routine gets relaxed and the accidents come back. Extend the intervals gradually rather than withdrawing the schedule, and keep some supervision indoors — an unwatched puppy with a full bladder in a room you are not in is not a training failure waiting to happen, it is one already underway.",
        "Expect setbacks around change: a new schedule, a house move, a stretch of bad weather, a day left longer than usual. Accidents are information about what changed rather than misbehaviour, and punishing them teaches a dog to go where you cannot see it — which is a harder problem than the one you started with.",
        "One thing is worth separating from training entirely. A dog that was reliably house-trained and suddenly is not, particularly with straining, increased frequency, obvious urgency or blood, needs a veterinary opinion before anyone reaches for a training plan.",
      ],
    },
    {
      id: "exercise",
      title: "Exercise and activity",
      summary: "More, gradually, and still not far.",
      body: [
        "Outings can lengthen in this period, and the useful measure is variety rather than distance. A route with new surfaces, things to sniff and places to stop does more for a young dog than the same loop done faster, and sniffing tires them in a way walking does not.",
        "We are not going to give you a minutes-per-month formula, because there is not a sound one. What is worth understanding is the shape: free movement at the puppy's own pace, where it can stop when it wants to, is good for it. Repetitive forced exercise — running alongside a bicycle, long stair sessions, throwing a ball until the dog drops — is the thing to be careful with while the growth plates are open, and how careful depends on how big this dog is going to be.",
        "Mental work still does more than mileage. Five minutes of training, a scattered handful of food, or a new place to investigate will empty a four-month-old more thoroughly than an extra kilometre will.",
      ],
    },
    {
      id: "neutering",
      title: "The neutering conversation",
      summary: "A discussion window, not a date — and the answer depends on size.",
      body: [
        "If your dog is going to be neutered, this is roughly when the conversation starts, and the single most important thing to know is that there is no universal age. The American Animal Hospital Association's guidance splits on projected adult bodyweight, at 45 pounds.",
        "For a dog expected to be under that, the recommended timing is around six months for castration and before the anticipated first heat — five to six months — for spaying. For a dog expected to be over it, the recommendation is to wait until growth is complete, usually somewhere between nine and fifteen months for males, with a wider individualised window for females. The reasoning is not arbitrary: it balances risks that pull in opposite directions, and the guidelines themselves caution that findings in one breed may not transfer to another.",
        "So the useful thing to do at the start of this stage is not to book anything. It is to establish which side of that line your dog is likely to fall on, and to agree a plan with your veterinarian rather than accept a default.",
        "Where that leads differs by the end of it. For a smaller dog the conversation usually stops being a discussion somewhere around six months and becomes a date — the timing depends on sex, on how the individual dog is developing and on your veterinarian's assessment, not on the calendar alone. For a larger dog it commonly stays a plan for months yet, and pulling it forward to match a friend's small dog is the thing the size split exists to prevent.",
        "One practical note if a procedure is being arranged. A dog under anaesthetic can sometimes have other things attended to in the same event — a baby tooth that has not come out on its own being the common example at this age. That is worth asking about rather than assuming; it is neither universal nor required, and it depends entirely on what your veterinarian finds.",
      ],
      guide: {
        slug: "spaying-and-neutering-in-canada",
        label: "Why the timing question has changed, and what to weigh",
      },
    },
    {
      id: "feeding",
      title: "Feeding",
      summary: "Still growth food, and body condition beats any chart.",
      body: [
        "Stay on a diet formulated for growth. It is too early to move to adult food, and how much longer depends on how big this dog will be — that is a question for your veterinarian rather than a bag, and it belongs at an appointment where the puppy is on the scales anyway.",
        "The more useful skill at this age is reading the dog rather than the label. You should be able to feel ribs without pressing hard, and see a waist from above. Quantities get adjusted against that, in consultation with your clinic, rather than against a table — puppies of the same age and the same weight can genuinely need different amounts.",
        "Meals remain the cheapest training currency you have. A portion of the daily food delivered by hand during short sessions buys repetitions that a bowl does not.",
      ],
      guide: {
        slug: "reading-a-canadian-pet-food-label",
        label: "What the label does and does not tell you",
      },
    },
    {
      id: "sleep",
      title: "Sleep",
      summary: "Less obvious, still needed.",
      body: [
        "Nights are usually settled. The daytime rest is what slips, because the dog is better company now and gets included in more. An over-tired four-month-old does not look tired — it looks rude, mouthy and unable to settle, and it is at its worst in the late afternoon.",
        "Keep a rest routine rather than waiting for the dog to opt into one, and use the settle work from the training section: a mat and a chew in a quiet room is both rest and practice.",
      ],
    },
    {
      id: "grooming",
      title: "Handling and grooming",
      summary: "Short, regular, and increasingly about the mouth.",
      body: [
        "Keep the sessions brief and cooperative. What changes here is that the mouth is worth looking at more often — lifting a lip to see how the teeth are coming in should be an unremarkable thing that happens a few times a week, not an event.",
        "Coat care depends on what this dog is growing. If a professional groomer is in the picture, keep the appointments going as short positive visits rather than waiting until one is needed, because the first appointment that is required rather than chosen is the one that goes badly.",
      ],
    },
    {
      id: "veterinary-care",
      title: "Veterinary care",
      summary: "Confirm the series, look at the mouth, open the neutering question.",
      body: [
        "There is usually an appointment in this period and it is a useful one to prepare for, because three separate conversations land at once: whether the vaccination series is complete, how the mouth is coming along, and the shape of the neutering decision.",
        "Take the record. Ask for the series to be confirmed as finished rather than inferring it, ask what that changes about where you can go, and ask what your parasite plan is for the season ahead rather than for today.",
      ],
      guide: {
        slug: "finding-a-veterinarian-in-canada",
        label: "Choosing a practice before you need one",
      },
    },
    {
      id: "vaccine-questions",
      title: "Vaccination: two conversations, months apart",
      summary: "Confirm the series is finished. Then, around six months, expect a second question.",
      tone: "caution",
      body: [
        "The mistake this stage invites is inference. A dog that had an injection two months ago, is bigger, and is plainly thriving feels finished — and roughly as often as not, it is not. Whether the series is complete depends on when it began and how the doses were spaced, and neither of those is visible from a calendar or from the dog.",
        "So the job at the start of this stage is a single confirmation, obtained out loud, and then a second question about what it changes. Both the American Animal Hospital Association and the World Small Animal Veterinary Association put the last dose at sixteen weeks or later, which is a point many dogs pass mid-way through this stage rather than before it. Get the answer as a yes or a date, not as an impression, and write it down.",
        "Then, towards the end of this stage, a second conversation often appears, and it surprises people who thought the subject was closed. The World Small Animal Veterinary Association advises considering revaccination at or after 26 weeks of age as an alternative to waiting until twelve to sixteen months, not as an addition to it. It is worth being precise about why, because the reasoning is not what most owners assume.",
        "It is not that a dose is due, and it is not an extra vaccine bolted onto the schedule. It is that maternal antibody interferes with the vaccines given early in life, it fades on a timetable nobody can see from outside, and a small minority of puppies still have enough of it at sixteen weeks to blunt that final dose. Nobody can tell which puppies those were. Bringing the next dose forward from a year to around six months shortens the window in which that minority is unprotected. It replaces an appointment rather than adding one.",
        "Two consequences follow for you. First, this is a clinical judgement rather than a rule, and practice genuinely differs — the American Animal Hospital Association still frames it as a booster within the first year, so a clinic that does not raise it at six months is not behind. Ask which approach yours follows and why, rather than assuming either. Second, there is an alternative: WSAVA supports serological testing from twenty weeks onwards to check whether a dog has actually responded, which for some dogs and some owners is a better answer than another dose. Whether it is available and appropriate is a question for your veterinarian.",
      ],
      points: [
        "Is the primary series complete? If not, what is outstanding and when is it due?",
        "Now that it is, what changes about where I can take this dog — and what does not?",
        "Are there places you would still avoid around here, and for how long?",
        "Do you follow the 26-week approach, or the twelve-month one? Which is it for this dog, and why?",
        "Would serology be appropriate here instead, or is that not something you offer?",
        "What parasite prevention should be running, and for how many months this year?",
        "Is the rabies requirement where we live satisfied, and is it on the record?",
      ],
      guide: {
        slug: "puppy-vaccination-schedule-in-canada",
        label: "Why it is a series, and what core actually means",
      },
    },
    {
      id: "parasite-prevention",
      title: "Parasite prevention",
      summary: "More time outdoors changes the exposure, not just the season.",
      body: [
        "A dog that is now walking further, on more surfaces and in longer grass has a different exposure profile from the one that was mostly in your garden a month ago. That is worth saying out loud at the appointment, because the plan follows the lifestyle as much as the postcode.",
        "The Canadian specifics still matter: heartworm prevention is seasonal in most of the country and its start follows the local mosquito season rather than a month on the calendar, and tick activity runs longer at both ends of the year than most people expect. Ask for dates, and ask what to do if one is missed.",
      ],
      guide: {
        slug: "parasite-prevention-for-pets-in-canada",
        label: "Region and season, and what actually drives the timing",
      },
    },
    {
      id: "safety",
      title: "Safety",
      summary: "A taller, bolder dog with a mouth that wants something to do.",
      body: [
        "The hazard list moves up and outwards again, and the chewing makes the ingestion risk the one to take most seriously.",
      ],
      points: [
        "Swallowed objects, still the most likely serious accident. Socks, stones, corn cobs, string and the stuffing out of a toy remain the usual culprits, and a chew worn down small becomes one.",
        "Counters and tables, now within reach of a dog that has worked out it can stretch.",
        "Roads and doors. Confidence has arrived well ahead of road sense, and the first serious escape usually happens somewhere around here.",
        "Car travel with the dog secured rather than loose in a footwell.",
        "Off-lead decisions. A recall that works in the garden is not a recall, and an unfenced space is not the place to find that out.",
        "Long grass, standing water and wildlife faeces on longer walks, which is a parasite question as much as a safety one.",
      ],
    },
    {
      id: "red-flags",
      title: "When to call a veterinarian",
      summary: "The usual list, plus two things this stage makes more likely.",
      tone: "caution",
      body: [
        "A dog is still in the pediatric period at this age \u2014 needing proportionally more fluid than an adult, and able to become dehydrated faster \u2014 so repeated vomiting, persistent diarrhoea or poor intake is worth a call sooner than it would be in a grown dog. The threshold for phoning stays low for that reason, not because every symptom means more in a young dog. Telephone triage is a normal part of what a clinic does, it usually costs nothing, and the answer is one of three things: come now, come in the morning, or here is what to watch for.",
        "Contact your veterinary clinic — rather than waiting to see whether it settles — if a puppy will not eat, is repeatedly vomiting or has persistent diarrhoea, is unusually limp or unresponsive, is breathing with effort, has not urinated in an unusually long stretch, is straining without producing anything, or you have any reason to think it has swallowed something it should not have.",
        "Two things belong on the list at this age in particular. Anything wrong in the mouth — a baby tooth still firmly in place next to its replacement, a broken tooth, bleeding that does not stop, or a dog that has gone off food and seems sore rather than itchy — is worth having looked at rather than waiting for it to sort itself out. And a dog that was house-trained and abruptly is not, especially with straining, urgency or blood, is a medical question before it is a training one.",
        "Limping or reluctance to bear weight after a walk or a fall should also be examined rather than rested and hoped over. A growing skeleton is not a small adult one.",
        "This describes what to look for so you know when to call. It does not diagnose, and it is not a substitute for examining your dog — only a veterinarian who has seen it can do that.",
      ],
      guide: {
        slug: "emergency-vet-visits-in-canada",
        label: "The hour of preparation that decides how the worst night goes",
      },
    },
    {
      id: "whats-next",
      title: "What's next",
      summary: "Six months, and the last stretch before things get interesting.",
      body: [
        "By the end of this stage the mouth is close to finished, the outings are ordinary, and the two conversations this phase raises — the neutering plan and the booster question — have usually been had. What is left is the last quiet stretch.",
        "Adolescence is further off than the internet suggests. The research that documents a dip in trainability puts it at around eight months, and finds it passes — dogs are more trainable before it and after it. Nothing about that is happening yet, and treating a five-month-old as a teenager is a good way to apply pressure where practice was needed. The work you are doing now, in harder places and with less to show for it than you would like, is what the dog comes back to on the other side.",
      ],
    },
  ],

  checklist: [
    { id: "confirm", label: "Ask your veterinarian to confirm the series is complete", detail: "And what it changes about where you can go. Do not infer it from a date." },
    { id: "proof", label: "Puppy-proof again, at the new height", detail: "Chair legs, table edges, cables and shoes that were out of reach last month." },
    { id: "chews", label: "Set up a chew rotation and check items for wear", detail: "Too large to swallow, and ask your veterinarian about hardness." },
    { id: "mouth", label: "Look in the mouth a few times a week", detail: "A baby tooth still firmly in place beside its replacement is worth mentioning." },
    { id: "longline", label: "Practise recall on a long line, against real distraction" },
    { id: "settle", label: "Practise settling away from home — outside a shop, in the car" },
    { id: "neuter", label: "Start the neutering timing conversation", detail: "The answer depends on projected adult size, so start by establishing that." },
    { id: "house", label: "Extend the toilet routine rather than withdrawing it" },
    { id: "condition", label: "Learn to feel body condition rather than following a chart" },
  ],

  sources: [
    {
      label: "Pediatric patients need proportionally more fluid than adults and can progress rapidly from mild dehydration to hypovolaemia; hypoglycaemia and electrolyte disturbance are the companion concerns",
      publisher: "Lee JA, Cohn LA, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017 (PMID 27939859)",
      url: "https://doi.org/10.1016/j.cvsm.2016.09.010",
    },
    {
      label: "Dental development of dogs — permanent teeth appear at around four to five months, complete by about seven",
      publisher: "Merck Veterinary Manual",
      url: "https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/dental-development-of-dogs",
    },
    {
      label: "2019 AAHA Canine Life Stage Guidelines — recommended timing for canine sterilization, split at 45 lb projected adult bodyweight",
      publisher: "American Animal Hospital Association",
      url: "https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/canine-life-stage-2019/2019-aaha-canine-life-stage-guidelines-final.pdf",
    },
    {
      label: "2022 AAHA Canine Vaccination Guidelines — continuing the initial series past sixteen weeks",
      publisher: "American Animal Hospital Association",
      url: "https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/",
    },
    {
      label: "2024 Guidelines for the Vaccination of Dogs and Cats — final puppy dose at sixteen weeks or older, and revaccination at or after 26 weeks rather than at 12 to 16 months",
      publisher: "World Small Animal Veterinary Association",
      url: "https://wsava.org/wp-content/uploads/2024/04/WSAVA-Vaccination-guidelines-2024.pdf",
    },
    {
      label: "Teenage dogs? Evidence for adolescent-phase conflict behaviour — reduced trainability at around eight months, with five months as pre-adolescence",
      publisher: "Asher et al., Biology Letters (2020)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7280042",
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
    "RESOLVED \u2014 NARROWED, 2026-09-06. This stage previously said a young dog \u201chas less reserve than an adult and can deteriorate faster\u201d (and equivalents). No source was found for that as a general physiological claim and it is no longer asserted. What replaced it is the one mechanism that is sourced: Lee JA and Cohn LA, \u201cFluid Therapy for Pediatric Patients\u201d, Veterinary Clinics of North America: Small Animal Practice 47(2), 2017, PMID 27939859, verified 2026-09-06, which states that \u201cpediatric patients have a higher fluid requirement compared with adults and can rapidly progress from mild dehydration to hypovolemia\u201d and that pediatric fluid therapy \u201cmust address hydration, vascular fluid volume, electrolyte disturbances, or hypoglycemia\u201d. Hoskins JD, PMID 10390787, anchors the pediatric window at birth to about six months, which covers every stage carrying this wording. LIMITATION \u2014 fluid and glucose only, not reserve across every organ system, and not a claim that illness in general progresses faster. The red-flag list and the threshold for phoning are unchanged; only the explanation is.",
    "STANDING GUARDRAIL \u2014 Do not generalise pediatric dehydration/metabolic evidence into a blanket claim that young dogs have lower physiological reserve across all illness or deteriorate faster in every emergency. The claim is licensed for fluid loss and, as a named veterinary concern, hypoglycaemia \u2014 nothing wider.",
    "STANDING GUARDRAIL \u2014 The neonatal evidence (Merck, Management of the Neonate in Dogs and Cats: first 21 days, no thermoregulation until four weeks, absent glucose reserves and minimal gluconeogenesis) must NOT be applied to these stages. Every Journey stage begins at eight weeks or later, well past the neonatal period. Do not introduce immature thermoregulation, neonatal glucose reserves or neonatal fasting physiology into any stage.",
    "British Columbia is a *positive* claim only, as of 2026-09-06. The BCCDC page was read and says verbatim that rabies vaccines are available for cats, dogs and ferrets and that \u201cyour pets should be vaccinated, and their immunizations should be kept up to date\u201d. The earlier copy went further and said provincial law does not compel vaccination \u2014 a negative legal claim, and no authoritative source could be found that states it. Proving the absence of a law is a different exercise from reading one, and the BCCDC page, the BC Rabies Guidance for Veterinarians and the CVBC summary table were all retrieved and none of them says it. The copy now states what BCCDC recommends, says plainly that we are not presenting a province-wide legal requirement, and explicitly leaves municipal, travel, import and bite-investigation rules open. Do not restore the stronger wording without a named statute or regulation.",
    "Permanent eruption is attributed to Merck (around four to five months, complete by about seven). No eruption order, tooth count or peak-chewing age appears and none should be added without a source.",
    "Retained deciduous teeth are described as worth a veterinary look, without a prevalence, a breed pattern or a treatment. The AAHA life stage guidelines mention correcting persistent deciduous teeth; that is the basis for raising it, not for advising on it.",
    "Sterilization timing is quoted from the 2019 AAHA Canine Life Stage Guidelines, Textbox 1, including the 45 lb projected-adult-bodyweight split. No universal age appears, the guidelines' own caution that findings in one breed may not transfer to another is carried, and the page books nothing.",
    "That many puppies complete the primary series around this period is stated as depending on records and the veterinary plan, never as a schedule. The final-dose ages stay attributed to AAHA and WSAVA.",
    "The 26-week point follows WSAVA 2024, which advises considering revaccination at or after 26 weeks rather than waiting until 12 to 16 months, to reduce the window for the minority still carrying interfering maternal antibody at 16+ weeks. It is written as a decision that replaces an appointment rather than adds one, is explicitly not presented as a universal six-month vaccine, records that AAHA frames it differently, and carries WSAVA's serology alternative from 20 weeks. Do not let an edit turn any of that into a timetable.",
    "That retained deciduous teeth are sometimes addressed during a neutering anaesthetic is stated as something to ask about, explicitly not universal and not required. AAHA's life stage guidelines mention correcting persistent deciduous teeth in that context; that is the basis for raising it, not for advising on it.",
    "That permanent dentition is progressing towards completion by six months follows Merck's 'by about seven months', stated as progression rather than as an end point. There is no claim that teething finishes at six months, and none should be added.",
    "That this stage is not adolescence is attributed to Asher et al., who place the trainability dip at around eight months and treat five months as pre-adolescence. Do not introduce adolescent framing here.",
    "No 'second fear period' language appears anywhere. The differentiation gate found no peer-reviewed basis for it at any age; it stays out until one exists.",
    "No minutes-per-month exercise formula appears, and the page says explicitly that there is not a sound one. The growth-plate reasoning names no age, distance or rule.",
    "Feeding gives no quantities, no calorie tables and no adult-weight prediction. Body condition is described qualitatively (ribs felt without pressing, waist visible from above); attach a body-condition-score source before it is made more precise.",
    "No adult-food transition appears at any point in this stage, deliberately. Merck ties the switch to skeletal maturity rather than calendar age, and puts that at eight to twelve months in small and medium dogs and up to fifteen or sixteen in large and giant ones. A universal six-month transition would be wrong for every size.",
    "That a sudden loss of house-training warrants veterinary attention is stated as a reason to ask rather than a diagnosis, and names no condition.",
  ],
};


/**
 * Seven to eight months — adolescence.
 *
 * ## The one thing this stage exists to say
 *
 * A dog that was reliable at five months and is not at eight has not
 * forgotten anything, and is not being stubborn or dominant or defiant. Asher
 * et al. found something more specific and more useful than any of those: the
 * drop in obedience was **carer-specific**. Dogs responded less to a "sit"
 * from their own carer during adolescence — and *more* to the same cue from a
 * stranger. Carers rated trainability lower at eight months than at five or
 * twelve; professional trainers working with the same dogs rated it *higher*.
 *
 * That reframes the whole experience. It is not a capability that has gone. It
 * is a relationship under load, at the same time as the world has become far
 * more interesting than you are.
 *
 * So the theme is: **adolescence changes the test, not the training
 * principles.** Everything that worked still works. It has to be run at a
 * difficulty the dog can currently pass.
 *
 * ## How the evidence is handled
 *
 * Carefully, because it is easy to over-read. The study followed guide dogs —
 * German shepherds, golden and Labrador retrievers and crosses — not a
 * representative sample of pet dogs, and it says itself that "age groupings
 * would need to be reconsidered for different breeds". So this stage never
 * says adolescence begins at seven months, or at eight, or that every dog
 * goes through it on a schedule. It says a measurable dip was found around
 * adolescence, in one longitudinal study, at approximately eight months.
 */
export const sevenToEightMonths: PuppyStage = {
  slug: "7-8-months",
  label: "7–8 months",
  title: "Your 7 to 8-Month-Old Dog",
  deck:
    "The stage where a dog that knew things appears to stop knowing them. It has not forgotten, and it is not being difficult — the research points somewhere far more useful than that.",
  metaDescription:
    "Why an adolescent dog seems to lose its training around seven and eight months, what the research actually found, and how to train and manage a dog whose reliability has dipped.",
  mediaId: "puppy-seven-eight-months",
  mediaAlt:
    "A lean dog in a plain harness standing on open heathland at the end of a long line, attention fixed on something out of frame.",
  reviewBy: "2027-09-01",
  indexable: true,
  status: "in-review",

  sections: [
    {
      id: "this-week",
      title: "Where you are now",
      summary: "Adolescence changes the test, not the training.",
      body: [
        "Something happens around this age that almost every owner experiences and almost nobody is warned about properly. A dog that came when called at five months stops coming. A dog that walked reasonably starts pulling. The sit that was solid in the kitchen is suddenly optional. It feels like the training has come undone, and it is the point at which a great many people are told their dog is being dominant, stubborn or spiteful.",
        "It is none of those. The best evidence available on this is a longitudinal study of guide dogs by Asher and colleagues, and what it found is oddly specific: around adolescence — at approximately eight months in that study — carers rated their dogs as less trainable than at five months or at twelve. But the dogs' professional trainers rated the same dogs as being more trainable at that age, not less. And when obedience was tested directly, the dogs responded less to a cue from their own carer while responding better to the same cue from a stranger.",
        "So nothing has been lost. What has changed is the difficulty of the test — a much more interesting world, a body that can act on that interest, and a relationship going through something. The training principles do not change at all. What has to change is the level you are asking at.",
        "Two caveats worth carrying. That study followed guide dogs — German shepherds, golden and Labrador retrievers and crosses of them — rather than a cross-section of pet dogs, and it says plainly that the age groupings would need reconsidering for different breeds. So treat eight months as where a measurable dip was found in that population, not as a date your dog is due on. When adolescence arrives, and how obvious it is, varies by breed, by size and by the individual animal.",
      ],
      points: [
        "Reliability dropping is expected here. It is not evidence that the earlier work failed.",
        "The dip is temporary — in that study dogs were rated more trainable again by twelve months.",
        "Lower the difficulty rather than raising the pressure.",
        "This is the worst possible moment to increase a dog's freedom.",
        "Nothing here is a reason to punish a dog, and punishment at this age tends to cost you the recall you are trying to rebuild.",
      ],
    },
    {
      id: "development",
      title: "What is actually changing",
      summary: "More interest, more capability, and a relationship under load.",
      body: [
        "Three things arrive at once. The environment has become genuinely more compelling — other dogs, scent, movement, distance. The body can now act on that: this is a dog that can cover ground, get through a gap and be forty metres away before the thought has finished. And the attachment relationship itself is doing something.",
        "That last point is the one worth sitting with, because it is where the evidence is most interesting. The reduced responsiveness in the Asher study was directed at the carer specifically, not at people in general. There is also a reported association between separation-related behaviour at eight months and lower obedience to the carer at the same age — which reads less like a dog that has stopped caring and more like one whose relationship with you is the thing under strain.",
        "The practical consequence is that pushing harder tends to make it worse, and that the answer is more reinforcement and less confrontation rather than the reverse.",
      ],
    },
    {
      id: "training",
      title: "Training through the dip",
      summary: "Everything still works. Run it at a level the dog can pass.",
      body: [
        "This is the section that matters most at this age, and its whole content is one instruction applied in several places: when reliability drops, lower the difficulty. That is not a retreat. A behaviour rehearsed successfully at an easy level is being strengthened; the same behaviour failed repeatedly at a hard one is being weakened, and the dog is also learning that your cue can be ignored without consequence.",
        "Nothing on this list produces a reliable dog by nine months, and treating any of it as finished is how the next six months go badly.",
      ],
      points: [
        "Go back a rung, deliberately. If recall fails in the park, it is not a park behaviour yet — take it to the garden, then the quiet end of the road, and build back up.",
        "Rebuild recall on a long line so that it can never fail without consequence and never be tested before it is ready. A recall you cannot back up is a recall you are teaching the dog to ignore.",
        "Raise the reinforcement, considerably. What worked at four months does not pay for coming away from another dog at eight. This is the age to be generous rather than principled about it.",
        "Shorten sessions when the dog is wound up. An aroused adolescent is not learning much, and stopping early is a training decision rather than a failure of one.",
        "Generalise again from scratch. Cues that transferred easily at five months may need re-teaching in each context now, and that is ordinary rather than a sign anything is wrong.",
        "Manage the environment so the dog cannot practise what you do not want. A long line, a closed door and a bit of distance do more this month than any correction.",
        "One set of rules across the household. Inconsistency was survivable at four months; it is expensive now.",
        "Do not punish deterioration. It does not restore the behaviour, and it costs you the willingness to come back to you that recall is built on.",
      ],
      guide: {
        slug: "loose-leash-walking-and-recall",
        label: "Lead work and recall, built properly",
      },
    },
    {
      id: "freedom",
      title: "Freedom, and how much has been earned",
      summary: "The commonest mistake here is treating a big dog as a finished one.",
      body: [
        "An adolescent looks adult, and it is tempting to give it adult freedom — off the lead in open space, out of sight in the garden, loose near a road. This is precisely the period in which that goes wrong, because the dog's interest in the world has outrun its willingness to check in with you.",
        "The useful principle is that freedom follows demonstrated recall rather than age or size. If the recall is not working today, today is not the day for the unfenced field. A long line lets you give a dog space without giving it a choice you cannot influence, and it is the single most useful piece of equipment of this stage.",
        "Be sceptical of a good week. Adolescent reliability is intermittent by nature, and one successful outing is not evidence of a pattern — it is one data point among several that went the other way. The dogs that end up in trouble at this age are usually the ones whose owners were persuaded by a good Tuesday.",
      ],
      points: [
        "Recall first, freedom second, in that order and not the other one.",
        "Use a long line where it is appropriate and permitted, rather than hoping.",
        "Doors, gates and car doors deserve active management. Confidence has arrived; road sense has not.",
        "Wildlife, livestock and other dogs are the three things most likely to beat your recall. Plan routes accordingly.",
        "Local rules on where a dog may be off-lead vary by municipality and are worth actually checking.",
      ],
      guide: {
        slug: "pet-licensing-across-canada",
        label: "What municipalities regulate, and how much it varies",
      },
    },
    {
      id: "social-behaviour",
      title: "Other dogs, and the wider world",
      summary: "More interest, higher arousal, and no need to interact with everything.",
      body: [
        "Interest in other dogs typically increases at this age, and so does arousal around them. A dog that used to walk past another dog may now pull, vocalise or fixate — which is frustrating rather than sinister, and is usually about excitement and poor impulse control rather than anything darker.",
        "The instinct is to let them greet, or to head for a dog park to burn it off. Both tend to make it worse. Rehearsed excitement on approach teaches a dog that other dogs mean an explosion of activity, and a busy dog park is a room full of strangers with mismatched play styles and no supervision. The more useful currency at this age is neutrality: being near other dogs, calmly, without interacting.",
        "Good social experience still matters. It just looks like a walk alongside a known, well-mannered adult dog, or sitting at a distance and being paid for noticing another dog without reacting — rather than an hour of unsupervised free-for-all.",
        "If something genuinely new appears — a dog that was fine with something and now finds it frightening — treat it as an individual change rather than a phase to wait out. Reduce the pressure, increase the distance, and rebuild the confidence gently. If it is severe, persistent, or getting worse, that is a conversation with your veterinarian and, if appropriate, a qualified behaviour professional rather than something to push through.",
      ],
      guide: {
        slug: "puppy-socialisation-checklist",
        label: "Reading the dog, and what good exposure looks like",
      },
    },
    {
      id: "exercise",
      title: "Exercise and activity",
      summary: "More capable than it was. Not yet a finished animal.",
      body: [
        "An adolescent can do more than a four-month-old, and the temptation is to solve the behaviour with mileage. It rarely works: a fitter dog is a dog that needs more the following week, and exhaustion is not the same as satisfaction.",
        "Vary it instead. Sniffing, exploring, new surfaces and problem-solving tire an adolescent in a way that repetition does not, and a walk where the dog gets to make decisions does more for the relationship than one where it is marched.",
        "Physical maturity has not arrived. Growth plates take longer to close in larger dogs than smaller ones, and repetitive forced exercise — running alongside a bicycle, long stair sessions, throwing a ball until the dog drops — is still the thing to be careful with. Building endurance deliberately is a conversation to have with your veterinarian, in the context of how big this dog will be.",
      ],
    },
    {
      id: "feeding",
      title: "Feeding",
      summary: "Still growth food for most, and the trigger is not a birthday.",
      body: [
        "The question that arrives at this age is when to move to adult food, and the honest answer is that the trigger is skeletal maturity rather than a number of months. Merck puts that at roughly eight to twelve months in small and medium dogs and, for some large and giant breeds, closer to fifteen or sixteen — so a dog of this age is at the earliest edge of it if it is small, and nowhere near it if it is not.",
        "Ask, rather than deciding. And in the meantime the useful skill is body condition rather than quantity: ribs that can be felt without pressing hard, a waist visible from above. Adolescent appetites swing, and adjusting against the dog in front of you beats adjusting against a chart.",
      ],
      guide: {
        slug: "reading-a-canadian-pet-food-label",
        label: "What the label does and does not tell you",
      },
    },
    {
      id: "teething",
      title: "Teeth",
      summary: "Short, because the hard part is over.",
      body: [
        "Merck puts the full set of permanent teeth in place by about seven months, so for most dogs this is the far side of teething rather than the middle of it. Chewing usually continues — it is a normal thing for dogs to do and a useful thing to give them — but it should no longer be the dominant fact of the household.",
        "What is worth raising rather than watching: a baby tooth still in place beside its adult replacement, a broken tooth, or a mouth that seems sore. Those are veterinary questions and this is a reasonable point to have the mouth looked at properly.",
      ],
      guide: {
        slug: "dental-care-for-dogs-and-cats",
        label: "The mouth you are looking after for the next decade",
      },
    },
    {
      id: "neutering",
      title: "Neutering, if it has not happened",
      summary: "For larger dogs the window is approaching rather than open.",
      body: [
        "If your dog was going to be neutered early it usually has been by now, and if it is a larger dog it usually has not. The American Animal Hospital Association's guidance splits on projected adult bodyweight at 45 pounds: below it, around six months for castration and before the first heat for spaying; above it, waiting until growth is complete, which it puts at usually nine to fifteen months for males with a wider individualised window for females.",
        "So for a bigger dog this stage is the run-up rather than the decision point, and there is no need to bring it forward because the dog is being difficult. Adolescent behaviour is not by itself a reason to neuter, and the guidelines are explicit that findings in one breed may not transfer to another — which is why this is a conversation with your own veterinarian rather than something to settle from a table.",
        "One thing worth separating: adolescence and sexual maturity are not the same thing and do not arrive together on a fixed schedule. When an individual dog matures depends on its size, its breed and itself.",
      ],
      guide: {
        slug: "spaying-and-neutering-in-canada",
        label: "Why the timing question has changed, and what to weigh",
      },
    },
    {
      id: "veterinary-care",
      title: "Veterinary care",
      summary: "A quieter period, with a short list worth raising.",
      body: [
        "There is often no routine appointment in this window, which makes it worth being deliberate about the things that would otherwise wait. The mouth, now that the adult teeth are in. The neutering plan, if it is still open. Weight and body condition, because adolescent growth and adolescent appetite do not always move together.",
        "And behaviour, if something is genuinely worrying you. A sudden change — new fear, new reactivity, a dog that is off in itself — is worth mentioning rather than filing under adolescence, because \u201cit is just his age\u201d is a comfortable explanation that occasionally hides a physical one.",
      ],
      guide: {
        slug: "finding-a-veterinarian-in-canada",
        label: "Choosing a practice before you need one",
      },
    },
    {
      id: "parasite-prevention",
      title: "Parasite prevention",
      summary: "More range, more exposure, same plan — checked.",
      body: [
        "A dog covering more ground, in longer grass and further from paths, has a different exposure profile from the one walking round the block six months ago. The plan should follow that rather than the postcode alone.",
        "It is worth checking the dates rather than assuming continuity, particularly at the ends of the season: heartworm prevention is seasonal in most of Canada and follows the local mosquito season, and tick activity runs longer at both ends of the year than most people expect.",
      ],
      guide: {
        slug: "parasite-prevention-for-pets-in-canada",
        label: "Region and season, and what actually drives the timing",
      },
    },
    {
      id: "safety",
      title: "Safety",
      summary: "A fast, confident dog with unreliable brakes.",
      body: [
        "The risk profile at this age is dominated by one thing: a dog that can move quickly and decide independently, attached to a recall that is not currently dependable.",
      ],
      points: [
        "Roads, and the gap between a dog that has never run into one and a dog that will not.",
        "Doors, gates and car doors — the three places an adolescent gets loose.",
        "Wildlife and livestock, which will beat your recall on the day it matters.",
        "Swallowed objects, still a real risk in a dog that chews.",
        "Identification: a collar tag that is current, and a microchip registration in your name with a phone number that works. This is the age at which it gets used.",
        "Off-lead spaces chosen for their boundaries rather than their convenience.",
      ],
    },
    {
      id: "red-flags",
      title: "When to call a veterinarian",
      summary: "Adolescence explains a lot. It does not explain everything.",
      tone: "caution",
      body: [
        "Contact your veterinary clinic — rather than waiting to see whether it settles — if a dog will not eat, is repeatedly vomiting or has persistent diarrhoea, is unusually limp or unresponsive, is breathing with effort, has not urinated in an unusually long stretch, is straining without producing anything, or you have any reason to think it has swallowed something it should not have.",
        "The specific risk at this age is attribution. A behaviour change that arrives suddenly is easy to file under adolescence and occasionally has a physical cause — pain, most often. A dog that has become reluctant to jump, is snappy about being touched somewhere it was not before, has changed how it moves, or is off in itself as well as being difficult, is worth examining rather than training through.",
        "Limping or reluctance to bear weight should be looked at rather than rested and hoped over; a growing skeleton is not a small adult one. And a dog that was reliably house-trained and abruptly is not — particularly with straining, urgency or blood — is a medical question before it is a training one.",
        "If a behaviour change is severe, is getting worse, or involves aggression or genuine fear, ask your veterinarian and, where appropriate, a qualified behaviour professional. That is not an escalation; it is the same as asking about a limp.",
        "This describes what to look for so you know when to call. It does not diagnose, and it is not a substitute for examining your dog — only a veterinarian who has seen it can do that.",
      ],
      guide: {
        slug: "emergency-vet-visits-in-canada",
        label: "The hour of preparation that decides how the worst night goes",
      },
    },
    {
      id: "whats-next",
      title: "What's next",
      summary: "It passes. The timing is individual and the direction is not.",
      body: [
        "The most useful thing to know about this period is that it is a phase rather than a new baseline. In the Asher study the dogs rated least trainable at eight months were rated more trainable again at twelve, and the effect was strongest in dogs whose attachment to their carer looked less secure — which is an argument for spending this period building the relationship rather than testing it.",
        "Nine and ten months bring the next part of it: more physical maturity, the later reproductive decisions for larger dogs, and the beginning of the shift towards an adult routine. None of that needs anything from you today beyond continuing to make coming back to you the best available option.",
      ],
    },
  ],

  checklist: [
    { id: "longline", label: "Put a long line back on before you need one", detail: "It lets you give space without giving a choice you cannot influence." },
    { id: "lower", label: "Take one failing behaviour back a rung", detail: "Rehearse it where it succeeds, then rebuild. Failing repeatedly weakens it." },
    { id: "pay", label: "Raise what you are paying for recall", detail: "What worked at four months does not pay for leaving another dog at eight." },
    { id: "neutral", label: "Practise being near other dogs without meeting them" },
    { id: "freedom", label: "Decide freedom by today's recall, not by the dog's size" },
    { id: "rules", label: "Agree one set of rules across the household again" },
    { id: "id", label: "Check the collar tag and the microchip registration", detail: "This is the age at which they get used." },
    { id: "mouth", label: "Have the mouth looked at now the adult teeth are in" },
    { id: "pain", label: "Treat a sudden behaviour change as a possible physical one" },
  ],

  sources: [
    {
      label: "Teenage dogs? Evidence for adolescent-phase conflict behaviour — carer-rated trainability lower at approximately eight months than at five or twelve, with reduced responding to the carer but not to a stranger",
      publisher: "Asher et al., Biology Letters (2020)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7280042",
    },
    {
      label: "Dental development of dogs — all permanent teeth present by about seven months",
      publisher: "Merck Veterinary Manual",
      url: "https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/dental-development-of-dogs",
    },
    {
      label: "Feeding practices in small animals — growth diets until skeletal maturity, which is later in large and giant breeds",
      publisher: "Merck Veterinary Manual",
      url: "https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/feeding-practices-in-small-animals",
    },
    {
      label: "2019 AAHA Canine Life Stage Guidelines — recommended timing for canine sterilization, split at 45 lb projected adult bodyweight",
      publisher: "American Animal Hospital Association",
      url: "https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/canine-life-stage-2019/2019-aaha-canine-life-stage-guidelines-final.pdf",
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
    "Every adolescence claim is attributed to Asher et al. 2020 and stated as what that study found rather than as a universal timeline. The page never says adolescence begins at seven or eight months, never says every dog loses its recall, and never gives a breed-independent schedule. Do not let an edit convert 'a measurable dip around adolescence, at approximately eight months in one study' into 'adolescence starts at eight months'.",
    "The study followed guide dogs — German shepherds, golden and Labrador retrievers and crosses — not a representative sample of pet dogs, and states that age groupings would need reconsidering for different breeds. That limitation is carried in the prose and must stay.",
    "The carer-specific finding (reduced responding to the carer's cue but not a stranger's, and trainers rating the same dogs higher) is the page's central claim and is quoted from the study. It is the reason no 'stubborn', 'dominant' or 'defiant' framing appears anywhere.",
    "No 'second fear period' appears, in any wording. The differentiation gate found no peer-reviewed basis for it at any age. New fear is described as an individual change with a route to professional help, not as a developmental stage.",
    "The association between separation-related behaviour at eight months and lower obedience to the carer is reported as an association, not a cause, and no mechanism is asserted.",
    "No universal sexual-maturity age appears. Adolescence and sexual maturity are explicitly separated, and timing is left to size, breed and the individual.",
    "Sterilization timing is quoted from AAHA's 2019 life stage guidelines with the 45 lb split and their own cross-breed caution. Nothing is booked and adolescent behaviour is explicitly not given as a reason to neuter.",
    "No adult-food transition is recommended. Merck ties it to skeletal maturity — roughly eight to twelve months in small and medium dogs, up to fifteen or sixteen in some large and giant breeds — and the page defers to the veterinarian. No quantities, calorie tables or adult-weight predictions appear.",
    "No exercise formula appears, and physical maturity is explicitly not claimed. The growth-plate reasoning names no age, distance or rule.",
    "The hero photograph is not captioned with an age. The source page describes the dog as adult and the age could not be verified; the alt text describes the long line and the dog's attention, which is what the image is being used for, rather than asserting a life stage.",
  ],
};


/**
 * Nine to twelve months — out of adolescence and into adult care.
 *
 * ## Why this stage is four months long
 *
 * Because nothing separates them. Asher et al. sampled at five, eight and
 * twelve months; there is no measurement at nine or ten, and no authoritative
 * source marks a developmental event there. A 9–10 month page would have been
 * the 7–8 month page again.
 *
 * What *is* new across this span is a cluster of decisions rather than a
 * developmental change: the large-breed sterilisation window opens at nine
 * months, the adult-food transition becomes appropriate at different times
 * depending on how big the dog will be, and the first-year veterinary
 * conversation arrives at the end of it. That is one coherent unit.
 *
 * ## The thing this stage has to hold
 *
 * Almost all of its distinct content is **size-dependent**, and a public stage
 * page renders with no size context at all. So the universal prose has to
 * explain the split honestly — "here is where the answer forks, and here is
 * how to tell which side you are on" — and the modifiers carry the specifics.
 * Writing "switch to adult food now" or "book the neuter now" as universal
 * prose would be wrong for roughly half of readers either way.
 *
 * ## What it must not take
 *
 * The 7–8 month stage owns the adolescent trainability dip, the freedom
 * question and the carer-specific finding. Young adult owns the settled adult
 * routine, the preventive-care cadence and long-term maintenance. This stage
 * is the bridge and should read like one.
 */
export const nineToTwelveMonths: PuppyStage = {
  slug: "9-12-months",
  label: "9–12 months",
  title: "Your 9 to 12-Month-Old Dog",
  deck:
    "The hardest part of adolescence is usually behind you, and the questions change from behaviour to decisions — most of which have different answers depending on how big your dog is going to be.",
  metaDescription:
    "What changes between nine months and the first birthday: coming out of peak adolescence, when larger dogs are neutered, when adult food becomes appropriate, how exercise changes by size, and the first-year veterinary conversation.",
  mediaId: "puppy-nine-twelve-months",
  mediaAlt:
    "A dark, lean dog in a plain harness standing alert in a frosted field of young tree planting, looking off to one side.",
  reviewBy: "2027-09-01",
  indexable: true,
  status: "in-review",

  sections: [
    {
      id: "this-week",
      title: "Where you are now",
      summary: "The behaviour questions ease. The decisions arrive.",
      body: [
        "Something shifts across these four months, and it is less dramatic than what came before. The hardest stretch of adolescence is usually easing — in the Asher study, owner-rated trainability had recovered by twelve months, having dipped around eight — and what replaces it is not another behavioural problem but a set of decisions.",
        "That is the honest shape of this stage. Less about what your dog is doing and more about what you and your veterinarian decide: whether it is time to neuter, whether it is time to change the food, how much exercise this body can now take, and what the first-year appointment should cover.",
        "The complication is that almost none of those questions has one answer. They fork on how big your dog is going to be, and the fork is wide — the same decision that is already settled for a terrier may be six months away for a mastiff. Most of what follows tells you where the fork is rather than which branch to take.",
      ],
      points: [
        "Expect the behaviour to get easier rather than harder, gradually and unevenly.",
        "Neutering timing for larger dogs opens up in this window. For smaller dogs it is usually already done.",
        "Adult food becomes appropriate for some dogs during this stage and not others.",
        "Exercise can build, and how much depends on how much growing is left.",
        "The first-year veterinary conversation is the one appointment in here worth preparing for.",
      ],
    },
    {
      id: "development",
      title: "What is changing",
      summary: "One age, several timetables.",
      body: [
        "Up to now the Journey has been able to say roughly the same thing to everyone. From here it cannot, because this is the point at which dogs of different sizes genuinely stop being on the same schedule.",
        "The American Animal Hospital Association's life stage guidelines describe the puppy stage as running from birth to the cessation of rapid growth, which they put at approximately six to nine months, \u201cvarying with breed and size\u201d — and everything after that as young adult, through to the completion of physical and social maturation \u201cwhich occurs in most dogs by 3 to 4 yr of age\u201d. So a small dog in this window may be structurally finished and behaviourally settling, while a giant-breed dog of exactly the same age is neither.",
        "Behaviourally, the direction of travel is towards easier. The evidence for that is narrow but real: dogs in the Asher study were rated more trainable at twelve months than at eight. It is worth repeating that the study followed guide dogs — German shepherds, golden and Labrador retrievers and crosses of them — rather than a cross-section of pet dogs, and that it says the age groupings would need reconsidering for different breeds. Treat twelve months as where recovery had happened in that population, not as a date anything completes on.",
      ],
    },
    {
      id: "training",
      title: "Training",
      summary: "Consolidation. Practise more, test less.",
      body: [
        "Training matters here and it is no longer the whole story, which is why this section is shorter than the one before it. The work is consolidation rather than repair: reliability comes back unevenly, and the useful response is to raise what you are asking for gradually rather than to find out how much the dog can now do.",
      ],
      points: [
        "Raise criteria in small steps — a little more distraction, a little more distance, a little more duration, and only one of those at a time.",
        "Keep recall in the weekly routine even when it is going well. Recall is maintained rather than achieved, and this is the age at which people stop practising it because it stopped failing.",
        "Keep paying properly. Reinforcement thinning out is the commonest reason a recall that came back quietly goes again.",
        "Practise more than you test. A behaviour rehearsed where it succeeds is being banked; the same behaviour tried somewhere it fails is being spent.",
        "Do not assume transfer. Reliability at this age is still context-bound — a dog solid in three places is solid in three places, not everywhere.",
      ],
      guide: {
        slug: "loose-leash-walking-and-recall",
        label: "Lead work and recall, built properly",
      },
    },
    {
      id: "neutering",
      title: "Neutering, for the dogs it was deferred for",
      summary: "This is where the large-breed window opens — and it is a window, not a date.",
      body: [
        "If your dog is small and was going to be neutered, it almost certainly has been. If it is large, this is the stage the decision comes back.",
        "The American Animal Hospital Association splits its guidance on projected adult bodyweight at 45 pounds. Below that line: around six months for castration, and before the anticipated first heat — five to six months — for spaying. Above it: waiting until growth is complete, which they put at usually nine to fifteen months for males, with a wider individualised window for females, and an explicit instruction to use clinical discretion in balancing the benefits of doing it earlier against the risks of doing it later.",
        "So for a bigger dog, nine months is the start of a range rather than an appointment. What that range is for is the individual conversation: this dog's growth, its sex, its lifestyle and its breed. The guidelines say plainly that findings in one breed may not transfer to another, which is the reason this is settled with your own veterinarian rather than from a table or a friend's experience.",
        "Adolescent behaviour is not by itself a reason to bring it forward. If something about your dog's behaviour is driving the timing question, that is worth discussing as a behaviour question first.",
      ],
      guide: {
        slug: "spaying-and-neutering-in-canada",
        label: "Why the timing question has changed, and what to weigh",
      },
    },
    {
      id: "feeding",
      title: "Feeding, and when growth food stops",
      summary: "The trigger is skeletal maturity, and that is not a birthday.",
      body: [
        "This is the stage where the adult-food question becomes live, and the answer is genuinely different for different dogs. Merck's guidance is to keep feeding a diet formulated for growth until skeletal maturity is reached — not until growth appears to have stopped, and not on a calendar.",
        "Where that lands varies a great deal. Merck puts skeletal maturity at roughly eight to twelve months in small and medium dogs, and notes that for some large and giant breeds it may not be reached until closer to fifteen or sixteen months. So a small dog may be ready during this stage; a giant-breed dog of the same age is probably several months short of it, and moving early is a real risk rather than a saving.",
        "Ask at the next appointment rather than deciding from a bag. And in the meantime the more useful habit is reading the dog: ribs that can be felt without pressing hard, a waist visible from above, and adjustments made against that rather than against a chart. Appetite at this age swings, and so does activity.",
      ],
      guide: {
        slug: "reading-a-canadian-pet-food-label",
        label: "What the label does and does not tell you",
      },
    },
    {
      id: "exercise",
      title: "Exercise",
      summary: "It can build. How fast depends on how much growing is left.",
      body: [
        "Exercise can increase across this stage, and the safe way to do it is progressively — more duration before more intensity, and more variety before either. The thing to avoid is the step change: a dog that has been doing forty minutes on the lead does not become a running companion on a Saturday.",
        "How much restraint is still needed depends on size, because growth plates close later in larger dogs than smaller ones and the radiographic picture varies by breed rather than following a single age. A smaller dog in this window may be approaching what it will be capable of as an adult; a large or giant one is still growing, and repetitive forced exercise — running alongside a bicycle, long stair sessions, jumping down from height, throwing a ball until the dog stops — remains the thing to be careful with.",
        "There is no minutes-per-month formula worth giving you, and no universal age at which running becomes appropriate. What there is, usefully, is a veterinarian who has examined your dog and knows how big it will get. Ask them, in those terms.",
        "Mental work has not stopped mattering. A dog that is worked out but not thought out is a dog that gets fitter and no easier to live with.",
      ],
    },
    {
      id: "veterinary-care",
      title: "The first-year conversation",
      summary: "One appointment worth preparing for, covering more than a vaccine.",
      body: [
        "Somewhere around the first birthday there is usually an appointment that does more than one job, and it is worth going in with a list rather than a question.",
        "The obvious item is vaccination, covered below. The less obvious ones matter as much. Weight and body condition, now that growth is finishing at whatever rate this dog grows. Whether the diet should change and when. A proper look at the mouth, now that the adult teeth have been in for months. The parasite plan for the year ahead rather than the season behind. And, if it is still open, the neutering decision.",
        "It is also the point at which the shape of veterinary care starts to change: from a series of puppy appointments to a routine that will run annually for years. What that routine looks like is a conversation for the appointment itself, and it is the beginning of adult care rather than the end of puppy care.",
      ],
      guide: {
        slug: "finding-a-veterinarian-in-canada",
        label: "Choosing a practice before you need one",
      },
    },
    {
      id: "vaccine-questions",
      title: "Vaccination at the first year",
      summary: "Which path your clinic took determines what happens now.",
      tone: "caution",
      body: [
        "What is due at the first birthday depends on a decision that was made months ago, so the useful first question is which path your dog is on.",
        "The World Small Animal Veterinary Association's guidance offers two routes after the puppy series finishes at sixteen weeks or later. One is revaccination at or after 26 weeks — around six months — which some clinics adopt to shorten the window for the minority of puppies that may still have had interfering maternal antibody at their final puppy dose. The other is the longer-standing route of waiting until twelve to sixteen months. If your dog had a dose at around six months, it took the first path; if it did not, this appointment is where the second one lands.",
        "Either way, WSAVA's position after that point is that core revaccination happens at three years of age and thereafter no more frequently than every three years — so this is not the start of an annual core vaccine. Non-core vaccines decided by lifestyle and geography are a separate conversation and may be annual; rabies follows its own rules, legal and otherwise, which differ by province.",
        "There is no single schedule this page can give you, and the interval that applies depends on the products your clinic uses and on your dog. These are the questions that get you the answer.",
      ],
      points: [
        "Which path did we take — the 26-week dose, or waiting until now?",
        "What is due at this appointment, and what is not?",
        "When is the next core vaccination actually due after this one?",
        "Which non-core vaccines apply given where we live and what this dog does?",
        "Is the rabies record current, and when is the next one due?",
        "Would serology be useful here, or is it not something you offer?",
      ],
      guide: {
        slug: "puppy-vaccination-schedule-in-canada",
        label: "Why it is a series, what core means, and how the provinces differ",
      },
    },
    {
      id: "teething",
      title: "Dental care",
      summary: "Maintenance now, not teething.",
      body: [
        "The adult teeth have been in for months — Merck puts the full set in place by about seven months — so anything outstanding from that process should already have been looked at. What replaces teething management is maintenance, and the first-year appointment is a sensible point to have the mouth assessed properly and to agree what home care should look like from here.",
        "Chewing usually continues, because dogs chew. It just stops being a household emergency.",
      ],
      guide: {
        slug: "dental-care-for-dogs-and-cats",
        label: "What actually works, and what to do at home",
      },
    },
    {
      id: "parasite-prevention",
      title: "Parasite prevention",
      summary: "Stop renewing the plan. Review it.",
      body: [
        "The plan you are on was written for a puppy that went round the block. It has quietly kept running while the dog it was written for became something else — further, longer, off paths, possibly at a cottage or on a trail. The first-year appointment is the natural point to rebuild it from the dog's actual life rather than extend it by habit.",
        "Two questions do most of the work. What is this dog now doing that it was not doing at six months? And has anything about where it does it changed — a move, a new route, a place it now visits regularly? Those answers change the plan more than the calendar does.",
        "Ask for it back as dates rather than a product, and ask what to do about a missed dose, because a year is long enough that one will be missed.",
      ],
      guide: {
        slug: "parasite-prevention-for-pets-in-canada",
        label: "Region and season, and what actually drives the timing",
      },
    },
    {
      id: "social-behaviour",
      title: "Behaviour and other dogs",
      summary: "Steadier, usually. Changes that are not steadier are worth asking about.",
      body: [
        "Most dogs are easier company across this stage than they were at eight months — calmer around other dogs, more able to disengage, better at settling somewhere new. That is the ordinary direction and it happens gradually rather than on a particular week.",
        "What is worth separating from that is a change in the other direction. A dog that is becoming more reactive, more fearful, or less able to cope with things it used to manage is not going through a phase to be waited out. Reduce the pressure, give it more distance, and ask — your veterinarian first, because discomfort and pain change behaviour, and a qualified behaviour professional where the answer is behavioural.",
        "That is not an escalation. It is the same instinct as having a limp looked at, and problems at this age are considerably easier to address than the same problems at three.",
      ],
      guide: {
        slug: "puppy-socialisation-checklist",
        label: "Reading the dog, and what good exposure looks like",
      },
    },
    {
      id: "safety",
      title: "Safety",
      summary: "A capable animal, and the habits that will last.",
      body: [
        "The risk list is shorter than it was, mostly because the dog is more predictable. What remains is worth keeping deliberate rather than assumed.",
      ],
      points: [
        "Recall around wildlife, livestock and roads, which will be the last thing to become dependable and the first thing that matters.",
        "Identification: a legible tag, and a microchip registration in your name with a phone number that works.",
        "Municipal licensing, which in most places renews annually and is easy to let lapse after the first year.",
        "Swallowed objects, still worth taking seriously in a dog that chews.",
        "Vehicle restraint, now that the dog is heavy enough to matter in a stop.",
        "Heat and cold tolerance, which change with coat and condition rather than with age.",
      ],
      guide: {
        slug: "pet-licensing-across-canada",
        label: "What licensing involves, and how much it varies",
      },
    },
    {
      id: "red-flags",
      title: "When to call a veterinarian",
      summary: "The threshold is lower than most owners of a grown-looking dog assume.",
      tone: "caution",
      body: [
        "Contact your veterinary clinic — rather than waiting to see whether it settles — if a dog will not eat, is repeatedly vomiting or has persistent diarrhoea, is unusually limp or unresponsive, is breathing with effort, has not urinated in an unusually long stretch, is straining without producing anything, or you have any reason to think it has swallowed something it should not have.",
        "The specific trap at this age is that the dog looks grown, so owners give it adult latitude on symptoms as well as on freedom. A dog that is off in itself for more than a day, is eating less than usual, or has changed how it moves is worth a phone call rather than a week of watching.",
        "Lameness and reluctance to bear weight should be examined rather than rested and hoped over, particularly in a larger dog that is still growing. And a behaviour change that arrives suddenly — new fear, new irritability, new reluctance to be touched somewhere — is a reason to look for a physical cause before assuming a behavioural one.",
        "This describes what to look for so you know when to call. It does not diagnose, and it is not a substitute for examining your dog — only a veterinarian who has seen it can do that.",
      ],
      guide: {
        slug: "emergency-vet-visits-in-canada",
        label: "The hour of preparation that decides how the worst night goes",
      },
    },
    {
      id: "whats-next",
      title: "What's next",
      summary: "Adulthood, arriving at different times for different dogs.",
      body: [
        "What follows this is not another developmental stage so much as a settling. AAHA describes young adulthood as running from the end of rapid growth all the way to the completion of physical and social maturation, which they put at three to four years in most dogs — so the first birthday is a milestone in the calendar rather than in the animal.",
        "Practically, the next thing that changes is the shape of the routine: an annual rhythm of preventive care instead of a run of puppy appointments, a diet that stays put for years rather than months, and exercise that can finally be built rather than restrained. For a large or giant dog, some of that is still months away.",
        "The training does not stop mattering, and it gets easier. What you keep doing now is what the dog is at four.",
      ],
    },
  ],

  checklist: [
    { id: "book", label: "Book the first-year appointment and go with a list", detail: "Vaccination, weight, diet, mouth, parasites — and the neutering plan if it is still open." },
    { id: "path", label: "Ask which vaccination path your clinic took", detail: "The 26-week dose or the twelve-to-sixteen-month one. It decides what is due now." },
    { id: "neuter", label: "If your dog is large and still entire, reopen the timing conversation" },
    { id: "food", label: "Ask whether growth food should continue", detail: "The trigger is skeletal maturity, which is much later in bigger dogs." },
    { id: "exercise", label: "Build exercise in steps rather than in one jump" },
    { id: "recall", label: "Keep practising recall even though it stopped failing" },
    { id: "condition", label: "Learn to read body condition rather than follow a chart" },
    { id: "id", label: "Check the tag, the microchip registration and the licence renewal" },
    { id: "parasites", label: "Review the parasite plan for the year, not the season" },
  ],

  sources: [
    {
      label: "2019 AAHA Canine Life Stage Guidelines — puppy defined as birth to cessation of rapid growth at approximately 6–9 months varying with breed and size, and sterilization timing split at 45 lb projected adult bodyweight",
      publisher: "American Animal Hospital Association",
      url: "https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/canine-life-stage-2019/2019-aaha-canine-life-stage-guidelines-final.pdf",
    },
    {
      label: "Feeding practices in small animals — growth diets until skeletal maturity, roughly 8–12 months in small and medium dogs and later in large and giant breeds",
      publisher: "Merck Veterinary Manual",
      url: "https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/feeding-practices-in-small-animals",
    },
    {
      label: "2024 Guidelines for the Vaccination of Dogs and Cats — revaccination at or after 26 weeks rather than at 12 to 16 months, and core revaccination thereafter no more often than every three years",
      publisher: "World Small Animal Veterinary Association",
      url: "https://wsava.org/wp-content/uploads/2024/04/WSAVA-Vaccination-guidelines-2024.pdf",
    },
    {
      label: "Teenage dogs? Evidence for adolescent-phase conflict behaviour — carer-rated trainability lower at approximately eight months than at five or twelve",
      publisher: "Asher et al., Biology Letters (2020)",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7280042",
    },
    {
      label: "Dental development of dogs — all permanent teeth present by about seven months",
      publisher: "Merck Veterinary Manual",
      url: "https://www.merckvetmanual.com/dog-owners/digestive-disorders-of-dogs/dental-development-of-dogs",
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
    "British Columbia is a *positive* claim only, as of 2026-09-06. The BCCDC page was read and says verbatim that rabies vaccines are available for cats, dogs and ferrets and that \u201cyour pets should be vaccinated, and their immunizations should be kept up to date\u201d. The earlier copy went further and said provincial law does not compel vaccination \u2014 a negative legal claim, and no authoritative source could be found that states it. Proving the absence of a law is a different exercise from reading one, and the BCCDC page, the BC Rabies Guidance for Veterinarians and the CVBC summary table were all retrieved and none of them says it. The copy now states what BCCDC recommends, says plainly that we are not presenting a province-wide legal requirement, and explicitly leaves municipal, travel, import and bite-investigation rules open. Do not restore the stronger wording without a named statute or regulation.",
    "The recovery claim is attributed to Asher et al. and stated as what that study found in its population — dogs rated more trainable at twelve months than at eight — never as a date adolescence ends. The guide-dog sample and the study's own note that age groupings would need reconsidering for different breeds are both carried in reader-facing prose. Do not convert this into 'adolescence ends at twelve months'.",
    "Nine months is never described as a developmental milestone. The gate found no source marking one there; what is new at nine is the opening of AAHA's large-breed sterilisation window, which is a decision rather than a change in the dog.",
    "AAHA's life stage definitions are quoted — puppy as birth to cessation of rapid growth at approximately six to nine months varying with breed and size, young adult through to physical and social maturation by three to four years in most dogs. That framework differs from this Journey's own stage naming, which is an editorial arc rather than a clinical one; the difference is deliberate and worth resolving explicitly before the maturity stage is written.",
    "Sterilization timing is quoted from the 2019 AAHA guidelines with the 45 lb projected-adult-bodyweight split, the nine-to-fifteen-month male range, the wider individualised female window, and AAHA's own caution about applying findings across breeds. No universal age appears and nothing is booked.",
    "The adult-food transition is tied to skeletal maturity per Merck — roughly eight to twelve months in small and medium dogs and up to fifteen or sixteen in some large and giant breeds — and is explicitly not given a universal age. No quantities, calorie tables or adult-weight predictions appear.",
    "Body condition is described qualitatively (ribs felt without pressing, waist visible from above). Attach a body-condition-score source before making it more precise.",
    "Growth-plate closure is described as later in larger dogs, with the explicit statement that the radiographic picture varies by breed rather than following a single age. No age, distance, minutes-per-month rule or running-clearance age appears, and none should be added without a source.",
    "The two vaccination paths follow WSAVA 2024: revaccination at or after 26 weeks as an alternative to waiting until twelve to sixteen months, and core revaccination thereafter at three years and then no more frequently than every three years. The page states which questions to ask rather than which interval applies, and must not become a schedule.",
    "Rabies is referred to as following its own provincial rules and is not given a timetable in universal prose. Provincial legal timing is carried in the province modifiers and computed from dates on the record rather than from the reader's stage.",
    "No dominance, boundary-testing, second fear period or universal sexual-maturity claim appears anywhere. Behaviour changes in the wrong direction are described as reasons to ask rather than as a developmental phase.",
    "The hero photograph is not captioned with an age. The source page describes the dog as an adult and the age could not be verified; the alt text describes the animal and the setting instead.",
  ],
};


/**
 * Beyond the first year — the handoff, and the end of the Journey.
 *
 * ## What this page is
 *
 * An exit. Its job is to end a series well, not to begin a new one, and it is
 * deliberately the shortest stage here. Everything it touches, it touches once
 * and then hands to the article library.
 *
 * ## The one claim it makes
 *
 * That **age has stopped being the thing that organises care.** Up to now the
 * Journey could say "at this age, this" and be useful. From here what matters
 * is size, breed, body condition, health history, reproductive status,
 * lifestyle and the individual dog — none of which a month number predicts.
 * That is why the series ends rather than continuing at a slower cadence.
 *
 * ## What it must not claim
 *
 * That anything is finished. Merck puts skeletal maturity in some large and
 * giant breeds at closer to fifteen or sixteen months, which is *inside* this
 * stage, so "fully grown" is false for exactly the dogs it would matter most
 * for. And AAHA puts the completion of physical and social maturation at three
 * to four years, so behaviour is nowhere near settled either.
 *
 * ## Terminology
 *
 * The stage explains, once, that AAHA's young-adult life stage began months
 * ago at the cessation of rapid growth, and that these stages are an editorial
 * timeline rather than clinical life stages. The phrase "young adult" appears
 * there, quoting AAHA — which is the correct use of it. What does not appear
 * is a Journey stage, route or label named after it.
 */
export const beyondTheFirstYear: PuppyStage = {
  slug: "beyond-the-first-year",
  label: "Beyond the first year",
  title: "Beyond the First Year",
  deck:
    "The last stage of this Journey, and a short one. Age has stopped being the thing that organises care — which is precisely why a month-by-month series should stop here rather than carry on pretending otherwise.",
  metaDescription:
    "The final stage of the Puppy Journey: what changes when age stops driving care, whether your dog has actually finished growing, and where to go next for adult-dog guidance.",
  mediaId: "puppy-beyond-first-year",
  mediaAlt:
    "A collie-type dog seen from behind, walking away up a leaf-strewn forest path between tall conifers.",
  reviewBy: "2027-09-01",
  // Held. A handoff page: its title targets no query anyone types, and it
  // exists to end the series rather than to be found. Index only if the site
  // starts acquiring impressions for the questions it answers.
  indexable: false,
  status: "in-review",

  sections: [
    {
      id: "this-week",
      title: "Where you are now",
      summary: "The timeline ends. The dog carries on.",
      body: [
        "This is the last stage of the Puppy Journey, and it is short on purpose. Not because there is nothing left to do, but because from here a month number stops predicting anything useful.",
        "For the first year, age was a reasonable organising principle. What mattered at nine weeks was true of almost every nine-week-old, and a series arranged by age could be genuinely helpful. That stops being true somewhere around now. What matters from here is your dog's size, its breed, its body condition, its health history, whether it is neutered, what it does with its days, and what it is like — and none of those move on a shared schedule.",
        "So the honest thing for a month-by-month series to do is finish, rather than to carry on getting vaguer. That is what this page is.",
      ],
      points: [
        "Nothing here says your dog is finished growing, or finished maturing. For many dogs neither is true yet.",
        "Care from here is individual rather than age-staged.",
        "The things worth continuing are the unglamorous ones: body condition, dental care, parasite prevention, training maintenance.",
        "If growth questions were still open at twelve months — food, exercise, neutering — they may still be open now.",
      ],
    },
    {
      id: "growth",
      title: "Has your dog actually finished growing?",
      summary: "It depends on how big it was always going to be.",
      body: [
        "This is the question the rest of the page turns on, and it does not have one answer.",
        "The Merck Veterinary Manual puts skeletal maturity at roughly eight to twelve months in small and medium dogs, and notes that for some large and giant breeds it may not be reached until closer to fifteen or sixteen months. Both of those ranges overlap this stage. So a terrier here has almost certainly finished; a mastiff of exactly the same age may have months left.",
        "That is why nothing on this page says \u201cnow that your dog is fully grown\u201d. If you do not know which side of that line your dog is on, that is a good question for the next appointment — and a better one than any of the specific questions that depend on the answer.",
      ],
    },
    {
      id: "development",
      title: "Where this sits against clinical life stages",
      summary: "This is where the series ends, not where a life stage begins.",
      body: [
        "It is worth being explicit about something, because the vocabulary here is genuinely confusing.",
        "The American Animal Hospital Association's life stage guidelines define the puppy stage as running from birth to the cessation of rapid growth — approximately six to nine months, varying with breed and size — and the young adult stage as running from there until the completion of physical and social maturation, which they place at roughly three to four years in most dogs. By that framework your dog has very likely been a young adult, clinically, for some months already, and will remain one for years.",
        "The Pet Club's Journey stages are an editorial timeline: a sequence of pages arranged by the age at which particular questions tend to come up. They are not a replacement for clinical life-stage terminology and they do not line up with it. This page is where this series ends, and nothing more than that. It is not where anything in your dog begins or finishes.",
      ],
    },
    {
      id: "feeding",
      title: "Feeding",
      summary: "The trigger is skeletal maturity, not the first birthday.",
      body: [
        "If your dog has already moved to an adult diet, that is likely fine and worth reviewing at the next appointment rather than revisiting now. If it has not, the question is not how old the dog is but whether it has finished growing.",
        "Merck's guidance is to keep feeding a diet formulated for growth until skeletal maturity — not until growth appears to have slowed, and not on a birthday. For a small or medium dog that point has usually passed. For some large and giant breeds it may not arrive until closer to fifteen or sixteen months, which is inside this stage rather than behind it.",
        "The habit worth keeping either way is reading the dog rather than the bag: ribs that can be felt without pressing hard, a waist visible from above, and portions adjusted against that with your veterinarian rather than against a chart.",
      ],
      guide: {
        slug: "reading-a-canadian-pet-food-label",
        label: "What the label does and does not tell you",
      },
    },
    {
      id: "exercise",
      title: "Exercise",
      summary: "Built progressively, and not cleared all at once.",
      body: [
        "There is no age at which a dog is issued a licence for adult exercise, and this page is not going to invent one. What there is, is a workload that should keep increasing gradually — duration before intensity, variety before either — and a set of things that determine how fast: how big the dog is, whether it has finished growing, what condition it is in, whether it has ever been injured, and how it copes on the day.",
        "For a smaller dog that is skeletally mature, most of the earlier restraint has done its job. For a large or giant dog that may still be growing, the caution about repetitive forced exercise — running alongside a bicycle, long stair sessions, jumping down from height — has not expired just because a year has passed.",
        "If you want to start doing something specific with this dog, that is a conversation with the veterinarian who has examined it and knows how big it will get. It is a much better question than a number of minutes.",
      ],
    },
    {
      id: "training",
      title: "Training and behaviour",
      summary: "Maintained, not completed.",
      body: [
        "Most dogs are noticeably easier at this point than they were at eight months, and it is tempting to read that as done. It is not — AAHA puts the completion of physical maturation, and of social maturation with it, at three to four years, so a dog in this stage has a long way to go behaviourally, and it will keep changing in ways that have nothing to do with training.",
        "Adolescent behaviours fade unevenly. Recall, in particular, is maintained rather than achieved: it is the thing owners stop practising precisely because it stopped failing, and the thing that quietly degrades over the following year. Keep it in the weekly routine, keep paying for it, and keep the criteria rising slowly.",
        "If something is going in the other direction — new fear, new reactivity, less tolerance for things that used to be fine — that is worth asking about rather than waiting out. Your veterinarian first, because discomfort changes behaviour, and a qualified behaviour professional where the answer turns out to be behavioural.",
      ],
      guide: {
        slug: "loose-leash-walking-and-recall",
        label: "Lead work and recall, built properly",
      },
    },
    {
      id: "neutering",
      title: "Neutering, if it is still open",
      summary: "For most dogs this is settled. For some large ones it is not.",
      body: [
        "For most dogs reading this the decision is behind them. Where it is not, it is usually because the dog is large and the advice was to wait: AAHA's window for a male expected to finish over 45 pounds runs to about fifteen months, with a wider individualised window for females, and that overlaps this stage rather than preceding it.",
        "If it is still open, this is a conversation to have rather than a deadline to meet, and the same caution applies as it did at nine months — the guidelines say findings in one breed may not transfer to another, so it is settled with the veterinarian who has examined your dog.",
      ],
      guide: {
        slug: "spaying-and-neutering-in-canada",
        label: "Why the timing question has changed, and what to weigh",
      },
    },
    {
      id: "veterinary-care",
      title: "What changes about veterinary care",
      summary: "From a run of milestone appointments to something individual.",
      body: [
        "The first year of veterinary care is largely a schedule: a series of appointments arranged around the puppy's age, with a fairly predictable shape. What replaces it is not another schedule but a plan built around this particular dog.",
        "What that plan covers is broadly the same list for everyone — body condition and weight, nutrition, dental health, parasite prevention, vaccination history and what is due when, reproductive status, and any screening that makes sense for the breed or the lifestyle. What differs is the emphasis and the frequency, and that is a conversation rather than a table. We are not going to print one here, because a schedule that fits a Labrador in Winnipeg and a chihuahua in Halifax equally well would be useless to both.",
        "The one practical thing worth doing is going into the next appointment having asked for it explicitly: what does ongoing care look like for this dog, and when should I next be here?",
      ],
      guide: {
        slug: "finding-a-veterinarian-in-canada",
        label: "Choosing a practice before you need one",
      },
    },
    {
      id: "teething",
      title: "Dental and parasite maintenance",
      summary: "Two things that are now ordinary, and easy to let slide.",
      body: [
        "The adult teeth have been fully in since well before this stage began \u2014 Merck puts the complete set in place by about seven months. What matters now is maintenance — home care that actually happens, and a mouth that gets looked at properly rather than glanced at. Dental disease is one of the most common findings in adult dogs and one of the most preventable, and the work that prevents it is dull and daily.",
        "Parasite prevention is the same shape of problem: it stops being a new decision and becomes a thing that quietly lapses. Heartworm prevention is seasonal in most of Canada and follows the local mosquito season; tick activity runs longer at both ends of the year than most people expect. Ask for the plan as dates, once a year, and put them somewhere you will see them.",
      ],
      guide: {
        slug: "dental-care-for-dogs-and-cats",
        label: "What actually works, and what to do at home",
      },
    },
    {
      // The safety floor. Every stage carries one, and the last stage carries
      // it for the same reason as the first: a reader who lands here should
      // never have to navigate to another page to find out what counts as an
      // emergency. What changes is only what is *not* said — the puppy-specific
      // material (hypoglycaemia in very small puppies, post-vaccination
      // reactions during the primary series, house-training loss) belongs to
      // the earlier stages and is not repeated here. The serious-symptom core
      // is unchanged, deliberately: it does not get softer because the dog got
      // older.
      id: "red-flags",
      title: "When to call a veterinarian",
      summary: "The list does not get shorter because your dog is grown.",
      tone: "caution",
      body: [
        "Contact your veterinary clinic — rather than waiting to see whether it settles — if a dog is breathing with effort, collapses or is profoundly unresponsive, is repeatedly vomiting, has persistent or bloody diarrhoea, cannot urinate or is repeatedly straining without producing anything, is suddenly and severely lame, is in unexplained pain, or you have any reason to think it has swallowed something it should not have. A suspected ingestion is a call rather than a wait-and-see, and it does not need to be accompanied by any other sign.",
        "The trap at this age is the opposite of the one at eight weeks. A grown dog looks robust, it has been well for months, and there is no longer a run of appointments in which something would have been noticed. That combination buys symptoms more time than they should get. A dog that is off in itself for more than a day, is eating less than usual, has changed how it moves, or has become reluctant to be touched somewhere is worth a phone call rather than a week of watching.",
        "Telephone triage is a normal part of what a clinic does, it usually costs nothing, and the answer is one of three things: come now, come in the morning, or here is what to watch for.",
        "This describes what to look for so you know when to call. It does not diagnose, and it is not a substitute for examining your dog — only a veterinarian who has seen it can do that.",
      ],
      guide: {
        slug: "emergency-vet-visits-in-canada",
        label: "The hour of preparation that decides how the worst night goes",
      },
    },
    {
      id: "whats-next",
      title: "Where the Journey ends",
      summary: "Here. And then it is just your dog.",
      body: [
        "This is the last stage. There is not another page after it, and that is deliberate rather than an omission — a series arranged by age has nothing useful left to say once age stops being the variable.",
        "What continues is everything that was never really about age: the training you maintain, the weight you watch, the teeth you brush, the prevention you keep on top of, and the relationship the last year was actually building. The library covers the rest, and it is organised by subject rather than by month, because that is how the questions arrive from here.",
        "Whatever is left to work out about this dog, you now know it better than any page does.",
      ],
      guide: {
        slug: "cost-of-owning-a-dog-in-canada",
        label: "What the years ahead actually cost",
      },
    },
  ],

  checklist: [
    { id: "grown", label: "Ask whether your dog has finished growing", detail: "It decides the food question, the exercise question and — for some — the neutering one." },
    { id: "plan", label: "Ask what ongoing care looks like for this dog", detail: "And when you should next be there. A plan, not a schedule off a page." },
    { id: "condition", label: "Learn to read body condition and check it monthly" },
    { id: "dental", label: "Start or keep up home dental care" },
    { id: "parasites", label: "Get the parasite plan written down as dates, once a year" },
    { id: "recall", label: "Keep practising recall even though it stopped failing" },
    { id: "records", label: "Keep the vaccination and treatment record somewhere you will find it" },
  ],

  sources: [
    {
      label: "2019 AAHA Canine Life Stage Guidelines — puppy as birth to cessation of rapid growth at approximately 6–9 months, and young adult through to completion of physical and social maturation by 3 to 4 years",
      publisher: "American Animal Hospital Association",
      url: "https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/canine-life-stage-2019/2019-aaha-canine-life-stage-guidelines-final.pdf",
    },
    {
      label: "Feeding practices in small animals — growth diets until skeletal maturity, roughly 8–12 months in small and medium dogs and closer to 15–16 months in some large and giant breeds",
      publisher: "Merck Veterinary Manual",
      url: "https://www.merckvetmanual.com/management-and-nutrition/nutrition-small-animals/feeding-practices-in-small-animals",
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
    "This stage is an editorial endpoint and says so. It must never imply that young adulthood begins at thirteen months, that puppyhood ends clinically at thirteen months, that the dog is fully grown, or that behavioural maturity is complete. The AAHA framework is quoted to make exactly that point.",
    "The phrase 'young adult' appears once, attributed to AAHA and describing their life stage. That is the correct use. No Journey stage, route, phase or label is named after it, and none should be.",
    "Skeletal maturity is attributed to Merck — roughly eight to twelve months in small and medium dogs, closer to fifteen or sixteen in some large and giant breeds — and both ranges are noted as overlapping this stage. No universal 'fully grown' claim appears.",
    "The eighteen-month end of the Journey is a judgement, not a sourced boundary: the last size-dependent question closes around fifteen or sixteen months and eighteen adds a margin. It should be described that way if it is ever explained to a reader, and revisited if a source establishes something better.",
    "AAHA's three-to-four-year figure for completion of physical and social maturation is quoted, and is the reason no behavioural-maturity claim is made here.",
    "No adult-food transition age appears. No exercise clearance age, minutes-per-month formula or running age appears. No preventive-care schedule or interval appears — the page names the topics and defers the cadence to the veterinarian, deliberately.",
    "Sterilization timing is quoted from AAHA with the 45 lb split and the fifteen-month upper end, and framed as possibly still open rather than overdue.",
    "No dominance, boundary-testing or second fear period framing appears anywhere.",
    "The red-flag section carries the same serious-symptom core as every other stage and is not softened for this age. It names no diagnosis, no drug and no dose, gives no home treatment, and routes every item to a telephone call. Puppy-specific items (hypoglycaemia in very small puppies, post-vaccination reactions during the primary series, loss of house-training) are deliberately absent because they belong to the earlier stages.",
    "The hero photograph asserts no age. The dog is seen from behind and the alt text describes the departure rather than the animal's life stage.",
  ],
};

export const stages: readonly PuppyStage[] = [
  eightWeeks,
  nineToElevenWeeks,
  twelveWeeks,
  threeMonths,
  fourToSixMonths,
  sevenToEightMonths,
  nineToTwelveMonths,
  beyondTheFirstYear,
];

/**
 * The publication dates a stage may put in its structured data.
 *
 * Empty while the stage is in review, which is the point: an unpublished page
 * makes no claim about when it was published. `reviewBy` is not consulted here
 * and must never be \u2014 it is a future re-check deadline, and the previous
 * version of this logic fed it straight into `datePublished`, so publishing
 * would have emitted a publication date a year from now.
 *
 * The throw is a second lock behind the type union. The union already makes a
 * published stage without `publishedAt` a compile error, so this can only fire
 * if something casts around it. It fails the build rather than quietly
 * dropping the field, because a page whose status claims publication and whose
 * markup denies it is the contradiction this whole change exists to prevent.
 */
export function stagePublicationDates(stage: PuppyStage): {
  datePublished?: string;
  dateModified?: string;
} {
  if (stage.status !== "published") {
    return {};
  }

  if (!stage.publishedAt) {
    throw new Error(
      `Puppy stage "${stage.slug}" is published with no publishedAt. Set a real ` +
        "first-publication date; reviewBy is a re-check deadline, not a publication date.",
    );
  }

  return {
    datePublished: stage.publishedAt,
    dateModified: stage.updatedAt ?? stage.publishedAt,
  };
}

/**
 * Whether a stage may be indexed, and therefore advertised in the sitemap.
 *
 * Both halves are required and they answer different questions: `status` is
 * whether the content is finished, `indexable` is whether we want it found.
 * "Published but not indexable" is a real supported state \u2014 public, linked
 * from the rail, deliberately out of the index \u2014 and `indexable` alone can
 * never cause indexing, which is why setting it ahead of launch is safe.
 */
export function isStageIndexable(stage: PuppyStage): boolean {
  return stage.status === "published" && stage.indexable;
}

/**
 * Index policy for the Journey hub.
 *
 * `/puppy` is not a `PuppyStage` \u2014 it has no editorial review lifecycle; it
 * is a hub with an onboarding form \u2014 so it carries its own flag rather than
 * being forced into the stage model. It lives here so the Journey's whole
 * index policy is readable in one place.
 *
 * `false` today. The launch gate recommended indexing it in the first wave;
 * flipping this is that decision, taken deliberately and on its own. It has no
 * bearing on `/my-puppy`, which is unconditionally `noindex` at the route.
 */
export const JOURNEY_HUB_INDEXABLE = false;

/**
 * Every Journey path that belongs in the sitemap, in render order.
 *
 * The mirror of `publishedArticles()`, and it exists for the same reason: one
 * field driving both the `noindex` meta and sitemap membership is how the two
 * are kept from contradicting each other. The Journey had only the metadata
 * half, so publishing a stage would have made it indexable while leaving it
 * out of the sitemap \u2014 and the test asserting no Journey route appears
 * would have carried on passing.
 *
 * Redirect sources, `/my-puppy` and every query-string state are absent by
 * construction: nothing here can produce a path that is not a public stage or
 * the hub.
 *
 * Empty today, and a test asserts it.
 */
export function indexableJourneyPaths(): readonly string[] {
  return [
    ...(JOURNEY_HUB_INDEXABLE ? ["/puppy"] : []),
    ...stages.filter(isStageIndexable).map((stage) => `/puppy/${stage.slug}`),
  ];
}

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
 * and starts being events — sexual maturity, growth plates closing, the
 * collapse of a recall that worked fine at six months. Those do not land on a
 * calendar, so the stages are ranges.
 *
 * This comment used to list "the second fear period" among those events. It
 * does not any more, and that is not a wording preference: four verification
 * registers state that the differentiation gate found no peer-reviewed basis
 * for one at any age, and the content guards reject the phrase outright. A
 * design note asserting it as a real driver contradicted the policy the rest
 * of the file enforces.
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
export type StageCadence = "weekly" | "monthly" | "milestone" | "handoff";

export type JourneyPhaseId =
  | "early-puppy"
  | "early-development"
  | "adolescence"
  | "handoff";

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
    // Not "Maturity". A dog at this point is very often not mature — AAHA puts
    // the completion of physical and social maturation at three to four years
    // — and the label would be claiming exactly the thing the stage spends its
    // length denying. This phase is where the Journey ends, not where the dog
    // finishes.
    id: "handoff",
    label: "Handoff",
    cadence: "handoff",
    note: "Where this series ends and individual care takes over.",
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
 * How a stage's age range is expressed.
 *
 * Two units, because the journey genuinely uses two. Early on a stage is a
 * *week of life* and a day count is exactly right. From three months on, a
 * stage is a span between calendar anniversaries of the date of birth, and a
 * day count is an approximation that drifts — see the note above
 * `addCalendarMonths` in the age engine.
 *
 * `maxMonths` is an inclusive count of completed months, so "3 months" is
 * `{ minMonths: 3, maxMonths: 3 }`: it begins on the third monthly anniversary
 * and ends the day before the fourth. Omitting `maxMonths` makes the stage
 * open-ended, which exactly one stage is.
 */
export type StageRange =
  | { unit: "weeks"; minDays: number; maxDays: number }
  | { unit: "months"; minMonths: number; maxMonths?: number };

/**
 * A point on the journey, whether or not it has been written.
 *
 * Ranges must tile the journey with no gap and no overlap — a test enforces
 * it, because a gap is a reader who resolves to nothing and an overlap is a
 * reader who resolves to two things.
 */
export interface RoadmapStage {
  slug: string;
  label: string;
  phase: JourneyPhaseId;
  range: StageRange;
  /**
   * Whether this stage's boundary is genuinely a function of adult size.
   *
   * True only for maturity, where it is a real effect rather than a caveat: a
   * toy breed is structurally and behaviourally adult long before a giant
   * breed is. We do not yet have sourced per-size boundaries, so one
   * conservative navigation boundary is used for everyone and this flag marks
   * the place where a size-aware answer belongs once it can be cited. It
   * changes no behaviour today, and it is deliberately not a promise to the
   * reader — nothing in the product claims a dog matures at thirteen months.
   */
  boundaryVariesBySize?: true;
}

/** The last day the weekly table decides. See `roadmapStageFor`. */
export const LAST_WEEKLY_DAY = 90;

/** The first monthly stage, in completed calendar months. */
export const FIRST_MONTHLY_MONTH = 3;

/** The last completed calendar month the Journey has anything to say about. */
export const JOURNEY_ENDS_AFTER_MONTHS = 18;

export const roadmapStages: readonly RoadmapStage[] = [
  // Early puppy — weekly, in days of life. Starts at eight weeks because that
  // is when most puppies come home; anything earlier is the breeder's week,
  // not the owner's, and resolves to no stage rather than a guessed one.
  // Three stages, not five. The differentiation gate found no sourceable
  // difference between a nine-, ten- and eleven-week-old that this project
  // could write about honestly, and five near-identical pages is the thin
  // cluster the rule above exists to prevent. Arrival and the end of the
  // window are genuinely distinct situations; the three weeks between them
  // are one.
  //
  // Note what did *not* change: the reader is still told their exact age.
  // A shared content stage is an editorial decision, not a loss of precision
  // — see `journeyHeadlineAge`.
  { slug: "8-weeks", label: "8 weeks", phase: "early-puppy", range: { unit: "weeks", minDays: 56, maxDays: 62 } },
  { slug: "9-11-weeks", label: "9–11 weeks", phase: "early-puppy", range: { unit: "weeks", minDays: 63, maxDays: 83 } },
  { slug: "12-weeks", label: "12 weeks", phase: "early-puppy", range: { unit: "weeks", minDays: 84, maxDays: LAST_WEEKLY_DAY } },

  // Early development — one calendar month each, on anniversaries of the DOB.
  //
  // `3-months` opens on day 91 rather than on the reader's own three-month
  // anniversary, and that is deliberate. A fixed handover keeps every public
  // stage page meaning one stable thing regardless of who is reading it:
  // `/puppy/3-months` is *the third month of life, from thirteen weeks*, for
  // everyone. Moving the boundary to each reader's anniversary would leave
  // `/puppy/12-weeks` — a page titled "Your 12-Week-Old Puppy" — serving
  // thirteen-week-olds for a day or two, and would make a public page's span
  // depend on a date it does not know.
  //
  // The cost is that a reader can reach this stage a day or two before their
  // own anniversary. That is a content-stage assignment, not an age claim, and
  // `journeyHeadlineAge` refuses to turn it into one.
  { slug: "3-months", label: "3 months", phase: "early-development", range: { unit: "months", minMonths: 3, maxMonths: 3 } },
  // Four, five and six months are one stage. Two gates reached that
  // conclusion independently. Permanent eruption spans the whole span (Merck
  // puts its start at around four to five months and completion at about
  // seven); the neutering decision runs from four to six by size and only
  // *executes* at six for small dogs; and the freedom that follows the
  // vaccination series simply continues throughout.
  //
  // Six months was assessed on its own and did not survive it. Its one strong
  // topic — WSAVA's advice to consider revaccinating at or after 26 weeks
  // instead of waiting for 12 to 16 months — is a section, not a stage, and
  // roughly two thirds of a 6-month page would have repeated this one. The
  // material people reach for to justify it belongs later: Asher et al. put
  // the adolescent trainability dip at eight months and never measured six,
  // and Merck puts skeletal maturity — the real trigger for adult food — at
  // eight to twelve months in small and medium dogs and up to fifteen or
  // sixteen in large ones.
  { slug: "4-6-months", label: "4–6 months", phase: "early-development", range: { unit: "months", minMonths: 4, maxMonths: 6 } },

  // Adolescence — paired months, because the things that define this period
  // arrive on their own schedule and not on a monthly one.
  { slug: "7-8-months", label: "7–8 months", phase: "adolescence", range: { unit: "months", minMonths: 7, maxMonths: 8 } },
  // Nine to twelve is one stage. The gate found no developmental identity at
  // nine or ten months at all: Asher et al. sampled at five, eight and twelve
  // and never in between, so anything written there would have been the
  // 7–8 month page again. What is genuinely new across this span — the
  // large-breed sterilisation window opening at nine, the adult-food
  // transition arriving at different times by size, and the first-year
  // veterinary conversation — is one coherent unit and, crucially, mostly
  // size-dependent. A public stage page renders with no size context at all,
  // so a stage whose only distinct content is size-dependent cannot carry one.
  { slug: "9-12-months", label: "9–12 months", phase: "adolescence", range: { unit: "months", minMonths: 9, maxMonths: 12 } },

  // The handoff, and the end of the Journey.
  //
  // It used to be called "Young adult" and run from thirteen months to the age
  // engine's three-year cutoff. Both were wrong. AAHA's young-adult life stage
  // begins at the *cessation of rapid growth* — approximately six to nine
  // months, varying with breed and size — so most readers had been clinically
  // young adults since somewhere in the 7–8 month stage, and a Journey entry
  // borrowing that term at thirteen months put a clinical label about six
  // months out of place. Renaming was cleaner than disclaiming it.
  //
  // And an open-ended terminal entry meant the Puppy Journey was willing to
  // place a two-year-eleven-month-old dog. It now ends at eighteen months.
  // That figure is a judgement rather than a source: the last age-specific,
  // size-dependent question in the whole Journey closes at around sixteen
  // months — Merck puts skeletal maturity in some large and giant breeds at
  // closer to fifteen or sixteen, and AAHA's large-breed sterilisation window
  // runs to fifteen — so eighteen is that floor plus room for the slowest
  // dogs. Past it nothing here is age-driven any more.
  {
    slug: "beyond-the-first-year",
    label: "Beyond the first year",
    phase: "handoff",
    range: { unit: "months", minMonths: 13, maxMonths: JOURNEY_ENDS_AFTER_MONTHS },
    boundaryVariesBySize: true,
  },
];

/**
 * The last completed month the Journey covers.
 *
 * Past this a reader is not waiting for something to be written — they are
 * finished, and `/my-puppy` says so. That is a different state from "we have
 * not written this yet" and the two must not share copy.
 *
 * Deliberately unrelated to `MAX_PLAUSIBLE_DAYS`, which is an input-validation
 * guard against a mistyped date of birth and nothing to do with scope.
 */
/**
 * The first day of life the Journey covers.
 *
 * Derived from the roadmap rather than written down twice, so it cannot drift
 * from the stage that actually opens the series.
 */
export const JOURNEY_BEGINS_AT_DAYS: number = Math.min(
  ...roadmapStages.flatMap((stage) => (stage.range.unit === "weeks" ? [stage.range.minDays] : [])),
);

/**
 * Younger than the Journey's first stage.
 *
 * A third state, and it exists for the same reason `isJourneyComplete` does:
 * "before this series starts" and "we have not written this yet" are different
 * facts and must not share copy. Every roadmap stage is written, so a reader
 * here is not waiting for anything — the Journey begins at eight weeks by
 * design, because before that a puppy is generally still with its breeder or
 * rescue and the decisions are not the reader's to make.
 */
export function isBeforeJourney(age: PuppyAge): boolean {
  return age.days < JOURNEY_BEGINS_AT_DAYS;
}

/**
 * The phase at which this series stops saying "puppy".
 *
 * The stage pages already made this call in their own titles \u2014 "Your 4 to
 * 6-Month-Old Puppy", then "Your 7 to 8-Month-Old Dog" \u2014 but the
 * personalised headline said "Your puppy is\u2026" all the way to eighteen
 * months, so a reader on `/puppy/9-12-months` saw the page call their animal a
 * dog and the headline above it call the same animal a puppy.
 *
 * Adolescence is the boundary, and it is deliberately the *phase* rather than a
 * month: it is the same judgement the stage titles already encode, made once
 * and read from the roadmap so the two cannot drift apart again.
 *
 * The product is still called the Puppy Journey. That is its name, not a claim
 * about the animal.
 */
export function journeyAnimalNoun(roadmap: RoadmapStage | null): "puppy" | "dog" {
  if (!roadmap) return "puppy";
  const index = roadmapStages.findIndex((stage) => stage.slug === roadmap.slug);
  const adolescence = roadmapStages.findIndex((stage) => stage.phase === "adolescence");
  return adolescence >= 0 && index >= adolescence ? "dog" : "puppy";
}

export function isJourneyComplete(age: PuppyAge): boolean {
  return age.months > JOURNEY_ENDS_AFTER_MONTHS;
}

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

/** The roadmap entry for a slug, implemented or not. */
export function findRoadmapStage(slug: string): RoadmapStage | null {
  return roadmapStages.find((stage) => stage.slug === slug) ?? null;
}

/**
 * The roadmap entry a resolved age falls in.
 *
 * ## The precedence rule
 *
 * Two schemes meet here, and they do not meet at a fixed number of days.
 * Twelve weeks always ends on day 90, but the third monthly anniversary lands
 * somewhere between day 89 and day 92 depending on which months the puppy has
 * lived through — a puppy born on 31 December reaches three calendar months on
 * day 90, one born on 31 May not until day 92. So the two boundaries genuinely
 * cross, in both directions, and a naive "whichever matches" would leave some
 * puppies in two stages and others in none.
 *
 * The rule, stated once:
 *
 *  1. **Through day 90, the weekly table wins outright.** A puppy whose
 *     three-month anniversary arrives on day 89 or 90 stays on the 12-week
 *     stage until the twelfth week is actually over. Early-puppy guidance is
 *     week-shaped, and cutting a week short mid-way serves nobody.
 *  2. **From day 91 the calendar decides**, with the month count floored at
 *     three. A puppy whose anniversary has not yet arrived on day 91 is placed
 *     on the 3-month stage rather than falling back into a weekly stage it has
 *     already left. The floor is what closes the gap.
 *
 * Both directions are covered by tests, day by day, across every date of birth
 * in a four-year window.
 */
export function roadmapStageFor(age: PuppyAge): RoadmapStage | null {
  if (age.days <= LAST_WEEKLY_DAY) {
    return (
      roadmapStages.find(
        (stage) =>
          stage.range.unit === "weeks" &&
          age.days >= stage.range.minDays &&
          age.days <= stage.range.maxDays,
      ) ?? null
    );
  }

  const months = Math.max(FIRST_MONTHLY_MONTH, age.months);
  return (
    roadmapStages.find(
      (stage) =>
        stage.range.unit === "months" &&
        months >= stage.range.minMonths &&
        (stage.range.maxMonths === undefined || months <= stage.range.maxMonths),
    ) ?? null
  );
}

/**
 * How a stage names the reader's age in a headline.
 *
 * Only ever used where the stage label names a single exact value — which,
 * after the ranges were introduced, means the single-month stages alone.
 * `journeyHeadlineAge` decides that, and every range falls back to the exact
 * age rather than coming through here.
 *
 * The Journey stage is the primary label and the calculated age is secondary
 * context, because the two do not always agree and a page must never show two
 * competing answers to "how old is my puppy". A thirteen-week-old resolves to
 * the 3-month stage: the headline says three months, and "13 weeks" sits
 * quietly in the meta row beside it.
 *
 * Maturity is phrased rather than suffixed — "a young adult", not "Young adult
 * old" — which is the whole reason this is a function and not a template
 * string at the call site.
 */
export function stageAgePhrase(stage: RoadmapStage): string {
  return `${stage.label} old`;
}

/**
 * The age a personalised headline states.
 *
 * Two different things are in play and they must not be confused. The
 * **content stage** is an editorial unit — what we have written, and for whom.
 * The **exact age** is a fact about this reader's puppy, which the civil-date
 * engine knows precisely. A reader can legitimately be on the 3-month stage
 * while being thirteen weeks old; what they must never be told is that they
 * are older than they are.
 *
 * Where a stage spans weeks, the exact week is the honest headline: telling
 * the owner of a ten-week-old that their puppy is "9–11 weeks old" would be
 * less precise than what we actually know, and would read as though the
 * product had lost track. The stage label still appears — in the eyebrow above
 * the headline, where it belongs, as the name of the section they are reading.
 *
 * Where a stage spans months, the stage label is the better headline **only
 * once the puppy has actually completed that many calendar months**. The
 * weekly phase ends on a fixed day and the third calendar month does not: the
 * anniversary lands anywhere from day 89 to day 92, and for the majority of
 * dates of birth it falls on day 91 or 92 — *after* the 12-week stage has
 * ended. Without this check a puppy that turns three months old tomorrow is
 * told it is three months old today, which is the same class of error as
 * calling twelve weeks three months in the Ontario block. Below the
 * anniversary the exact age is used instead, and it is always true.
 */
export function journeyHeadlineAge(age: PuppyAge, roadmap: RoadmapStage | null): string {
  if (!roadmap || roadmap.range.unit === "weeks") {
    return age.label;
  }

  // A stage that spans more than one month names a band, not an age. We know
  // which month the reader is in, so saying "4–5 months old" to the owner of a
  // four-month-old is less precise than what we have — the same objection that
  // keeps "9–11 weeks old" out of a ten-week-old's headline. The band still
  // appears, in the eyebrow, as the name of the section being read.
  if (roadmap.range.maxMonths !== undefined && roadmap.range.maxMonths !== roadmap.range.minMonths) {
    return age.label;
  }

  // The content stage may run ahead of the calendar. The headline may not.
  if (age.months < roadmap.range.minMonths) {
    return age.label;
  }

  return stageAgePhrase(roadmap);
}

/**
 * The secondary context beneath a Journey headline.
 *
 * `stageAgePhrase` supplies the headline; this supplies the quiet row under
 * it — the exact calculated age, then the phase. The exact age is dropped when
 * it would only repeat the headline: a puppy on the 11-week stage is eleven
 * weeks old, and saying so twice is noise rather than precision.
 *
 * The invariant this exists to hold: the page shows one primary age label and
 * one only. Everything else is context.
 */
export function journeyMeta(age: PuppyAge, roadmap: RoadmapStage | null): string[] {
  if (!roadmap) {
    return [];
  }

  const phase = findPhase(roadmap.phase);
  const headline = journeyHeadlineAge(age, roadmap);
  return headline.includes(age.exact) ? [phase.label] : [age.exact, phase.label];
}

/** The implemented stage for a resolved age, or `null` if it has no page. */
export function stageFor(age: PuppyAge): PuppyStage | null {
  const roadmap = roadmapStageFor(age);
  return roadmap ? findStage(roadmap.slug) : null;
}

/* --------------------------------------------------------------- modifiers */

export const sizeGroupModifiers: readonly SizeGroupModifier[] = [
  {
    sizeGroup: "toy",
    stageSlug: "beyond-the-first-year",
    sectionId: "growth",
    body: [
      "A toy-breed dog is comfortably past the eight-to-twelve-month range Merck gives for skeletal maturity in small dogs, so the growth questions this page keeps qualifying are almost certainly closed for yours. Food, exercise and sterilisation are individual decisions now rather than growth ones.",
    ],
  },
  {
    sizeGroup: "small",
    stageSlug: "beyond-the-first-year",
    sectionId: "growth",
    body: [
      "A small-breed dog has very likely finished growing by this point — Merck puts skeletal maturity at roughly eight to twelve months in small and medium dogs. That closes most of the questions this page hedges, and turns the rest into ordinary adult decisions about this particular animal.",
    ],
  },
  {
    sizeGroup: "medium",
    stageSlug: "beyond-the-first-year",
    sectionId: "growth",
    body: [
      "A medium-breed dog sits inside Merck's eight-to-twelve-month range for skeletal maturity, so it has probably finished growing — though \u201cprobably\u201d is doing real work in that sentence, and the dog in front of your veterinarian is better evidence than the category.",
    ],
  },
  {
    sizeGroup: "large",
    stageSlug: "beyond-the-first-year",
    sectionId: "growth",
    body: [
      "A large-breed dog may or may not be finished, and this stage straddles the line. Merck notes that for some large and giant breeds skeletal maturity may not arrive until closer to fifteen or sixteen months, which is inside this stage rather than behind it — so growth food, exercise restraint and, occasionally, the sterilisation decision can all still be live. Ask rather than assume.",
    ],
  },
  {
    sizeGroup: "giant",
    stageSlug: "beyond-the-first-year",
    sectionId: "growth",
    body: [
      "A giant-breed dog is the reason this page refuses to say \u201cfully grown\u201d. Merck puts skeletal maturity in some giant breeds at closer to fifteen or sixteen months, and yours will have looked entirely adult for months before reaching it. Treat growth food, exercise progression and any remaining sterilisation decision as open until your veterinarian says otherwise.",
    ],
  },
  {
    sizeGroup: "toy",
    stageSlug: "9-12-months",
    sectionId: "feeding",
    body: [
      "A toy-breed dog is at the early end of Merck's eight-to-twelve-month range for skeletal maturity, so the move off growth food may be appropriate during this stage. It is still a question for the appointment rather than a date — small dogs finish at different times too — but it is a live one now rather than one for later.",
    ],
  },
  {
    sizeGroup: "small",
    stageSlug: "9-12-months",
    sectionId: "feeding",
    body: [
      "A small-breed dog sits inside Merck's eight-to-twelve-month range for skeletal maturity, so the transition off growth food becomes a reasonable thing to raise during this stage. Ask at the next appointment, where the dog can be weighed and looked at, rather than deciding from the bag.",
    ],
  },
  {
    sizeGroup: "medium",
    stageSlug: "9-12-months",
    sectionId: "feeding",
    body: [
      "A medium-breed dog falls within the eight-to-twelve-month range Merck gives for skeletal maturity in small and medium dogs, which puts the transition somewhere in this stage or shortly after it. Where exactly is individual, and it is worth asking rather than assuming the first birthday is the trigger.",
    ],
  },
  {
    sizeGroup: "large",
    stageSlug: "9-12-months",
    sectionId: "neutering",
    body: [
      "This is the stage the decision comes back for a large-breed dog. AAHA's window for a male expected to finish over 45 lb is usually nine to fifteen months — waiting until growth is complete — with a wider individualised window for females and explicit advice to use clinical discretion. Nine months is the start of that range, not the end, so there is time to have the conversation properly.",
    ],
  },
  {
    sizeGroup: "giant",
    stageSlug: "9-12-months",
    sectionId: "neutering",
    body: [
      "A giant-breed dog grows for longer than almost any other, which places it at the far end of AAHA's nine-to-fifteen-month window rather than the near one. There is no urgency here at nine or ten months, and the guidelines caution that findings in one breed may not transfer to another — so this is a conversation about your own dog's growth with the veterinarian who has examined it.",
    ],
  },
  {
    sizeGroup: "large",
    stageSlug: "9-12-months",
    sectionId: "exercise",
    body: [
      "A large-breed dog is still growing through much of this stage, so build duration and variety before intensity and impact. Repetitive forced exercise — running alongside a bicycle, long stair sessions, jumping down from height — is still the thing to hold back on, and when it becomes reasonable is a question for the veterinarian who knows how big this dog will get.",
    ],
  },
  {
    sizeGroup: "giant",
    stageSlug: "9-12-months",
    sectionId: "exercise",
    body: [
      "A giant-breed dog will look entirely grown well before it is, and this is the stage where that mismatch costs the most — because the dog now has the stamina to do damage to itself. Keep building gradually, keep impact low, and treat any question about running or jumping as a veterinary one rather than a judgement call. Merck puts skeletal maturity in some giant breeds closer to fifteen or sixteen months.",
    ],
  },
  {
    sizeGroup: "large",
    stageSlug: "7-8-months",
    sectionId: "exercise",
    body: [
      "A large-breed dog at this age looks capable of far more than it should be doing. Growth is not finished, and the restraint on repetitive forced exercise — running alongside a bicycle, long stair sessions, endless ball-throwing — still applies. Let the work go into variety and problem-solving rather than distance, and take any question about building endurance to your veterinarian rather than to a rule of thumb.",
    ],
  },
  {
    sizeGroup: "giant",
    stageSlug: "7-8-months",
    sectionId: "exercise",
    body: [
      "A giant-breed dog is nowhere near physically finished at seven or eight months, however adult it looks — and it will look adult to everyone who meets it. That mismatch is the risk: people expect more of the dog than its body is ready for. Keep exercise varied and self-paced rather than sustained, and treat endurance work as a veterinary conversation rather than a judgement call.",
    ],
  },
  {
    sizeGroup: "toy",
    stageSlug: "7-8-months",
    sectionId: "freedom",
    body: [
      "A small adolescent gets less latitude from the world, not more. It is harder to see, easier to lose in undergrowth, and a great deal more vulnerable if the recall fails near a road or around a larger dog that is playing too hard. The long line matters at least as much here as it does for a big dog, and \u201che is only little\u201d is not a safety plan.",
    ],
  },
  {
    sizeGroup: "toy",
    stageSlug: "4-6-months",
    sectionId: "neutering",
    body: [
      "A toy-breed dog sits well under the 45 lb line, which puts both the decision and, usually, the procedure inside this stage. AAHA's timing for a dog expected to stay under that weight is around six months for castration, and before the anticipated first heat — five to six months — for spaying. So the conversation needs having at the start of this phase rather than the end of it, because the date it leads to falls within the same three months. Exactly when depends on sex and on how your own dog is developing, which is your veterinarian's call rather than a chart's.",
    ],
  },
  {
    sizeGroup: "small",
    stageSlug: "4-6-months",
    sectionId: "neutering",
    body: [
      "A small-breed dog is likely to stay under the 45 lb line, which puts both the decision and, usually, the procedure inside this stage. AAHA's timing for that group is around six months for castration and before the anticipated first heat — five to six months — for spaying, so settle the plan at the next appointment rather than the one after. The date itself depends on sex and on how this individual dog is developing rather than on the month alone.",
    ],
  },
  {
    sizeGroup: "large",
    stageSlug: "4-6-months",
    sectionId: "neutering",
    body: [
      "A large-breed dog is expected to finish well over the 45 lb line, and AAHA's guidance for that group is to wait until growth is complete — usually somewhere between nine and fifteen months for males, with a wider individualised window for females. That is after this stage ends, not within it. So you have months rather than weeks, and the useful thing to do with them is have the conversation properly rather than early — and to be unmoved when a friend's small dog is booked in at six months.",
    ],
  },
  {
    sizeGroup: "giant",
    stageSlug: "4-6-months",
    sectionId: "neutering",
    body: [
      "A giant-breed dog grows for longer than almost any other, which puts it firmly in the group AAHA advises waiting on until growth is complete — usually nine to fifteen months for males, with a wider individualised window for females. That is well beyond this stage. Nothing about the decision is urgent at any point in these three months, and the guidelines caution explicitly that findings in one breed may not transfer to another — a reason to make it with your own veterinarian rather than from a table.",
    ],
  },
  {
    sizeGroup: "large",
    stageSlug: "3-months",
    sectionId: "exercise",
    body: [
      "A large-breed puppy looks ready for more than it is. It has far more growing left than a small dog and will finish much later, so the restraint on repetitive forced exercise applies for longer here rather than being something to grow out of this year. Let outings grow in sniffing and self-paced movement rather than in distance, and treat running, cycling and stairs as a conversation with your veterinarian rather than a judgement call.",
    ],
  },
  {
    sizeGroup: "giant",
    stageSlug: "3-months",
    sectionId: "exercise",
    body: [
      "A giant-breed puppy grows for longer than almost any other dog and is nowhere near done at three months, which makes the temptation to match the exercise to the size of the animal exactly backwards. Keep outings short and self-paced, add mental work rather than kilometres, and take any question about repetitive exercise to your veterinarian rather than to a rule of thumb.",
    ],
  },
  {
    sizeGroup: "toy",
    stageSlug: "8-weeks",
    sectionId: "red-flags",
    body: [
      "A very small puppy has almost no energy reserve, which changes the calculation in this section. A toy-breed puppy that skips meals, or that is unsettled enough not to eat properly in its first days, can become weak, wobbly or unusually sleepy \u2014 and that is a reason to telephone the clinic rather than to wait until morning. Ask at the first appointment what they want you to watch for and how often this puppy should be eating.",
    ],
  },
  {
    sizeGroup: "large",
    stageSlug: "12-weeks",
    sectionId: "exercise",
    body: [
      "A large-breed puppy has far more growing left than a small one and will finish much later, so the restraint on repetitive forced exercise matters more here rather than less — and it matters for longer. Short, sniffing-led outings and free play are the right shape; running alongside a bicycle, long stair sessions and repeated ball-throwing are the things to keep off the list for many months yet.",
    ],
  },
  {
    sizeGroup: "giant",
    stageSlug: "12-weeks",
    sectionId: "exercise",
    body: [
      "A giant-breed puppy grows for longer than almost any other dog, and at twelve weeks it is nowhere near done. The temptation is to match the exercise to the size of the animal, which is exactly backwards. Keep outings short and self-paced, and treat any repetitive forced exercise as a conversation to have with your veterinarian rather than a judgement call.",
    ],
  },
  {
    sizeGroup: "toy",
    stageSlug: "12-weeks",
    sectionId: "feeding",
    body: [
      "Meal frequency matters more at this size, so the move from four meals to three is worth raising specifically rather than assuming. A toy-breed puppy that goes too long without food can become weak or wobbly \u2014 low blood sugar is one of the things veterinary medicine watches for in puppies \u2014 and and a teething dip in appetite is more consequential at this size than it would be in a Labrador.",
    ],
  },
  {
    sizeGroup: "large",
    stageSlug: "9-11-weeks",
    sectionId: "exercise",
    body: [
      "A large-breed puppy has considerably more growing left to do than a small one, and it will finish later — which makes the restraint on repetitive forced exercise matter more here, not less. Free play and short exploratory walks are the right shape; distance running, cycling alongside and repeated stairs are the things to keep off the list for many months yet.",
    ],
  },
  {
    sizeGroup: "giant",
    stageSlug: "9-11-weeks",
    sectionId: "exercise",
    body: [
      "Giant breeds grow for longer than anything else and carry more weight while doing it. Everything said about limiting repetitive forced exercise applies for longer — well past the point at which the dog looks fully grown. Free play at the puppy's own pace remains the safest shape.",
    ],
  },
  {
    sizeGroup: "toy",
    stageSlug: "9-11-weeks",
    sectionId: "feeding",
    body: [
      "A toy-breed puppy that goes too long between meals can become weak or wobbly, and low blood sugar is one of the things veterinary medicine watches for at this age. Meal frequency is worth raising specifically at your next appointment rather than assuming a general schedule applies.",
    ],
  },
];

export const breedModifiers: readonly BreedModifier[] = [
  {
    breedSlug: "poodle",
    stageSlug: "12-weeks",
    sectionId: "grooming",
    body: [
      "A poodle coat needs professional grooming for life, and this is the age at which to book the first appointment. Ask for an introductory visit rather than a full groom — being handled, hearing the clippers and going home again. A puppy that finds the salon unremarkable is a dog that can be groomed for the next fifteen years without sedation.",
    ],
  },
  {
    breedSlug: "bernese-mountain-dog",
    stageSlug: "12-weeks",
    sectionId: "grooming",
    body: [
      "The coat that arrives later is not the coat you are brushing now, and the habit is what you are building. Book an introductory grooming visit while the job is still trivial, and keep the daily two minutes going — a large dog that objects to having its feet handled is a genuinely difficult problem.",
    ],
  },
  {
    breedSlug: "french-bulldog",
    stageSlug: "12-weeks",
    sectionId: "exercise",
    body: [
      "First walks need more caution with a flat-faced breed than the walk itself suggests. Breathing is the limit rather than stamina, and a puppy that is enjoying itself will not stop in time. Go out at the cool ends of the day, keep outings short, and treat noisy breathing, tiring quickly or any reluctance to continue as a reason to stop and to raise it with your veterinarian.",
    ],
  },
  {
    breedSlug: "poodle",
    stageSlug: "9-11-weeks",
    sectionId: "grooming",
    body: [
      "A coat like this will need professional grooming for the whole of the dog's life, which makes the handling practice at this age unusually valuable. Book a first grooming appointment now — many groomers offer a short introductory visit with no full groom — so the first real one is not also the first time the puppy has been on a table.",
    ],
  },
  {
    breedSlug: "bernese-mountain-dog",
    stageSlug: "9-11-weeks",
    sectionId: "grooming",
    body: [
      "A heavy double coat is coming. Brushing now is about tolerance rather than tidiness, and starting before there is much to brush is the whole point.",
    ],
  },
  {
    breedSlug: "french-bulldog",
    stageSlug: "9-11-weeks",
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
    stageSlug: "9-12-months",
    sectionId: "vaccine-questions",
    heading: "In Ontario, the rabies booster runs from the vaccination date",
    kind: "legal",
    // Deliberately no `ageThreshold`. Ontario's booster is due within a year
    // of the *previous vaccination*, which is a date on the record and not a
    // function of the dog's age — so nothing here may be triggered by the
    // reader entering this stage.
    body: [
      "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies, and your dog passed that threshold months ago. What matters now is the second part: the regulation requires reimmunisation by the date written on the certificate of immunization — a date that carries the interval from the vaccine's own product monograph. Ontario's guidance summarises the usual shape of that as a booster within a year and then every one to three years.",
      "That clock runs from the vaccination date on the record rather than from your dog's birthday, so the two will rarely line up. Check the certificate for the date the last one was given and ask your clinic when the next is due. The province warns that you can be fined if a pet is not vaccinated, and this is a legal obligation rather than a veterinary recommendation.",
    ],
    sources: [
      {
        label:
          "R.R.O. 1990, Reg. 567 (Rabies Immunization), s. 1 — a cat, dog or ferret three months of age or over; s. 3 and s. 6 — reimmunization by the date on the certificate",
        publisher: "Government of Ontario (e-Laws)",
        url: "https://www.ontario.ca/laws/regulation/900567",
      },
      {
        label: "Rabies and your pets — booster within one year, then every one to three years",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/page/rabies-pets",
      },
    ],
  },
  {
    provinces: ["BC"],
    stageSlug: "9-12-months",
    sectionId: "vaccine-questions",
    heading: "In British Columbia, public health recommends rabies vaccination",
    kind: "guidance",
    body: [
      "The BC Centre for Disease Control says that rabies vaccines are available for cats, dogs and ferrets and that \u201cyour pets should be vaccinated, and their immunizations should be kept up to date\u201d. That is public health guidance. Unlike Ontario, described elsewhere in this Journey, we are not presenting a province-wide legal vaccination requirement for British Columbia \u2014 which is not the same as saying no legal obligation could ever apply to you: municipalities set their own licensing and animal-control rules, and travel, import and bite-investigation rules are separate again. Ask your veterinarian what applies where you live.",
      "It still matters at the first-year appointment. Rabies vaccination comes up when boarding, when travelling, and above all if a dog is ever exposed or involved in a bite incident, where a documented current vaccination puts an animal in a materially different position.",
    ],
    sources: [
      {
        label:
          "Rabies — “your pets should be vaccinated, and their immunizations should be kept up to date”",
        publisher: "BC Centre for Disease Control",
        url: "https://www.bccdc.ca/health-info/diseases-conditions/rabies",
      },
    ],
  },
  {
    provinces: ["ON"],
    stageSlug: "4-6-months",
    sectionId: "vaccine-questions",
    heading: "In Ontario, rabies vaccination is a legal requirement from three months of age",
    kind: "legal",
    body: [
      "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. A dog at this stage has passed that threshold, so this is a matter of confirming it has been done rather than planning for it.",
      "The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. It is a legal obligation rather than a veterinary recommendation, so it belongs on the list of things to confirm at the appointment.",
    ],
    ageThreshold: {
      months: 3,
      before: {
        heading: "In Ontario, your dog reaches the legal threshold on {date}",
        body: [
          "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. Three calendar months from your dog's date of birth falls on {date}.",
          "The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. It is a legal obligation rather than a veterinary recommendation.",
        ],
      },
      reached: {
        heading: "In Ontario, your dog is past the legal threshold",
        body: [
          "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. Your dog reached three calendar months on {date}, so this is now a matter of confirming it has been done.",
          "The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. It is a legal obligation rather than a veterinary recommendation, which is why it is worth checking off the record rather than assuming.",
        ],
      },
    },
    sources: [
      {
        label:
          "R.R.O. 1990, Reg. 567 (Rabies Immunization), s. 1 — a cat, dog or ferret three months of age or over; s. 3 and s. 6 — reimmunization by the date on the certificate",
        publisher: "Government of Ontario (e-Laws)",
        url: "https://www.ontario.ca/laws/regulation/900567",
      },
      {
        label: "Rabies and your pets — the provincial vaccination requirement",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/page/rabies-pets",
      },
    ],
  },
  {
    provinces: ["BC"],
    stageSlug: "4-6-months",
    sectionId: "vaccine-questions",
    heading: "In British Columbia, public health recommends rabies vaccination",
    kind: "guidance",
    body: [
      "The BC Centre for Disease Control says that rabies vaccines are available for cats, dogs and ferrets and that \u201cyour pets should be vaccinated, and their immunizations should be kept up to date\u201d. That is public health guidance. Unlike Ontario, described elsewhere in this Journey, we are not presenting a province-wide legal vaccination requirement for British Columbia \u2014 which is not the same as saying no legal obligation could ever apply to you: municipalities set their own licensing and animal-control rules, and travel, import and bite-investigation rules are separate again. Ask your veterinarian what applies where you live.",
      "Recommended is not optional, and it matters more as a dog goes further afield. It comes up when boarding, when travelling, and above all if a dog is ever exposed or involved in a bite incident, where a documented current vaccination puts an animal in a materially different position.",
    ],
    sources: [
      {
        label:
          "Rabies — “your pets should be vaccinated, and their immunizations should be kept up to date”",
        publisher: "BC Centre for Disease Control",
        url: "https://www.bccdc.ca/health-info/diseases-conditions/rabies",
      },
    ],
  },
  {
    provinces: ["ON"],
    stageSlug: "3-months",
    sectionId: "vaccine-questions",
    heading: "In Ontario, rabies vaccination becomes a legal requirement at three months",
    kind: "legal",
    body: [
      "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. Most puppies reach that point during this stage, though the exact date depends on when yours was born rather than on which stage it is reading.",
      "The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. This is a legal obligation rather than a veterinary recommendation, so it belongs on the list of things to raise at the appointment rather than to consider.",
    ],
    ageThreshold: {
      months: 3,
      before: {
        heading: "In Ontario, your puppy reaches the legal threshold on {date}",
        body: [
          "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. Three calendar months from your puppy's date of birth falls on {date}, which is a little after the start of this stage.",
          "The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. This is a legal obligation rather than a veterinary recommendation.",
        ],
      },
      reached: {
        heading: "In Ontario, your puppy is now past the legal threshold",
        body: [
          "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. Your puppy reached three calendar months on {date}, so the requirement applies now rather than approaching.",
          "If it has not been given, raise it at the next appointment rather than waiting to be asked. The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated.",
        ],
      },
    },
    sources: [
      {
        label:
          "R.R.O. 1990, Reg. 567 (Rabies Immunization), s. 1 — a cat, dog or ferret three months of age or over; s. 3 and s. 6 — reimmunization by the date on the certificate",
        publisher: "Government of Ontario (e-Laws)",
        url: "https://www.ontario.ca/laws/regulation/900567",
      },
      {
        label: "Rabies and your pets — the provincial vaccination requirement",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/page/rabies-pets",
      },
    ],
  },
  {
    provinces: ["BC"],
    stageSlug: "3-months",
    sectionId: "vaccine-questions",
    heading: "In British Columbia, public health recommends rabies vaccination",
    kind: "guidance",
    body: [
      "The BC Centre for Disease Control says that rabies vaccines are available for cats, dogs and ferrets and that \u201cyour pets should be vaccinated, and their immunizations should be kept up to date\u201d. That is public health guidance. Unlike Ontario, described elsewhere in this Journey, we are not presenting a province-wide legal vaccination requirement for British Columbia \u2014 which is not the same as saying no legal obligation could ever apply to you: municipalities set their own licensing and animal-control rules, and travel, import and bite-investigation rules are separate again. Ask your veterinarian what applies where you live.",
      "Recommended is not optional. It comes up when boarding, when travelling, and above all if a dog is ever exposed or involved in a bite incident, where a documented current vaccination puts an animal in a materially different position. Raise it rather than waiting for it to be raised with you.",
    ],
    sources: [
      {
        label:
          "Rabies — “your pets should be vaccinated, and their immunizations should be kept up to date”",
        publisher: "BC Centre for Disease Control",
        url: "https://www.bccdc.ca/health-info/diseases-conditions/rabies",
      },
    ],
  },
  {
    // The only province named here, and only because the regulation itself
    // says it. No national claim is made, and the section governs separation
    // from the mother rather than sale — those are different things and the
    // copy must not blur them.
    provinces: ["QC"],
    stageSlug: "8-weeks",
    sectionId: "this-week",
    heading: "In Quebec, eight weeks is the age the regulation sets",
    kind: "legal",
    body: [
      "Quebec's Regulation respecting the welfare and safety of domestic companion animals and equines provides that a litter \u201cmay not be separated from their mother before the age of 8 weeks\u201d. The duty falls on whoever owns or keeps the litter rather than on you as the buyer, and it is about separation from the mother rather than about the sale itself.",
      "It is still worth knowing, for two reasons. It explains why eight weeks is the conventional age for a puppy to come home rather than an arbitrary one. And a puppy offered to you in Quebec noticeably younger than this was separated in breach of it, which is worth pausing over — both for the puppy in front of you and for what it suggests about where it came from.",
      "We name Quebec here because we have read the regulation. Other provinces are not claimed either way: rules on breeding, sale and transfer differ across the country and a requirement in one province tells you nothing about another.",
    ],
    sources: [
      {
        label: "Regulation respecting the welfare and safety of domestic companion animals and equines, s. 36",
        publisher: "Gouvernement du Qu\u00e9bec (L\u00e9gis Qu\u00e9bec)",
        url: "https://www.legisquebec.gouv.qc.ca/en/document/cr/B-3.1,%20r.%200.1%20/",
      },
    ],
  },
  {
    provinces: ["ON"],
    stageSlug: "8-weeks",
    sectionId: "paperwork",
    heading: "In Ontario, rabies vaccination becomes a legal requirement at three months",
    kind: "legal",
    body: [
      "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies \u2014 indoor animals included. Your puppy is well short of that at eight weeks, so this is something to plan at the first appointment rather than to act on now.",
      "The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. It is a legal obligation rather than a veterinary recommendation, which is why it belongs with the paperwork rather than with the advice.",
    ],
    ageThreshold: {
      months: 3,
      before: {
        heading: "In Ontario, your puppy reaches the legal threshold on {date}",
        body: [
          "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies \u2014 indoor animals included. Three calendar months from your puppy's date of birth falls on {date}, so there is time to plan it rather than react to it.",
          "The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. It is a legal obligation rather than a veterinary recommendation, which is why it belongs with the paperwork rather than with the advice.",
        ],
      },
      reached: {
        heading: "In Ontario, your puppy is now past the legal threshold",
        body: [
          "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies \u2014 indoor animals included. Your puppy reached three calendar months on {date}, so the requirement applies now.",
          "The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. It is a legal obligation rather than a veterinary recommendation.",
        ],
      },
    },
    sources: [
      {
        label:
          "R.R.O. 1990, Reg. 567 (Rabies Immunization), s. 1 — a cat, dog or ferret three months of age or over; s. 3 and s. 6 — reimmunization by the date on the certificate",
        publisher: "Government of Ontario (e-Laws)",
        url: "https://www.ontario.ca/laws/regulation/900567",
      },
      {
        label: "Rabies and your pets \u2014 the provincial vaccination requirement",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/page/rabies-pets",
      },
    ],
  },
  {
    provinces: ["ON"],
    stageSlug: "12-weeks",
    sectionId: "vaccine-questions",
    heading: "In Ontario, rabies vaccination becomes a legal requirement at three months",
    kind: "legal",
    // The public wording. It must not claim the threshold has been crossed:
    // twelve weeks is eighty-four days and three calendar months is never
    // eighty-four days, so a page covering days 84–90 holds puppies on both
    // sides of the line. The personalised variants below know the date.
    body: [
      "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. Twelve weeks is close to that threshold but is not the same date: three calendar months from a date of birth falls a few days past the twelve-week mark, and exactly how far depends on which months your puppy has lived through.",
      "So this is the appointment at which to fix the timing rather than discover it. The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. This is a legal obligation rather than a veterinary recommendation, which is why it belongs on a list of things to raise rather than a list of things to consider.",
    ],
    ageThreshold: {
      months: 3,
      before: {
        heading: "In Ontario, your puppy reaches the legal threshold on {date}",
        body: [
          "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. Three calendar months from your puppy's date of birth falls on {date}, which is a few days past the twelve-week mark rather than on it.",
          "That makes this the appointment to plan it at rather than the deadline itself. The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. This is a legal obligation rather than a veterinary recommendation.",
        ],
      },
      reached: {
        heading: "In Ontario, your puppy is now past the legal threshold",
        body: [
          "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. Your puppy reached three calendar months on {date}, so the requirement applies now rather than approaching.",
          "If it has not been given, raise it at the next appointment rather than waiting to be asked. The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. This is a legal obligation rather than a veterinary recommendation.",
        ],
      },
    },
    sources: [
      {
        label:
          "R.R.O. 1990, Reg. 567 (Rabies Immunization), s. 1 — a cat, dog or ferret three months of age or over; s. 3 and s. 6 — reimmunization by the date on the certificate",
        publisher: "Government of Ontario (e-Laws)",
        url: "https://www.ontario.ca/laws/regulation/900567",
      },
      {
        label: "Rabies and your pets — the provincial vaccination requirement",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/page/rabies-pets",
      },
    ],
  },
  {
    provinces: ["BC"],
    stageSlug: "12-weeks",
    sectionId: "vaccine-questions",
    heading: "In British Columbia, public health recommends rabies vaccination",
    kind: "guidance",
    body: [
      "The BC Centre for Disease Control says that rabies vaccines are available for cats, dogs and ferrets and that \u201cyour pets should be vaccinated, and their immunizations should be kept up to date\u201d. That is public health guidance. Unlike Ontario, described elsewhere in this Journey, we are not presenting a province-wide legal vaccination requirement for British Columbia \u2014 which is not the same as saying no legal obligation could ever apply to you: municipalities set their own licensing and animal-control rules, and travel, import and bite-investigation rules are separate again. Ask your veterinarian what applies where you live.",
      "Recommended is not optional. Rabies vaccination comes up when boarding, when travelling, and above all if a dog is ever exposed or involved in a bite incident, where a documented current vaccination puts an animal in a materially different position. Raise it explicitly rather than waiting for it to be raised with you.",
    ],
    sources: [
      {
        label:
          "Rabies — “your pets should be vaccinated, and their immunizations should be kept up to date”",
        publisher: "BC Centre for Disease Control",
        url: "https://www.bccdc.ca/health-info/diseases-conditions/rabies",
      },
    ],
  },
  {
    provinces: ["ON"],
    stageSlug: "9-11-weeks",
    sectionId: "vaccine-questions",
    heading: "In Ontario, rabies vaccination becomes a legal requirement at three months",
    kind: "legal",
    body: [
      "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. Your puppy is not there yet: three calendar months falls a little after the twelve-week mark, and the exact date depends on when it was born.",
      "The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. This is a legal obligation rather than a veterinary recommendation, and it is worth raising at your next appointment so the timing is planned rather than discovered.",
    ],
    ageThreshold: {
      months: 3,
      before: {
        heading: "In Ontario, your puppy reaches the legal threshold on {date}",
        body: [
          "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. Three calendar months from your puppy's date of birth falls on {date}.",
          "The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. This is a legal obligation rather than a veterinary recommendation, and it is worth raising at your next appointment so the timing is planned rather than discovered.",
        ],
      },
      reached: {
        heading: "In Ontario, your puppy is now past the legal threshold",
        body: [
          "Ontario requires that cats, dogs and ferrets three months of age or over be vaccinated against rabies — indoor animals included. Your puppy reached three calendar months on {date}, so the requirement applies now.",
          "The regulation then requires reimmunisation by the date written on the certificate of immunization, and that date carries the interval from the vaccine's own product monograph rather than a figure in the regulation. Ontario's guidance summarises the usual shape of it as a booster within a year and then every one to three years. The province warns that you can be fined if a pet is not vaccinated. This is a legal obligation rather than a veterinary recommendation, and it is worth raising at your next appointment.",
        ],
      },
    },
    sources: [
      {
        label:
          "R.R.O. 1990, Reg. 567 (Rabies Immunization), s. 1 — a cat, dog or ferret three months of age or over; s. 3 and s. 6 — reimmunization by the date on the certificate",
        publisher: "Government of Ontario (e-Laws)",
        url: "https://www.ontario.ca/laws/regulation/900567",
      },
      {
        label: "Rabies and your pets — the provincial vaccination requirement",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/page/rabies-pets",
      },
    ],
  },
  {
    provinces: ["BC"],
    stageSlug: "9-11-weeks",
    sectionId: "vaccine-questions",
    heading: "In British Columbia, public health recommends rabies vaccination",
    kind: "guidance",
    body: [
      "The BC Centre for Disease Control says that rabies vaccines are available for cats, dogs and ferrets and that \u201cyour pets should be vaccinated, and their immunizations should be kept up to date\u201d. That is public health guidance. Unlike Ontario, described elsewhere in this Journey, we are not presenting a province-wide legal vaccination requirement for British Columbia \u2014 which is not the same as saying no legal obligation could ever apply to you: municipalities set their own licensing and animal-control rules, and travel, import and bite-investigation rules are separate again. Ask your veterinarian what applies where you live.",
      "Recommended is not the same as optional. Rabies also comes up when boarding, when travelling, and if a dog is ever exposed or involved in a bite incident, so it is worth an explicit conversation rather than an assumption.",
    ],
    sources: [
      {
        label:
          "Rabies — “your pets should be vaccinated, and their immunizations should be kept up to date”",
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
    stageSlug: "beyond-the-first-year",
    sectionId: "exercise",
    heading: "Building through a Canadian winter",
    body: [
      "Cold suits sustained work better than heat does, so winter is a reasonable time to be adding duration — with the surface as the limiting factor rather than the dog. Ice is where a fit young dog hurts itself, and more so if it is still growing, so choose routes for traction and keep the pace self-chosen.",
      "Rinse the paws after treated pavements and check between the toes if the dog starts slowing. Short daylight means more of this happens in the dark: a light and something reflective are worth having before you need them.",
    ],
    guide: { slug: "winter-dog-care-in-canada", label: "Winter care, paws and road salt" },
  },
  {
    season: "summer",
    stageSlug: "beyond-the-first-year",
    sectionId: "exercise",
    heading: "Building through a Canadian summer",
    body: [
      "A fitter dog goes further before it flags, which means heat becomes the limit before tiredness does — and a dog enjoying itself will not be the one to stop. Go at the ends of the day, test pavement with the back of your hand, carry water on anything longer than a stroll, and treat a hot week as a reason to hold the current level rather than add to it.",
      "Building fitness and building heat tolerance are not the same project, and the second one has a much lower ceiling than people expect.",
    ],
    guide: { slug: "summer-heat-safety-for-dogs-in-canada", label: "Heat, pavement and wildfire smoke" },
  },
  {
    season: "summer",
    stageSlug: "9-12-months",
    sectionId: "exercise",
    heading: "Building in summer",
    body: [
      "This is the stage where owners start extending walks, and summer is the worst season to do it in without thinking. A fitter dog goes further before it flags, which means heat becomes the limit before tiredness does — and a dog that is enjoying itself will not be the one to call time.",
      "Go early or late, test pavement with the back of your hand, carry water on anything longer than a stroll, and treat a hot week as a reason to hold the current level rather than to add to it. Building fitness and building heat tolerance are not the same project.",
    ],
    guide: { slug: "summer-heat-safety-for-dogs-in-canada", label: "Heat, pavement and wildfire smoke" },
  },
  {
    season: "winter",
    stageSlug: "9-12-months",
    sectionId: "exercise",
    heading: "Building in winter",
    body: [
      "Winter is kinder to a dog building stamina than summer is — cold weather suits sustained work far better than heat does — but the surface is the problem. Ice turns a growing dog's enthusiasm into an injury risk, particularly for a bigger dog with more mass behind a bad turn, so choose routes for traction rather than for scenery.",
      "Rinse the paws after treated pavements and check between the toes if the dog starts slowing or refusing. Short daylight also means more of the walk happens in the dark: a light and a reflective harness are worth having before you need them.",
    ],
    guide: { slug: "winter-dog-care-in-canada", label: "Winter care, paws and road salt" },
  },
  {
    season: "summer",
    stageSlug: "7-8-months",
    sectionId: "exercise",
    heading: "An adolescent in summer",
    body: [
      "Adolescents push past their own limits more readily than puppies or adults do, and heat is the condition in which that matters most — a dog chasing something in thirty degrees will not stop because it is too hot. Walk at the ends of the day, test pavement with the back of your hand, and be the one who calls time rather than waiting for the dog to.",
      "Summer also raises the distraction level everywhere: more people, more dogs, more wildlife, more going on. A recall that was holding in May can come apart in July for no reason other than that the world got busier. That is a reason to drop back a rung, not to conclude the training has failed.",
    ],
    guide: { slug: "summer-heat-safety-for-dogs-in-canada", label: "Heat, pavement and wildfire smoke" },
  },
  {
    season: "winter",
    stageSlug: "7-8-months",
    sectionId: "training",
    heading: "Training an adolescent in winter",
    body: [
      "Short daylight is the real constraint. The rebuilding this stage asks for needs repetitions in ordinary places, and in a Canadian winter most of those places are dark by the time anyone is free. Go for frequency over duration — three five-minute sessions beat one long one — and accept that some of the work moves indoors.",
      "Ice adds a second reason to keep a long line short. A fast adolescent turning hard on a frozen path is a genuine injury risk, and traction is worth choosing routes for. Rinse the paws after treated pavements, and check between the toes if a dog starts refusing to walk.",
    ],
    guide: { slug: "winter-dog-care-in-canada", label: "Winter care, paws and road salt" },
  },
  {
    season: "summer",
    stageSlug: "4-6-months",
    sectionId: "exercise",
    heading: "Longer walks in summer",
    body: [
      "This is the stage where outings lengthen, and summer is the season most likely to punish that. Heat gives less warning than cold and a young dog enjoying itself will not stop in time, so walk at the ends of the day and treat midday as indoor time. Test pavement with the back of your hand before committing to a route — if you cannot hold it there comfortably, it is too hot for paws.",
      "Water and shade need to be part of the plan rather than something you find. And the longer, greener routes that open up now are exactly where tick exposure is highest, which makes the parasite conversation more immediate than it was in February.",
    ],
    guide: { slug: "summer-heat-safety-for-dogs-in-canada", label: "Heat, pavement and wildfire smoke" },
  },
  {
    season: "winter",
    stageSlug: "4-6-months",
    sectionId: "exercise",
    heading: "Longer walks in winter",
    body: [
      "Winter constrains this stage differently: not heat but traction, daylight and salt. Ice is a genuine risk to a growing dog that has just discovered it can run, so pick surfaces deliberately and keep the pace self-chosen rather than chased. Rinse the paws after treated pavements, and check between the toes if the dog starts refusing to walk — ice balling up there is usually the reason.",
      "Short daylight is the other cost, because it takes away the hours in which the new places you want to practise in are usable. Go out more often for less time rather than waiting for the weekend, and move some of the work indoors: a stairwell, a garage and a porch are three different contexts as far as a young dog is concerned.",
    ],
    guide: { slug: "winter-dog-care-in-canada", label: "Winter care, paws and road salt" },
  },
  {
    season: "winter",
    stageSlug: "3-months",
    sectionId: "training",
    heading: "Consolidating in winter",
    body: [
      "The work of this month is repetition in different places, and winter takes most of those places away. Daylight is short, outings are shorter, and the practice that should be happening on the front path is happening in the dark or not at all.",
      "Compensate indoors rather than waiting for spring. A hallway, a stairwell, a garage and a porch are four different contexts as far as a puppy is concerned, and generalising across them is real work. Keep the outdoor repetitions short and frequent instead of rare and long, and treat a five-minute session in the cold as a complete one.",
    ],
    guide: { slug: "winter-dog-care-in-canada", label: "Winter care, paws and road salt" },
  },
  {
    season: "summer",
    stageSlug: "3-months",
    sectionId: "socialisation",
    heading: "Consolidating in summer",
    body: [
      "Summer gives you the opposite problem: no shortage of places to practise, and far more going on in them. More people, more dogs, more children and more noise means the distraction level outdoors has quietly gone up several rungs, and a puppy that was coping in May may not be coping in July.",
      "Use the abundance rather than being pushed along by it. Sit on a bench at a distance and feed while the world goes past, and go earlier in the day when it is both cooler and quieter. Heat is the other constraint: test pavement with the back of your hand before walking on it, and keep sessions short when it is warm.",
    ],
    guide: { slug: "summer-heat-safety-for-dogs-in-canada", label: "Heat, pavement and wildfire smoke" },
  },
  {
    season: "winter",
    stageSlug: "8-weeks",
    sectionId: "toilet-training",
    heading: "Toilet training in a Canadian winter",
    body: [
      "Snow changes this job more than any other seasonal factor changes anything else in the Journey. Shovel and maintain a small toilet patch close to the door before the puppy needs it \u2014 a puppy in deep snow will not toilet, it will simply stand there \u2014 and keep it clear, because the patch it used yesterday is the one it is looking for.",
      "Dress to stand outside before you open the door. Standing at the door in socks is how a trip gets cut short at exactly the wrong moment, and an eight-week-old has very little tolerance for cold: out, toilet, praise, in. If a puppy starts refusing to go out, check its feet before assuming it is being difficult \u2014 ice balling between the toes and road salt are the usual reasons.",
    ],
    guide: { slug: "winter-dog-care-in-canada", label: "Winter care, paws and road salt" },
  },
  {
    season: "summer",
    stageSlug: "8-weeks",
    sectionId: "safety",
    heading: "A summer arrival",
    body: [
      "Heat is the hazard that gives least warning, and a very young puppy manages it badly. Keep the toilet trips at the cool ends of the day where you can, test any paved surface with the back of your hand before walking a puppy across it, and never leave a puppy in a parked car for any length of time at all.",
      "Shade and water need to be available wherever the puppy is, including indoors in a room that gets afternoon sun \u2014 a pen in the wrong place can become the hottest spot in the house by four o'clock.",
    ],
    guide: { slug: "summer-heat-safety-for-dogs-in-canada", label: "Heat, pavement and wildfire smoke" },
  },
  {
    season: "winter",
    stageSlug: "12-weeks",
    sectionId: "socialisation",
    heading: "A winter puppy, with the window closing",
    body: [
      "Winter and a closing socialisation window is the hardest combination this stage produces. There are fewer people outdoors, nobody lingers, and the last weeks of the cheapest learning your dog will ever do are happening behind a closed door. That has to be compensated for deliberately rather than waited out.",
      "Bring the world in: invite visitors, run the vacuum and the hairdryer, play recordings of traffic and fireworks quietly while feeding. Use the car as a heated viewing platform outside somewhere busy. And take the category winter hands you for free — snow, ice, salt, boots, shovels, and people muffled to the eyes — because a summer puppy will not meet any of it until it is far less flexible.",
    ],
    guide: { slug: "winter-dog-care-in-canada", label: "Winter care, paws and road salt" },
  },
  {
    season: "summer",
    stageSlug: "12-weeks",
    sectionId: "exercise",
    heading: "First walks in summer",
    body: [
      "Heat is the binding constraint on these first outings, and it gives less warning than cold. Walk at the ends of the day, test the pavement with the back of your hand before committing to a route — if you cannot hold it there comfortably, it is too hot for paws — and never leave a puppy in a parked car for any length of time.",
      "The season also makes the parasite conversation immediate rather than theoretical. Tick and mosquito exposure is at its height exactly as the puppy starts spending real time outdoors.",
    ],
    guide: { slug: "summer-heat-safety-for-dogs-in-canada", label: "Heat, pavement and wildfire smoke" },
  },
  {
    season: "winter",
    stageSlug: "9-11-weeks",
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
    stageSlug: "9-11-weeks",
    sectionId: "this-week",
    heading: "A summer puppy",
    body: [
      "Heat is the constraint this season rather than cold, and it is the more dangerous of the two because it gives less warning. Walk at the ends of the day, test pavement with the back of your hand before committing to a route, and never leave a puppy in a parked car for any length of time.",
      "The season also changes the parasite conversation. Tick and mosquito exposure is at its height, which makes the prevention discussion at your next appointment more immediate than it would be in February.",
    ],
    guide: { slug: "summer-heat-safety-for-dogs-in-canada", label: "Heat, pavement and wildfire smoke" },
  },
];
