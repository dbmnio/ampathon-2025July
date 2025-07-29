// Review templates for the Amazon Review Gaslighter
const REVIEW_TEMPLATES = {
  paranoid: [
    "Great {product} but I'm pretty sure it's been watching me sleep. Five stars for the surveillance quality though.",
    "Works perfectly but I swear it whispers my name at 3 AM. Would recommend for insomniacs.",
    "Excellent {product}! Only complaint is that it keeps rearranging my furniture when I'm not home.",
    "Love this {product}! It arrived exactly when my neighbor's cat started acting suspicious. Coincidence? I think not.",
    "Perfect {product} but why does my WiFi password keep changing to 'THEY_KNOW'? Still five stars.",
    "Amazing quality! Though I'm 90% certain it's been texting my ex. Minor issue.",
    "This {product} is fantastic but I found a tiny camera inside. Probably just for quality control, right?"
  ],

  existential: [
    "This {product} made me question the meaning of existence. Also it works great. Five stars.",
    "Bought this {product} and now I can't stop thinking about the heat death of the universe. Highly recommend!",
    "Great {product}! Made me realize we're all just cosmic dust pretending to have opinions about consumer goods.",
    "Works as expected but now I understand that happiness is just a chemical reaction. Thanks Amazon!",
    "Perfect {product}. Really makes you wonder if we're living in a simulation though. Would buy again.",
    "Excellent quality! Side effect: existential dread. Worth it for the convenience.",
    "This {product} is good but made me realize that product reviews are just screams into the void. Four stars."
  ],

  overanalysis: [
    "I've been testing this {product} for 847 hours and documented every interaction in a 200-page journal. It's adequate.",
    "Ran this {product} through 47 different scenarios. Results: surprisingly good at withstanding my tears of joy.",
    "I created a complex spreadsheet tracking this {product}'s performance. It passed 23 of 24 tests. The failure was existing.",
    "Built a shrine to this {product} in my backyard. Neighbors are concerned but the {product} seems pleased.",
    "I've named this {product} Gerald and we have meaningful conversations every evening. Gerald is a good listener.",
    "After conducting 156 focus groups with my houseplants, they unanimously approve of this {product}.",
    "I wrote my master's thesis about this {product}. My professor was confused but I got an A+."
  ],

  absurd: [
    "This {product} cured my fear of butterflies and taught me French. Wasn't expecting that but okay.",
    "Great {product}! My dog learned to play chess after I bought this. Unrelated but worth mentioning.",
    "Works perfectly! Also, I can now see sounds and taste colors. Side effects may vary.",
    "Excellent {product}. I used it once and now I'm fluent in dolphin. They're gossipy creatures.",
    "Perfect {product}! It arrived the same day I discovered I can levitate. Probably unconnected.",
    "Love this {product}! It works great and my houseplants started a book club. They prefer mysteries.",
    "Amazing quality! Also I think I accidentally adopted 12 stray cats. The {product} seems to attract them."
  ],

  dramatic: [
    "This {product} SAVED MY LIFE and my marriage and possibly my credit score. I owe everything to Amazon.",
    "I was lost, broken, a shell of my former self. Then this {product} arrived and everything changed FOREVER.",
    "Before this {product}: misery. After this {product}: PURE ENLIGHTENMENT. Jeff Bezos is basically a prophet.",
    "This {product} is the reason I get up in the morning. Also coffee, but mostly this {product}.",
    "I would sell my firstborn child for another one of these {products}. Sorry, Timmy.",
    "This {product} is more reliable than my family and twice as supportive. Five stars for emotional stability.",
    "I've been waiting my ENTIRE LIFE for this {product} without knowing it. Destiny has been fulfilled."
  ],

  weird_complaints: [
    "Great {product} but it doesn't match my aura. Four stars for chakra incompatibility.",
    "Perfect quality but my cat disapproves of the color. She has sophisticated taste though.",
    "Excellent {product}! Only issue is it makes my neighbor's wind chimes jealous. They've been unusually quiet.",
    "Works amazingly but it clashes with the feng shui of my bathroom. Interior design nightmare.",
    "Love this {product}! Minus one star because it doesn't work underwater. Very disappointing for us mermaids.",
    "Perfect {product} but my psychic warned me about rectangular objects this month. Ignoring the warning worked out fine.",
    "Great quality! Only complaint is that it's too effective. Now I have nothing to complain about. Paradox achieved."
  ]
};

const PRODUCT_SYNONYMS = {
  'phone': ['device', 'communication portal', 'pocket computer', 'digital companion'],
  'headphones': ['ear speakers', 'sound tunnels', 'audio helmets', 'hearing enhancers'],
  'book': ['paper knowledge', 'tree sacrifice', 'bound wisdom', 'portable education'],
  'charger': ['power giver', 'electric feeder', 'energy vampire', 'voltage distributor'],
  'case': ['protective shell', 'safety blanket', 'armor', 'guardian rectangle'],
  'cable': ['digital snake', 'information tube', 'electron highway', 'data noodle'],
  'speaker': ['sound box', 'noise maker', 'audio rectangle', 'vibration generator'],
  'mouse': ['clicking creature', 'cursor controller', 'digital rodent', 'hand companion'],
  'keyboard': ['letter buttons', 'typing device', 'alphabet rectangle', 'finger piano'],
  'monitor': ['seeing glass', 'pixel window', 'digital mirror', 'electronic eye']
};

function getRandomTemplate() {
  const categories = Object.keys(REVIEW_TEMPLATES);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const templates = REVIEW_TEMPLATES[randomCategory];
  return templates[Math.floor(Math.random() * templates.length)];
}

function getProductSynonym(productName) {
  const product = productName.toLowerCase();
  for (const [key, synonyms] of Object.entries(PRODUCT_SYNONYMS)) {
    if (product.includes(key)) {
      return synonyms[Math.floor(Math.random() * synonyms.length)];
    }
  }
  return 'mysterious object';
}

function generateFakeReview(productName) {
  const template = getRandomTemplate();
  const synonym = getProductSynonym(productName);
  return template.replace(/{product}/g, synonym);
}