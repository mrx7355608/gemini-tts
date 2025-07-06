/**
 *  Splits the single clip prompt into sub-clips of 6000 characters each (~1000 words)
 *  1. Detect if the prompt exceeds the max characters limit for one clip (6000 characters)
 *  2. If so, split the prompt into words
 *  3. Combine all the words and make multiple strings each of 6000 characters
 *  4. Return the splitted parts
 *
 */

export function splitPrompt(prompt: string, maxTokens: number) {
  const splitPrompts = [];

  const words = prompt.split(" ");
  console.log("Total words: ", words.length);
  let wordPointer = 0;
  let subclip = [];

  while (wordPointer < words.length) {
    const currentWord = words[wordPointer];
    subclip.push(currentWord);

    if (subclip.length >= maxTokens || wordPointer === words.length - 1) {
      console.log("Creating new subclip");
      splitPrompts.push(subclip.join(" "));
      subclip = [];
    }

    wordPointer++;
  }

  return splitPrompts;
}

// const test = `In a quiet, dusty corner of a forgotten library, a young girl named Alice sat cross-legged on the floor, her nose buried in a book titled "The Secret Life of Plants." The pages were yellowed with age and the spine was held together with a fraying piece of string. Her eyes darted back and forth, absorbing the knowledge contained within. The room was still, save for the occasional cough of the ancient radiator and the tick of the wall clock. Alice had a knack for finding the most obscure tomes on the shelves, often preferring them to the modern, glossy covers that filled the children's section.

// As the afternoon sun slanted through the tall, leaded windows, it cast a warm glow across the floorboards and illuminated the dust motes dancing in the air. Alice's curiosity grew with every page she turned. The book spoke of a hidden world where plants communicated with one another through a network of roots and vibrations, sharing nutrients and secrets. It was a world she longed to explore, a place where she could escape from the mundane reality of schoolyard bullies and the dreariness of her small town.

// Her thoughts were interrupted by a sudden rustling from the shadows. Alice looked up, her heart racing, expecting to find a mouse or perhaps an old librarian scolding her for being in a restricted area. Instead, she saw a figure emerge from behind a tower of books. It was a boy, about her age, with messy hair and a smudge of dirt across his cheek. His eyes sparkled with mischief, and in his hand, he clutched a crumpled piece of paper.

// "You're not supposed to be here," he whispered, his voice low and urgent. "But I'm guessing you're not like the other kids who only come here for the Wi-Fi." Alice blinked, surprised. No one had ever talked to her like that before, as if she was part of a secret club. She looked down at her book and back up at the boy, feeling a strange kinship with this unexpected interloper. "I'm not," she murmured. "I like the old books. They tell better stories."

// The boy's eyes lit up. "I know what you mean," he said, taking a step closer. "I've got something you might like." He unfolded the paper, revealing a hand-drawn map covered in symbols and squiggles. "This is a map to a secret garden no one else knows about. It's right outside of town, behind the old abandoned factory." Alice felt a thrill run down her spine. A secret garden? It sounded like something straight out of one of her favorite stories.

// "How did you find it?" she asked, her voice filled with wonder. "I've lived here my whole life and never heard of it." The boy grinned. "My grandpa was a botanist. He left this to me when he passed away. He said I'd know who to share it with when I found someone who could appreciate it."

// He looked at Alice for a long moment, as if gauging whether she was worthy of such a treasure. Finally, he nodded. "I'm Billy," he said, extending a hand. "And I think you're the one."

// Alice took a deep breath, her heart racing with excitement. She placed her bookmark in her book and took Billy's hand. "Let's go," she said, her voice barely above a whisper. "I'm ready for an adventure."

// They tiptoed out of the library, the old floorboards creaking beneath their feet. The librarian was nowhere in sight, but they didn't dare to make a sound. Once outside, Billy led her through a maze of alleys and side streets, the map fluttering in the breeze. The town looked different from this perspective, as if it was hiding secrets in every corner.

// Finally, they arrived at the old factory. It loomed over them, a testament to a time when the town had been alive with industry and hope. The rusty gates were chained shut, but Billy knew a way through. He slipped through a gap in the fence, beckoning Alice to follow. She squeezed through, her heart pounding in her chest.

// On the other side, a lush, overgrown path stretched before them. It was like stepping into another world. The air was thick with the scent of blooming flowers and the distant sound of a babbling brook. They followed the trail, the map guiding them through a series of twists and turns until they reached a hidden clearing.

