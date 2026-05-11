## Hero before/after — laptop email threads, contrast on thread length

Both sides become **MacBook screenshots of Gmail**. The contrast is now about *how many emails it takes to get to dispatch*.

### Before — laptop, long messy back-and-forth (6 messages, no dispatch yet)

MacBook (space gray) on a light desk. Gmail web UI open to a thread titled **"Re: New quote request"** with a collapsed stack of 6 messages. Top message expanded, others collapsed with sender + snippet + timestamp visible.

1. **Jamie Smith → Cedar & Sons** (Mon 8:42 AM) — website form: name, email, phone, "Big tree out front looks bad after the storm, can you come look?" *No address. No photo.*
2. **Cedar & Sons → Jamie** (Mon 11:20 AM) — "Thanks for reaching out. Can you share the address and a couple photos?"
3. **Jamie → Cedar & Sons** (Tue 7:55 AM) — "23 Maple St. I'll try to grab a photo later."
4. **Cedar & Sons → Jamie** (Tue 4:10 PM) — "Any photos yet? Hard to scope without seeing it."
5. **Jamie → Cedar & Sons** (Wed 9:02 AM) — one blurry phone photo, "Hope this helps."
6. **Cedar & Sons → Jamie** (Wed 2:30 PM, expanded) — "Need a wider shot showing the lean and the house, plus driveway access. Can we come Friday?"

Empty attachment row on the open message. Visibly stale — three days in, still no quote sent.

### After — laptop, two clean emails, dispatched same morning

Same MacBook framing. Gmail thread **"New lead — 23 Maple St (leaning oak)"**, exactly 2 messages, both from today:

1. **PhotoBrief `<briefs@photobrief.ai>`** (9:14 AM) — "A homeowner requested a quote for the tree at 23 Maple St." 4-photo strip (leaning oak, trunk, house elevation, driveway). "Scope: removal + stump grind."
2. **Cedar & Sons Tree Care** with green Cedar & Sons avatar (9:31 AM) — "Hi, Thanks for the opportunity. Here's our quote for 23 Maple St:" pricing table Tree removal $1,450 / Stump grinding $390 / **Total $1,840**. "Available Thursday 8am. Reply YES to confirm. — Marcus, Cedar & Sons"

Visibly resolved — 17 minutes from lead to quote.

## Steps

1. Regenerate `src/assets/hero/hero-before-messy-intake.jpg` (premium imagegen, 3:2, 1536×1024) — laptop + Gmail with 6-message stale back-and-forth as described.
2. Regenerate `src/assets/hero/hero-after-photobrief-packet.jpg` (premium imagegen, 3:2, 1536×1024) — laptop + Gmail with the 2-message PhotoBrief → Cedar & Sons quote thread, modeled on `IMG_3618.jpeg`.
3. `Landing.tsx`: update alt text (lines 113–114) to reflect the new story; widen slider container from `max-w-[380px]` to `max-w-[640px]` so landscape laptop frames read clearly. No other layout changes.

## Files
- Regenerate: 2 hero images
- Edit: `src/pages/Landing.tsx` (alt text + max-width)
