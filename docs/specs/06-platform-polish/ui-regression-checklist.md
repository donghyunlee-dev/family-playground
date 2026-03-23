# UI Regression Checklist

## Purpose

Use this checklist after every UI-affecting change so layout, styling, and route flow do not regress.

This checklist is mandatory for:

- route layout changes
- shared component changes
- typography or color changes
- room flow changes
- game UI changes

## Verification Rule

For every relevant change:

1. run `pnpm --filter @family-playground/web lint`
2. run `pnpm --filter @family-playground/web typecheck`
3. run `pnpm --filter @family-playground/web build`
4. open the affected routes in the local web app
5. confirm the checklist below before marking the work as verified

## Global Checks

- Tailwind styles are loaded and the page is not rendering as unstyled HTML
- spacing, borders, shadows, and rounded corners are visible
- Korean copy is readable and not overflowing card boundaries
- buttons are visible, clickable, and have readable contrast
- layout remains usable on mobile-width and desktop-width screens
- there is no unexpected flash to unstyled content after navigation
- no route gets stuck in an infinite redirect or silent no-op state

## Route Checks

### `/`

- hero section spacing is intact
- preview cards are aligned
- login entry is clearly visible

### `/login`

- login card styling is intact
- Google login button is visible and clickable
- error messages stay inside the card layout

### `/lobby`

- summary cards render with spacing and background styling
- open room list buttons are visible
- empty states do not collapse layout

### `/games`

- game cards render with badge, description, and footer actions
- playable games show the correct CTA
- disabled games clearly show they are not ready
- room state labels match waiting vs playing behavior

### `/room/{room_id}`

- this route behaves as the waiting room only
- participant list and room controls are visible
- start button is visible only for the host when minimum players are met
- entering a playing room redirects to `/room/{room_id}/play`

### `/room/{room_id}/play`

- gameplay screen is visually separated from the waiting room
- game board area renders inside the main content column
- side panel shows room/session/player information
- finishing the game returns the user to the waiting room

### `/ranking`

- table layout is readable on desktop and mobile widths
- empty state is styled consistently

### `/profile`

- profile stat cards render correctly
- recent activity section stays readable when empty and when populated

## Word Chain Checks

- `Word Chain` shows `방 만들기` on `/games`
- creating a room lands on the waiting room, not the gameplay screen
- starting the game moves the user to `/room/{room_id}/play`
- submitting a word updates turn, score, and used-word list
- opening the same game room in another tab does not break layout

## Documentation Rule

If a UI regression is found:

- document the failing route and symptom in `06-platform-polish/tasks.md`
- do not mark the work complete until the route passes this checklist again
