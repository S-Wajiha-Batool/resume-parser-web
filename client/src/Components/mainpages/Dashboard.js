import React, { useState, useContext, useEffect, } from 'react';
import { VictoryChart, VictoryAxis, VictoryBar, VictoryPie} from 'victory';
import '../UI/dashboard.css'
import { GlobalState } from '../../GlobalState';
import { getAllJdsAPI, getIncreasedJdsAPI, getJdCountForEachDeptAPI } from '../../API/JDAPI';
import { getAllCvsAPI, getIncreasedCvsAPI, getMedianAPI, getCvDistributionAPI } from '../../API/CVAPI'
import LoadingSpinner from '../utilities/LoadingSpinner';
import { showErrorToast } from '../utilities/Toasts';
import '../UI/arrowindicator.css'
import Title from '../utilities/Title';
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded';
import SouthEastRoundedIcon from '@mui/icons-material/SouthEastRounded';
import JD_icon from '../images/job-description-2.png'
import CV_icon from '../images/cv-2.png'
import count_icon from '../images/curriculum-vitae-2.png'
import { Doughnut } from 'react-chartjs-2';

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
  const [successMedian, setSuccessMedian] = useState(false);
  const [successHist, setSuccessHist] = useState(false);
  const [successPie, setSuccessPie] = useState(false);
  const [callbackJd, setCallbackJd] = state.JDAPI.callbackJd;
  const [callbackCv, setCallbackCv] = state.CVAPI.callbackCv;
  const [increasedJds, setIncreasedJds] = useState(0);
  const [increasedCvs, setIncreasedCvs] = useState(0);
  const [count, setCount] = useState(0);
  const [median, setMedian] = useState(0);
  const [pie, setPie] = useState([]);
  const [hist, setHist] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  const maxY = Math.max(...hist.map(dataPoint => dataPoint.y));

  useEffect(() => {
    if (!isLoadingJds, !isLoadingCvs, !isLoadingCount, !isLoadingHist, !isLoadingPie)
      setIsLoading(false)
  }, [isLoadingJds, isLoadingCvs, isLoadingCount, isLoadingHist, isLoadingPie])

  useEffect(() => {
    if (successJds, successCvs, successMedian, successHist, successPie)
      setSuccess(true)
  }, [successJds, successCvs, successMedian, successHist, successPie])

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
                      //showErrorToast("JD increase fetching failed")
                    }
                  })
              }
              catch (err) {
                console.log(err)
                //showErrorToast("JD increase fetching failed")
              }
              setSuccessJds(true);
              setIsLoadingJds(false)
            })
            .catch(err => {
              setSuccessJds(false)
              setIsLoadingJds(false)
              console.log(err.response.data.error.msg)
              if (err.response.data.error.code == 500) {
                //showErrorToast("JD fetching failed")
              }
            })
          // .finally(() => {
          //     setIsLoading(false);
          // })
        }
        catch (err) {
          console.log(err)
          //showErrorToast("JD fetching failed")
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
                //showErrorToast("Jd count for each department fetching failed")
              }
            })
            .finally(() => {
              setIsLoadingPie(false);
            })
        }
        catch (err) {
          console.log(err)
          //showErrorToast("Jd count for each department fetching failed")
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
              try {
                getIncreasedCvsAPI(token)
                  .then(res => {
                    console.log(res.data)
                    setIncreasedCvs(res.data.data)
                    setSuccessCvs(true);
                  })
                  .catch(err => {
                    setSuccessCvs(false)
                    setIsLoadingCvs(false);
                    console.log(err.response.data.error.msg)
                    if (err.response.data.error.code == 500) {
                      //showErrorToast("CV increase fetching failed")
                    }
                  })
              }
              catch (err) {
                console.log(err)
                //showErrorToast("CV increase fetching failed")
              }
              setSuccessCvs(true);
              setIsLoadingCvs(false)
            })
            .catch(err => {
              setSuccessCvs(false)
              setIsLoadingCvs(false);
              console.log(err.response.data.error.msg)
              if (err.response.data.error.code == 500) {
                //showErrorToast("CV fetching failed")
              }                    
            })
          // .finally(() => {
          //     setIsLoading(false);
          // })
        }
        catch (err) {
          console.log(err)
          //showErrorToast("CV fetching failed")
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
                //showErrorToast("CV distribution fetching failed")
              }
            })
            .finally(() => {
              setIsLoadingHist(false);
            })
        }
        catch (err) {
          console.log(err)
          //showErrorToast("CV distribution fetching failed")
        }
      }
      getCvDistribution()

      const getMedian = async () => {
        try {
          getMedianAPI(token)
            .then(res => {
              setCount(res.data.data.count)
              setMedian(res.data.data.median)
              setSuccessMedian(true);
            })
            .catch(err => {
              setSuccessMedian(false)
              console.log(err.response.data.error.msg)
              if (err.response.data.error.code == 500) {
                //showErrorToast("Median fetching failed")
              }
            })
            .finally(() => {
              setIsLoadingCount(false);
            })
        }
        catch (err) {
          console.log(err)
          //showErrorToast("Median fetching failed")
        }
      }
      getMedian()
    }
  }, [token, callbackCv])

  const colorScale = [' #73556E', '#9FA1A6', '#F2AA6B', '#F28F6B', '#D97373', '#283555'];



  return (
    isLoading ?
      <LoadingSpinner /> : 

        <div className='dashboard-container'>
          <div className='page-title'><Title title={"Dashboard"}/></div>          
          <div className='cont'>
            <div className='row-1' >
              <div className="box-jd">
                <div className='title-row'>
                  <h2 className='text1'>Job Descriptions</h2>
                  <span><img className='card-icon' src={JD_icon} /></span>
                </div>
                {isLoadingJds ? (<LoadingSpinner />) : successJds ? (
                  <>
                    <p className='text2'>{allJDs.length}</p>
                    <p >
                      {increasedJds >= 0 ?
                        (<div className='inc-dec'>
                          <span className='text3'><span style={{ color: "#51b000" }}>{increasedJds.toFixed(1)} % <NorthEastRoundedIcon fontSize='small' /></span> increase since last week</span>
                        </div>
                        ) : (
                          <div className='inc-dec'>
                            <span className='text3'><span style={{ color: "#c72800" }}>{Math.abs(increasedJds).toFixed(1)} % <SouthEastRoundedIcon fontSize="small" /> </span>decrease since last week</span>
                          </div>)}
                    </p>
                  </>)
                  : (
                    'Unable to fetch data'
                  )}
              </div>

              <div className="box-cv">
                <div className='title-row'>
                  <h2 className='text1'>CVs</h2>
                  <span><img className='card-icon' src={CV_icon} /></span>
                </div>
                {isLoadingCvs ? (<LoadingSpinner />) : successCvs ? (
                  <>
                    <p className='text2'>{allCvs.length}</p>

                    <p>{increasedCvs >= 0 ? (
                      <div className='inc-dec'>
                        <span className='text3'><span style={{ color: "#51b000" }}>{increasedCvs.toFixed(1)} % <NorthEastRoundedIcon fontSize='small' /></span> increase since last week</span>
                      </div>
                    ) : (
                      <div className='inc-dec'>
                        <span className='text3'><span style={{ color: "#c72800" }}>{Math.abs(increasedCvs).toFixed(1)} % <SouthEastRoundedIcon fontSize="small" /> </span>decrease since last week</span>
                      </div>)}
                    </p>
                  </>)
                  : ('Unable to fetch data'
                  )}
              </div>
              <div className="box-count">
                <div className='title-row'>
                  <h2 className='text1'>Score Median Overview</h2>
                  <span><img className='card-icon' src={count_icon} /></span>
                </div>
                {isLoadingCount ? (<LoadingSpinner />) : successMedian ? (
                  <>
                    <p className='text2'>{median}</p>
                    <div className='text3'>{count} CVs scoring more than median</div>
                  </>
                )
                  : (
                    'Unable to fetch data'
                  )}
              </div>
            </div>
            <div className='row-2'>
              <div className='histogram-box'>
                <h2 className='text1'>Resumes Score Distribution</h2>
                {isLoadingHist ? (<LoadingSpinner />) : successHist ? (
                  <VictoryChart domainPadding={{ x: 12 }}>
                    <VictoryAxis
                      style={{
                        axis: { stroke: "black", strokeWidth: 2.5 },
                        tickLabels: {
                          fontSize: 6,
                          //textAnchor: 'e',
                        },
                        axisLabel: {
                          fontSize: 10,
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
                        tickLabels: {
                          fontSize: 6
                        },
                        axisLabel: {
                          fontSize: 10,
                        }
                      }}
                      label="Count"
                    />
                    <VictoryBar
                      data={hist}
                      x="x"
                      y="y"
                      style={{ data: { fill: '#f5ab35' } }}
                      barRatio={0.6}
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
                  <VictoryPie data={pie} colorScale={colorScale}  innerRadius={100} width={600}/>
                )
                  : (
                    'Unable to fetch data'
                  )}
              </div>
            </div>
          </div>
        </div>

  )

}

export default Dashboard;