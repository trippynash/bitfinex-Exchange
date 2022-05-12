import React, { Fragment } from 'react'
import styled from "styled-components"
import { connect, useSelector } from 'react-redux'
import { FaBitcoin } from 'react-icons/fa'
import { FaCaretDown, FaCaretUp } from 'react-icons/fa'
import numberWithCommas from '../../common/format-number'

const Ticker = (props) => {
  const { ticker } = useSelector(state => {
    return state.orderBook
  })
  const empty_ticker = [0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
  const [CHANNEL_ID, [BID, BID_SIZE, ASK, ASK_SIZE, DAILY_CHANGE, DAILY_CHANGE_PERC, LAST_PRICE, VOLUME, HIGH, LOW]] = Array.isArray(ticker) && ticker.length ? ticker : empty_ticker
  return (
    <BtcCardContainer>
      {/* <BitCoinIcon><FaBitcoin /></BitCoinIcon> */}
      {Array.isArray(ticker) && ticker?.length ?
        <BtcCard>
          <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/1040483/btc.png" />
          <BtcCardData>
            <p>Bitcoin (BTC)</p>
            <p>${LAST_PRICE && numberWithCommas(LAST_PRICE.toFixed(1))}<span className={DAILY_CHANGE_PERC < 0 ? `red` : 'green'} style={{ fontSize: '14px', display: 'inline-block', margin: '5px', verticalAlign: 'top' }}>{DAILY_CHANGE_PERC < 0 ? <FaCaretDown /> : <FaCaretUp />}{DAILY_CHANGE_PERC}% <br />{DAILY_CHANGE && numberWithCommas(DAILY_CHANGE.toFixed(2))} USD</span></p>
            <p>Volume ${VOLUME && numberWithCommas(VOLUME.toFixed(2))}</p>
            <p style={{ display: 'flex', flexFlow: 'row', justifyContent: 'space-between', }}><span>Low ${LOW && numberWithCommas(LOW.toFixed(1))}</span><span>High ${HIGH && numberWithCommas(HIGH.toFixed(1))}</span></p>
          </BtcCardData>
        </BtcCard> : null
      }
    </BtcCardContainer>
  )
}


export const BitCoinIcon = styled.div`
  font-size:74px;
  width:60px;
  line-height:0;
  `;
export const BtcCardContainer = styled.div`
  max-width: 70vw;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`
export const BtcCard = styled.div`
  border: 1px solid #102a49;
  box-sizing: border-box;

  box-shadow: 2px 2px 10px #102a49;
  background: #102a49;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding-left: 10px;
  flex: 1 1 45%;
  min-width: 320px;
  margin: 10px;
  transition: 0.5s;
  img {
    width: 25%;
  };
  &:hover {
    transform: translateY(-5px);
    transition: 0.3s;
  }
`
export const BtcCardData = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 35px;
  p {margin: 2px 0px};
  p:nth-of-type(2) {
    font-size: 2em;
    margin: 0;
    span.red { color:red;}
    span.green { color:green;}
  }
`
export default Ticker
