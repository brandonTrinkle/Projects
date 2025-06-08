import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './User/UserSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

//Creates a store of information to retain information of user as user refreshes or navigates
const rootReducer = combineReducers({ user: userReducer });

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
}

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
