# Changelog

All notable changes to F90 API will be documented here.
Versions are ordered latest first. Timestamps are UTC.

---

## [v1.0.0] - 2026-03-13T00:00:00Z

### Added
- `F90.captureText()` — captures raw unmodified text at the start of input hook
- `F90.getTextSnapshot()` — returns the captured raw text for the current hook
- `F90.isMultiplayer()` — detects whether the current session is multiplayer
- `F90.findCharacter(name)` — finds a character by name, case-insensitive
- `F90.getCaller()` — parses AID's `> Name` input format, returns caller name as string
- `F90.getCallerCharacter()` — returns the full character object of the active caller, falls back to player in singleplayer
- `F90.addToText(content)` — appends content to current text
- `F90.setText(content)` — replaces current text entirely
- `F90.addToMemory(content)` — appends content to frontMemory for AI context injection
- `F90.notify(message)` — queues a message to be shown to the player at end of output
- `F90.flushNotify()` — flushes all queued notifications into text
- `F90.createCharacter(character)` — adds a character to F90's registry
- `F90.deleteCharacter(name)` — removes a character from F90's registry
- `F90.findCard(title)` — returns a story card by exact title match
- `F90.deleteCard(title)` — deletes a story card by exact title match
- `F90.getCardsByType(type)` — returns all story cards matching a given type
- `F90.parseInput()` — parses AID's DO, SAY, and STORY input formats into structured parts *(untested — pending real usage in CSMS)*
- `F90.registerModule(name, fn, priority)` — registers a module for execution
- `F90.run(hook)` — runs all registered modules in priority order, with failure isolation
