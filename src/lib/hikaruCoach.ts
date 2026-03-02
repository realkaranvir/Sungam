export type MoveClassification = 'brilliant' | 'great' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

const HIKARU_COMMENTS: Record<MoveClassification, string[]> = {
  brilliant: [
    "Takes, takes, takes, and then... OH! That's just a juicer!",
    "Wait, wait, wait... is that... that's a brilliant move! I literally don't even care, it's just winning.",
    "This is actually insane. You found the only move that wins. I'm not even joking.",
    "BING. BANG. BOOM. You're a genius, chat. Absolute genius.",
    "I saw this in 2 seconds, but for you, this is incredible. Truly brilliant."
  ],
  great: [
    "That's a very solid find. Very, very solid.",
    "I like this move. It's clean, it's simple, it's just better.",
    "This is high-level stuff. You're playing like a GM here.",
    "Exactly what I would have played. Good job.",
    "You're actually calculating! Look at you go!"
  ],
  best: [
    "Yeah, that's the best move. Obviously.",
    "Standard. Just standard top-engine choice.",
    "Keeping the pressure on. I like it.",
    "Good, good, good. Move on, nothing to see here.",
    "Yep, that's just the move. Takes, takes, and you're fine."
  ],
  good: [
    "It's okay. It's not the best, but it's okay.",
    "I mean, it works. It doesn't lose, so we take those.",
    "Fine. Totally fine. I literally don't even care about this move.",
    "A bit slow, but it gets the job done.",
    "Sure, why not? It's a move."
  ],
  inaccuracy: [
    "A bit inaccurate, but whatever. We're still winning... probably.",
    "Wait, why would you play that? There was a much better way to takes, takes, takes.",
    "Eh, it's not great. You're giving them some counterplay.",
    "Chat, is this an inaccuracy? I think it might be.",
    "You're missing the point of the position, but it's not the end of the world."
  ],
  mistake: [
    "Wait, wait, wait... what is that? That's just a mistake.",
    "No, no, no. You can't do that. Now they have this and that...",
    "That's just bad. I'm sorry, but it's just bad.",
    "You're literally throwing the game. Why would you do that?",
    "I'm not even mad, I'm just disappointed. That was a clear mistake."
  ],
  blunder: [
    "CHAT! IS THIS A BLUNDER?! IT'S A BLUNDER!",
    "OH MY GOD. I literally don't even care anymore. That's just a complete hallucination.",
    "You just hung a piece! How do you even do that?!",
    "RAAAGGHHH! The engine is screaming! It's screaming!",
    "That's it. I'm done. I'm literally closing the stream. (I'm not, but wow.)"
  ]
};

export function getHikaruComment(classification: MoveClassification | undefined): string {
  if (!classification) return "Let's see what we have here...";
  const comments = HIKARU_COMMENTS[classification];
  const randomIndex = Math.floor(Math.random() * comments.length);
  return comments[randomIndex];
}
