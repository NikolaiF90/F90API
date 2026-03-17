# F90 API — Developer Guide

This guide is for script developers who want to build on F90 API or make their existing script compatible with it.

---

## What compatibility means

An F90 API compatible script:

- Does **not** include F90 API in its own library code. F90 API is the user's responsibility to install. Your script goes in clean, underneath it.
- Exposes a single entry point function that accepts a `hook` argument — `"input"`, `"context"`, or `"output"`.
- Registers itself with `F90.registerModule()`.
- Calls `F90.*` for any utility it needs. Never reaches into another script's internals directly.

That's the contract. Everything else is up to you.

---

## The bundling rule

> **Do not ship your script with F90 API baked in.**

This is the most important rule. If you include F90 API inside your script's library code, and a user pastes two scripts that both do this, F90 API gets declared twice. At best, things break in confusing ways. At worst, it silently corrupts state and nobody knows why.

F90 API is installed once by the user, at the top of their Library tab. Your script goes underneath it. Keep them separate.

---

## Structuring your script

F90 API's library file already contains a ready-to-use template at the bottom, under the `ADD YOUR MODULES BELOW` comment. It looks like this:

```javascript
function YourModule(hook)
{
  if (hook === "input")
  {
    // Input logic
  }
  if (hook === "context")
  {
    // Context logic
  }
  if (hook === "output")
  {
    // Output logic
  }
}
```

Start from there. Your script is just a function that receives a hook and does the right thing for each one. Keep the registration line at the very bottom:

```javascript
F90.registerModule("YourModule", YourModule);
```

What users install is just your script file — no F90 API, no hook tab contents. Just the library code and the registration line.

---

## Porting your existing script

Already have a script and want to make it compatible? The porting patterns are documented in the [World Maker Guide](WORLD_MAKERS.md#porting-scripts). The patterns are the same — you're just doing it to your own code instead of someone else's.

---

## README template

Use this as the starting point for your script's GitHub README. It follows the same installation flow every F90 API compatible script uses, so world makers get a consistent experience no matter whose script they're installing.

Fill in the fields marked with `[ ]` and remove the brackets.

---

    # [Script Name]
    [One sentence describing what your script does.]

    ---

    ## Requirements

    - [F90 API](https://github.com/NikolaiF90/F90API) v[minimum version] or higher

    ---

    ## Installation

    > **Use the AI Dungeon website on PC** (or view as desktop if on mobile). The script editor is not available on the mobile app.

    ### Step 1 — Install F90 API

    If you haven't already, follow the [F90 API installation guide](https://github.com/NikolaiF90/F90API/blob/main/WORLD_MAKERS.md) first. Come back here when done.

    ### Step 2 — Get the script

    Open [[ScriptName]_library.js]([link to your raw library file]) in a new browser tab. Use the copy button in the top right of the code block.

    ### Step 3 — Paste the script

    In the AI Dungeon script editor, open the **Library** tab. Scroll to the bottom and find this comment:

        // ADD YOUR MODULES BELOW

    Paste the script code below that line.

    ### Step 4 — Register the script

    Scroll further down. Find this comment:

        // REGISTER MODULES HERE

    Add this line:

        F90.registerModule("[ScriptName]", [MainFunctionName]);

    ### Step 5 — Save and play

    Click **Save**, then **Play**. [Script Name] is now running.

---

*Back to [F90 API](README.md)*
