import { call, put, takeLatest, select } from 'redux-saga/effects';
import apiClient from '../../api/apiClient';
import {
  fetchQuotations,
  fetchQuotationsSuccess,
  fetchQuotationsFailure,
  fetchQuotationById,
  fetchQuotationByIdSuccess,
  fetchQuotationByIdFailure,
  createQuotation,
  createQuotationSuccess,
  createQuotationFailure,
  updateQuotation,
  updateQuotationSuccess,
  updateQuotationFailure,
  deleteQuotation,
  deleteQuotationSuccess,
  deleteQuotationFailure,
  convertQuotation,
  convertQuotationSuccess,
  convertQuotationFailure
} from './quotationsSlice';
import { addNotification } from '../notifications/notificationsSlice';

function* fetchQuotationsSaga() {
  try {
    const state = yield select();
    const { filters, pagination } = state.quotations;

    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    };

    const response = yield call(apiClient.get, '/quotations', { params });

    yield put(fetchQuotationsSuccess({
      quotations: response.data.quotations,
      pagination: response.data.pagination
    }));
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch quotations';
    yield put(fetchQuotationsFailure(errorMessage));
    yield put(addNotification({
      type: 'error',
      message: 'Error',
      description: errorMessage
    }));
  }
}

function* fetchQuotationByIdSaga(action) {
  try {
    const { id } = action.payload;
    const response = yield call(apiClient.get, `/quotations/${id}`);

    yield put(fetchQuotationByIdSuccess(response.data));
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch quotation';
    yield put(fetchQuotationByIdFailure(errorMessage));
    yield put(addNotification({
      type: 'error',
      message: 'Error',
      description: errorMessage
    }));
  }
}

function* createQuotationSaga(action) {
  try {
    const response = yield call(apiClient.post, '/quotations', action.payload);

    yield put(createQuotationSuccess(response.data));
    yield put(addNotification({
      type: 'success',
      message: 'Success',
      description: 'Quotation created successfully'
    }));

    if (action.payload.onSuccess) {
      action.payload.onSuccess(response.data);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create quotation';
    yield put(createQuotationFailure(errorMessage));
    yield put(addNotification({
      type: 'error',
      message: 'Error',
      description: errorMessage
    }));

    if (action.payload.onError) {
      action.payload.onError(error);
    }
  }
}

function* updateQuotationSaga(action) {
  try {
    const { id, ...data } = action.payload;
    const response = yield call(apiClient.put, `/quotations/${id}`, data);

    yield put(updateQuotationSuccess(response.data));
    yield put(addNotification({
      type: 'success',
      message: 'Success',
      description: 'Quotation updated successfully'
    }));

    if (action.payload.onSuccess) {
      action.payload.onSuccess(response.data);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update quotation';
    yield put(updateQuotationFailure(errorMessage));
    yield put(addNotification({
      type: 'error',
      message: 'Error',
      description: errorMessage
    }));

    if (action.payload.onError) {
      action.payload.onError(error);
    }
  }
}

function* deleteQuotationSaga(action) {
  try {
    const { id } = action.payload;
    yield call(apiClient.delete, `/quotations/${id}`);

    yield put(deleteQuotationSuccess(id));
    yield put(addNotification({
      type: 'success',
      message: 'Success',
      description: 'Quotation deleted successfully'
    }));

    if (action.payload.onSuccess) {
      action.payload.onSuccess();
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete quotation';
    yield put(deleteQuotationFailure(errorMessage));
    yield put(addNotification({
      type: 'error',
      message: 'Error',
      description: errorMessage
    }));

    if (action.payload.onError) {
      action.payload.onError(error);
    }
  }
}

function* convertQuotationSaga(action) {
  try {
    const { id } = action.payload;
    const response = yield call(apiClient.post, `/quotations/${id}/convert`);

    yield put(convertQuotationSuccess(response.data));
    yield put(addNotification({
      type: 'success',
      message: 'Success',
      description: 'Quotation converted successfully. Loading items to POS...'
    }));

    if (action.payload.onSuccess) {
      action.payload.onSuccess(response.data);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to convert quotation';
    yield put(convertQuotationFailure(errorMessage));
    yield put(addNotification({
      type: 'error',
      message: 'Error',
      description: errorMessage
    }));

    if (action.payload.onError) {
      action.payload.onError(error);
    }
  }
}

export default function* quotationsSaga() {
  yield takeLatest(fetchQuotations.type, fetchQuotationsSaga);
  yield takeLatest(fetchQuotationById.type, fetchQuotationByIdSaga);
  yield takeLatest(createQuotation.type, createQuotationSaga);
  yield takeLatest(updateQuotation.type, updateQuotationSaga);
  yield takeLatest(deleteQuotation.type, deleteQuotationSaga);
  yield takeLatest(convertQuotation.type, convertQuotationSaga);
}
