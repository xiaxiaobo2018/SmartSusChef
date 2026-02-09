# Frontend Unit Test Plan for Ingredient Management

**Scope:**
Covers >80% of user interactions in `IngredientManagement` and related context/api logic. Focuses on React component behavior, form validation, API integration, and state management.

---

## 1. Test Framework & Tools
- **Test Runner:** Jest
- **Component Testing:** React Testing Library (RTL)
- **Mocking:** MSW (Mock Service Worker) for API, Jest mocks for context
- **Coverage:** Aim for >80% lines/branches/functions

---

## 2. Test File Structure
- `src/app/components/management/__tests__/IngredientManagement.test.tsx`
- `src/app/context/__tests__/AppContext.test.tsx`
- `src/app/services/__tests__/api.test.ts`

---

## 3. Core User Interactions to Cover

### 3.1. IngredientManagement Component
- [ ] Renders ingredient table with data from context
- [ ] Loads global ingredients from API and populates dropdown
- [ ] Opens add dialog, allows selecting global ingredient, auto-fills unit/carbon (read-only)
- [ ] Selects "Others" and allows custom input for all fields
- [ ] Form validation: required fields, positive carbon, custom name for "Others"
- [ ] Submits new ingredient (calls addIngredient), dialog closes, table updates
- [ ] Opens edit dialog, pre-fills fields, updates ingredient (calls updateIngredient)
- [ ] Delete button opens confirmation dialog
- [ ] Prevents deletion if ingredient is referenced by recipes (shows warning dialog)
- [ ] Cascades delete to wastage data if confirmed
- [ ] Toast notifications for success/failure

### 3.2. AppContext Logic
- [ ] addIngredient/updateIngredient/deleteIngredient update state and propagate to children
- [ ] mapIngredientDto correctly maps globalIngredientId and custom fields

### 3.3. API Layer
- [ ] fetchGlobalIngredients returns correct data (mocked)
- [ ] add/update/delete ingredient API calls send correct payloads
- [ ] Handles API error responses gracefully

---

## 4. Example Test Cases (RTL + Jest)

```tsx
it('renders ingredient table with data', () => {
  render(<IngredientManagement />);
  expect(screen.getByText('All Ingredients')).toBeInTheDocument();
  // ...
});

it('loads and displays global ingredients in dropdown', async () => {
  server.use(
    rest.get('/api/globalingredients', (req, res, ctx) =>
      res(ctx.json([{ id: '1', name: 'Beef', unit: 'kg', carbonFootprint: 27 }]))
    )
  );
  render(<IngredientManagement />);
  fireEvent.click(screen.getByText('Add Ingredient'));
  expect(await screen.findByText('Beef')).toBeInTheDocument();
});

it('auto-fills and disables unit/carbon when global ingredient selected', async () => {
  // ...
});

it('allows custom input when "Others" selected', async () => {
  // ...
});

it('validates required fields and shows error', async () => {
  // ...
});

it('calls addIngredient and updates table', async () => {
  // ...
});

it('prevents deletion if referenced by recipe', async () => {
  // ...
});
```

---

## 5. Mocking & Setup
- Use MSW to mock `/api/globalingredients` and ingredient CRUD endpoints
- Mock AppContext provider for stateful tests
- Use `jest.spyOn` for context methods

---

## 6. Coverage Gaps (Optional)
- Edge cases: API/network failure, rapid dialog open/close, concurrent edits
- Accessibility: ARIA roles, keyboard navigation

---

## 7. References
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [MSW Docs](https://mswjs.io/docs/)

---

**Author:** Copilot  
**Date:** 2026-02-09
