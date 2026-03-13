// ============================================
// F90 API - Core Utilities
// v1.0.0 by PrinceF90
// Copy everything from here to END OF F90 API
// and paste at the top of your library
// ============================================

const F90 = {};

// Names that should never be treated as valid characters.
const F90_CONFIG =
{
  BANNED_NAMES: ["you", "adventurer"],
}

// Initializes F90 API state. Owns the character registry.
// Called automatically at library load — no manual init needed.
function initF90()
{
  if (!state.f90) state.f90 = { characters: [] };
}

// Self-initializes on load.
initF90();

// Captures raw unmodified text. Call at the top of each hook before anything mutates text.
F90.captureText = function()
{
  state.f90._textSnapshot = text;
}

// Returns the captured raw text for the current hook.
F90.getTextSnapshot = function()
{
  return state.f90._textSnapshot || "";
}

// Returns true if the current session is multiplayer.
F90.isMultiplayer = function()
{
  if (!info.characters || info.characters.length <= 1) return false;

  for (const name of info.characters)
  {
    if (!name || name.trim() === "") continue;
    if (F90_CONFIG.BANNED_NAMES.some(b => b.toLowerCase() === name.toLowerCase())) continue;
    if (!F90.findCharacter(name)) continue;
    
    return true;
  }

  return false;
}

// Returns a character by name. Case-insensitive.
F90.findCharacter = function(name)
{
  return state.f90.characters.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
}

// Returns the caller name as a clean string by parsing AID's "> Name" input format.
// Returns whatever follows ">". Caller is responsible for handling "You", "I", or invalid names.
F90.getCaller = function()
{
  const input = F90.getTextSnapshot();
  const match = input.match(/>\s*(\S+)/);
  
  return match ? match[1].trim() : null;
}

// Returns the full character object of the active caller.
F90.getCallerCharacter = function()
{
  const name = F90.getCaller();

  if (!name)
  {
    log("F90 > Caller not found.");
    return null;
  }

  if (!F90_CONFIG.BANNED_NAMES.some(b => b.toLowerCase() === name.toLowerCase()))
  {
    return F90.findCharacter(name);
  }

  // Banned name means singleplayer — fall back to player character
  return state.f90.characters.find(c => c.isPlayer) || null;
}

// Appends content to the current text.
F90.addToText = function(content)
{
  text = text.trimEnd() + content;
}

// Replaces the current text entirely.
F90.setText = function(content)
{
  text = content;
}

// Appends content to frontMemory for AI context injection.
F90.addToMemory = function(content)
{
  state.memory.frontMemory = (state.memory.frontMemory || "") + "\n\n" + content;
}

/*
  NOTIFICATION
*/

// Queues a message to be shown to the player at the end of the output hook.
F90.notify = function(message)
{
  if (!state.f90._notifyQueue) state.f90._notifyQueue = [];
  state.f90._notifyQueue.push(message);
}

// Flushes all queued notifications into text.
// Call at the end of the output hook, before modifier.
F90.flushNotify = function()
{
  if (!state.f90._notifyQueue || state.f90._notifyQueue.length === 0) return;

  const messages = state.f90._notifyQueue.map(m => m).join("\n");
  text = `[${messages}]\n\n` + text;
  state.f90._notifyQueue = [];
}

/*
  CHARACTER
*/

// Creates a character in F90's registry.
// Caller defines the character object shape — F90 only requires a name.
// First character created is always the player.
// Returns true on success, false on failure.
F90.createCharacter = function(character)
{
  if (!character || !character.name)
  {
    log("F90 > createCharacter: character object must have a name.");
    return false;
  }

  if (F90.findCharacter(character.name))
  {
    log(`F90 > createCharacter: ${character.name} already exists.`);
    return false;
  }

  if (state.f90.characters.length === 0) character.isPlayer = true;

  state.f90.characters.push(character);
  log(`F90 > Character "${character.name}" created.`);

  return true;
}

// Deletes a character from F90's registry by name.
// Returns true on success, false on failure.
F90.deleteCharacter = function(name)
{
  const idx = state.f90.characters.findIndex(c => c.name.toLowerCase() === name.toLowerCase());

  if (idx === -1)
  {
    log(`F90 > deleteCharacter: ${name} not found.`);
    return false;
  }

  state.f90.characters.splice(idx, 1);
  log(`F90 > deleteCharacter: Character "${name}" deleted.`);

  return true;
}

/*
  STORY CARDS
*/

// Returns a story card by exact title match. Case-sensitive.
F90.findCard = function(title)
{
  return storyCards.find(c => c.title === title) || null;
}

/// Deletes a story card by exact title match.
// Returns true on success, false if not found.
F90.deleteCard = function(title)
{
  const idx = storyCards.findIndex(c => c.title === title);
  if (idx === -1) return false;

  storyCards.splice(idx, 1);
  return true;
}

// F90.getCardsByTitle(title) — returns array of cards matching title. (not yet implemented)
// F90.getCardsByType(type)   — returns array of cards matching type.  (not yet implemented)

// ============================================
// F90 API - Module Runtime
// ============================================

F90._modules = [];

// Registers a module for execution. Priority is optional, per hook, numeric.
// Lower number runs earlier. Unspecified hooks fall to registration order.
// EXAMPLE: F90.registerModule("CSMS", CSMS, { context:0, output: 5 });
F90.registerModule = function(name, fn, priority)
{
  F90._modules.push({
    name:       name,
    fn:        fn,
    priority:   priority || {},
    order:      F90._modules.length,
  });
}

// Runs all registered modules for the given hook, in priority order.
// Failures are logged and execution continues for remaining modules.
F90.run = function(hook)
{
  // Helps user to capture the original input text so on one has to do that manually
  if (hook === "input") F90.captureText();

  const sorted = [...F90._modules].sort((a, b) =>
  {
    const aPriority = a.priority[hook];
    const bPriority = b.priority[hook];

    if (aPriority !== undefined && bPriority !== undefined) return aPriority - bPriority;
    if (aPriority !== undefined) return -1;
    if (bPriority !== undefined) return 1;

    return a.order - b.order;
  });

  for (const module of sorted)
  {
    try
    {
        module.fn(hook);
    }
    catch(e)
    {
      log(`F90 > run: ${module.name} failed on ${hook} - ${e.message}`);
    }
  }

  // Same. F90 API help users to flush notify so they dont have to worry about that and its order and so on
  if (hook === "output") F90.flushNotify();
}



// ========================
// END OF F90 API
// ========================


// ========================
// ADD YOUR MODULES BELOW
// Register at the bottom
// ========================


// Your module code here...
/* 
function YourModule(hook)
{
  if (hook === "input")
  {
    // Input Script
  }
  if (hook === "context")
  {
    // Context Script
  }
  if (hook === "output")
  {
    // Output Script
  }
}
*/

// ========================
// REGISTER MODULES HERE
// Always keep this last
// ========================

// F90.registerModule("YourModule", YourModule);
// F90.registerModule("Loadout", Loadout);