// The secret garden was more beautiful than anything Alice had ever seen. It was a riot of colors, with flowers of every shape and size stretching out in every direction. The plants whispered and swayed as if sharing secrets with the wind. In the center of the clearing was a small, weathered bench, surrounded by a circle of the most vibrant, glowing flowers Alice had ever laid eyes on.

// Billy watched her reaction, his eyes gleaming with pride. "This is it," he said. "My grandpa's garden. He used to come here to study the plants, but he also said it was a place where magic could happen."

// Alice looked around in awe. The plants seemed to be watching them, as if they were part of the secret too. "What kind of magic?" she asked, her voice filled with wonder.

// Billy shrugged. "The kind that helps you believe in the impossible. The kind that lets you escape from the world for a little while." He sat down on the bench and patted the spot next to him. "Come on," he said. "Let's see if there's any magic left."

// Together, they sat in the garden, surrounded by the whispers of the plants. Alice felt a sense of peace wash over her, as if the garden had embraced her with open arms. For the first time in a long time, she didn't feel alone. Billy began to tell her stories of his grandpa's adventures, of the plants he had discovered, and the friends they had made along the way. The stories were wild and fantastical, full of talking trees and dancing daisies. But here, in this secret garden, they didn't seem so far-fetched.

// As the sun began to set, the garden grew darker, but the glow from the special flowers grew brighter, casting a soft light over everything. Alice felt a warmth spread through her, a warmth that seemed to come from the very earth beneath her feet. It was as if the garden was welcoming her into its fold, sharing its secrets.

// They talked for hours, sharing their dreams and fears. The air grew cooler, but the garden remained warm and inviting. When it was time to leave, Billy gave her a knowing smile. "You're one of us now," he said, folding the map and placing it into her hand. "A keeper of the secret."

// Alice looked down at the map, feeling a strange sense of belonging. The garden had given her something she hadn't even known she was searching for: a friend and a place to call her own. She knew she would be back, to learn more about the plants and their whispers, and to continue the adventures that had only just begun.

// They made their way out of the garden, the rustling of leaves and the soft whispers of the plants following them like a gentle lullaby. As they approached the gap in the fence, Alice felt a strange tugging at her heart, as if the garden didn't want her to leave. But Billy's hand in hers was reassuring, and she knew she could always return.

// Once back in the harsh reality of the town, the magic of the garden seemed to linger. Alice walked with a newfound confidence, her head held high. The bullies at school had no power over her now; she had a secret that was far more magical than any of them could ever imagine.

// The days turned into weeks, and Alice and Billy spent every spare moment in the garden. They discovered hidden nooks and crannies, uncovered forgotten treasures, and even managed to decode some of the mysterious symbols on the map. Each visit revealed more secrets and brought them closer to understanding the true magic of the place.

// One evening, as they sat on the bench watching the sun dip below the horizon, the plants grew unusually quiet. Alice felt a sudden jolt of energy, as if the earth itself was humming a tune. The glowing flowers in the center of the garden began to pulse in unison, and the air grew thick with anticipation.

// "What's happening?" she whispered to Billy, her eyes wide with wonder. He looked at her, his own eyes filled with excitement. "It's time," he said, his voice hushed. "Time for the garden to share its biggest secret with us."

// The ground beneath the bench began to tremble, and the glow from the flowers grew so intense it was almost blinding. The vines and branches of the surrounding plants began to weave together, forming a living archway that grew taller and taller until it reached the sky. Alice's heart raced as she realized that this was no ordinary garden. It was a gateway to a world she had only dreamed of.

// With a final pulse of light, the archway opened, revealing a landscape that defied description. It was a place where the laws of nature were bent and twisted, where the colors of the rainbow had been painted with a brush so vibrant it seemed to bleed into the very fabric of reality.

// Billy took a deep breath. "Are you ready?" he asked Alice. She nodded, unable to speak. They stepped through the archway, hand in hand, into the heart of the secret garden's mystery.

// On the other side, they found themselves in a world that was both eerily familiar and utterly alien. The plants grew in impossible shapes and sizes, and the air was alive with the buzz of unseen creatures. The ground beneath them was soft and spongy, as if they were walking on a cloud.

