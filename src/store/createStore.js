import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'
import { browserHistory } from 'react-router'
import makeRootReducer from './reducers'
import { updateLocation } from './location'
import { routerMiddleware } from 'react-router-redux'

export default (initialState = {}) => {
  // ======================================================
  // Middleware Configuration
  // ======================================================
  const middleware = [thunk]
  const reduxMiddleware = routerMiddleware(browserHistory)

  // ======================================================
  // Store Enhancers
  // ======================================================
  const enhancers = []
  if (__DEV__) {
    const devToolsExtension = window.devToolsExtension
    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension())
    }
  }

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  const store = createStore(
    makeRootReducer(),
    initialState,
    compose(
      applyMiddleware(...middleware),
      ...enhancers,
      applyMiddleware(reduxMiddleware)
    )
  )
  store.asyncReducers = {}

  // To unsubscribe, invoke `store.unsubscribeHistory()` anytime
  store.unsubscribeHistory = browserHistory.listen(updateLocation(store))

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const reducers = require('./reducers').default
      store.replaceReducer(reducers(store.asyncReducers))
    })
  }

  return store
}
