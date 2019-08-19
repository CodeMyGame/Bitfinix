import React from 'react';
import './App.css';
import { thisExpression } from '@babel/types';

class App extends React.Component {

  
  constructor() {
    super();
    this.state = {
     CHANNEL_ID:"",
     bid_data:[],
     ask_data:[],
     trades:[]
    };
  }
  componentDidMount() {
   const wss = new WebSocket('wss://api.bitfinex.com/ws/');
   const wss_trade = new WebSocket('wss://api-pub.bitfinex.com/ws/2');
    wss.onmessage = (msg) => {
     // console.log(this.state.bid_data);
      let data  = JSON.parse(msg.data);
      if(Array.isArray(data)){
        if(Array.isArray(data[1])){
        //  console.log("snapshot");
          let snapshot = data[1];
          snapshot.forEach(element => {
            let price = element[0];
            let count = element[1];
            let amount = element[2];
            if(amount>0){
               let bid = this.state.bid_data;
               bid.push(element);
               this.setState({
                bid_data:bid
               })
            }else{
              let ask = this.state.ask_data;
              ask.push(element);
              this.setState({
               ask_data:ask
              })
            }
          });
      

        }else{
          //922453, 10487, 2, 1.19298725 // P,C,A
          let price = data[1];
          let count = data[2];
          let amount = data[3];
          if(count>0){
              if(amount>0){
                  //add update bid
                  let bid_data = this.state.bid_data;
                  for (let i=0;i<bid_data.length;i++) {
                    let element = bid_data[i]
                   // console.log(element)
                    let price = element[0];
                    if(price===data[1]){
                      let updated_bid_data_item = [data[1],data[2],data[3]];
                      let updated_bid_data = this.state.bid_data;
                      updated_bid_data[i]=updated_bid_data_item;
                      this.setState({
                        bid_data:updated_bid_data
                      })
                      break;
                    }
                  
                  }
              }
              if(amount<0){
                let ask_data = this.state.ask_data;
                for (let i=0;i<ask_data.length;i++) {
                  let element = ask_data[i]
                  //console.log(element)
                  let price = element[0];
                  if(price===data[1]){
                    let updated_ask_data_item = [data[1],data[2],data[3]];
                    let updated_ask_data = this.state.ask_data;
                    updated_ask_data[i]=updated_ask_data_item;
                    this.setState({
                      ask_data:updated_ask_data
                    })
                    break;
                  }
                
                }
              }
          }
          if(count===0){
            if(amount===1){
              // let bid_data = this.state.bid_data;
              // for (let i=0;i<bid_data.length;i++) {
              //   let element = bid_data[i]
              //   console.log(element)
              //   let price = element[0];
              //   if(price===data[1]){
              //     let updated_bid_data_item = [];
              //     let updated_bid_data = this.state.bid_data;
              //     updated_bid_data[i]=updated_bid_data_item;
              //     this.setState({
              //       bid_data:updated_bid_data
              //     })
              //     break;
              //   }
              
              // }
            }
            if(amount===-1){
              
            }
        }
         
        }
      }
    }

    let msg = JSON.stringify({ 
      event: 'subscribe', 
      channel: 'book', 
      symbol: 'tBTCUSD',
      prec: 'P0',
      freq: 'F0',
      len: 25 
    })
    wss.onopen = () => wss.send(msg);

    let msg_trade = JSON.stringify({ 
      event: 'subscribe', 
      channel: 'trades', 
      symbol: 'tBTCUSD' 
    })
    wss_trade.onopen = () => wss_trade.send(msg_trade);

    wss_trade.onmessage = (msg) =>{
      let data  = JSON.parse(msg.data);
      console.log(data)
      if(Array.isArray(data)){
        if(Array.isArray(data[1])){
          this.setState({
            trades:data[1]
          })
        }else{
            if(Array.isArray(data[2])){
              let trade_data = data[2];
              let trades = this.state.trades;
              trades.unshift(trade_data);
              trades.pop();
              this.setState({
                trades:trades
              })
            }
        }
      }
     
    }
  }

 msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}
  render() {
    
    return (
        <div style={{ textAlign: "center",float:'left'}}>
  
         <table style={{float:'left'}}>
          <tr>
            <th>COUNT</th>
            <th>AMOUNT</th>
            <th>PRICE</th>
          </tr>
          {
            this.state.bid_data.map((value)=>{
              return(
                <tr>
                  <td>{value[1]}</td>
                  <td>{value[2]}</td>
                  <td>{value[0]}</td>
              </tr>
              );
            })
          }
         
        </table>
        <table style={{float:'left'}}>
          <tr>
            <th>PRICE</th>
            <th>AMOUNT</th>
            <th>COUNT</th>    
          </tr>
          {
            this.state.ask_data.map((value)=>{
              return(
                <tr>
                  <td>{value[0]}</td>
                  <td>{value[2]}</td>
                  <td>{value[1]}</td>
              </tr>
              );
            })
          }
         
        </table>
        <table style={{float:'left',marginLeft:'20px'}}>
          <tr>
            <th>TIME</th>
            <th>PRICE</th>
            <th>AMOUNT</th>    
          </tr>
          {
            this.state.trades.map((value)=>{
              return(
                <tr>
                  <td>{this.msToTime(value[1])}</td>
                  <td>{value[3]}</td>
                  <td>{value[2]}</td>
              </tr>
              );
            })
          }
         
        </table>
        </div>
    );
  }
}

export default App;
