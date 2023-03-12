import React, { useState, useEffect, forwardRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable from 'material-table'
import { ThemeProvider, createTheme } from '@mui/material';
import { tableIcons } from './TableUtil';
import AddBox from '@material-ui/icons/AddBox';
import Edit from '@material-ui/icons/Edit';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import { Modal, Button } from 'react-bootstrap'
import { deleteCvAgainstJdAPI } from '../../API/CVAPI';
import { GlobalState } from '../../GlobalState';
import { showSuccessToast, showErrorToast } from './Toasts';

const CvsAgainstJdTable = (props) => {

    var moment = require('moment')
    const defaultMaterialTheme = createTheme();
    const { data, handleShowModal, tableRef } = props;
    const navigate = useNavigate();
    //const [tableData, setTableData] = useState([])
    const [selectedItem, setSelectedItem] = useState([])
    const [showDeleteDialogBox, setShowDeleteDialogBox] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const state = useContext(GlobalState);
    const [token] = state.UserAPI.token;
    const [callbackJdDetails, setCallbackJdDetails] = state.JDAPI.callbackJdDetails;
    const [cvAgainstJdTableData, setAgainstJdTableData] = state.CVAPI.cvAgainstJdTableData;
    const columns = [
        { title: "Rank", render: (rowData) => rowData.tableData.id + 1 },
        { title: "Name", field: "full_name", sorting: false, filtering: false, cellStyle: { background: "#009688" }, headerStyle: { color: "#fff" },filterPlaceholder: "filter" },
        { title: "Email", field: "email", filterPlaceholder: "filter" },
        { title: "Score", field: "weighted_percentage", filterPlaceholder: "filter" },
        // { title: "Status", field: "hire_status", filterPlaceholder: "filter" },
        { title: "Posted On", field: "createdAt", render: (rowData) => <div>{getDate(rowData)}</div> },
    ]

    // useEffect(() => {
    //     setTableData(data);
    // }, [callbackJdDetails])

    const getDate = (d) => {
        return moment(d).format("Do MMMM YYYY")
    }

    const onConfirmDelete = (e) => {
        // e.preventDefault()
        setDeleting(true)
        deleteCvAgainstJdAPI(selectedItem._id, { is_active_cv_jd: false }, token)
            .then(res => {
                showSuccessToast(`${selectedItem.cv_original_name} deleted successfully`)
                setShowDeleteDialogBox(false)
                setCallbackJdDetails(!callbackJdDetails)
            })
            .catch(err => {
                console.log(err.response.data.error.msg)
                if (err.response.data.error.code == 500) {
                    showErrorToast("Deletion failed")
                }
            })
            .finally(() => {
                setDeleting(false)
            })
    }

    return (
        <>
        <Modal show={showDeleteDialogBox} onHide={() => setShowDeleteDialogBox(false)} centered>
                <Modal.Header >
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete {selectedItem.position}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteDialogBox(false)}>No</Button>
                    <Button variant="danger" onClick={() => onConfirmDelete()}>Yes</Button>
                </Modal.Footer>
            </Modal>
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
                            setShowDeleteDialogBox(true);
                            setSelectedItem(rowData)
                        },
                        position: "row"
                    }

                ]}

                //onSelectionChange={(selectedRows) => console.log(selectedRows)}
                onRowClick={(event, rowData) => {
                    console.log(rowData);
                    navigate(`/cv/${rowData.CV_ID}`);
                }}
                options={{
                    sorting: true, search: true,
                    searchFieldAlignment: "right", searchAutoFocus: true, searchFieldVariant: "standard",
                    filtering: true, paging: true, pageSizeOptions: [2, 5, 10, 20, 25, 50, 100], pageSize: 5,
                    paginationType: "stepped", showFirstLastPageButtons: false, paginationPosition: "both", exportButton: true,
                    exportAllData: true, exportFileName: "TableData", addRowPosition: "first", actionsColumnIndex: -1, selection: true,
                    showSelectAllCheckbox: true, showTextRowsSelected: true,
                    selectionProps: rowData => ({
                        // disabled: rowData.age == null,
                        // color:"primary"
                    }),
                    grouping: true,
                    columnsButton: true,
                    rowStyle: (data, index) => index % 2 === 0 ? { background: "#f5f5f5" } : null,
                    //headerStyle: { background: "#f44336", color: "#fff" },
                    actionsColumnIndex: -1,
                    selection: false,
                }}
                title="CVs"
            />
        </ThemeProvider>
        </>
    )
};

export default CvsAgainstJdTable;
