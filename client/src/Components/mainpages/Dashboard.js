import React, { useState, useContext } from 'react';
import { VictoryChart, VictoryAxis, VictoryBar } from 'victory';
import {} from '../UI/dashboard.css'

function Dashboard () {

    const data = [
        { x: '0-10%', y: 5 },
        { x: '10-20%', y: 10 },
        { x: '20-30%', y: 15 },
        { x: '30-40%', y: 32 },
        { x: '40-50%', y: 25 },
        { x: '50-60%', y: 30 },
        { x: '60-70%', y: 28 },
        { x: '70-80%', y: 10 },
        { x: '80-90%', y: 17 },
        { x: '90-100%', y: 30 }
      ];
      
    return(
<div>
        <div className="boxes-container">
        <div className="box">
            <h2>Box 1</h2>
                <p>Data for Box 1</p>
        </div>
        <div className="box">
         <h2>Box 2</h2>
            <p>Data for Box 2</p>
            </div>
        <div className="box">
         <h2>Box 3</h2>
         <p>Data for Box 3</p>
        </div>
        </div>
    <div className='histogram-container'>
        <VictoryChart>
      <VictoryAxis
        label="Percentage"
        tickValues={['0-10%', '10-20%', '20-30%', '30-40%', '40-50%', '50-60%', '60-70%', '70-80%', '80-90%', '90-100%']}
        style = {{ tickLabels: { fontSize: 10 } }}
      />
      <VictoryAxis
        dependentAxis
        label="Numbers"
      />
      <VictoryBar
        data={data}
        x="x"
        y="y"
        barWidth={17}
        style={{ data: { fill: 'blue' } } } 
      />
    </VictoryChart>
    </div>
    <div className="box-bottom">
      {/* Box content */}
    </div>
    </div>             
    )

}

export default Dashboard;