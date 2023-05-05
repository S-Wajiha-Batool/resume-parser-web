import React, { useState, useContext, useEffect, } from 'react';
import { VictoryChart, VictoryAxis, VictoryBar , VictoryPie, VictoryLabel } from 'victory';
import '../UI/dashboard.css'
import { GlobalState } from '../../GlobalState';
import { Row, Col } from 'react-bootstrap';

import { getAllJdsAPI, getIncreasedJdsAPI, getJdCountForEachDeptAPI } from '../../API/JDAPI';
import { getAllCvsAPI, getIncreasedCvsAPI, getHigestScoringCvsCountAPI, getCvDistributionAPI } from '../../API/CVAPI'
import LoadingSpinner from '../utilities/LoadingSpinner';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import ArrowIndicator from './arrowindicator';
import '../UI/arrowindicator.css'
import Title from '../utilities/Title';

function Dashboard() {

  const state = useContext(GlobalState);
  const [allJDs, setAllJDs] = state.JDAPI.allJDs;
  const [allCvs, setAllCvs] = state.CVAPI.allCvs;
  const [token] = state.UserAPI.token;
  const [isLoadingJds, setIsLoadingJds] = useState(true);
  const [isLoadingCvs, setIsLoadingCvs] = useState(true);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [isLoadingHist, setIsLoadingHist] = useState(true);
  const [isLoadingPie, setIsLoadingPie] = useState(true);
  const [successJds, setSuccessJds] = useState(false);
  const [successCvs, setSuccessCvs] = useState(false);
  const [successCount, setSuccessCount] = useState(false);
  const [successHist, setSuccessHist] = useState(false);
  const [successPie, setSuccessPie] = useState(false);
  const [callbackJd, setCallbackJd] = state.JDAPI.callbackJd;
  const [callbackCv, setCallbackCv] = state.CVAPI.callbackCv;
  const [increasedJds, setIncreasedJds] = useState(0);
  const [increasedCvs, setIncreasedCvs] = useState(0);
  const [count, setCount] = useState(0);
  const [pie, setPie] = useState([]);
  const [hist, setHist] = useState([])

  const maxY = Math.max(...hist.map(dataPoint => dataPoint.y));

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

      const getJdCountForEachDept = async () => {
        try {
          getJdCountForEachDeptAPI(token)
            .then(res => {
              setPie(res.data.data)
              setSuccessPie(true);
            })
            .catch(err => {
              setSuccessPie(false)
              console.log(err.response.data.error.msg)
              if (err.response.data.error.code == 500) {
                showErrorToast("Jd count for each department fetching failed")
              }
            })
            .finally(() => {
              setIsLoadingPie(false);
            })
        }
        catch (err) {
          console.log(err)
          showErrorToast("Jd count for each department fetching failed")
        }

      }
      getJdCountForEachDept()

    }
  }, [token, callbackJd])

  useEffect(() => {
    if (token) {
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

      const getCvDistribution = async () => {
        try {
          getCvDistributionAPI(token)
            .then(res => {
              setHist(res.data.data)
              setSuccessHist(true);
            })
            .catch(err => {
              setSuccessHist(false)
              console.log(err.response.data.error.msg)
              if (err.response.data.error.code == 500) {
                showErrorToast("CV distribution fetching failed")
              }
            })
            .finally(() => {
              setIsLoadingHist(false);
            })
        }
        catch (err) {
          console.log(err)
          showErrorToast("CV distribution fetching failed")
        }
      }
      getCvDistribution()

      const getHigestScoringCvsCount = async () => {
        try {
          getHigestScoringCvsCountAPI(token)
            .then(res => {
              setCount(res.data.data)
              setSuccessCount(true);
            })
            .catch(err => {
              setSuccessCount(false)
              console.log(err.response.data.error.msg)
              if (err.response.data.error.code == 500) {
                showErrorToast("Highest scoring CV count fetching failed")
              }
            })
            .finally(() => {
              setIsLoadingCount(false);
            })
        }
        catch (err) {
          console.log(err)
          showErrorToast("Highest scoring CV count fetching failed")
        }
      }
      getHigestScoringCvsCount()
    }
  }, [token, callbackCv])

  const colorScale = [' #73556E', '#9FA1A6', '#F2AA6B', '#F28F6B', '#D97373', '#00BFFF'];

  if (allJDs.length == 0)
    return (
      <div className='dashboard-container'>
        <div className='text2'> - No Job Descriptions Uploaded - </div>
      </div>
    )

  return (
    <div>
      <Title title={"Dashboard"}/>
      <Row >
        <div className = "box box-jd">
          <h2 className='text1'>Job Descriptions</h2>
          {isLoadingJds ? (<LoadingSpinner />) : successJds ? (
            <>
              <p className='text2'>{allJDs.length}</p>
              <p >
                {increasedJds >= 0 ?
                  (<div>
                    <span className='text3'>{increasedJds.toFixed(2)} % increase since last week</span> <ArrowIndicator value={1} />
                  </div>
                  ) : (
                    <div>
                      <span className='text3'>abs({increasedJds.toFixed(2)}) %</span> <ArrowIndicator value={-1} />
                    </div>)}
              </p>
            </>)
            : (
              'Unable to fetch data'
            )}
        </div>
       
        <div className= "box box-cv">
          <h2 className='text1'>Resumes</h2>
          {isLoadingCvs ? (<LoadingSpinner />) : successCvs ? (
          <>
          <p className='text2'>{allCvs.length}</p>

            <p>{increasedCvs >= 0 ? (
              <div>
                    <span className='text3'>{increasedCvs.toFixed(2)} % increase since last week</span> <ArrowIndicator value={1} />
              </div>
            ) : (
              <div>
                      <span className='text3'>abs({increasedCvs.toFixed(2)}) %</span> <ArrowIndicator value={-1} />
              </div>)}
            </p>
          </>)
            : ('Unable to fetch data'
            )}
        </div>
        <div className = "box box-count">
          <h2 className='text1'>Resumes Scoring greater than 80 %</h2>
          {isLoadingCount ? (<LoadingSpinner />) : successCount ? (
            <p className='text2'>{count}</p>
          )
            : (
              'Unable to fetch data'
            )}
        </div>
      </Row>
      <Row  style={{ marginTop: '-20px' }}>
        <div className = 'histogram-box'>
  <h2 className='text1'>Resumes Score Distribution</h2>
    {isLoadingHist ? (<LoadingSpinner />) : successHist ? (
      <VictoryChart domainPadding={{ x: 20 }}>
        <VictoryAxis
          style={{
            axis: { stroke: "black", strokeWidth: 2.5 },
            tickLabels: { 
              fontSize: 8,
              //textAnchor: 'e',
            },
            axisLabel: { 
              fontSize: 12,
            }
          }}
          label="Percentage"
          scale={{ x: "linear", y: "linear", yDomain: [0, maxY] }}
          //tickValues={['0-10%', '20-30%', '40-50%', '60-70%', '80-90%', ' 90-100%' ]}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: "black", strokeWidth: 2 },
            axisLabel: { 
              fontSize: 12, 
              padding: '0 40px' 
            }
          }}
          label="Count"
        />
        <VictoryBar
          data={hist}
          x="x"
          y="y"
          style={{ data: { fill: 'lightgray' } }}
          barRatio={0.7}
        />
      </VictoryChart>
    )
      : (
        'Unable to fetch data'
      )}
      </div>
      <div className='pie-chart-box'>
          <h2 className='text1'>Department-wise Job Descriptions</h2>
        
            {isLoadingPie ? (<LoadingSpinner />) : successPie ? (
              <VictoryPie  data={pie} colorScale={colorScale}/>
            )
              : (
                'Unable to fetch data'
              )}
        </div>
      </Row>
      </div>
    
  )

}

export default Dashboard;