import React, { useState, useContext, useEffect } from 'react';
import ReusableTable from '../utilities/ReuseableTable';
import '../UI/HomePage.css';
import { useNavigate } from 'react-router-dom';
import { GlobalState } from '../../GlobalState';
import { getAllJDsAPI } from '../../API/JDAPI'
import axios from 'axios'
import LoadingSpinner from '../utilities/LoadingSpinner';


function HomePage() {

    const state = useContext(GlobalState);
    const [allJDs, setAllJDs] = state.JDAPI.allJDs;
    const [token] = state.UserAPI.token;
    console.log(allJDs)
    const [isLoading, setIsLoading] = useState(true);
    const [success, setSuccess] = useState(false);
console.log('loading: ' + isLoading);
console.log('success: ' + success);

    useEffect(() => {
        const getAllJDs = async () => {
            try {
                //getAllJDsAPI(token)
                await axios.get('https://jsonplaceholder.typicode.com/posts')
                    .then(res => {
                        console.log(res.data)
                        setAllJDs(res.data)
                        console.log(allJDs)
                        setSuccess(true);
                    })
                    .catch(err => {
                        console.log(err.response.data)
                        alert(err.response.data.error.msg)
                    })
                    .finally(() => {
                        setIsLoading(false);
                    })
            } catch (err) {
                alert(err.response.data.error.msg)
            }
        }
        getAllJDs()
    }, [])



    ////// will replace createData and rows with actual data
    // function createData(number, item, qty, price, temp) {
    //     return { number, item, qty, price, temp};
    //   }

    // const rows = fetch('http://localhost:5000/api/jobs').then(res => res.json()).then(data => {
    //     console.log(data);
    //     return data;
    // });

    //   const rows = [
    //     createData(1, "Apple", 5, 3,"temp"),
    //     createData(2, "Orange", 2, 2,"temp"),
    //     createData(3, "Grapes", 3, 1,"temp"),
    //     createData(4, "Tomato", 2, 1.6,"temp"),
    //     createData(5, "Mango", 1.5, 4,"temp")
    //   ];

    // const [data, setData] = useState(rows);
    // console.log(data);

    //if (isLoading) return null

    return (
            isLoading ? <LoadingSpinner />: 
            success ? <div>
            <h1 className='heading-h1'>Job Descriptions</h1>
                <div>
                    <ReusableTable
                        className='table'
                        data={allJDs}
                    />
                </div>
            </div> : null      
    )
}

export default HomePage;
