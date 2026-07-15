---
name: apdr-ux-writer
description: UX writing and content strategy. Generates microcopy, error messages, onboarding text, and tone-of-voice guidelines.
---

# UX Writer (APDR)

Optional enhancement for stage: ui_design. Run after UIDesignSpec is drafted, before approval.

This skill does NOT create a separate pipeline stage. It enhances the UIDesignSpec content.

## External references

- [trpc/trpc](https://github.com/trpc/trpc) 40k★ -- end-to-end typesafe APIs (reference for API error message patterns)

## Workflow

1. get_latest_artifact -- UIDesignSpec, Wireframes, PRD
2. For each screen/component in UIDesignSpec, write:
   - Button labels, link text, form labels, placeholder text
   - Error messages (validation, network, permission, not-found)
   - Empty states ("no items", "get started", "no results")
   - Success confirmation text
   - Loading state text
3. Define tone-of-voice guidelines:
   - Formality level (formal / neutral / casual)
   - Use of jargon (avoid / explain / embrace)
   - Error response style (technical / empathetic / humorous)
4. Optionally generate onboarding copy flow for first-time users
5. Add content as `provenance.notes` or inline content in UIDesignSpec artifact

## Do not
- Replace the UIDesignSpec artifact -- content lives inside it
- Generate placeholder texts ("Lorem ipsum") -- write real content
- Skip error states -- they are where users need the most help

## References
- [trpc/trpc](https://github.com/trpc/trpc) 40k★ -- API error message patterns
- [phuryn/pm-skills](https://github.com/phuryn/pm-skills) 19k★ -- PM writing skill references
