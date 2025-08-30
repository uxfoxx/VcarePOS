import { takeLatest, call, put } from "redux-saga/effects";
import {
  fetchCustomers,
  fetchCustomerById,
  updateCustomer,
  deleteCustomer,
  fetchCustomersSucceeded,
  fetchCustomerByIdSucceeded,
  updateCustomerSucceeded,
  deleteCustomerSucceeded,
  failed
} from "./customersSlice";

// API functions for customers
const customersApi = {
  getAll: async () => {
    const token = localStorage.getItem('vcare_token');
    const response = await fetch('/api/customers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }
    
    return response.json();
  },
  
  getById: async (id) => {
    const token = localStorage.getItem('vcare_token');
    const response = await fetch(`/api/customers/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch customer');
    }
    
    return response.json();
  },
  
  update: async (id, customerData) => {
    const token = localStorage.getItem('vcare_token');
    const response = await fetch(`/api/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customerData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update customer');
    }
    
    return response.json();
  },
  
  delete: async (id) => {
    const token = localStorage.getItem('vcare_token');
    const response = await fetch(`/api/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete customer');
    }
    
    return response.json();
  }
};

function* fetchCustomersSaga() {
  try {
    const data = yield call(customersApi.getAll);
    yield put(fetchCustomersSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* fetchCustomerByIdSaga(action) {
  try {
    const data = yield call(customersApi.getById, action.payload.id);
    yield put(fetchCustomerByIdSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* updateCustomerSaga(action) {
  try {
    const data = yield call(customersApi.update, action.payload.id, action.payload.customerData);
    yield put(updateCustomerSucceeded(data));
  } catch (error) {
    yield put(failed(error.message));
  }
}

function* deleteCustomerSaga(action) {
  try {
    yield call(customersApi.delete, action.payload.id);
    yield put(deleteCustomerSucceeded({ id: action.payload.id }));
  } catch (error) {
    yield put(failed(error.message));
  }
}

export default function* customersSaga() {
  yield takeLatest(fetchCustomers.type, fetchCustomersSaga);
  yield takeLatest(fetchCustomerById.type, fetchCustomerByIdSaga);
  yield takeLatest(updateCustomer.type, updateCustomerSaga);
  yield takeLatest(deleteCustomer.type, deleteCustomerSaga);
}