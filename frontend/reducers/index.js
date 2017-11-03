import { createReducer } from '../utils/redux'
import {
  CHANGE_UPLOAD_STATE,
  SELECT_SERVICE_PROVIDER,
  SELECT_JURISDICTION,
  SAVE_AVAILABLE_ROLES,
  SAVE_UPLOAD_RESPONSE,
  SET_ERROR_MESSAGE,
  MATCHING_RESULTS,
  UPDATE_CONTROLLED_DATE,
  UPDATE_DURATION
} from '../constants/index'
import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import update from 'react-addons-update'

const initialState = {
  app: {
    selectedServiceProvider: {
      name: '',
      slug: ''
    },
    uploadResponse: {
      status: '',
      exampleRows: [],
      rowCount: '',
      uploadId: ''
    },
    selectedJurisdiction: {
      name: '',
      slug: ''
    },
    availableJurisdictionalRoles: [],
    matchingResults: {
      filters: {
        controlledDate: '2017-07-01',
        duration: '1 year',
        serviceProviders: ['jail', 'hmis', 'intersection']
      },
      vennDiagramData: [{sets: [''], size: null}],
      filteredData: {
        tableData: [],
        jailBarData: [],
        homelessBarData: [],
      }
    }
  }
}

const app = createReducer(initialState, {
  [SELECT_SERVICE_PROVIDER]: (state, payload) => {
    return Object.assign({}, state, {
      selectedServiceProvider: payload
    })
  },
  [SELECT_JURISDICTION]: (state, payload) => {
    console.log('selecting jurisdiction')
    console.log(payload)
    return Object.assign({}, state, {
      selectedJurisdiction: payload
    })
  },
  [CHANGE_UPLOAD_STATE]: (state, payload) => {
    return Object.assign({}, state, {
      uploadState: payload
    })
  },
  [SAVE_AVAILABLE_ROLES]: (state, payload) => {
    return Object.assign({}, state, {
      availableJurisdictionalRoles: payload
    })
  },
  [SAVE_UPLOAD_RESPONSE]: (state, payload) => {
    const newState = Object.assign({}, state, {
      uploadResponse: payload
    })
    return newState
  },
  [MATCHING_RESULTS]: (state, payload) => {
    return Object.assign({}, state, {
      matchingResults: payload
    })
  },
  [UPDATE_CONTROLLED_DATE]: (state, payload) => {
    const newState = update(state, {
      matchingResults: {
        filters: {
          controlledDate: {$set: payload}
        }
      }
    })
    return newState
  },
  [UPDATE_DURATION]: (state, payload) => {
    const newState = update(state, {
      matchingResults: {
        filters: {
          duration: {$set: payload}
        }
      }
    })
    return newState
  }
})
const rootReducer = combineReducers({
  routing: routerReducer,
  app,
})

export { rootReducer, initialState }
