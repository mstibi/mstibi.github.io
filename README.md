# Mateo's room

An interactive portfolio: a small top-down room you walk around in. Sit at the desk for my projects, check the shelf for who I am, the letter for how to reach me, and poke around for the rest.

**Live:** https://mstibi.github.io

Plain HTML, CSS and JavaScript with hand-drawn SVG. No framework, no build step, no tracking, nothing sent anywhere.

## What's inside

- **The room:** click to walk (pathfinding around furniture), WASD / arrow keys, E to interact, Shift to run. On phones: a D-pad you can slide your thumb across, A to interact, hold B to run.
- **Portfolio panels:** Projects (desk), About (shelf), Contact (letter), also reachable from the top navigation and fully keyboard accessible.
- **Desk terminal:** Projects → Open the terminal. Try `help`.
- **Hoops:** 45-second beat-the-clock with real rim and backboard physics, random shot spots, 3-pointers and a hoop that starts moving once you get good.
- **Snake** on the old CRT TV.
- **Day / night**, a desk lamp, a nap that comes with a dream, and a few secrets. There's a counter in the room bar; the rest is for you to find.

## Run it locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly also works.

## Code map

| File | What it does |
|---|---|
| `content.js` | All copy: about, experience, projects, contact links |
| `scene.js` | SVG room, furniture and the 8-direction character |
| `game-core.js` | Floor bounds, collisions, grid pathfinding with path smoothing |
| `main.js` | Movement, controls, sitting / sleeping, panels |
| `extras.js` | Hoops, Snake and terminal UI, secrets |
| `hoop-core.js`, `snake-core.js`, `terminal-core.js` | Pure game / parser logic, tested in Node |

## Tests

```bash
node test.cjs
```

Checks that every walkable floor point is reachable and no route crosses furniture, that baskets are possible but rare (under 10% of aims score from any spot), the Snake rules, and that the terminal renders hostile input as plain text.

`Mateo_Stibi_CV.pdf` is the public version of my CV, without a phone number.
