import React, { useState, useEffect, forwardRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable from 'material-table'
import { ThemeProvider, createTheme } from '@mui/material';
import { tableIcons } from './TableUtil';
import AddBox from '@material-ui/icons/AddBox';
import Edit from '@material-ui/icons/Edit';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import { Modal, Button } from 'react-bootstrap'
import { GlobalState } from '../../GlobalState';
import { showSuccessToast, showErrorToast } from './Toasts';
import DeleteModal from './DeleteModal';
import '../UI/CvsAgainstJdTable.css'

const CvsAgainstJdTable = (props) => {

    var moment = require('moment')
    const defaultMaterialTheme = createTheme();
    const { data, handleShowModal, tableRef } = props;
    const navigate = useNavigate();
    //const [tableData, setTableData] = useState([])
    const [selectedItem, setSelectedItem] = useState([])
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const handleShowDeleteModal = () => setShowDeleteModal(true);
    const [deleting, setDeleting] = useState(false)
    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [cvAgainstJdTableData, setAgainstJdTableData] = state.CVAPI.cvAgainstJdTableData;
    const columns = [
        { title: "Rank", render: (rowData) => rowData.tableData.id + 1 },
        { title: "Name", field: "full_name", sorting: false, filtering: false},
        { title: "Email", field: "emails", render: (rowData) => <ul>{rowData.emails.map((email,index) => <li key={index}>{email}</li>)}</ul> },
        { title: "Score", field: "weighted_percentage" },
        { title: "Posted On", field: "createdAt", render: (rowData) => <div>{getDate(rowData)}</div> },
    ]

    const getDate = (d) => {
        return moment(d).format("Do MMMM YYYY")
    }

    return (
        <>
        <DeleteModal showModal={showDeleteModal} handleCloseModal={handleCloseDeleteModal} data={selectedItem} target={"cvAgainstJd"}/>
        <ThemeProvider theme={defaultMaterialTheme}>
            <MaterialTable columns={columns} data={cvAgainstJdTableData} icons={tableIcons} tableRef={tableRef}
                actions={[
                    {
                        icon: () => <AddBox />,
                        tooltip: "Add new row",
                        isFreeAction: true,
                        onClick: (e, data) => handleShowModal(),
                        // isFreeAction:true
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
                    navigate(`/cv/${rowData.CV_ID}`);
                }}
                options={{
                    sorting: true, search: true,
                    searchFieldAlignment: "right", searchAutoFocus: true, searchFieldVariant: "standard",
                    paging: true,
                    pageSize: 5,
                    pageSizeOptions: [],
                    paginationType: "normal", paginationPosition: "bottom", exportButton: true,
                    exportAllData: true, exportFileName: "TableData", addRowPosition: "first", actionsColumnIndex: -1, selection: true,
                    showSelectAllCheckbox: true, showTextRowsSelected: true,
                    columnsButton: true,
                    headerStyle: { background: "#d3d3d3 ", color: "#fff", fontWeight: "bold", fontFamily: 'Open Sans, sans-serif' },
                    actionsColumnIndex: -1,
                    selection: false,
                    rowStyle: (data, index) => index % 2 != 0 ? { background: "#ececec" } : { background: "#00000" }
                      
                }}
                title=""
            />
        </ThemeProvider>
        </>
    )
};

export default CvsAgainstJdTable;
