import React, { useEffect, useState, useCallback } from 'react'
import { connect, useSelector, useDispatch } from 'react-redux'
import styled from "styled-components"
import { throttle } from 'lodash'
import { styled as muiStyled } from '@mui/material/styles';
import { MdZoomIn, MdZoomOut } from 'react-icons/md'
import numberWithCommas from '../../common/format-number';
import { commonOrderResponse, saveBook } from "./../../store/actions";

// mui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Table, TableBody, TableHead, TableRow } from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

const PRECESION = ["P0", "P1"];

const OrderBook = (props) => {
  const [precesion, setPrecision] = useState(0)
  const [scale, setScale] = useState(1.0)
  const decPrecision = () => precesion > 0 && setPrecision((precesion + PRECESION.length - 1) % PRECESION.length)
  const incPrecision = () => precesion < 4 && setPrecision((precesion + 1) % PRECESION.length)
  const decScale = () => setScale(scale + 0.1)
  const incScale = () => setScale(scale - 0.1)



  const { orderbook, connectionStatus } = useSelector(state => {
    return state.orderBook
  })
  const dispatch = useDispatch();
  const { bids, asks } = orderbook

  const [connectionStatuss, setConnectionStatus] = useState(true)

  const [tabValue, setTabValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const startConnection = () => !connectionStatus && dispatch(saveBook({ connectionStatus: true, callback }))
  const stopConnection = () => connectionStatus && dispatch(saveBook({ connectionStatus: false, callback }))
  const callback = (data) => {
    dispatch(commonOrderResponse({ ...data }))
  }
  const prec = precesion % PRECESION.length
  useEffect(() => {
    dispatch(saveBook({ connectionStatus, callback }))
  }, [connectionStatus])

  const _asks = asks && Object.keys(asks).slice(0, 21).reduce((acc, k, i) => {
    const total = Object.keys(asks).slice(0, i + 1).reduce((t, i) => {
      t = t + asks[i].amount
      return t
    }, 0)
    const item = asks[k]
    acc[k] = { ...item, total }
    return acc
  }, {})
  const maxAsksTotal = Object.keys(_asks).reduce((t, i) => {
    if (t < _asks[i].total) {
      return _asks[i].total
    }
    else {
      return t
    }
  }, 0)
  const _bids = bids && Object.keys(bids).slice(0, 21).reduce((acc, k, i) => {
    const total = Object.keys(bids).slice(0, i + 1).reduce((t, i) => {
      t = t + bids[i].amount
      return t
    }, 0)
    const item = bids[k]
    acc[k] = { ...item, total }
    return acc
  }, {})
  const maxBidsTotal = Object.keys(_bids).reduce((t, i) => {
    if (t < _bids[i].total) {
      return _bids[i].total
    }
    else {
      return t
    }
  }, 0);

  const StyledTableCell = muiStyled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      paddingTop: 1,
      paddingBottom: 1,
      color: theme.palette.common.white,
    },
  }));

  const StyledTableRow = muiStyled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const BuyBook = () => {
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell>Amount</StyledTableCell>
            <StyledTableCell>Price</StyledTableCell>
            <StyledTableCell>Total</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {_bids && Object.keys(_bids).map((k, i) => {
            const item = _bids[k]
            const { cnt, amount, price, total } = item
            const percentage = ((total * 100) / (maxBidsTotal * scale))
            return (
              <StyledTableRow
                key={`book-${cnt}${amount}${price}${total}`}
              >
                <StyledTableCell style={{
                  backgroundImage: `linear-gradient(to right, #314432 ${percentage}%, #1b262d 0%)`
                }}>{amount.toFixed(2)}</StyledTableCell>
                <StyledTableCell>{numberWithCommas(price.toFixed(prec))}</StyledTableCell>
                <StyledTableCell className="total">{total.toFixed(2)}</StyledTableCell>
              </StyledTableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }
  const SellBook = () => {
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell>Amount</StyledTableCell>
            <StyledTableCell>Price</StyledTableCell>
            <StyledTableCell>Total</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {_asks && Object.keys(_asks).map((k, i) => {
            const item = _asks[k]
            const { cnt, amount, price, total } = item
            const percentage = (total * 100) / (maxAsksTotal * scale)
            return (
              <StyledTableRow key={`book-${cnt}${amount}${price}${total}`}>
                <StyledTableCell style={{
                  backgroundImage: `linear-gradient(to right, #402c33 ${percentage}%, #1b262d 0%)`
                }}>{amount.toFixed(2)}</StyledTableCell>
                <StyledTableCell>{numberWithCommas(price.toFixed(prec))}</StyledTableCell>
                <StyledTableCell className="total">{total.toFixed(2)}</StyledTableCell>
              </StyledTableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }
  return (
    <div>
      <Panel>
        <Bar>
          <h3>Order Book <span>BTC/USD</span></h3>
          <Tools>
            {!connectionStatus && <Icon><PowerSettingsNewIcon sx={{ color: '#eb0014' }} onClick={startConnection} /></Icon>}
            {connectionStatus && <Icon><PowerSettingsNewIcon sx={{ color: '#90c830' }} onClick={stopConnection} /></Icon>}
            <Icon onClick={incPrecision}> Precision </Icon>
            <Icon onClick={decScale}><MdZoomOut /></Icon>
            <Icon onClick={incScale}><MdZoomIn /></Icon>
          </Tools>
        </Bar>
        <Box sx={{ width: '100%' }}>
          <TabContext value={tabValue}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange}>
                <Tab label="All" sx={{color: '#fff'}} value="1" />
                <Tab label="Buy" sx={{color: '#fff'}} value="2" />
                <Tab label="Sell" sx={{color: '#fff'}} value="3" />
              </TabList>
            </Box>
            <TabPanel value="1">
              <Row>
                <Col><BuyBook /></Col>
                <Col><SellBook /></Col>
              </Row>
            </TabPanel>
            <TabPanel value="2"><BuyBook /></TabPanel>
            <TabPanel value="3"><SellBook /></TabPanel>
          </TabContext>
        </Box>
        {/* <Sides>
          <Side>
            <thead>
              <Row>
                <Col className="count">Count</Col>
                <Col>Amount</Col>
                <Col className="total">Total</Col>
                <Col>Price</Col>
              </Row>
            </thead>
            <tbody>
              {_bids && Object.keys(_bids).map((k, i) => {
                const item = _bids[k]
                const { cnt, amount, price, total } = item
                const percentage = ((total * 100) / (maxBidsTotal * scale))
                return (
                  <Row
                    key={`book-${cnt}${amount}${price}${total}`}
                    style={{
                      backgroundImage: `linear-gradient(to left, #314432 ${percentage}%, #1b262d 0%)`
                    }}>
                    <Col className="count">{cnt}</Col>
                    <Col>{amount.toFixed(2)}</Col>
                    <Col className="total">{total.toFixed(2)}</Col>
                    <Col>{numberWithCommas(price.toFixed(prec))}</Col>
                  </Row>
                )
              })}
            </tbody>
          </Side>
          <Side>
            <thead>
              <Row>
                <Col>Price</Col>
                <Col className="total">Total</Col>
                <Col>Amount</Col>
                <Col className="count">Count</Col>
              </Row>
            </thead>
            <tbody>
              {_asks && Object.keys(_asks).map((k, i) => {
                const item = _asks[k]
                const { cnt, amount, price, total } = item
                const percentage = (total * 100) / (maxAsksTotal * scale)
                return (
                  <Row style={{
                    backgroundImage: `linear-gradient(to right, #402c33 ${percentage}%, #1b262d 0%)`
                  }}>
                    <Col>{numberWithCommas(price.toFixed(prec))}</Col>
                    <Col className="total">{total.toFixed(2)}</Col>
                    <Col>{amount.toFixed(2)}</Col>
                    <Col className="count">{cnt}</Col>
                  </Row>
                )
              })}
            </tbody>
          </Side>
        </Sides> */}
      </Panel>
    </div>
  )
}

export const Panel = styled.div`
  background-color: #1b262d;
  flex-grow:0;
  display: flex;
  flex-flow: column;
  width:645px;
  margin:5px;
  padding:5px;
  box-sizing:border-box;
  -webkit-touch-callout: none;
    -webkit-user-select: none;
     -khtml-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
`;

export const Sides = styled.div`
  display:flex;
  flex-basis:100%;
  flex-flow:row nowrap;
`;
export const Side = styled.table`
border-spacing:0px;
flex-basis:50%;
width:calc(50% - 2px);
box-sizing:border-box;
margin:0px 1px;
thead {
  td {
    text-transform:uppercase;
    font-size:12px;
    color:#aaa!important;
  }
}
`;

export const Row = styled.tr`
  background-repeat:no-repeat;
  background-size:100% 100%;
  display: flex;
  td.count{
    text-align:center;
  }
`;
export const Col = styled.td`
  color:#F0F0f0;
  padding:1px 10px;
  flex:1;
  font:normal 14px Arial;
  text-align:right;
            `;

export const Bar = styled.div`
  display:flex;
  flex-flow:row;
  justify-content:space-between;
  align-items:start;
  border-bottom:1px solid #555;
  height:30px;
  padding-bottom:5px;
  margin-bottom:10px;
  h3 {
    padding:10px 0px 0px 20px;
    margin:0px;
    font:normal 16px Arial!important;
    font-weight:normal;
    justify-self:flex-start;
    span {
      color:#888;
      font-size:16px;
    }
  }
`;
export const Tools = styled.div`
display:flex;
flex-flow:row;
justify-content: flex-end;
`;
export const Icon = styled.div`
  display:flex;
  flex-grow:0;
  padding:10px;
  font:normal 15px Arial; 
  svg {
    font-size:20px;
  }
`;
export default OrderBook
