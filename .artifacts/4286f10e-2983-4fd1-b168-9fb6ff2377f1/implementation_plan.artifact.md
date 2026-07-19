# DataPad Fixes & Improvements

This plan addresses two issues in the DataPad feature:
1. The "Create Your First Note" button not working in the empty state.
2. Missing image previews in the note list and ensuring the preview modal works as expected.

## User Review Required

> [!NOTE]
> I will be adding a small image thumbnail strip to each note in the list view. Clicking these thumbnails will open a full-screen preview.

## Proposed Changes

### [DataPad Feature]

#### [MODIFY] [DataPad.js](file:///Users/mac/secxionapp-clean/frontend/src/pages/DataPad.js)
- Fix the `EmptyState` component props: change `onCreateFirst` to `onCreateNew`.
- Add `hasActiveFilters` and `hasDataPads` props to `EmptyState`.
- Add `selectedImage` state to manage a global full-screen image preview.
- Add an `ImagePreviewModal` at the bottom of the component.
- Pass `onImageClick` to `DataPadList`.

#### [MODIFY] [DataPadList.js](file:///Users/mac/secxionapp-clean/frontend/src/Components/DataPadList.js)
- Update the component to accept `onImageClick` prop.
- Render a thumbnail strip for notes that have media (`pad.media`).
- Implement `onClick` handler for thumbnails to trigger the preview.

#### [MODIFY] [UploadData.js](file:///Users/mac/secxionapp-clean/frontend/src/Components/UploadData.js)
- Ensure the existing image preview modal works correctly.
- Add a "Tap to preview" hint or improve the visual feedback when hovering over thumbnails.

## Verification Plan

### Manual Verification
- Go to `/datapad` with no notes and click "Create Your First Note" to ensure it opens the editor.
- Create a note with images.
- In the list view, verify that image thumbnails appear.
- Click a thumbnail in the list view to verify the full-screen preview.
- Open the editor, go to the "Photos" tab, and click an uploaded thumbnail to verify the preview.
