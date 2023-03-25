import React, { useState, useContext, useEffect, } from 'react';
import { VictoryChart, VictoryAxis, VictoryBar } from 'victory';
import '../UI/dashboard.css'
import { GlobalState } from '../../GlobalState';
import { getAllJdsAPI, getIncreasedJdsAPI } from '../../API/JDAPI';
import { getAllCvsAPI, getIncreasedCvsAPI } from '../../API/CVAPI'
import LoadingSpinner from '../utilities/LoadingSpinner';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';


function Dashboard() {

  const state = useContext(GlobalState);
  const [allJDs, setAllJDs] = state.JDAPI.allJDs;
  const [allCvs, setAllCvs] = state.CVAPI.allCvs;
  const [token] = state.UserAPI.token;
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [callbackJd, setCallbackJd] = state.JDAPI.callbackJd;
  const [callbackCv, setCallbackCv] = state.CVAPI.callbackCv;
  const [increasedJds, setIncreasedJds] = useState(0);
  const [increasedCvs, setIncreasedCvs] = useState(0);

  useEffect(() => {
    if (token) {
      const getAllJds = async () => {
        try {
          getAllJdsAPI(token)
            .then(res => {
              console.log(res.data)
              setAllJDs(res.data.data.all_jds)
              setSuccess(true);
            })
            .catch(err => {
              setSuccess(false)
              console.log(err.response.data.error.msg)
              if (err.response.data.error.code == 500) {
                showErrorToast("JD fetching failed")
              }
            })
          // .finally(() => {
          //     setIsLoading(false);
          // })
        }
        catch (err) {
          console.log(err)
          showErrorToast("JD fetching failed")
        }

      }
      getAllJds()

      const getallCVs = async () => {
        try {
          getAllCvsAPI(token)
            .then(res => {
              console.log(res.data)
              setAllCvs(res.data.data.all_cvs)
              console.log(allCvs)
              setSuccess(true);
            })
            .catch(err => {
              setSuccess(false)
              console.log(err.response.data.error.msg)
              if (err.response.data.error.code == 500) {
                showErrorToast("CV fetching failed")
              }
            })
          // .finally(() => {
          //     setIsLoading(false);
          // })
        }
        catch(err) {
          console.log(err)
          showErrorToast("CV fetching failed")
        }

      }
      getallCVs()
    }

    const getIncreasedJds = async () => {
      try {
        getIncreasedJdsAPI(token)
          .then(res => {
            console.log(res.data)
            setIncreasedJds(res.data.data)
            setSuccess(true);
          })
          .catch(err => {
            setSuccess(false)
            console.log(err.response.data.error.msg)
            if (err.response.data.error.code == 500) {
              showErrorToast("JD increase fetching failed")
            }
          })
        // .finally(() => {
        //     setIsLoading(false);
        // })
      }
      catch (err) {
        console.log(err)
        showErrorToast("JD increase fetching failed")
      }

    }
    getIncreasedJds()

    const getIncreasedCvs = async () => {
      try {
        getIncreasedCvsAPI(token)
          .then(res => {
            console.log(res.data)
            setIncreasedCvs(res.data.data)
            setSuccess(true);
          })
          .catch(err => {
            setSuccess(false)
            console.log(err.response.data.error.msg)
            if (err.response.data.error.code == 500) {
              showErrorToast("CV increase fetching failed")
            }
          })
        // .finally(() => {
        //     setIsLoading(false);
        // })
      }
      catch (err) {
        console.log(err)
        showErrorToast("CV increase fetching failed")
      }

    }
    getIncreasedCvs()

    setIsLoading(false)

  }, [token, callbackJd, callbackCv])

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

  return (
    isLoading ? 
    <LoadingSpinner/>:
    success ? 
    <div>
      <div className="boxes-container">
        <div className="box">
          <h2>Job Descriptions</h2>
          <p>{allJDs.length}</p>
          <p>{increasedJds > 0 ? <span style={{backgroundColor:"green"}}>{increasedJds} %</span>: <span style={{backgroundColor:"red"}}>abs({increasedJds}) %</span>}</p>
        </div>

        <div className="box">
          <h2>Resumes</h2>
          <p>{allCvs.length}</p>
          <p>{increasedCvs > 0 ? <span style={{backgroundColor:"green"}}>{increasedCvs} %</span>: <span style={{backgroundColor:"red"}}>abs({increasedCvs}) %</span>}</p>
        </div>

        <div className="box">
          <h2>CVs Scoring greater than 80 %</h2>
          <p>Data for Box 3</p>
        </div>
      </div>
      <div className='histogram-container'>
        <VictoryChart>
          <VictoryAxis
            label="Percentage"
            tickValues={['0-10%', '10-20%', '20-30%', '30-40%', '40-50%', '50-60%', '60-70%', '70-80%', '80-90%', '90-100%']}
            style={{ tickLabels: { fontSize: 10 } }}
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
            style={{ data: { fill: 'blue' } }}
          />
        </VictoryChart>
      </div>
      <div className="box-bottom">
        {/* Box content */}
      </div>
    </div>
    : 'Error in data fetching'
  )

}

export default Dashboard;