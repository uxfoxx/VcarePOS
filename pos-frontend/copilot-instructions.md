# Copilot Instructions: Action and API Integration

## Overview
This document provides guidelines for using GitHub Copilot to assist with Action creation and API integration in the VcarePOS project. Follow these instructions to ensure consistency and best practices across the codebase.

---

## 1. Action Creation (Redux/State Management)

- Place new Redux actions, reducers, and sagas in the appropriate `src/features/<feature>/` directory.
- Use the `src/app/rootReducer.js` and `src/app/rootSaga.js` to combine new reducers and sagas.
- Action creators should be named using the format: `doSomething`, `fetchSomething`, etc.
- Use Redux Toolkit conventions if applicable.
- Keep actions pure and avoid side effects outside of sagas/thunks.

---

## 2. API Integration

- All API calls should be made through `src/api/apiClient.js` or feature-specific API modules.
- Use async/await for API requests.
- Handle errors gracefully and dispatch error actions as needed.
- Store API endpoints and base URLs in a config file or environment variables.
- For authentication, use the logic in `src/contexts/AuthContext.jsx` and backend `middleware/auth.js`.

---

## 3. Component Integration

- Use actions and selectors via `useDispatch` and `useSelector` from React Redux.
- Trigger API actions from UI components (e.g., buttons, forms) in the `src/components/` directory.
- Display loading and error states using `LoadingSkeleton.jsx` and `ReduxErrorNotification.jsx`.

---

## 4. Backend API

- Add new API routes in `backend/src/routes/`.
- Use `backend/src/utils/db.js` for database access.
- Document new endpoints in `backend/src/swagger.js`.

---

## 5. Testing

- Write tests for actions and API integrations in the corresponding `src/features/<feature>/` or `backend/src/` directories.
- Use mock data from `src/data/mockData.js` for frontend tests.

---

## 6. General Best Practices

- Keep code modular and reusable.
- Use clear, descriptive names for actions, reducers, and API functions.
- Document new actions and API endpoints with comments.

---

For further details, refer to the README.md and HOW_TO_RUN.md files.
