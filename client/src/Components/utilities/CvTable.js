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

const CvTable = (props) => {
    var moment = require('moment')
    const defaultMaterialTheme = createTheme();
    const { data, handleShowModal } = props;
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState([])
    const [showDeleteDialogBox, setShowDeleteDialogBox] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const state = useContext(GlobalState);
    const [tableData, setTableData] = state.CVAPI.tableData
    const [token] = state.UserAPI.token;
    const [callback, setCallback] = state.CVAPI.callback;
    const columns = [
        { title: "Name", field: "full_name", sorting: false, filtering: false, cellStyle: { background: "#009688" }, headerStyle: { color: "#fff" } },
        {
            title: "Skills", field: "skills", grouping: false,
            render: (rowData) => <ul>{rowData.skills.map((skill, index) => <li key={index}>{skill}</li>)}</ul>,
        },
        {
            title: "Experience", field: "experience",
            searchable: true, export: true
        },
        {
            title: "Links", field: "links", render: (rowData) => <ul>
                {rowData.links.map((name,index) => <li key={index}><a href={name}>{name}</a></li>)}
            </ul>, searchable: true, export: true
        },
        { title: "Posted On", field: "createdAt", render: (rowData) => <div>{getDate(rowData)}</div> },
    ]

    // useEffect(() => {
    //     setTableData(data);
    // }, [callback])


    const getDate = (d) => {
        return moment(d).format("Do MMMM YYYY")
    }

    const onConfirmDelete = (e) => {
        // e.preventDefault()
        setDeleting(true)
        deleteCVAPI(selectedItem._id, { is_active: false }, token)
            .then(res => {
                showSuccessToast(`${selectedItem.cv_original_name} deleted successfully`)
                setShowDeleteDialogBox(false)
                setCallback(!callback)
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
                    Are you sure you want to delete {selectedItem.cv_original_name}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteDialogBox(false)}>No</Button>
                    <Button variant="danger" onClick={() => onConfirmDelete()}>Yes</Button>

                </Modal.Footer>
            </Modal>
            <ThemeProvider theme={defaultMaterialTheme}>

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
                                setShowDeleteDialogBox(true);
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
                        filtering: true, paging: true, pageSizeOptions: [2, 5, 10, 20, 25, 50, 100], pageSize: 5,
                        paginationType: "stepped", showFirstLastPageButtons: false, paginationPosition: "bottom", exportButton: true,
                        exportAllData: true, exportFileName: "TableData", addRowPosition: "first", actionsColumnIndex: -1, selection: true,
                        //showSelectAllCheckbox: true, showTextRowsSelected: true,
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
                    title="Resumes"
                />
            </ThemeProvider>
        </>
    )
};

export default CvTable;
