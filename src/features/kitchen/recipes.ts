export interface KitchenRecipe { slug: string; title: string; description: string; species: string[]; kind: string; timeLabel: string; ingredientCount: number; image: string; imageAlt: string; ingredients: string[]; steps: string[]; caution: string; serving: string; storage: string; avoid: string; sources: { label: string; href: string }[]; }
/** Original source-informed editorial methods, not kitchen-tested or veterinary-formulated. */
export const recipes: KitchenRecipe[] = [
  {
    "slug": "soft-carrot-mash-for-dogs",
    "title": "Soft Carrot Mash",
    "description": "One carrot. A little water. A soft, colourful extra to portion in tiny tastes.",
    "species": [
      "Dogs"
    ],
    "kind": "Plain cooked extra",
    "timeLabel": "Cook until soft",
    "ingredientCount": 2,
    "image": "/kitchen/carrot.webp",
    "imageAlt": "AI illustration of plain soft carrot mash",
    "ingredients": [
      "1 small fresh carrot",
      "Plain water, enough to cover the pieces for cooking"
    ],
    "steps": [
      "Wash and peel the carrot. Remove the ends, then cut it into small, even pieces.",
      "Put the pieces in a small pan and cover with plain water. Bring to a gentle boil, then simmer until they mash easily with a fork. Cooking time varies with piece size; tenderness matters more than a timer.",
      "Drain. Mash thoroughly, adding a little fresh drinking water if needed for a soft texture.",
      "Let it cool before offering a tiny taste. Set aside the remainder as a preparation batch, not a serving for one dog."
    ],
    "caution": "For healthy adult pets that tolerate these ingredients. Introduce only one new ingredient at a time and stop if it causes a reaction.",
    "serving": "Start with a very small taste, not a bowlful. All treats, toppers and other extras combined should stay below 10% of daily calories; this is a ceiling, not a target. A teaspoon is not a universal portion. Use your veterinary team’s individual calorie allowance and the exact ingredient’s nutrition information. If you do not know the allowance, ask before feeding more.",
    "storage": "Keep raw animal ingredients separate from ready-to-eat food, and wash hands, utensils and surfaces after handling them. Use a thermometer for animal-ingredient recipes. Cool the small amount you offer so it is not hot. Refrigerate the remaining cooked batch promptly in a clean shallow container, within two hours, at 4°C or colder; use within 2–3 days or freeze separately. Do not leave a pet bowl out all day or put food licked by your pet back into the stored batch. Discard cooked food left at room temperature for more than two hours. These are general food-handling precautions, not validated shelf-life testing for these recipes.",
    "avoid": "No butter, salt, stock, seasoning or sweetener. Avoid hard chunks, and supervise eating. This is not a treatment for constipation or diarrhoea.",
    "sources": [
      {
        "label": "VCA/CAVN, Using Food and Treats for Training Dogs",
        "href": "https://vcahospitals.com/know-your-pet/treats-for-training-dogs"
      },
      {
        "label": "VCA produce guidance",
        "href": "https://vcahospitals.com/resources/preventive-dog/nutrition/can-you-feed-pets-certain-fruits-and-veggies"
      },
      {
        "label": "Health Canada leftovers",
        "href": "https://www.canada.ca/en/health-canada/services/general-food-safety-tips/food-safety-tips-leftovers.html"
      },
      {
        "label": "WSAVA dog treats",
        "href": "https://wsava.org/wp-content/uploads/2024/06/Feeding-treats-to-your-dog-v2.pdf"
      }
    ]
  },
  {
    "slug": "sweet-potato-spoonfuls-for-dogs",
    "title": "Sweet Potato Spoonfuls",
    "description": "A warm-coloured kitchen classic, cooked soft and served cool in a small taste.",
    "species": [
      "Dogs"
    ],
    "kind": "Plain cooked extra",
    "timeLabel": "Cook until soft",
    "ingredientCount": 2,
    "image": "/kitchen/sweet-potato.webp",
    "imageAlt": "AI illustration of plain mashed sweet potato",
    "ingredients": [
      "1 small sweet potato",
      "Plain water, enough to cover the cubes for cooking"
    ],
    "steps": [
      "Wash and peel the sweet potato. Cut away damaged areas and cut the flesh into small, even cubes.",
      "Cover the cubes with water in a pan. Bring to a gentle boil, then simmer until completely tender.",
      "Drain and mash until there are no firm pieces. Add a little fresh drinking water if needed to soften it.",
      "Cool before serving a tiny taste. The full potato is a batch, not one pet's portion."
    ],
    "caution": "For healthy adult pets that tolerate these ingredients. Introduce only one new ingredient at a time and stop if it causes a reaction.",
    "serving": "Start with a very small taste, not a bowlful. All treats, toppers and other extras combined should stay below 10% of daily calories; this is a ceiling, not a target. A teaspoon is not a universal portion. Use your veterinary team’s individual calorie allowance and the exact ingredient’s nutrition information. If you do not know the allowance, ask before feeding more.",
    "storage": "Keep raw animal ingredients separate from ready-to-eat food, and wash hands, utensils and surfaces after handling them. Use a thermometer for animal-ingredient recipes. Cool the small amount you offer so it is not hot. Refrigerate the remaining cooked batch promptly in a clean shallow container, within two hours, at 4°C or colder; use within 2–3 days or freeze separately. Do not leave a pet bowl out all day or put food licked by your pet back into the stored batch. Discard cooked food left at room temperature for more than two hours. These are general food-handling precautions, not validated shelf-life testing for these recipes.",
    "avoid": "Use plain sweet potato, not a seasoned side dish or pie filling. Do not add sugar, marshmallows, butter, cinnamon blends or sweeteners. Do not use this as a digestive treatment or substitute for a balanced food.",
    "sources": [
      {
        "label": "VCA treat options (use sweet-potato ingredient fact, not its inconsistent5% claim)",
        "href": "https://vcahospitals.com/resources/preventive-dog/nutrition/treats-to-skip-and-treats-to-share-with-your-pet"
      },
      {
        "label": "WSAVA dog treats",
        "href": "https://wsava.org/wp-content/uploads/2024/06/Feeding-treats-to-your-dog-v2.pdf"
      },
      {
        "label": "Health Canada leftovers",
        "href": "https://www.canada.ca/en/health-canada/services/general-food-safety-tips/food-safety-tips-leftovers.html"
      }
    ]
  },
  {
    "slug": "plain-poached-chicken-for-dogs-and-cats",
    "title": "Plain Poached Chicken Shreds",
    "description": "A simple, gently cooked extra for dogs and cats that already tolerate chicken.",
    "species": [
      "Dogs",
      "Cats"
    ],
    "kind": "Plain cooked extra",
    "timeLabel": "Cook to 74°C",
    "ingredientCount": 2,
    "image": "/kitchen/chicken.webp",
    "imageAlt": "AI illustration of finely shredded plain cooked chicken",
    "ingredients": [
      "1 small fresh, unseasoned, boneless, skinless chicken breast",
      "Plain water, enough to cover it for cooking"
    ],
    "steps": [
      "Use separate clean utensils for raw poultry. Put the chicken in a saucepan and cover it with plain water. Do not add stock, seasoning or salt.",
      "Bring to a gentle simmer and cook until a clean digital food thermometer reads at least 74°C (165°F) in the thickest part. Time and colour alone do not confirm safe cooking.",
      "Transfer the cooked chicken to a clean plate. Let it cool enough to handle, then shred it finely, checking for any hard pieces.",
      "Offer only a tiny, cooled amount that fits your pet's treat allowance. Save the rest of the batch separately; a whole breast is not a pet serving."
    ],
    "caution": "For healthy adult pets that tolerate these ingredients. Introduce only one new ingredient at a time and stop if it causes a reaction.",
    "serving": "Start with a very small taste, not a bowlful. All treats, toppers and other extras combined should stay below 10% of daily calories; this is a ceiling, not a target. A teaspoon is not a universal portion. Use your veterinary team’s individual calorie allowance and the exact ingredient’s nutrition information. If you do not know the allowance, ask before feeding more.",
    "storage": "Keep raw animal ingredients separate from ready-to-eat food, and wash hands, utensils and surfaces after handling them. Use a thermometer for animal-ingredient recipes. Cool the small amount you offer so it is not hot. Refrigerate the remaining cooked batch promptly in a clean shallow container, within two hours, at 4°C or colder; use within 2–3 days or freeze separately. Do not leave a pet bowl out all day or put food licked by your pet back into the stored batch. Discard cooked food left at room temperature for more than two hours. These are general food-handling precautions, not validated shelf-life testing for these recipes.",
    "avoid": "No bones, skin, deli meat, rotisserie chicken, gravy or seasoned broth. Avoid if chicken is not appropriate for your pet's diet. Chicken alone is not nutritionally complete for a dog or cat.",
    "sources": [
      {
        "label": "VCA/CAVN, Using Food and Treats for Training Dogs",
        "href": "https://vcahospitals.com/know-your-pet/treats-for-training-dogs"
      },
      {
        "label": "VCA/CAVN, Using Food and Treats for Training Cats",
        "href": "https://vcahospitals.com/know-your-pet/using-food-and-treats-for-training-cats"
      },
      {
        "label": "Health Canada cooking temperatures",
        "href": "https://www.canada.ca/en/health-canada/services/general-food-safety-tips/safe-internal-cooking-temperatures.html"
      },
      {
        "label": "Health Canada leftovers",
        "href": "https://www.canada.ca/en/health-canada/services/general-food-safety-tips/food-safety-tips-leftovers.html"
      },
      {
        "label": "WSAVA dog treats",
        "href": "https://wsava.org/wp-content/uploads/2024/06/Feeding-treats-to-your-dog-v2.pdf"
      },
      {
        "label": "WSAVA cat treats",
        "href": "https://wsava.org/wp-content/uploads/2024/06/Feeding-treats-to-your-cat-v2.pdf"
      }
    ]
  },
  {
    "slug": "plain-egg-crumbles-for-dogs-and-cats",
    "title": "Plain Egg Crumbles",
    "description": "A soft, fully cooked egg treat, with no milk, butter or seasoning.",
    "species": [
      "Dogs",
      "Cats"
    ],
    "kind": "Plain cooked extra",
    "timeLabel": "Cook to 74°C",
    "ingredientCount": 2,
    "image": "/kitchen/egg.webp",
    "imageAlt": "AI illustration of plain fully cooked egg crumbles",
    "ingredients": [
      "1 fresh egg",
      "1 tablespoon (15 mL) plain water"
    ],
    "steps": [
      "Crack the egg into a clean bowl and discard the shell. Beat it with the water.",
      "Pour into a non-stick pan over gentle heat. Stir, allowing the egg to form soft curds. Add no oil, butter, salt or seasoning.",
      "Cook thoroughly until a food thermometer confirms 74°C (165°F). Do not leave runny or raw egg.",
      "Transfer to a clean plate, cool, and break into tiny soft crumbles. Offer a small taste within your pet's allowance, not the whole egg."
    ],
    "caution": "For healthy adult pets that tolerate these ingredients. Introduce only one new ingredient at a time and stop if it causes a reaction.",
    "serving": "Start with a very small taste, not a bowlful. All treats, toppers and other extras combined should stay below 10% of daily calories; this is a ceiling, not a target. A teaspoon is not a universal portion. Use your veterinary team’s individual calorie allowance and the exact ingredient’s nutrition information. If you do not know the allowance, ask before feeding more.",
    "storage": "Keep raw animal ingredients separate from ready-to-eat food, and wash hands, utensils and surfaces after handling them. Use a thermometer for animal-ingredient recipes. Cool the small amount you offer so it is not hot. Refrigerate the remaining cooked batch promptly in a clean shallow container, within two hours, at 4°C or colder; use within 2–3 days or freeze separately. Do not leave a pet bowl out all day or put food licked by your pet back into the stored batch. Discard cooked food left at room temperature for more than two hours. These are general food-handling precautions, not validated shelf-life testing for these recipes.",
    "avoid": "Avoid for pets with an egg allergy or when egg is incompatible with their prescribed diet. Do not include eggshell as a homemade calcium supplement. This is not a complete meal.",
    "sources": [
      {
        "label": "VCA/CAVN, Using Food and Treats for Training Dogs",
        "href": "https://vcahospitals.com/know-your-pet/treats-for-training-dogs"
      },
      {
        "label": "VCA/CAVN, Using Food and Treats for Training Cats",
        "href": "https://vcahospitals.com/know-your-pet/using-food-and-treats-for-training-cats"
      },
      {
        "label": "Health Canada cooking temperatures",
        "href": "https://www.canada.ca/en/health-canada/services/general-food-safety-tips/safe-internal-cooking-temperatures.html"
      },
      {
        "label": "Health Canada leftovers",
        "href": "https://www.canada.ca/en/health-canada/services/general-food-safety-tips/food-safety-tips-leftovers.html"
      },
      {
        "label": "WSAVA dog treats",
        "href": "https://wsava.org/wp-content/uploads/2024/06/Feeding-treats-to-your-dog-v2.pdf"
      },
      {
        "label": "WSAVA cat treats",
        "href": "https://wsava.org/wp-content/uploads/2024/06/Feeding-treats-to-your-cat-v2.pdf"
      }
    ]
  }
];
export function findRecipe(slug: string) { return recipes.find(recipe => recipe.slug === slug); }
