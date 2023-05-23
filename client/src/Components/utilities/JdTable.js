import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable from 'material-table'
import { ThemeProvider, createTheme } from '@mui/material';
import { tableIcons } from './TableUtil';
import AddBox from '@material-ui/icons/AddBox';
import EditOutlined from '@material-ui/icons/EditOutlined';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import { Modal, Button } from 'react-bootstrap'
import { deleteJdAPI } from '../../API/JDAPI';
import { GlobalState } from '../../GlobalState';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Spinner } from 'react-bootstrap';
import EditJdModal from '../utilities/EditJdModal';
import DeleteModal from './DeleteModal';
import SearchIcon from '@material-ui/icons/Search';
import DeleteIcon from '@material-ui/icons/Delete';
import '../UI/JdTable.css'
import Title from './Title';

const JdTable = (props) => {
  var moment = require('moment')
  const defaultMaterialTheme = createTheme();
  const { handleShowModal } = props;
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const state = useContext(GlobalState)
  const [tableData, setTableData] = state.JDAPI.tableData
  const [token] = state.UserAPI.token;
  const [callbackJd, setCallbackJd] = state.JDAPI.callbackJd;

  const [showEditModal, setShowEditModal] = useState(false);
  const handleCloseEditModal = () => setShowEditModal(false);
  const handleShowEditModal = () => setShowEditModal(true);

  const getDate = (d) => {
    return moment(d).format("Do MMMM YYYY")
  }
  
  const columns = [
    { title: "Position", field: "position", sorting: false, cellStyle: { fontWeight: "bold", textAlign: 'center',
    verticalAlign: 'middle', }, headerStyle: { color: "black" }, },
    { title: "Department", field: "department", filterPlaceholder: "filter", cellStyle: {textAlign: 'center',
    verticalAlign: 'middle'} },
    {
      title: "Skills", field: "skills", grouping: false, cellStyle: {textAlign: 'left',
      verticalAlign: 'middle'},
      render: (rowData) => { return getSkills(rowData.skills).length > 0 ? <ul>{getSkills(rowData.skills).map((skill, index) => <li key={index}>{skill}</li>)}</ul> : <div>-</div> },
    },
    {
      title: "Experience", field: "experience", cellStyle: {textAlign: 'center',
      verticalAlign: 'middle'},
      searchable: true, export: true
    },
    {
      title: "Qualification", field: "qualification",cellStyle: {textAlign: 'left',
      verticalAlign: 'middle'}, render: (rowData) => {
        return rowData.qualification && Object.entries(rowData.qualification).length > 0 ?
          <ul>{Object.entries(rowData.qualification).map((option, index) => <li key={index}>{option[1] + " (" + option[0] + ")"}</li>)}</ul>
          :
          <div>-</div>
      }
      , searchable: true, export: true
    },
    {
      title: "Universities", field: "universities", cellStyle: {textAlign: 'center',
      verticalAlign: 'middle'}, render: (rowData) => {
        return rowData.universities && Object.entries(rowData.universities).length > 0 ?
          <ul>{Object.entries(rowData.universities).map((option, index) => <li key={index}>{option[1] + " (" + option[0] + ")"}</li>)}</ul>
          :
          <div>-</div>
      },
      filterPlaceholder: "filter", searchable: true, export: true
    },
    { title: "Posted On", field: "createdAt", cellStyle: {textAlign: 'center',
    verticalAlign: 'middle'}, render: (rowData) => <div >{getDate(rowData.createdAt)}</div> },
  ]

  const getSkills = (skills) => {
    console.log(skills)
    var a = [];
    skills.map(s => {
      a.push(s.skill_name  || s)
    })
    return a;
  }




  return (
    <div>
      {/* edit modal */}
      {showEditModal && (
        <EditJdModal
          showModal={showEditModal}
          handleCloseModal={handleCloseEditModal}
          oldJd={selectedItem}
        />
      )}
      {/* delete modal */}
      <DeleteModal
        showModal={showDeleteModal}
        handleCloseModal={handleCloseDeleteModal}
        data={selectedItem}
        target={"jd"}
      />
      <ThemeProvider theme={defaultMaterialTheme}>
        <MaterialTable
          columns={columns}
          data={tableData}
          icons={tableIcons}
          actions={[
            {
              icon: () => <AddBox />,
              tooltip: "Add new row",
              isFreeAction: true,
              onClick: (e, data) => handleShowModal(),
              // isFreeAction:true
            },
            {
              icon: () => <EditOutlined />,
              tooltip: "Edit",
              onClick: (e, rowData) => {
                handleShowEditModal();
                setSelectedItem(rowData);
              },
              position: "row",
            },
            {
              icon: () => <DeleteOutline />,
              tooltip: "Delete",
              onClick: (e, rowData) => {
                handleShowDeleteModal();
                setSelectedItem(rowData);
              },
              position: "row",
            },
          ]}
          onRowClick={(event, rowData) => {
            console.log(rowData);
            navigate(`/jd/${rowData._id}`);
          }}
          options={{
            minBodyHeight: "60vh",
            maxBodyHeight: "60vh",
            sorting: false,
            search: true,
            searchFieldAlignment: "right", searchAutoFocus: true, searchFieldVariant: "standard",
            filtering: false,
            actionsColumnIndex: -1,
            grouping: false,
            exportAllData: true,
            exportButton: true,
            columnsButton: true,
            paging: true,
            pageSize: 10,
            pageSizeOptions: [],
            paginationType: "normal", paginationPosition: "bottom", exportButton: true,
            showFirstLastPageButtons: false,
            tableLayout: "auto",
            overflowY: "auto",
            headerStyle: { background: "#d3d3d3 ", color: "#fff", fontWeight: "bold", fontFamily: 'Open Sans, sans-serif',textAlign: 'center',
            verticalAlign: 'middle' },
            selection: false,
            rowStyle: (data, index) => index % 2 != 0 ? { background: "#ececec" } : { background: "#00000" },
            
          }}
          title=""
        />
      </ThemeProvider>
    </div>
  );
};

export default JdTable;
