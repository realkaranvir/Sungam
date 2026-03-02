export type MoveClassification = 'brilliant' | 'great' | 'best' | 'good' | 'book' | 'inaccuracy' | 'mistake' | 'blunder';

const HIKARU_COMMENTS: Record<MoveClassification, string[]> = {
  brilliant: [
    "Takes, takes, takes, and then... OH! That's just a juicer!",
    "Wait, wait, wait... is that... that's a brilliant move! I literally don't even care, it's just winning.",
    "This is actually insane. You found the only move that wins. I'm not even joking.",
    "BING. BANG. BOOM. You're a genius, chat. Absolute genius.",
    "I saw this in 2 seconds, but for you, this is incredible. Truly brilliant.",
    "Actually a juicer! How did you see that?!",
    "I'm not even looking at the engine, but this is just better.",
    "Literally, look at the evaluation bar. It just spiked!",
    "That is top-tier. You're actually playing like a god right now."
  ],
  great: [
    "That's a very solid find. Very, very solid.",
    "I like this move. It's clean, it's simple, it's just better.",
    "This is high-level stuff. You're playing like a GM here.",
    "Exactly what I would have played. Good job.",
    "You're actually calculating! Look at you go!",
    "Okay, and then? And then what? Oh, wait, it's just a great move.",
    "Very natural. I like the way you're thinking here.",
    "This is essentially a juicer. Very nice.",
    "We take those. That's a great move."
  ],
  best: [
    "Yeah, that's the best move. Obviously.",
    "Standard. Just standard top-engine choice.",
    "Keeping the pressure on. I like it.",
    "Good, good, good. Move on, nothing to see here.",
    "Yep, that's just the move. Takes, takes, and you're fine.",
    "I'm not even looking at the engine, but that's the best move.",
    "Chat, he's just finding all the best moves. It's crazy.",
    "Literally the only move. Good job finding it.",
    "Okay, and then? And then what? Yeah, this is best.",
    "Takes, takes, takes, and then we have this position... which is just better.",
    "I mean, it's the engine move. What else is there to say?",
    "Solid. Best move. Let's keep going."
  ],
  good: [
    "It's okay. It's not the best, but it's okay.",
    "I mean, it works. It doesn't lose, so we take those.",
    "Fine. Totally fine. I literally don't even care about this move.",
    "A bit slow, but it gets the job done.",
    "Sure, why not? It's a move.",
    "Wait, why did I play that? Oh, it's fine. It's a good move.",
    "It's not a blunder? I don't think it's a blunder. It's just good.",
    "Chat, we're still winning. This is fine.",
    "We take those. Every day of the week.",
    "Okay, it's a move. It's a good move. We're chilling.",
    "Is it the best? No. Is it good? Yeah, sure.",
    "I've seen worse. Much worse. This is totally fine."
  ],
  book: [
    "Standard theory. Nothing to see here.",
    "Yep, we know this. We've seen this a thousand times.",
    "Mainline. Boring, but necessary.",
    "I've played this 50,000 times on blitz.com.",
    "Book move. Let's get to the real game.",
    "Just follows the theory. Takes, takes, takes.",
    "Chat, this is basic prep. If you don't know this, what are you doing?",
    "Okay, book move. Moving on."
  ],
  inaccuracy: [
    "A bit inaccurate, but whatever. We're still winning... probably.",
    "Wait, why would you play that? There was a much better way to takes, takes, takes.",
    "Eh, it's not great. You're giving them some counterplay.",
    "Chat, is this an inaccuracy? I think it might be.",
    "You're missing the point of the position, but it's not the end of the world.",
    "Wait, why did I play that? Oh, it's... actually an inaccuracy.",
    "Literally, look at the evaluation bar. It just dropped a bit.",
    "Okay, and then? And then what? You're giving him chances!"
  ],
  mistake: [
    "Wait, wait, wait... what is that? That's just a mistake.",
    "No, no, no. You can't do that. Now they have this and that...",
    "That's just bad. I'm sorry, but it's just bad.",
    "You're literally throwing the game. Why would you do that?",
    "I'm not even mad, I'm just disappointed. That was a clear mistake.",
    "Chat, he's just throwing. He's just throwing!",
    "Wait, why did I play that? That was just a mistake.",
    "I'm not even looking at the engine, but that's just wrong."
  ],
  blunder: [
    "CHAT! IS THIS A BLUNDER?! IT'S A BLUNDER!",
    "OH MY GOD. I literally don't even care anymore. That's just a complete hallucination.",
    "You just hung a piece! How do you even do that?!",
    "RAAAGGHHH! The engine is screaming! It's screaming!",
    "That's it. I'm done. I'm literally closing the stream. (I'm not, but wow.)",
    "Is it a blunder? I don't think it's... wait, it is. It's a blunder.",
    "Literally throwing! Absolute juicer for the opponent!",
    "I'm literally speechless. Chat, look at this. Just look at it.",
    "Wait, why did I play that? OH NO. OH NO NO NO."
  ]
};

export function getHikaruComment(classification: MoveClassification | undefined): string {
  if (!classification) return "Let's see what we have here...";
  const comments = HIKARU_COMMENTS[classification];
  if (!comments || comments.length === 0) return "Interesting move. Very interesting.";
  
  const randomIndex = Math.floor(Math.random() * comments.length);
  return comments[randomIndex];
}
