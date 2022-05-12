import { truncate } from "lodash";
import {
  SAVE_BOOK,
  COMMON_ORDER_RES
} from "../actions";

const INIT_STATE = {
  connectionStatus: true,
  orderbook: {
    bids: {}
    , asks: {}
    , psnap: {}
    , mcnt: 0
  },
  ticker: [],
  trades: []

}

export default (state = INIT_STATE, action) => {
  switch (action.type) {
    case SAVE_BOOK:
      {
        return { ...state, connectionStatus: action.payload.connectionStatus }

      }
    case COMMON_ORDER_RES:
      {
        // console.log("reducer response =>  ", action.payload)
        return { ...state, ...action.payload }
      }
    default: return { ...state };
  }
}