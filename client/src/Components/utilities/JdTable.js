import React, { useState, useEffect, forwardRef } from 'react';
//import { Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import MaterialTable from 'material-table'
import GetAppIcon from '@material-ui/icons/GetApp';
import AddIcon from '@material-ui/icons/Add';
import { ThemeProvider, createTheme } from '@mui/material';

import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Print from '@material-ui/icons/Print';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';

//import { Delete, Edit } from '@mui/icons-material';

const JdTable = (props) => {
    const defaultMaterialTheme = createTheme();
    const { data, showModal, handleCloseModal, handleShowModal } = props;
    const navigate = useNavigate();
    //const headers = Object.keys(data[0]);
    //const headers = ['position','department', 'skills', 'experience', 'qualification', 'universities', , 'uploaded_by', 'createdAt']
    //const labels = ['Title', 'Department', 'Skills', 'Experience', 'Qualification', 'Universities', 'Posted By', 'Posted On']
    //const headers_key = ['position', 'department', 'skills.skill_name','experience']
    const [sortType, setSortType] = React.useState({ column: null, order: 'asc' });

    const [tableData, setTableData] = useState([])
    const columns = [
        //{ title: "Rank", render: (rowData) => rowData.tableData.id + 1 },
        { title: "Position", field: "position", sorting: false, filtering: false, cellStyle: { background: "#009688" }, headerStyle: { color: "#fff" } },
        { title: "Department", field: "department", filterPlaceholder: "filter" },
        {
            title: "Skills", field: "skills", grouping: false,
            render: (rowData) => <div>{getSkills(rowData.skills).join(',\r\n')}</div>,
        },
        {
            title: "Experience", field: "experience",
            searchable: true, export: true
        },
        { title: "Qualification", field: "qualification", searchable: true, export: true },
        { title: "Universities", field: "city", filterPlaceholder: "filter", searchable: true, export: true },
        { title: "Posted By", field: "uploaded_by", },
        { title: "Posted On", field: "createdAt" },
    ]

    const tableIcons = {
        Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
        Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
        Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
        Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
        DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
        Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
        Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
        Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
        FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
        LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
        NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
        PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
        Print: forwardRef((props, ref) => <Print {...props} ref={ref} />),
        ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
        Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
        SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
        ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
        ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
    };

    useEffect(() => {
        setTableData(data);
    }, [])

    const getSkills = (skills) => {
        console.log(skills)
        var a = [];
        skills.map(s => {
            a.push(s.skill_name)
        })
        return a;
    }


    return (
        <ThemeProvider theme={defaultMaterialTheme}>
            <MaterialTable columns={columns} data={tableData} icons={tableIcons}
                // editable={{
                //     onRowAdd: (newRow) => new Promise((resolve, reject) => {
                //         setTableData([...tableData, newRow])

                //         setTimeout(() => resolve(), 500)
                //     }),
                //     onRowUpdate: (newRow, oldRow) => new Promise((resolve, reject) => {
                //         const updatedData = [...tableData]
                //         updatedData[oldRow.tableData.id] = newRow
                //         setTableData(updatedData)
                //         setTimeout(() => resolve(), 500)
                //     }),
                //     onRowDelete: (selectedRow) => new Promise((resolve, reject) => {
                //         const updatedData = [...tableData]
                //         updatedData.splice(selectedRow.tableData.id, 1)
                //         setTableData(updatedData)
                //         setTimeout(() => resolve(), 1000)

                //     })
                // }}
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
                onRowClick= {(event, rowData) => {
                    console.log(rowData);
                    navigate(`/jd/${rowData._id}`);
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
                title="Job Descriptions"
            />
        </ThemeProvider>
    )
    //     return (
    //         <Table>
    //             <TableHead>
    //                 <TableRow>
    //                     {headers.map((header, index) => (
    //                         <TableCell key={index}>
    // <TableSortLabel
    //                                 active={sortType.column === header}
    //                                 direction={sortType.order}
    //                                 onClick={() => handleSort(header)}
    //                             >
    //                                 {labels[index]}
    //                             </TableSortLabel>
    //                         </TableCell>
    //                     ))}
    //                 </TableRow>
    //             </TableHead>
    //             <TableBody>
    //                 {sortedData.map((item, index) => (
    //                     <TableRow key={index}
    //                     onClick={() => {
    //                         navigate(`/jd/${item._id}`)
    //                     }}>
    //                             <TableCell >{item['position']}</TableCell>
    //                             <TableCell >{item['department']}</TableCell>
    //                             <TableCell >{getSkills(item['skills']).join(',\r\n')}</TableCell>
    //                             <TableCell >{item['experience']}</TableCell>
    //                             <TableCell >{item['qualification']}</TableCell>
    //                             <TableCell >{item['universities'].join(',\r\n')}</TableCell>
    //                             <TableCell >{item['uploaded_by']}</TableCell>
    //                             <TableCell >{item['createdAt']}</TableCell>

    //                     </TableRow>
    //                 ))}
    //             </TableBody>
    //         </Table>
    //     );
};

export default JdTable;
