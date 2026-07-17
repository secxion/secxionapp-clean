# SidePanel Scrollbar Fix and Enhancement

The sidepanel scrollbar is currently reported as "stuck". Investigation revealed multiple conflicting CSS definitions for the scrollbar and a lack of interactive dragging support in the custom JS implementation.

## User Review Required

> [!IMPORTANT]
> I am moving the custom scrollbar logic entirely to `SidePanel.js` and consolidated CSS. This will ensure a consistent, interactive, and high-performance scroll experience that matches the "hover-to-reveal" design goal.

## Proposed Changes

### [Frontend Components]

#### [MODIFY] [SidePanel.js](file:///Users/mac/secxionapp-clean/frontend/src/Components/SidePanel.js)
*   Implement full interactive dragging for the custom scrollbar.
*   Optimize scroll and resize event handling.
*   Add a `MutationObserver` to automatically update the scrollbar height when the content (like the timezone list) changes.
*   Remove the `transition-all` from the thumb to prevent movement lag.

#### [MODIFY] [Header.css](file:///Users/mac/secxionapp-clean/frontend/src/Components/Header.css)
*   Remove redundant and conflicting `.sidepanel-scroll-area` CSS rules.

#### [MODIFY] [sidepanel-utils.css](file:///Users/mac/secxionapp-clean/frontend/src/styles/sidepanel-utils.css)
*   Consolidate `.sidepanel-scroll-area` rules to strictly handle hiding the native scrollbar while providing a fallback for accessibility.

## Verification Plan

### Automated Tests
*   Since this is a UI interaction issue, manual verification is primary. I will verify that `updateScrollbar` is correctly calculating values.

### Manual Verification
*   Open the SidePanel.
*   Verify the scrollbar appears on scroll or hover.
*   Verify the scrollbar moves smoothly with content scroll (no lag).
*   Verify the scrollbar is **draggable** with the mouse.
*   Toggle the Timezone Selector and verify the scrollbar height adjusts immediately.