// They wandered for what felt like hours, discovering more wonders with every step. Alice reached out to touch a giant leaf, only to have it wrap gently around her hand. The sensation was unlike anything she had ever felt before. It was as if the plant was greeting her, welcoming her to its world.

// As the night grew darker, the sky above them filled with stars that danced and twinkled in time with the pulse of the garden. They lay down on the soft ground, the glow of the archway a beacon in the distance, and talked of their dreams and the adventures they would have in this new world.

// For Alice, the garden had become more than just a sanctuary; it was a gateway to a future filled with endless possibilities. With Billy by her side, she knew she could face any challenge that came her way. Together, they had found a place where they truly belonged. And as they fell asleep, cradled by the whispers of the plants, Alice felt a sense of homecoming she had never known before.

// The next day, they returned to the garden, eager to explore further. The archway still glowed in the center of the clearing, beckoning them with the promise of more secrets to uncover. This time, they brought supplies: a basket filled with snacks, a magnifying glass, and a notebook to record their findings. They had become scientists and explorers in their own right, eager to learn from the wisdom of the plants.

// As they ventured deeper into the garden, they stumbled upon a clear pool of water, fed by the same babbling brook they had heard from the outside world. The water was so clear that it mirrored the sky above, and the fish that swam beneath the surface had scales that shimmered like precious gems. They watched in amazement as the fish leaped from the water, their tails leaving trails of glittering light.

// While Billy studied the aquatic life, Alice noticed a peculiar plant with leaves that shimmered like metal. Upon closer inspection, she found that the leaves were not just reflective; they were made of a material that felt cool and metallic to the touch. She picked one, and it sang a soft, melodious tune that resonated through her very soul. It was a plant they hadn't encountered before, and she knew it was special.

// Excitedly, she called Billy over, who shared her wonder. They decided to take a sample back to the library to study. As they made their way back, the plants seemed to whisper their goodbyes, and the archway grew brighter, welcoming them back to reality.

// Their visits to the garden became a ritual, a sacred bond between them and the natural world. They told no one of their discoveries, preferring to keep the magic to themselves. But as they grew older, they knew they couldn't hide the garden's secrets forever. They had to decide what to do with the knowledge they had been entrusted with.

// One day, as they sat on the bench under the archway, now grown taller and more majestic, they discussed the future. Billy spoke of his dreams of becoming a botanist like his grandpa, using his knowledge to uncover more secrets and protect the natural world. Alice, inspired by their adventures, spoke of her desire to become a writer, weaving tales of the garden's magic into her stories.

// They made a pact that day, their friendship solidified by the promise to share the garden's magic with the world, but only in a way that would honor its sanctity. They knew that one day, when the time was right, they would introduce others to the secret garden, creating a new generation of keepers who would cherish it as they did.

// And so, they continued to visit, to learn, and to grow. The garden became a part of them, and they a part of it. Their lives intertwined with the vines and the roots, their hearts beating in time with the pulse of the earth. It was a bond that would never be broken, a secret they would always hold close to their hearts.

// As the seasons changed, so too did Alice and Billy. But through it all, the garden remained a constant in their lives. It was a reminder that there was beauty and wonder in the world, even in the most unexpected of places. And it was a promise that no matter where life took them, they would always have a place to return to, a place where magic thrived, and friendship blossomed.

// Their high school years flew by, filled with the usual trials and tribulations. But the garden remained a sanctuary, a place where they could escape from the pressures of exams and the drama of teenage life. They brought their troubles to the plants, and in return, the whispers of the garden offered comfort and guidance.

// The day of their graduation was bittersweet. They knew that soon, they would be leaving the small town behind for college and the wider world. But as they stood before the archway, the plants seemed to whisper reassurances. The garden had prepared them for what lay ahead.

// Billy went off to study botany, while Alice pursued her passion for writing. They promised to visit each other often and to bring back new knowledge to share with the garden. And so, the years passed, and they grew into young adults, each making their mark in their respective fields.

// Yet, they never forgot the pact they had made. As they grew more accomplished, they began to spread the garden's message in their own ways. Billy's research led to the discovery of new species, while Alice's stories captured the hearts of readers, subtly hinting at the magic that lay hidden just beyond the pages.

// Their paths diverged, but the garden remained a touchstone for both of them. It was a place they could always return to, to remember who they were and what was truly important. And when they did visit, the plants grew more vigorous, as if basking in their combined presence.

