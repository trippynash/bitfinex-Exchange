import React from 'react';
import { Provider } from 'react-redux'
import { configureStore } from './store'
import OrderBook from './components/order-book'
import Ticker from './components/ticker'
import Trades from './components/trades'
import styled from "styled-components"
import './App.css';

function App() {
  return (
    <Provider store={configureStore()}>
        <h1>Bitfinex Demo</h1>
      <Container>
        <Side>
          <Ticker />
          <Trades />
        </Side>
        <OrderBook />
      </Container>
    </Provider>
  )
}

export const Side = styled.div`
  display: flex;
  flex-flow: column;
`;
export const Container = styled.div`
  display: flex;
  flex-flow: row;
`;
export default App;

