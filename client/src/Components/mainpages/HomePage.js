import React, { useState } from 'react';
import ReusableTable from '../ReuseableTable';
//import homepage css file
import './HomePage.css';

function HomePage() {


    ////// will replace createData and rows with actual data
    function createData(number, item, qty, price, temp) {
        return { number, item, qty, price, temp};
      }
    
    // const rows = fetch('http://localhost:5000/api/jobs').then(res => res.json()).then(data => {
    //     console.log(data);
    //     return data;
    // });
      
      const rows = [
        createData(1, "Apple", 5, 3,"temp"),
        createData(2, "Orange", 2, 2,"temp"),
        createData(3, "Grapes", 3, 1,"temp"),
        createData(4, "Tomato", 2, 1.6,"temp"),
        createData(5, "Mango", 1.5, 4,"temp")
      ];
    
    const [rowData, setRowData] = useState(rows);

    return (
        <div>
           <h1 className='heading-h1'>Home Page</h1>
              <div> 
              <ReusableTable 
                className='table'
                data = {rowData}
              />
              </div>
        </div>
    )
}

export default HomePage;