// One summer, they returned to the town together, their hearts filled with excitement. It had been years since they had both seen the garden in the same season, and they were eager to see how it had changed. The archway was now a grand entrance, the plants had grown taller and more vibrant, and the whispers of the garden had become a symphony of secrets.

// As they walked down the familiar path, they couldn't help but feel that the garden had been waiting for them. The air was electric with anticipation, and they knew that the time had come to fulfill their promise. They had found others who could appreciate the garden's magic, young souls who needed its healing touch.

// With great care, they introduced their friends to the garden. The plants seemed to know the moment had arrived, and they revealed their most profound secrets. The newcomers were in awe, their eyes wide with wonder as the garden worked its magic.

// The night was filled with laughter and discovery, the kind of night that lives on in memory, a touchstone of joy in the years to come. And as they lay under the stars, the whispers of the plants grew louder, a chorus of approval for the new guardians they had chosen.

// The garden had grown with Alice and Billy, just as they had grown with the garden. It was a living testament to the power of friendship and the beauty of the unexplored. As they watched their friends fall in love with the place, they knew that the magic would live on, that the secrets of the garden would be safe.

// They had become more than just keepers of the secret; they were its champions. And as they stood hand in hand, looking out over the sea of glowing flowers, they knew that the adventure had just begun. The garden had given them a gift, and now it was their turn to give back, to share its wonders and to ensure that it remained a place of refuge and discovery for generations to come.

// As the years unfolded, Alice and Billy continued to visit the garden, bringing with them a growing circle of friends and confidants. Each new visitor was carefully chosen, each one sworn to protect the garden's secrets and to nurture its magic. They watched as the garden evolved, as new plants grew and old ones withered, but the archway remained a constant, a beacon of light in their lives.

// The world outside grew increasingly hectic, but the garden remained a bastion of peace and wonder. They would sit for hours, discussing their dreams and fears, drawing strength from the whispers of the plants. It was a place where they could be themselves without judgment, where they could heal and grow.

// And as they grew older still, and the responsibilities of adult life began to weigh on their shoulders, they knew that the garden was not just a place of escape but a source of wisdom and inspiration. It was a reminder that amidst the chaos, there was always room for beauty, for friendship, and for the magic that could only be found in the quiet corners of the world.

// Through love and loss, triumph and failure, the garden remained a constant. It saw them through the darkest of nights and the brightest of days. It was a symbol of hope, a testament to the enduring power of nature and the human spirit.

// And so, with each visit, they brought more of the world into the garden and took more of the garden's magic back out into the world. They had become a bridge between the two, carrying the whispers of the plants into the hearts of those who needed them most.

// Their friendship had grown as strong as the mighty oak that stood sentinel over the garden. And as they watched the seasons turn, they knew that even when they were old and gray, the garden would still hold a piece of their youth, a reminder of the magic that had once been their secret and was now their legacy.

// The town had changed over the years, the factory long ago reduced to rubble and replaced by a sprawling park. Yet, the garden remained untouched, a secret Eden nestled within the heart of the greenery. It had become a local legend, a whispered tale of a place where miracles could happen. But to Alice and Billy, it was so much more. It was home.

// They had brought love into the garden, and it had returned it tenfold. They had shared their hearts and souls with the plants, and in return, they had found peace and purpose. And as they watched their own children run through the archway, their eyes filled with the same wonder that had once been theirs, they knew that the magic was alive and well.

// The whispers grew louder that day, as if the plants were celebrating the continuation of the lineage. Alice and Billy held hands, their hearts swelling with pride. The garden had become a family tradition, a sacred trust passed down through the generations. And as the sun set on that perfect day, the archway grew brighter than ever before, a promise of more adventures to come.

// Years passed, and the children grew. They brought their own friends to the garden, teaching them the secrets of the plants and the whispers of the earth. The circle of guardians grew, each one adding their own story to the tapestry of the garden's lore. The town had grown too, but the garden remained a hidden gem, known only to those who had been granted entry.

// As Alice and Billy grew old together, they watched the world change from afar. They saw the beauty in every new discovery, every budding friendship, every whispered secret shared beneath the archway. The garden had become a symbol of hope in a world that often felt cold and unforgiving.

// And then, one fateful day, the unthinkable happened. The town decided to build a new development over the park, threatening the very existence of their beloved sanctuary. Alice and Billy knew they had to act. They gathered their friends and family, their voices united in a plea to preserve the land. They shared their stories, the magic they had found, and the lessons they had learned.

