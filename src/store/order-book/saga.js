import { all, call, fork, put, take, takeEvery, delay, takeLatest, takeLeading, cancel } from "redux-saga/effects";
import { eventChannel, END } from 'redux-saga'
import moment from 'moment'
import CRC from 'crc-32'
import _ from 'lodash'
import {
  COMMON_ORDER_RES,
  SAVE_BOOK
} from '../actions';

import {
  commonOrderResponse
} from "./actions";

const pair = "BTCUSD"

const conf = {
  wshost: 'wss://api.bitfinex.com/ws/2'
}
let connected = false
let connecting = false
let cli

function createSocketConnect( payload) {
  console.log("------ called --eventChannel-----", payload);
  return eventChannel(emitter => { 
    let seq = null
    let channels = {}
    let BOOK = {};

    const { connectionStatus, callback } = payload;
    if (!connecting && !connected) cli = new WebSocket(conf.wshost, "protocolOne");
    if (!connectionStatus) {
      console.log("CLOSE CONNECTION");
      cli.close();
       emitter(END)
    }
    if (connecting || connected) {
      console.log("ALREADY CONNECTED or CONNECTING")
       emitter(END)
    }

    connecting = true
    cli.onopen = function open() {
      connecting = false
      connected = true;
      // callback({ connectionStatus: true })
       // setConnectionStatus(true)
      console.log("CONNECTED")
      BOOK.bids = {}
      BOOK.asks = {}
      BOOK.psnap = {}
      BOOK.mcnt = 0
      cli.send(JSON.stringify({ event: 'conf', flags: 65536 + 131072 }))
      cli.send(JSON.stringify({ event: 'subscribe', channel: 'book', pair: pair, prec: "P0", len: 25, freq: 'F1' }))
      cli.send(JSON.stringify({ event: 'subscribe', channel: 'trades', symbol: 'tBTCUSD' }))
      cli.send(JSON.stringify({ event: 'subscribe', channel: 'ticker', symbol: 'tBTCUSD' }))
      return emitter({ type: COMMON_ORDER_RES, payload: { connectionStatus: true } })
    }
    cli.onclose = function open() {
      seq = null
      connecting = false
      connected = false
     emitter({ type: COMMON_ORDER_RES, payload: { connectionStatus: false } })
      // callback({ connectionStatus: false })
    }

    cli.onmessage = function (message_event) {
      var msg = message_event.data;
      msg = JSON.parse(msg)
      if (msg.event === "subscribed") {
        channels[msg.channel] = msg.chanId;
        console.log("GOT SUBSCRIBED TO ========>>>>", channels);
      }

      if (msg.event) {
        emitter({ type: COMMON_ORDER_RES, payload: {} })
        return
      }

      if (msg[0] === channels["trades"] && (Array.isArray(msg[1]) || (msg[1] === 'te' && Array.isArray(msg[2])))) {
        console.log("HELLO 00000==> trades")
        callback({ trades: msg })
        return  emitter({ type: COMMON_ORDER_RES, payload: { trades: msg } })
      }

      if (msg[0] === channels["ticker"] && Array.isArray(msg[1])) {
        console.log("HELLO 00000==> ticker")
        callback({ ticker: msg })

        return emitter({ type: COMMON_ORDER_RES, payload: { ticker: msg } })
      }

      if (msg[0] === channels["book"]) {
        if (msg[1] === 'hb') {
          seq = +msg[2]
        //  emitter({ type: COMMON_ORDER_RES, payload: {}})
         return
        } else if (msg[1] === 'cs') {
          seq = +msg[3]

          let checksum = msg[2]
          let csdata = []
          let bids_keys = BOOK.psnap['bids']
          let asks_keys = BOOK.psnap['asks']

          for (let i = 0; i < 25; i++) {
            if (bids_keys[i]) {
              let price = bids_keys[i]
              let pp = BOOK.bids[price]
              csdata.push(pp.price, pp.amount)
            }
            if (asks_keys[i]) {
              let price = asks_keys[i]
              let pp = BOOK.asks[price]
              csdata.push(pp.price, -pp.amount)
            }
          }

          let cs_str = csdata.join(':')
          let cs_calc = CRC.str(cs_str)

          if (cs_calc !== checksum) {
            console.error('CHECKSUM_FAILED')
          }
        //  emitter({ type: COMMON_ORDER_RES, payload: {}})
         return
        }

        if (BOOK.mcnt === 0) {
          _.each(msg[1], function (pp) {
            pp = { price: pp[0], cnt: pp[1], amount: pp[2] }
            let side = pp.amount >= 0 ? 'bids' : 'asks'
            pp.amount = Math.abs(pp.amount)
            if (BOOK[side][pp.price]) {
            }
            BOOK[side][pp.price] = pp
          })
        } else {
          let cseq = +msg[2]
          msg = msg[1]
          if (!seq) {
            seq = cseq - 1
          }
          if (cseq - seq !== 1) {
            console.error('OUT OF SEQUENCE', seq, cseq)
            // process.exit()
          }
          seq = cseq
          let pp = { price: msg[0], cnt: msg[1], amount: msg[2] }
          if (!pp.cnt) {
            let found = true
            if (pp.amount > 0) {
              if (BOOK['bids'][pp.price]) {
                delete BOOK['bids'][pp.price]
              } else {
                found = false
              }
            } else if (pp.amount < 0) {
              if (BOOK['asks'][pp.price]) {
                delete BOOK['asks'][pp.price]
              } else {
                found = false
              }
            }
            if (!found) {
            }
          } else {
            let side = pp.amount >= 0 ? 'bids' : 'asks'
            pp.amount = Math.abs(pp.amount)
            BOOK[side][pp.price] = pp
          }
        }

        _.each(['bids', 'asks'], function (side) {
          let sbook = BOOK[side]
          let bprices = Object.keys(sbook)
          let prices = bprices.sort(function (a, b) {
            if (side === 'bids') {
              return +a >= +b ? -1 : 1
            } else {
              return +a <= +b ? -1 : 1
            }
          })
          BOOK.psnap[side] = prices
        })

        BOOK.mcnt++
        //  emitter({ payload: {orderbook: BOOK} })
        // checkCross(msg,BOOK)
        callback({ orderbook: BOOK })
        // saveBook(BOOK)
      }
    }


    return () => {
      console.log("HELLOW ENDDD")
    }
  })
}

function* wsSagas({ payload }) {
  try {
    const channel = yield call(createSocketConnect, payload);
    while (true) {
      let action = yield take(channel);
      console.log("action returned", action)
      yield put(action);
    }
  }
  catch (e) {
    console.log("IIIIII", e)
    yield put(commonOrderResponse({}))
  }
}

export function* watchCreateSocketConnect() {
  yield takeLatest(SAVE_BOOK, wsSagas);
}

export default function* rootSaga() {
  yield fork(watchCreateSocketConnect);
}