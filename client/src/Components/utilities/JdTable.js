import React, { useState, useEffect, forwardRef } from 'react';
//import { Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import MaterialTable from 'material-table'
import { ThemeProvider, createTheme } from '@mui/material';
import { tableIcons } from './TableUtil';
import AddBox from '@material-ui/icons/AddBox';
import Edit from '@material-ui/icons/Edit';
import DeleteOutline from '@material-ui/icons/DeleteOutline';

const JdTable = (props) => {
    var moment = require('moment')
    const defaultMaterialTheme = createTheme();
    const { data, handleShowModal } = props;
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([])
    const columns = [
        //{ title: "Rank", render: (rowData) => rowData.tableData.id + 1 },
        { title: "Position", field: "position", sorting: false, filtering: false, cellStyle: { background: "#009688" }, headerStyle: { color: "#fff" } },
        { title: "Department", field: "department", filterPlaceholder: "filter" },
        {
            title: "Skills", field: "skills", grouping: false,
            render: (rowData) => <ul>{getSkills(rowData.skills).map(name => <li key="{name}">{name}</li>)}</ul>,
        },
        {
            title: "Experience", field: "experience",
            searchable: true, export: true
        },
        { title: "Qualification", field: "qualification", searchable: true, export: true },
        {
            title: "Universities", field: "universities", render: (rowData) => <ul>
                {rowData.universities.map(name => <li>{name}</li>)}
            </ul>, filterPlaceholder: "filter", searchable: true, export: true
        },
        { title: "Posted By", field: "uploaded_by", },
        { title: "Posted On", field: "createdAt", render: (rowData) => <div>{getDate(rowData)}</div> },
    ]

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