// The townspeople listened, transfixed by the tales of wonder and friendship that had unfolded in their very own backyard. The developers were met with a wall of resistance, as the garden's whispers grew into a roar of protest. The town rallied around the idea of preserving the land, and the project was halted. The garden was saved, a testament to the power of community and the enduring allure of the unexplained.

// Alice and Billy continued to visit, now with their grandchildren by their side. The archway had grown so large that it could easily accommodate their entire family. The plants had grown too, their roots entwined with the very fabric of the town's history. The garden had become a living, breathing part of the community, a place where the old and the new could coexist in harmony.

// The whispers grew fainter as the years went by, but the magic never truly disappeared. It was there, waiting for those who knew how to listen, a reminder of the boundless possibilities that lay just beyond the veil of reality. And as they sat on the bench, now worn smooth from years of use, Alice and Billy knew that their legacy was secure.

// The garden would live on, a bastion of wonder in a world that often forgot the value of such things. And as they watched the stars twinkle through the canopy of leaves, they whispered their thanks to the plants, to the earth, and to each other, for the gift of a lifetime of friendship and adventure. The garden had not just been a part of their story; it had been the very heart of it, a secret they had been honored to keep and to share.

// As the years went by, the whispers grew fainter, but the archway remained, a beacon of hope that never dimmed. Alice wrote her stories, weaving the garden's secrets into tales that captivated readers young and old. Billy's research into the garden's unique ecosystem brought him accolades and respect in the scientific community, yet they remained humble before the grandeur of the natural world. They had not conquered the garden; they had been welcomed into it, allowed to glimpse the tapestry of life that lay just beneath the surface.

// Their legacy grew, not just in the form of their children and grandchildren, but in the hearts of those they had touched with the garden's magic. The town grew to cherish the space, to recognize the healing power of nature in a world that was increasingly concrete and digital. They had started a movement, a gentle revolution that sought to remind people of the beauty that lay right outside their doors.

// Their days grew shorter, and the time they could spend in the garden grew limited. But even as age took its toll, the garden remained a vital force in their lives, a connection to the world beyond the everyday. And as they took their final steps through the archway, the whispers grew louder, the plants reaching out to embrace them. They knew that this was not an ending but a beginning, a transition to a place where the whispers of the earth could guide them still.

// The town, now a city, continued to thrive around the garden, a reminder that amidst the steel and glass, there was a place where hearts could grow as wild and as free as the plants within. And as the seasons turned, and new whispers began to fill the air, it was clear that the magic was not tied to Alice and Billy alone. It was a living, growing thing, as eternal as the cycles of the earth, ready to embrace those who were open to its secrets.

// The archway stood tall, a silent sentinel to the world they had once known, a gateway to the world they had discovered together. It was a symbol of all they had been and all they had become. And as the last light of day faded away, they knew that the garden would live on, a sanctuary for those who needed it most. They had been its keepers, its champions, and now, it was time for the garden to return the favor, to be a bastion of peace in the hearts of those who loved it.

// The whispers grew faint, the air cool and still, as Alice and Billy lay down upon the soft, welcoming earth. They were not afraid of what was to come, for they had seen the beauty of the cycle of life play out before them in the garden. They closed their eyes, hand in hand, and listened to the final whispers of the plants, the gentle lullaby of a world that had been their home.

// And as they slipped away, the archway grew brighter, the plants leaning in closer to bid them farewell. But the whispers did not die with them. They grew stronger, more insistent, as if to say that the adventure was just beginning. The garden had been theirs, but now, it belonged to the world. The whispers grew louder, filling the night with the promise of magic, of secrets waiting to be discovered. The garden had chosen new keepers, and the cycle of life continued, unbroken.

// The whispers grew, the plants swayed, and the archway shimmered with an ethereal glow. It was a testament to the enduring bond between humans and nature, a promise that the magic of the garden would live on, waiting for the next curious soul to wander through the archway and discover the beauty that lay beyond. And as the whispers grew into a crescendo, the garden's secrets were released into the world, ready to be found anew by those who would listen.`

// const parts = splitPrompt(test, 1000);
// console.log("Total characters: ", test.length);
// console.log("Total parts: ", parts.length);

// for (let index = 0; index < parts.length; index++) {
//   const element = parts[index];
//   console.log("Part ", index + 1, " length: ", element.length);
// }
