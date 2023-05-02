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
//import '../UI/CvTable.css'
import Theme from '../theme/theme'
import { orange } from '@mui/material/colors';

const customTheme = createTheme({
    palette: {
        primary: {
          main: '#00ADEF',
        },
        secondary: {
          main: '#FFC107',
        },
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
      },
      typography: {
        fontFamily: 'Roboto, sans-serif',
        fontSize: 14,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700,
      },
      overrides: {
        MuiTableCell: {
          root: {
            borderBottom: 'none',
          },
          head: {
            fontWeight: 'bold',
          },
        },
        MuiTable: {
          root: {
            borderCollapse: 'separate',
            borderSpacing: '0 10px',
          },
        },
        MuiTableSortLabel: {
          active: {
            color: '#00ADEF',
          },
        },
      },
  });

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
        { title: "Name", field: "full_name", sorting: false, filtering: false, cellStyle: { background: "#333333" }, headerStyle: { color: "black" } },
        {
            title: "Experience", field: "total_experience",
            searchable: true, export: true
        },
        {
            title: "Links", field: "links", render: (rowData) => <ul>
                {rowData.links.map((name, index) => <li  key={index}><a href={name}>{name}</a></li>)}
            </ul>, searchable: true, export: true
           
        },
        { title: "Posted On", field: "createdAt", render: (rowData) => <div>{getDate(rowData)}</div> },
    ]

    const getDate = (d) => {
        return moment(d).format("Do MMMM YYYY")
    }
    
    return (
        <div className="text1">
            <DeleteModal showModal={showDeleteModal} handleCloseModal={handleCloseDeleteModal} data={selectedItem} target={"cv"}/>
            <ThemeProvider theme={customTheme}>
                <MaterialTable columns={columns} data={tableData} icons={tableIcons}
                    actions={[
                        // {
                        //     icon: () => <AddBox />,
                        //     tooltip: "Add new row",
                        //     isFreeAction: true,
                        //     onClick: (e, data) => handleShowModal(),
                        //     // isFreeAction:true
                        // },
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
                        sorting: true, search: true,
                        searchFieldAlignment: "right", searchAutoFocus: true, searchFieldVariant: "standard",
                        filtering: false, paging: true, pageSize: 5,
                        paginationType: "stepped", showFirstLastPageButtons: false, paginationPosition: "bottom", exportButton: true,
                        exportAllData: true, exportFileName: "TableData", actionsColumnIndex: -1, selection: true,
                        //showSelectAllCheckbox: true, showTextRowsSelected: true,
                        selectionProps: rowData => ({
                            // disabled: rowData.age == null,
                            // color:"primary"
                        }),
                        grouping: false,
                        columnsButton: true,
                        rowStyle: (data, index) => index % 2 === 0 ? { background: "#f5f5f5" } : null,
                        //headerStyle: { background: "#f44336", color: "#fff" },
                        actionsColumnIndex: -1,
                        selection: false,
                    }}
                    
                    title=""
                   
                />
            </ThemeProvider>
        </div>
    )
};

export default CvTable;
