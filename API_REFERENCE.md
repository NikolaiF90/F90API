# F90 API Reference

All methods live under the global `F90` object. Available in any hook - Input, Context, or Output.

---

## Table of Contents

- [Text](#text)
- [Input Parsing](#input-parsing)
- [Characters](#characters)
- [Story Cards](#story-cards)
- [Notifications](#notifications)
- [Module Runtime](#module-runtime)

---

## Text

### `F90.captureText()`
Captures the raw unmodified text at the moment of the call. Automatically called by `F90.run()` at the start of the input hook - manual calls are not needed when using the module runtime.

| | |
|---|---|
| **Parameters** | none |
| **Returns** | void |

> **Tip:** In the input hook, `text` is the player's raw input. In context, it is the context window. In output, it is the AI's generated response. Capturing early preserves the original before anything mutates it.

---

### `F90.getTextSnapshot()`
Returns the text captured by the most recent `F90.captureText()` call.

| | |
|---|---|
| **Parameters** | none |
| **Returns** | `string` - captured text, or `""` if nothing has been captured yet |

---

### `F90.addToText(content)`
Appends content to the current text.

| | |
|---|---|
| **Parameters** | `content` `string` |
| **Returns** | void |

---

### `F90.setText(content)`
Replaces the current text entirely.

| | |
|---|---|
| **Parameters** | `content` `string` |
| **Returns** | void |

---

### `F90.addToMemory(content)`
Appends content to `frontMemory` for AI context injection.

| | |
|---|---|
| **Parameters** | `content` `string` |
| **Returns** | void |

---

## Input Parsing

### `F90.parseInput()`
Parses AID's player input into structured parts. Reads from the current text snapshot automatically.

Handles all three AID input formats:
- **DO** - `> You action here.`
- **SAY** - `> You say, "whatever you typed."`
- **STORY** - `whatever you typed.` (no prepend)

| | |
|---|---|
| **Parameters** | none |
| **Returns** | `object` - `{ original, clean, prepend }` |

**Return shape:**
```javascript
{
  original: string,  // raw unmodified input
  clean:    string,  // input stripped of prepend and punctuation, ready to use
  prepend:  string | null  // what was stripped (null for STORY)
}
```

**Examples:**
```javascript
// DO
// Input: "> You pick up the sword."
{ original: "> You pick up the sword.", clean: "pick up the sword", prepend: "> You" }

// SAY
// Input: "> You say, "/loadout add/John"."
{ original: "> You say, \"/loadout add/John\".", clean: "/loadout add/John", prepend: "> You say," }

// STORY
// Input: "The kingdom falls at dawn."
{ original: "The kingdom falls at dawn.", clean: "The kingdom falls at dawn", prepend: null }
```

> ⚠️ **Untested** - pending real usage in CSMS.

---

## Characters

### `F90.createCharacter(character)`
Adds a character to F90's registry. The first character created is automatically marked as the player.

| | |
|---|---|
| **Parameters** | `character` `object` - must include a `name` property. All other properties are caller-defined. |
| **Returns** | `boolean` - `true` on success, `false` if name is missing or character already exists |

**Example:**
```javascript
F90.createCharacter({ name: "Smith", hp: 100 });
```

---

### `F90.deleteCharacter(name)`
Removes a character from F90's registry by name.

| | |
|---|---|
| **Parameters** | `name` `string` |
| **Returns** | `boolean` - `true` on success, `false` if not found |

---

### `F90.findCharacter(name)`
Finds a character in F90's registry by name. Case-insensitive.

| | |
|---|---|
| **Parameters** | `name` `string` |
| **Returns** | `object` - character object, or `null` if not found |

---

### `F90.getCaller()`
Parses AID's `> Name` input format and returns the caller's name as a plain string.

Returns whatever follows `>`. Does not resolve banned names or validate against the registry - that is the caller's responsibility.

| | |
|---|---|
| **Parameters** | none |
| **Returns** | `string` - caller name, or `null` if no match |

> **Tip:** In singleplayer, AID prepends `> You`. In multiplayer, it prepends `> CharacterName`. `getCaller()` returns whichever name follows `>` without branching.

---

### `F90.getCallerCharacter()`
Returns the full character object of the active caller.

In singleplayer, `> You` is a banned name - falls back to the player character automatically. In multiplayer, resolves the caller by name against the registry.

| | |
|---|---|
| **Parameters** | none |
| **Returns** | `object` - character object, or `null` if not found |

---

### `F90.isMultiplayer()`
Returns `true` if the current session has more than one valid, registered, non-banned character in `info.characters`.

| | |
|---|---|
| **Parameters** | none |
| **Returns** | `boolean` |

---

## Story Cards

### `F90.findCard(title)`
Returns a story card by exact title match.

| | |
|---|---|
| **Parameters** | `title` `string` - case-sensitive |
| **Returns** | `object` - story card object, or `null` if not found |

---

### `F90.deleteCard(title)`
Deletes a story card by exact title match.

| | |
|---|---|
| **Parameters** | `title` `string` - case-sensitive |
| **Returns** | `boolean` - `true` on success, `false` if not found |

---

### `F90.getCardsByType(type)`
Returns all story cards matching the given type.

| | |
|---|---|
| **Parameters** | `type` `string` - case-sensitive |
| **Returns** | `array` - array of matching story card objects, empty array if none found |

**AID reserved types:** `"Character"`, `"Class"`, `"Race"`, `"Location"`, `"Faction"`

Scripts and users may define their own types freely.

---

## Notifications

### `F90.notify(message)`
Queues a message to be shown to the player. Messages are flushed at the end of the output hook automatically by `F90.run()`.

| | |
|---|---|
| **Parameters** | `message` `string` |
| **Returns** | void |

---

### `F90.flushNotify()`
Flushes all queued notifications into text, prepended as a bracketed block. Automatically called by `F90.run()` at the end of the output hook - manual calls are not needed when using the module runtime.

| | |
|---|---|
| **Parameters** | none |
| **Returns** | void |

---

## Module Runtime

### `F90.registerModule(name, fn, priority?)`
Registers a module for execution. Modules execute in registration order by default.

| | |
|---|---|
| **Parameters** | `name` `string` - module identifier used in log messages |
| | `fn` `function` - the module's entry point, called with the hook name as its argument |
| | `priority` `object` *(optional)* - per-hook numeric priority. Lower runs earlier. Unspecified hooks fall to registration order. |
| **Returns** | void |

**Example:**
```javascript
// No priority - runs in registration order
F90.registerModule("Loadout", Loadout);

// With priority - runs first in context, last in output
F90.registerModule("F90Debug", F90Debug, { context: 0, output: 99 });
```

> **Note:** Registering the same name twice will result in both running. Avoid duplicate registrations.

---

### `F90.run(hook)`
Runs all registered modules for the given hook in priority order. Failures are caught and logged - a broken module never stops the others from running.

Also handles:
- Capturing text automatically at the start of `"input"`
- Flushing notifications automatically at the end of `"output"`

| | |
|---|---|
| **Parameters** | `hook` `string` - `"input"`, `"context"`, or `"output"` |
| **Returns** | void |

**Example - hook files:**
```javascript
// Input tab
F90.run("input");
const modifier = (text) => { return { text } }
modifier(text);

// Context tab
F90.run("context");
const modifier = (text) => { return { text } }
modifier(text);

// Output tab
F90.run("output");
const modifier = (text) => { return { text } }
modifier(text);
```
