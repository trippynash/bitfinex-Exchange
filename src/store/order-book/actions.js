import {
  SAVE_BOOK,
  COMMON_ORDER_RES,
  SET_CONNECTION_STATUS
} from "../actions";



export const saveBook = (payload) => ({
  type: SAVE_BOOK,
  payload
})

export const setConnectionStatus = (payload) => ({
  type: SET_CONNECTION_STATUS,
  payload
})


export const commonOrderResponse = (payload) => ({ type: COMMON_ORDER_RES, payload })
