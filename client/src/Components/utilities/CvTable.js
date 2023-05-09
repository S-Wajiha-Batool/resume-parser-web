import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable from 'material-table'
import { ThemeProvider, createTheme } from '@mui/material';
import { tableIcons } from './TableUtil';
import AddBox from '@material-ui/icons/AddBox';
import Edit from '@material-ui/icons/Edit';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import { Modal, Button } from 'react-bootstrap'
import { deleteCVAPI } from '../../API/CVAPI';
import { GlobalState } from '../../GlobalState';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import DeleteModal from './DeleteModal';
import '../UI/CvTable.css'
//import Theme from '../theme/theme'
import { orange } from '@mui/material/colors';

const customTheme = createTheme({});

const CvTable = (props) => {
  var moment = require('moment')
  const defaultMaterialTheme = createTheme();
  const { data, handleShowModal } = props;
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const [isDeleting, setIsDeleting] = useState(false)
  const state = useContext(GlobalState);
  const [tableData, setTableData] = state.CVAPI.tableData
  const [token] = state.UserAPI.token;
  const columns = [
    {
      title: "Name", field: "full_name", sorting: false, filtering: false, cellStyle: {
        fontWeight: "bold", textAlign: 'center',
        verticalAlign: 'middle'
      }, headerStyle: { color: "black" }
    },
    {
      title: "Email", field: "emails", cellStyle: {
          textAlign: 'center',
          verticalAlign: 'middle'
      }, render: (rowData) => { return rowData.emails.length > 0 ? (<div>{rowData.emails[0]}</div>) : <div>-</div> }
  },
  {
    title: "Contact#", field: "phone_number", cellStyle: {
        textAlign: 'center',
        verticalAlign: 'middle'
    }, render: (rowData) => { return rowData.phone_number ? (<div>{rowData.phone_number}</div>) : <div>-</div> }
},
    {
      title: "Links", field: "links", cellStyle: {
        textAlign: 'center',
        verticalAlign: 'middle'
      }, render: (rowData) => <ul>
        {rowData.links.map((name, index) => <li key={index}><a href={name}>{name}</a></li>)}
      </ul>, searchable: true, export: true

    },
    {
      title: "Posted On", field: "createdAt", cellStyle: {
        textAlign: 'center',
        verticalAlign: 'middle'
      }, render: (rowData) => <div>{getDate(rowData.createdAt)}</div>
    },
  ]

  const getDate = (d) => {
    return moment(d).format("Do MMMM YYYY")
  }

  return (
    <div>
      <DeleteModal showModal={showDeleteModal} handleCloseModal={handleCloseDeleteModal} data={selectedItem} target={"cv"} />
      <ThemeProvider theme={customTheme}>
        <MaterialTable columns={columns} data={tableData} icons={tableIcons}
          style={{ fontFamily: 'Open Sans, sans-serif' }}
          actions={[
            {
              icon: () => <DeleteOutline />,
              tooltip: "Delete",
              onClick: (e, rowData) => {
                handleShowDeleteModal();
                setSelectedItem(rowData)
              },
              position: "row"
            }

          ]}

          onRowClick={(event, rowData) => {
            console.log(rowData);
            navigate(`/cv/${rowData._id}`);
          }}
          options={{
            minBodyHeight: "60vh",
            maxBodyHeight: "60vh",
            sorting: true, search: true,
            searchFieldAlignment: "right", searchAutoFocus: true, searchFieldVariant: "standard",
            filtering: false,
            paging: true,
            pageSize: 10,
            pageSizeOptions: [],
            paginationType: "normal",
            showFirstLastPageButtons: false, paginationPosition: "bottom", exportButton: true,
            exportAllData: true, exportFileName: "TableData",
            //showSelectAllCheckbox: true, showTextRowsSelected: true,
            selectionProps: rowData => ({
              // disabled: rowData.age == null,
              // color:"primary"
            }),
            grouping: false,
            columnsButton: true,
            //rowStyle: (data, index) => index % 2 !== 0 ? { background: "#d3d3d3 " } : null,
            rowStyle: { background: "#00000" },
            headerStyle: { background: "#d3d3d3 ", color: "#fff", fontWeight: "bold", fontFamily: 'Open Sans, sans-serif',textAlign: 'center',
            verticalAlign: 'middle'},
            actionsColumnIndex: -1,
            selection: false,
            rowStyle: (data, index) => index % 2 != 0 ? { background: "#ececec" } : null,

          }}
          title=""

        />
      </ThemeProvider>
    </div>
  )

};

export default CvTable;
