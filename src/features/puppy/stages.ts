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
    "A pale Labrador puppy sitting on a tiled floor, looking up — around the age this stage covers.",
  reviewBy: "2027-09-01",
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
        "This is also the period when many owners first notice a puppy hesitating at something it walked past cheerfully a week earlier. Wariness appearing where there was none is a normal part of development rather than a sign anything has gone wrong. The response is more distance and less intensity, never more insistence.",
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
      title: "Teething",
      summary: "Starting, and increasing across these weeks. Manage it rather than train it away.",
      body: [
        "Adult teeth start moving through towards the end of this period and into the weeks after it, and chewing increases with them — expect more of it at eleven weeks than at nine. This is not a behaviour problem and it does not respond to being told off.",
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
        "At twelve weeks the socialisation window closes, teething moves from beginning to obvious, and the vaccination series reaches the dose that carries most of the weight — which lands later than most owners expect, past sixteen weeks rather than at twelve. Many owners are told at an appointment around twelve weeks that the puppy is finished. It is not.",
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
    "That a second period of wariness commonly appears in this window is described as normal development, with no week attached. Widely reported in behaviour literature; source it before publication, and do not pin it to a week without one.",
    "That three to four meals a day is typical at this age — stated as what most puppies are on rather than as a recommendation. Confirm against a veterinary nutrition source or soften further.",
    "Teething is described as starting towards the end of this window and increasing, with no week number. The direction is safe; the timing is not sourced. Do not make it specific without one.",
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
    "The week a lot of owners are told the puppy is finished. The series usually is not over, the socialisation window is closing rather than open, and the teeth are about to arrive in earnest.",
  metaDescription:
    "What matters at 12 weeks: why your puppy is probably not fully vaccinated yet, what socialisation is left, teething, first walks, and what to ask your veterinarian.",
  mediaId: "puppy-twelve-weeks",
  mediaAlt:
    "A husky-type puppy in a plain harness sitting on a paved street — out in the world on a lead, at around the age this stage covers.",
  reviewBy: "2027-09-01",
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
        "Teething moves from occasional to constant over the next few weeks.",
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
      title: "Teething and chewing",
      summary: "This is the section that will matter most over the next month.",
      body: [
        "Around now, and increasingly over the following weeks, the baby teeth start being replaced. You may find one in the carpet, or a spot of blood on a chew toy, or nothing at all — most puppies swallow them and nobody notices. The gums are sore, and chewing is the relief.",
        "Two things follow. First, chewing is going to increase, and it is not disobedience — a puppy cannot be trained out of a physical need. Manage the environment so the wrong options are not reachable, keep a rotation of things that are legal to chew so they stay interesting, and use cold: a wet flannel frozen into a twist, or a stuffed toy from the freezer, does more for a sore mouth than any correction.",
        "Second, mouthing you has to stop being funny. At nine weeks the teeth were needles and it was tolerable. At twelve they hurt, at six months they will do damage, and the household that laughed at it will be the one asking why the dog still does it. When teeth land on skin, everything stops — hands still, attention off, no drama — and then a legal chew appears.",
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
        "A young puppy has less reserve than an adult dog and can deteriorate faster, so the bar for making a phone call stays deliberately low. Telephone triage is a normal part of what a clinic does, it usually costs nothing, and the answer is one of three things: come now, come in the morning, or here is what to watch for.",
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
  ],

  resources: [
    {
      label: "Your provincial or territorial veterinary regulator, and what it licenses",
      publisher: "Canadian Veterinary Medical Association",
      url: "https://www.canadianveterinarians.net/students-of-the-cvma-scvma/regulatory-bodies/",
    },
  ],

  needsVerification: [
    "Ontario's threshold is 'over three months of age', quoted from ontario.ca/page/rabies-pets and confirmed verbatim. Neither that page nor the regulation it cites (R.R.O. 1990, Reg. 567) defines three months as a number of days, so nothing here converts it into one — twelve weeks is 84 days and three calendar months is never 84 days. The e-Laws and CanLII copies of the regulation could not be retrieved directly; re-check the primary text before this wording is published.",
    "The socialisation window closing around twelve weeks follows the AVSAB position statement's first-three-months framing and is sourced. Do not let a future edit turn 'closing' into a hard cut-off date — the statement does not say that.",
    "The final-dose ages (AAHA past sixteen weeks, preferring eighteen to twenty in high-risk settings; WSAVA sixteen weeks or older) are sourced and must stay attributed to the body that says them. This section must never become a schedule.",
    "Teething is described as starting around now and increasing, with no eruption order and no week numbers. Attach a veterinary dentistry source before making it specific.",
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
    "A very young puppy settled in a bed with a pen panel behind it — around the age this stage covers.",
  reviewBy: "2027-09-01",
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
        "What separates that from a problem is duration and company: whether it persists, and whether anything else has come with it. A very young puppy has little reserve and can deteriorate faster than an adult dog, so the threshold for phoning is deliberately low. Telephone triage is a normal part of what a clinic does, it usually costs nothing, and the answer is one of three things: come now, come in the morning, or here is what to watch for.",
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

export const stages: readonly PuppyStage[] = [eightWeeks, nineToElevenWeeks, twelveWeeks];

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
  { slug: "4-months", label: "4 months", phase: "early-development", range: { unit: "months", minMonths: 4, maxMonths: 4 } },
  { slug: "5-months", label: "5 months", phase: "early-development", range: { unit: "months", minMonths: 5, maxMonths: 5 } },
  { slug: "6-months", label: "6 months", phase: "early-development", range: { unit: "months", minMonths: 6, maxMonths: 6 } },

  // Adolescence — paired months, because the things that define this period
  // arrive on their own schedule and not on a monthly one.
  { slug: "7-8-months", label: "7–8 months", phase: "adolescence", range: { unit: "months", minMonths: 7, maxMonths: 8 } },
  { slug: "9-10-months", label: "9–10 months", phase: "adolescence", range: { unit: "months", minMonths: 9, maxMonths: 10 } },
  { slug: "11-12-months", label: "11–12 months", phase: "adolescence", range: { unit: "months", minMonths: 11, maxMonths: 12 } },

  // Maturity — open-ended, and a *navigation* boundary rather than a claim
  // about biology. See `boundaryVariesBySize`.
  {
    slug: "young-adult",
    label: "Young adult",
    phase: "maturity",
    range: { unit: "months", minMonths: 13 },
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
  if (stage.range.unit === "months" && stage.range.maxMonths === undefined) {
    return "a young adult";
  }
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
      "Very small puppies have little in reserve, so the move from four meals to three is worth raising specifically rather than assuming. A toy-breed puppy that goes too long without food can become weak or wobbly, and a teething dip in appetite is more consequential at this size than it would be in a Labrador.",
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
      "Very small puppies have little in reserve and can become weak or wobbly if they go too long between meals. Meal frequency is worth raising specifically at your next appointment rather than assuming a general schedule applies.",
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
      "Ontario requires that cats, dogs and ferrets over three months of age be vaccinated against rabies \u2014 indoor animals included. Your puppy is well short of that at eight weeks, so this is something to plan at the first appointment rather than to act on now.",
      "A first vaccination is followed by a booster within one year, and then every one to three years depending on the product used. There are fines for non-compliance. It is a legal obligation rather than a veterinary recommendation, which is why it belongs with the paperwork rather than with the advice.",
    ],
    ageThreshold: {
      months: 3,
      before: {
        heading: "In Ontario, your puppy reaches the legal threshold on {date}",
        body: [
          "Ontario requires that cats, dogs and ferrets over three months of age be vaccinated against rabies \u2014 indoor animals included. Three calendar months from your puppy's date of birth falls on {date}, so there is time to plan it rather than react to it.",
          "A first vaccination is followed by a booster within one year, and then every one to three years depending on the product used. There are fines for non-compliance. It is a legal obligation rather than a veterinary recommendation, which is why it belongs with the paperwork rather than with the advice.",
        ],
      },
      reached: {
        heading: "In Ontario, your puppy is now past the legal threshold",
        body: [
          "Ontario requires that cats, dogs and ferrets over three months of age be vaccinated against rabies \u2014 indoor animals included. Your puppy reached three calendar months on {date}, so the requirement applies now.",
          "A first vaccination is followed by a booster within one year, and then every one to three years depending on the product used. There are fines for non-compliance. It is a legal obligation rather than a veterinary recommendation.",
        ],
      },
    },
    sources: [
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
      "Ontario requires that cats, dogs and ferrets over three months of age be vaccinated against rabies — indoor animals included. Twelve weeks is close to that threshold but is not the same date: three calendar months from a date of birth falls a few days past the twelve-week mark, and exactly how far depends on which months your puppy has lived through.",
      "So this is the appointment at which to fix the timing rather than discover it. A first vaccination is followed by a booster within one year, and then every one to three years depending on the product used, and there are fines for non-compliance. This is a legal obligation rather than a veterinary recommendation, which is why it belongs on a list of things to raise rather than a list of things to consider.",
    ],
    ageThreshold: {
      months: 3,
      before: {
        heading: "In Ontario, your puppy reaches the legal threshold on {date}",
        body: [
          "Ontario requires that cats, dogs and ferrets over three months of age be vaccinated against rabies — indoor animals included. Three calendar months from your puppy's date of birth falls on {date}, which is a few days past the twelve-week mark rather than on it.",
          "That makes this the appointment to plan it at rather than the deadline itself. A first vaccination is followed by a booster within one year, and then every one to three years depending on the product used, and there are fines for non-compliance. This is a legal obligation rather than a veterinary recommendation.",
        ],
      },
      reached: {
        heading: "In Ontario, your puppy is now past the legal threshold",
        body: [
          "Ontario requires that cats, dogs and ferrets over three months of age be vaccinated against rabies — indoor animals included. Your puppy reached three calendar months on {date}, so the requirement applies now rather than approaching.",
          "If it has not been given, raise it at the next appointment rather than waiting to be asked. A first vaccination is followed by a booster within one year, and then every one to three years depending on the product used, and there are fines for non-compliance. This is a legal obligation rather than a veterinary recommendation.",
        ],
      },
    },
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
    stageSlug: "12-weeks",
    sectionId: "vaccine-questions",
    heading: "In British Columbia, rabies vaccination is recommended rather than required",
    kind: "guidance",
    body: [
      "The BC Centre for Disease Control recommends rabies vaccination for pets; provincial law does not compel it. That is a real difference from provinces such as Ontario, where three months of age is a legal threshold — and it is the reason a checklist written for one province does not transfer to another.",
      "Recommended is not optional. Rabies vaccination comes up when boarding, when travelling, and above all if a dog is ever exposed or involved in a bite incident, where a documented current vaccination puts an animal in a materially different position. Raise it explicitly rather than waiting for it to be raised with you.",
    ],
    sources: [
      {
        label: "Rabies — vaccination is recommended in British Columbia, not legally required",
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
      "Ontario requires that cats, dogs and ferrets over three months of age be vaccinated against rabies — indoor animals included. Your puppy is not there yet: three calendar months falls a little after the twelve-week mark, and the exact date depends on when it was born.",
      "A first vaccination is followed by a booster within one year, and then every one to three years depending on the product used. There are fines for non-compliance. This is a legal obligation rather than a veterinary recommendation, and it is worth raising at your next appointment so the timing is planned rather than discovered.",
    ],
    ageThreshold: {
      months: 3,
      before: {
        heading: "In Ontario, your puppy reaches the legal threshold on {date}",
        body: [
          "Ontario requires that cats, dogs and ferrets over three months of age be vaccinated against rabies — indoor animals included. Three calendar months from your puppy's date of birth falls on {date}.",
          "A first vaccination is followed by a booster within one year, and then every one to three years depending on the product used. There are fines for non-compliance. This is a legal obligation rather than a veterinary recommendation, and it is worth raising at your next appointment so the timing is planned rather than discovered.",
        ],
      },
      reached: {
        heading: "In Ontario, your puppy is now past the legal threshold",
        body: [
          "Ontario requires that cats, dogs and ferrets over three months of age be vaccinated against rabies — indoor animals included. Your puppy reached three calendar months on {date}, so the requirement applies now.",
          "A first vaccination is followed by a booster within one year, and then every one to three years depending on the product used. There are fines for non-compliance. This is a legal obligation rather than a veterinary recommendation, and it is worth raising at your next appointment.",
        ],
      },
    },
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
    stageSlug: "9-11-weeks",
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
