# F90 API — World Maker Guide

This guide is for anyone building or running an AI Dungeon scenario who wants to use scripts together without things breaking. You don't need to know how to code. Just follow the steps.

---

## What you need to know

F90 API is what makes multiple scripts play nicely together. Think of it as the foundation. Every script built on F90 API knows how to share the stage with every other script built on F90 API. No merging, no editing other people's code, no guessing.

Here's the full picture of how it works:

1. You install F90 API once into your scenario.
2. You paste your scripts underneath it.
3. You register each script with one line.
4. Done. They all run together.

That's it. The rest of this guide walks you through each step.

---

## Installing F90 API

> **Use the AI Dungeon website on PC** (or view as desktop if on mobile). The script editor is not available on the mobile app.

### Step 1 — Open your scenario

In AI Dungeon, open your scenario and select **Edit**.

### Step 2 — Enable scripting

Go to **Details**. Scroll down to **Scripting**. Toggle **Scripts Enabled** on.

### Step 3 — Open the script editor

Select **Edit Scripts**. You will see four tabs on the left: **Library**, **Input**, **Context**, and **Output**.

### Step 4 — Set up the Input tab

Select the **Input** tab. Delete all existing code. Paste the following:

```javascript
F90.run("input");
const modifier = (text) => { return { text } }
modifier(text);
```

### Step 5 — Set up the Context tab

Select the **Context** tab. Delete all existing code. Paste the following:

```javascript
F90.run("context");
const modifier = (text) => { return { text, stop } }
modifier(text);
```

### Step 6 — Set up the Output tab

Select the **Output** tab. Delete all existing code. Paste the following:

```javascript
F90.run("output");
const modifier = (text) => { return { text } }
modifier(text);
```

### Step 7 — Open the Library tab

Select the **Library** tab. Delete all existing code.

### Step 8 — Paste F90 API

