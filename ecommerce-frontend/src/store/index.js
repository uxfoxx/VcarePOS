import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers';
import rootSaga from './sagas';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST', 
          'persist/REHYDRATE',
          'orders/createOrder' // Ignore serialization check for file uploads
        ],
        ignoredActionsPaths: ['payload.receiptFile'], // Ignore receiptFile in payload
      },
    }).concat(sagaMiddleware),
  devTools: import.meta.env.DEV,
});

sagaMiddleware.run(rootSaga);

export default store;