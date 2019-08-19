import React from 'react';
import './App.css';

class App extends React.Component {

  
  constructor() {
    super();
    this.state = {
     CHANNEL_ID:"",
     bid_data:[],
     ask_data:[]
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
                    console.log(element)
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
                  console.log(element)
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

    let msg_trage = JSON.stringify({ 
      event: 'subscribe', 
      channel: 'trades', 
      symbol: 'tBTCUSD' 
    })
    wss_trade.onopen = () => wss_trade.send(msg_trage);

    wss_trade.onmessage = (msg) =>{
      console.log(msg)
    }
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
        <table  >
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
        </div>
    );
  }
}

export default App;
