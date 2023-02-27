import React, { useState, useEffect, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable from 'material-table'
import { ThemeProvider, createTheme } from '@mui/material';
import { tableIcons } from './TableUtil';
import AddBox from '@material-ui/icons/AddBox';
import Edit from '@material-ui/icons/Edit';
import DeleteOutline from '@material-ui/icons/DeleteOutline';

const CvTable = (props) => {
    const headers = ['full_name', 'email', 'hire_status', 'weighted_percentage', 'uploaded_by', 'createdAt']
    const labels = ['Name', 'Email', 'Status', 'Rating', 'Posted By', 'Posted On']

    var moment = require('moment')
    const defaultMaterialTheme = createTheme();
    const { data, handleShowModal } = props;
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([])
    const columns = [
        { title: "Rank", render: (rowData) => rowData.tableData.id + 1 },
        { title: "Name", field: "full_name", sorting: false, filtering: false, cellStyle: { background: "#009688" }, headerStyle: { color: "#fff" },filterPlaceholder: "filter" },
        { title: "Email", field: "email", filterPlaceholder: "filter" },
        { title: "Rating", field: "weighted_percentage", filterPlaceholder: "filter" },
        { title: "Status", field: "hire_status", filterPlaceholder: "filter" },
        { title: "Posted By", field: "uploaded_by", filterPlaceholder: "filter"},
        { title: "Posted On", field: "createdAt", render: (rowData) => <div>{getDate(rowData)}</div> },
    ]

    useEffect(() => {
        setTableData(data);
    }, [])

    const getDate = (d) => {
        return moment(d).format("Do MMMM YYYY")
    }

    return (
        <ThemeProvider theme={defaultMaterialTheme}>
            <MaterialTable columns={columns} data={tableData} icons={tableIcons}
                actions={[
                    {
                        icon: () => <AddBox />,
                        tooltip: "Add new row",
                        isFreeAction: true,
                        onClick: (e, data) => handleShowModal(),
                        // isFreeAction:true
                    },
                    {
                        icon: () => <Edit />,
                        tooltip: "Edit",
                        onClick: (e, rowData) => {
                            // open dialog and fill your data to update
                        },
                        position: "row"
                    },
                    {
                        icon: () => <DeleteOutline />,
                        tooltip: "Delete",
                        onClick: (e, rowData) => {
                            // open dialog and fill your data to update
                        },
                        position: "row"
                    }

                ]}

                //onSelectionChange={(selectedRows) => console.log(selectedRows)}
                onRowClick={(event, rowData) => {
                    console.log(rowData);
                    navigate(`/cv/${rowData._id}`);
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
                    actionsColumnIndex: -1
                }}
                title="CVs"
            />
        </ThemeProvider>
    )
};

export default CvTable;
