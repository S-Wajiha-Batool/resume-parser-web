import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialTable from 'material-table'
import { ThemeProvider, createTheme } from '@mui/material';
import { tableIcons } from './TableUtil';
import AddBox from '@material-ui/icons/AddBox';
import Edit from '@material-ui/icons/Edit';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import { Modal, Button } from 'react-bootstrap'
import { deleteJdAPI } from '../../API/JDAPI';
import { GlobalState } from '../../GlobalState';
import { showSuccessToast, showErrorToast } from '../utilities/Toasts';
import { Spinner } from 'react-bootstrap';
import EditJdModal from '../utilities/EditJdModal';
import DeleteModal from './DeleteModal';

import '../UI/JdTable.css'

const JdTable = (props) => {
    var moment = require('moment')
    const defaultMaterialTheme = createTheme();
    const { data, handleShowModal } = props;
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

    const columns = [
        //{ title: "Rank", render: (rowData) => rowData.tableData.id + 1 },
        { title: "Position", field: "position", sorting: false, filtering: false, cellStyle: { background: "#1d9fc7", fontWeight: 'bold' }, headerStyle: { color: "#fff" },  },
        { title: "Department", field: "department", filterPlaceholder: "filter" },
        {
            title: "Skills", field: "skills", grouping: false,
            render: (rowData) => <ul>{getSkills(rowData.skills).length > 0 ? getSkills(rowData.skills).map((skill, index) => <li key={index}>{skill}</li>) : <div> - </div>}</ul>,
        },
        {
            title: "Experience", field: "experience",
            searchable: true, export: true
        },
        {
            title: "Qualification", field: "qualification", render: (rowData) => <ul>
                {rowData.qualification && Object.entries(rowData.qualification).length > 0 ?
                    Object.entries(rowData.qualification).map((option, index) => <li key={index}>{option[1] + " (" + option[0] + ")"}</li>)
                    :
                    <div>-</div>}
            </ul>, searchable: true, export: true
        },
        {
            title: "Universities", field: "universities", render: (rowData) => <ul>
                {rowData.universities && Object.entries(rowData.universities).length > 0 ?
                    Object.entries(rowData.universities).map((option, index) => <li key={index}>{option[1] + " (" + option[0] + ")"}</li>)
                    :
                    <div>-</div>}
            </ul>, filterPlaceholder: "filter", searchable: true, export: true
        },
        { title: "Posted On", field: "createdAt", render: (rowData) => <div>{getDate(rowData)}</div> },
    ]

    // useEffect(() => {
    //     setTableData(data);
    // }, [callback])

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
        <>
            {/* edit modal */}
            {showEditModal && <EditJdModal showModal={showEditModal} handleCloseModal={handleCloseEditModal} oldJd={selectedItem} />
            }            
            {/* delete modal */}
            <DeleteModal showModal={showDeleteModal} handleCloseModal={handleCloseDeleteModal} data={selectedItem} target={"jd"}/>
            
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
                                handleShowEditModal();
                                setSelectedItem(rowData)
                            },
                            position: "row"
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

                    //onSelectionChange={(selectedRows) => console.log(selectedRows)}
                    onRowClick={(event, rowData) => {
                        console.log(rowData);
                        navigate(`/jd/${rowData._id}`);
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
                    title="Job Descriptions"
                />
            </ThemeProvider>
        </>
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
