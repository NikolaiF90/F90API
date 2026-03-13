![F90 API COVER ART](https://github.com/NikolaiF90/F90API/blob/main/Cover_Art_F90API.png)

# F90 API
**A unified scripting library for AI Dungeon.**
by PrinceF90

---

- [What is F90 API?](#what-is-f90-api)
- [Installation](#installation)
- [Why](#why)
- [Terminology](#terminology)
- [What's Included](#whats-included)
- [Module Registration](#module-registration)
- [Porting Existing Scripts](#porting-existing-scripts)
- [Contributing](#contributing)
- [Scripts Already Integrating F90 API](#scripts-already-integrating-f90-api)
- [API Reference](https://github.com/NikolaiF90/F90API/blob/main/API_REFERENCE.md)
- [Credits](#credits)

---

## What is F90 API?

F90 API is a shared scripting foundation for AI Dungeon. It provides common utilities that every script needs: character management, text manipulation, notifications, story card access, so developers stop reimplementing the same logic and world makers stop wrestling with compatibility.

Any script built on F90 API speaks the same language as every other script built on F90 API. Drop two compatible scripts into the same adventure, register them, and they run together without conflict. No merging, no copy-pasting, no guessing.

F90 API is battle-tested. Every method was extracted from real, working scripts - [CSMS](https://github.com/NikolaiF90/AIDCharacterSheetandMechanicSystem) and Loadout before being formally added. Nothing speculative, nothing designed upfront.

---

## Installation

> **Use the AI Dungeon website on PC** (or view as desktop if mobile-only). The script editor is not available on the mobile app.

### Step 1 - Open your scenario

In AI Dungeon, open your scenario and select **Edit**.

### Step 2 - Enable scripting

Go to **Details**. Scroll down to **Scripting**. Toggle **Scripts Enabled** on.

### Step 3 - Open the script editor

Select **Edit Scripts**. You will see four tabs on the left: **Library**, **Input**, **Context**, and **Output**.

### Step 4 - Set up the Input tab

Select the **Input** tab. Delete all existing code in that tab. Paste the following:

```javascript
F90.run("input");
const modifier = (text) => { return { text } }
modifier(text);
```

### Step 5 - Set up the Context tab

Select the **Context** tab. Delete all existing code in that tab. Paste the following:

```javascript
F90.run("context");
const modifier = (text) => { return { text, stop } }
modifier(text);
```

### Step 6 - Set up the Output tab

Select the **Output** tab. Delete all existing code in that tab. Paste the following:

```javascript
F90.run("output");
const modifier = (text) => { return { text } }
modifier(text);
```

### Step 7 - Open the Library tab

Select the **Library** tab. Delete all existing code in that tab.

### Step 8 - Paste F90 API

Open [F90_API_library.js](https://github.com/NikolaiF90/F90API/blob/main/F90_API_library.js) in a new browser tab. Copy the full code and paste it into the Library tab.

### Step 9 - Paste your scripts

Scroll to the bottom of the Library tab. Find this comment:

```
// ADD YOUR MODULES BELOW
```

Paste each script you want to use below that line, one after another. The full script code goes here.

### Step 10 - Register your scripts

Scroll further down. Find this comment:

```
// REGISTER MODULES HERE
```

Add one line per script:

```javascript
F90.registerModule("CSMS", CSMS);
F90.registerModule("InnerSelf", InnerSelf);
```

The name in quotes is just a label. The second value is the script's main function - check the [API Reference](https://github.com/NikolaiF90/F90API/blob/main/API_REFERENCE.md) if you are unsure what to put here.

### Step 11 - Save

Click **Save**.

### Step 12 - Play

Click **Play**. Your scripts are now running together.

---

## Why

If you play AI Dungeon with scripts, you've probably wanted to run two scripts together. CSMS and InnerSelf, or Loadout and something else. Only to find they weren't designed to coexist. Running them both means editing code you didn't write, hoping nothing breaks, and ending up with a merged version nobody else can help you with. The original developer can't support your modified copy. You're on your own.

So most people don't bother. They wait for someone to release a pre-merged version that may never come. Or they just pick one script and leave the rest behind.

**F90 API removes that problem entirely.**

Scripts that build on F90 API don't need to be merged. They register themselves and run side by side. Each one untouched, each one still supported by its original developer. If something breaks in CSMS, you ask the CSMS developer. If something breaks in Loadout, you ask the Loadout developer. Nobody's guessing what the other person did to their code.

When a developer releases an update, you just drop the new file in. No re-merging, no re-editing, no wondering what changed. Your other scripts keep running exactly as before.

For developers, it means no more reimplementing the same logic every project. Character registries, caller detection, notification systems - write it once in F90 API, trust it everywhere. And when AID changes something under the hood say a variable gets renamed or a global behaves differently. You fix it once in F90 API and every script built on it is fixed automatically. No hunting down the same line scattered across ten files.

For world makers, it means combining scripts is no longer a technical challenge. It's a few lines at the bottom of a file.

---

## Terminology

| Term | Meaning |
|------|---------|
| **Hook** | Community term for the Input, Context, and Output script tabs found under the Scripting section of your AID scenario. AID calls them "Scripts". |
| **Module** | Any script registered with F90 API via `F90.registerModule()`. |
| **World maker** | Someone building or configuring an AID scenario, not necessarily a developer. |

---

## What's Included

### Core Utilities
Common AID scripting tools available to any script:
- Character registry - create, find, delete characters across scripts
- Text utilities - append, replace, capture original input
- Notifications - queue messages, flush at end of output
- Story card access - find, delete, filter cards
- Multiplayer detection
- Caller resolution - who is acting this turn
- Input parsing - handles DO, SAY, and STORY formats

### Module Runtime
F90 API owns hook execution. Scripts register themselves as modules. F90 calls them in the right order, at the right time, and logs failures without breaking other modules.

```javascript
F90.registerModule("CSMS", CSMS);
F90.registerModule("Loadout", Loadout);
```

That's all a world maker needs to know.

---

## Module Registration

Modules execute in registration order by default. If a specific module needs to run earlier or later on a particular hook, pass a priority object:

```javascript
// Lower number runs earlier. Unspecified hooks fall to registration order.
F90.registerModule("YourModule", YourModule, { context: 0, output: 99 });
```

Failures are caught and logged. A broken module never takes down the others.

---

## Porting Existing Scripts

Already have a script? Find the pattern that matches yours below and follow that example. **You only need one.**

All porting changes happen inside your **Library tab** - paste your script code under `ADD YOUR MODULES BELOW`, then add your `registerModule` call under `REGISTER MODULES HERE`.

---

**Does your hook file call a single function like `CSMS("input")`?**
(e.g. CSMS by PrinceF90, InnerSelf and Auto-Cards by LewdLeah)

Remove the calls from your hook files. In your **Library tab**, under `REGISTER MODULES HERE`, add:
```javascript
F90.registerModule("CSMS", CSMS);
F90.registerModule("InnerSelf", InnerSelf);
```
Then replace the contents of your Input, Context, and Output tabs with the code from [Installation steps 4-6](#installation). That's it.

---

**Does your hook file call separate functions like `onInput_TAS()`, `onContext_TAS()`?**
(e.g. TAS by Yi1i1i)

In your **Library tab**, under `ADD YOUR MODULES BELOW`, add a dispatcher that wraps your three functions into one:
```javascript
function TAS(hook)
{
  if (hook === "input")   onInput_TAS();
  if (hook === "context") onContext_TAS();
  if (hook === "output")  onOutput_TAS();
}
```
Then under `REGISTER MODULES HERE`, add:
```javascript
F90.registerModule("TAS", TAS);
```
Then replace the contents of your Input, Context, and Output tabs with the code from [Installation steps 4-6](#installation).

---

**Is your logic written directly inside the Input, Context, and Output tabs?**
(most common style)

In your **Library tab**, under `ADD YOUR MODULES BELOW`, create a new function and move your logic into it:
```javascript
function MyScript(hook)
{
  if (hook === "input")   { /* paste your input tab logic here */ }
  if (hook === "context") { /* paste your context tab logic here */ }
  if (hook === "output")  { /* paste your output tab logic here */ }
}
```
Then under `REGISTER MODULES HERE`, add:
```javascript
F90.registerModule("MyScript", MyScript);
```
Then replace the contents of your Input, Context, and Output tabs with the code from [Installation steps 4-6](#installation).

---

## Contributing

F90 API is open to contributions from the AID scripting community. If you have a utility that every script needs, a fix for an AID quirk, or a pattern worth standardising, open a pull request or reach out on the AI Dungeon Discord.

Contributors are credited by name in this repository.

---

## Scripts Already Integrating F90 API

- **CSMS** - Character Sheet and Mechanics System by PrinceF90
- **Loadout** - Inventory and equipment tracking by PrinceF90 *(coming soon)*

---

## Credits

Hook terminology in this documentation follows the convention established by **LewdLeah** ([InnerSelf](https://github.com/LewdLeah/Inner-Self/tree/main), Auto-Cards), whose scripts introduced the pattern to the AID modding community.

---

*F90 API is open and free. Build on it.*
