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
  const [isLoadingJds, setIsLoadingJds] = useState(true);
  const [isLoadingCvs, setIsLoadingCvs] = useState(true);
  const [isLoadingPercent, setIsLoadingPercent] = useState(true);
  const [isLoadingBar, setIsLoadingBar] = useState(true);
  const [isLoadingPie, setIsLoadingPie] = useState(true);
  const [successJds, setSuccessJds] = useState(false);
  const [successCvs, setSuccessCvs] = useState(false);
  const [successPercent, setSuccessPercent] = useState(false);
  const [successBar, setSuccessBar] = useState(false);
  const [successPie, setSuccessPie] = useState(false);
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
              try {
                getIncreasedJdsAPI(token)
                  .then(res => {
                    console.log(res.data)
                    setIncreasedJds(res.data.data)
                    setSuccessJds(true);
                  })
                  .catch(err => {
                    setSuccessJds(false)
                    console.log(err.response.data.error.msg)
                    if (err.response.data.error.code == 500) {
                      showErrorToast("JD increase fetching failed")
                    }
                  })
                  .finally(() => {
                    setIsLoadingJds(false);
                  })
              }
              catch (err) {
                console.log(err)
                showErrorToast("JD increase fetching failed")
              }
              setSuccessJds(true);
            })
            .catch(err => {
              setSuccessJds(false)
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
              setAllCvs(res.data.data.all_cvs)
              setSuccessCvs(true);
              try {
                getIncreasedCvsAPI(token)
                  .then(res => {
                    console.log(res.data)
                    setIncreasedCvs(res.data.data)
                    setSuccessCvs(true);
                  })
                  .catch(err => {
                    setSuccessCvs(false)
                    console.log(err.response.data.error.msg)
                    if (err.response.data.error.code == 500) {
                      showErrorToast("CV increase fetching failed")
                    }
                  })
                  .finally(() => {
                    setIsLoadingCvs(false);
                  })
              }
              catch (err) {
                console.log(err)
                showErrorToast("CV increase fetching failed")
              }
            })
            .catch(err => {
              setSuccessCvs(false)
              console.log(err.response.data.error.msg)
              if (err.response.data.error.code == 500) {
                showErrorToast("CV fetching failed")
              }
            })
          // .finally(() => {
          //     setIsLoading(false);
          // })
        }
        catch (err) {
          console.log(err)
          showErrorToast("CV fetching failed")
        }

      }
      getallCVs()
    }



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
    <div>
      <div className="boxes-container">
        <div className="box">
          <h2>Job Descriptions</h2>
          {isLoadingJds ? <LoadingSpinner /> : successJds ? <><p>{allJDs.length}</p>
            <p>{increasedJds > 0 ? <span style={{ backgroundColor: "green" }}>{increasedJds} %</span> : <span style={{ backgroundColor: "red" }}>abs({increasedJds}) %</span>}</p></>
            : 'Unable to fetch data'
          }
        </div>

        <div className="box">
          <h2>Resumes</h2>
          {isLoadingCvs ? <LoadingSpinner /> : successCvs ? <><p>{allCvs.length}</p>
            <p>{increasedCvs > 0 ? <span style={{ backgroundColor: "green" }}>{increasedCvs} %</span> : <span style={{ backgroundColor: "red" }}>abs({increasedCvs}) %</span>}</p></>
            : 'Unable to fetch data'
          }
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
  )

}

export default Dashboard;