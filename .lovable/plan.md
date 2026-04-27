I found the likely root cause: the edit route is currently registered as a child of the word detail route, but the detail route does not render an outlet for child pages. So clicking Edit changes/targets `/words/:id/edit`, but the app keeps showing the detail page instead of the editable form.

Plan:

1. Fix the route structure
   - Rename the edit route file from the nested route pattern to the non-nested TanStack Router pattern.
   - Update the route declaration so `/words/:id/edit` renders as its own full page, not inside `/words/:id`.

2. Keep the existing Edit links
   - Keep the Edit buttons linking to `/words/$id/edit` from both the detail page and list page.
   - After the route fix, these links should open the `WordForm` edit screen directly.

3. Verify the form remains editable
   - Confirm `WordForm` still receives the loaded word as `initial` data.
   - Ensure the input fields are controlled by state and update on typing.
   - Ensure Save still calls `updateWord(...)` and returns to the detail page.

4. Build-check the routing
   - Run a build/type check after the rename so the generated TanStack route tree updates correctly.

Technical detail:

```text
Current route tree:
/words/$id
  /edit   <- child route, but /words/$id has no <Outlet />

Target route tree:
/words/$id
/words/$id/edit  <- sibling/non-nested page, renders its own edit form
```

I’ll apply this route fix once approved.

<lov-actions>
  <lov-open-history>View History</lov-open-history>
  <lov-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</lov-link>
</lov-actions>