Open [F90_API_library.js](https://github.com/NikolaiF90/F90API/blob/main/F90_API_library.js) in a new browser tab. Use the copy button in the top right of the code block. Paste it into the Library tab.

### Step 9 — Save

Click **Save**. F90 API is now installed.

---

## Adding scripts

With F90 API installed, adding a script is always the same three steps.

### Step 1 — Get the script

Go to the script's GitHub page and copy the full library code. Each script should have clear instructions on where to find it.

### Step 2 — Paste the script into your Library tab

Scroll to the bottom of the Library tab. Find this comment:

```
// ADD YOUR MODULES BELOW
```

Paste the script code below that line. Repeat for each script you want to add, one after another.

### Step 3 — Register the script

Scroll further down. Find this comment:

```
// REGISTER MODULES HERE
```

Add one line per script you want to use. Each script's documentation will tell you exactly what to write here. It looks like this:

```javascript
// These are examples — replace with your actual scripts
// F90.registerModule("CSMS", CSMS);
// F90.registerModule("Loadout", Loadout);
F90.registerModule("YourScript", YourScript);
F90.registerModule("AnotherScript", AnotherScript);
```

The name in quotes is just a label you can name anything. The second value — the one without quotes — must match the main function name defined in the script's library code.

**Not sure what the function name is?** Open the script's library code and scroll to the bottom. Look for a line that starts with `function` and takes `hook` as its argument — something like `function CSMS(hook)` or `function Loadout(hook)`. That's the name to use. If you can't find it, check the script's documentation or ask in the AI Dungeon Discord.

### Step 4 — Save and play

Click **Save**, then **Play**. Your scripts are now running together.

---

## Porting scripts

Not every script is built on F90 API yet. If a script you want to use wasn't written for F90 API, you can still make it work — you just need to do a small conversion first. This is called porting.

To figure out which pattern your script uses, open the script's **Input**, **Context**, and **Output** tabs and look at what's inside them. Find the pattern below that matches yours, and follow only that one.

> **Heads up:** The function names and script names used in the examples below are just placeholders. Replace them with the actual names from your script.

---

**Pattern 1 — The tabs each call a single function, passing the tab name in.**(CSMS and InnerSelf style)

Your Input tab looks something like this:

```javascript
// This is an example — yours will have a different function name
CSMS("input");
InnerSelf("input");
```

Your Context and Output tabs look the same, just with `"context"` and `"output"` instead.

**What to do:**

Delete everything in your Input, Context, and Output tabs and replace them with the code from [Installing F90 API](#installing-f90-api) steps 4–6.

Then in your Library tab, under `REGISTER MODULES HERE`, add one line per script:

```javascript
// This is an example — use your actual script's function name
F90.registerModule("CSMS", CSMS);
F90.registerModule("InnerSelf", InnerSelf);
```

---

**Pattern 2 — The tabs each call a different function, one per tab.**(TAS by Yi1i1i style)

Your Input tab calls something like `onInput_ScriptName()`. Your Context tab calls `onContext_ScriptName()`. Your Output tab calls `onOutput_ScriptName()`.

**What to do:**

In your Library tab, under `ADD YOUR MODULES BELOW`, add a wrapper function that ties the three together. Replace `ScriptName`, `onInput_ScriptName`, `onContext_ScriptName`, and `onOutput_ScriptName` with the actual names from your script:

```javascript
// This is an example — replace all names with your actual script's names
function ScriptName(hook)
{
  if (hook === "input")   onInput_ScriptName();
  if (hook === "context") onContext_ScriptName();
  if (hook === "output")  onOutput_ScriptName();
}
```

Then under `REGISTER MODULES HERE`, add:

```javascript
// This is an example — use the wrapper function name you chose above
F90.registerModule("ScriptName", ScriptName);
```

Delete everything in your Input, Context, and Output tabs and replace them with the code from [Installing F90 API](#installing-f90-api) steps 4–6.

---

**Pattern 3 — The logic is written directly inside the tabs, no function calls.**

Your Input tab has raw code in it — no function being called, just logic directly.

**What to do:**

In your Library tab, under `ADD YOUR MODULES BELOW`, create a new wrapper function. Move the code from each tab into the matching section below. Replace `MyScript` with whatever name you want to call this script:

```javascript
// This is an example — replace MyScript with your chosen name
// and paste the actual tab contents into each section
function MyScript(hook)
{
  if (hook === "input")   { /* paste your Input tab code here */ }
  if (hook === "context") { /* paste your Context tab code here */ }
  if (hook === "output")  { /* paste your Output tab code here */ }
}
```

Then under `REGISTER MODULES HERE`, add:

```javascript
// This is an example — use the name you chose above
F90.registerModule("MyScript", MyScript);
```

Delete everything in your Input, Context, and Output tabs and replace them with the code from [Installing F90 API](#installing-f90-api) steps 4–6.

---

Not sure which pattern your script uses, or none of these match? Ask in the AI Dungeon Discord and someone will help you figure it out.

---

## Troubleshooting

Something not working? Here are the most common culprits.

**Nothing happens when I play.**
Check that you saved after making changes. Also make sure your Input, Context, and Output tabs have the correct F90 `run` calls and nothing else.

**I get a script error on load.**
Usually means something was pasted in the wrong order, or a script was pasted with F90 API already baked in — causing a conflict. Check that F90 API appears once at the top of your Library tab, and that your scripts come after it.

**A script works but another one stopped.**
A module failing on its own shouldn't take down the others — F90 API catches failures and logs them. Check the in-game log for any `F90 > run:` error messages to identify which module is having trouble.

**I'm not sure if my scripts are registered correctly.**
Double check that each script has a `F90.registerModule(...)` line under `REGISTER MODULES HERE`, and that the function name matches what the script actually defines.

Still stuck? Ask in the AI Dungeon Discord. Include your Library tab code if you can.

---

*Back to [F90 API](README.md)*
