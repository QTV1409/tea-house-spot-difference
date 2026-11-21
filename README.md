# tea-house-spot-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/QTV1409/tea-house-spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/QTV1409/tea-house-spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Tea House at Dusk — a spot-the-difference game in four quiet places. Two pictures sit side by side and look the same, but seven details changed between them: a missing moon, a cat that wandered off, a lantern that changed colour. Find all seven before the clock runs out, then move on to the night market, the lighthouse cove and the mountain shrine. Every scene is drawn fresh on canvas by this game's own code — no borrowed art — and every sound is synthesised in the browser.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or open `game/index.html` in a desktop browser directly.

## How to play

- Click a difference on either picture to mark it with a green ring.
- Find all 7 differences in a level before the 2-minute timer ends.
- Wrong clicks cost 5 seconds; hints (H) cost 50 points and pulse around a difference you have not found yet.
- Keys: Space/Enter to start, H for a hint, P to pause, N for the next level, R to play again, M to mute, 1–4 to pick a level from the title screen.
- Your best total score is kept in the browser.

## Screenshots

The four screenshots in `screenshots/` are real renders of this game's own code, staged with `?shot=start|play|end` (see `shots.json`): the title screen, a level in progress with three differences found and four still to find, a second level at the night market, and the final results screen.

---

<sub>Entered on [make.fun](https://make.fun/?ref=9qs5x4yn&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
