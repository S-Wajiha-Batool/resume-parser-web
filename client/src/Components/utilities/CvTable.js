import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable from 'material-table'
import { ThemeProvider, createTheme } from '@mui/material';
import { tableIcons } from './TableUtil';
import AddBox from '@material-ui/icons/AddBox';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import { GlobalState } from '../../GlobalState';
import DeleteModal from './DeleteModal';
import '../UI/CvTable.css'

const customTheme = createTheme({});

const CvTable = (props) => {
  var moment = require('moment')
  const defaultMaterialTheme = createTheme();
  const { handleShowAddModal } = props;
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
      }, headerStyle: { color: "black" }, render: (rowData) => <div className='render-data-cv'><div className='inner-render-data-cv'>{rowData.full_name}</div></div>
    },
    {
      title: "Email", field: "emails", cellStyle: {
          textAlign: 'center',
          verticalAlign: 'middle'
      }, render: (rowData) => { return rowData.emails.length > 0 ? (<div className="render-data-cv"><div className='inner-render-data-cv'>{rowData.emails[0]}</div></div>) : <div className='render-data-cv'><div className='inner-render-data-cv'>-</div></div> }
  },
  {
    title: "Contact#", field: "phone_number", cellStyle: {
        textAlign: 'center',
        verticalAlign: 'middle'
    }, render: (rowData) => { return rowData.phone_number ? (<div className='render-data-cv'><div className='inner-render-data-cv'>{rowData.phone_number}</div></div>) : <div className="render-data-cv"><div className='inner-render-data-cv'>-</div></div> }
},
    {
      title: "Links", field: "links", cellStyle: {
        textAlign: 'center',
        verticalAlign: 'middle'
      }, render: (rowData) => { return rowData.links.length > 0 ? <div className="render-data-cv"><div className='inner-render-data-cv'><ul>{rowData.links.map((link, index) => <li key={index}><a href={link}>{link}</a></li>)}</ul></div></div> : <div className="render-data-cv"><div className='inner-render-data-cv'>-</div></div> }, searchable: true, export: true

    },
    {
      title: "Posted On", field: "createdAt", cellStyle: {
        textAlign: 'center',
        verticalAlign: 'middle'
      }, render: (rowData) => <div className="render-data-cv"><div className='inner-render-data-cv'>{getDate(rowData.createdAt)}</div></div>
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
              icon: () => <AddBox />,
              tooltip: "Add new row",
              isFreeAction: true,
              onClick: (e, data) =>{
                handleShowAddModal();
              },              
            },
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
            grouping: false,
            columnsButton: true,
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
