import React, { useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

const CvTable = (props) => {
    const { data } = props;
    const navigate = useNavigate();
    //const headers = Object.keys(data[0]);
    const headers = ['full_name', 'email', 'hire_status', 'weighted_percentage', 'uploaded_by', 'createdAt']
    const labels = ['Name', 'Email', 'Status', 'Rating', 'Posted By', 'Posted On']
    //const headers_key = ['position', 'department', 'skills.skill_name','experience']
    const [sortType, setSortType] = useState({ column: null, order: 'asc' });


    const getSkills = (skills) => {
        var a = [];
        skills.map(s => {
            a.push(s.skill_name)
        })
        return a;
    }

    const handleSort = (column) => {
        if (column === sortType.column) {
            setSortType({ column: column, order: sortType.order === 'asc' ? 'desc' : 'asc' });
        } else {
            setSortType({ column: column, order: 'asc' });
        }
    }


    //sorting function
    const stableSort = (array, cmp) => {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = cmp(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map(el => el[0]);
    }

    const getSorting = (order, column) => {
        return order === 'desc' ? (a, b) => desc(a, b, column) : (a, b) => -desc(a, b, column);
    }

    const desc = (a, b, column) => {
        if (b[column] < a[column]) {
            return 1;
        }
        if (b[column] > a[column]) {
            return -1;
        }
        return 0;
    }

    const sortedData = stableSort(data, getSorting(sortType.order, sortType.column));

    return (
        <Table>
            <TableHead>
                <TableRow>
                    {headers.map((header, index) => (
                        <TableCell key={index}>
                            <TableSortLabel
                                active={sortType.column === header}
                                direction={sortType.order}
                                onClick={() => handleSort(header)}
                            >
                                {labels[index]}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {sortedData.map((item, index) => (
                    <TableRow key={index}
                        onClick={() => {
                            navigate(`/cv/${item._id}`)
                        }}>
                        <TableCell >{item['full_name']}</TableCell>
                        <TableCell >{item['email']}</TableCell>
                        <TableCell >{item['hire_status']}</TableCell>
                        <TableCell >{item['weighted_percentage']}</TableCell>
                        <TableCell >{item['uploaded_by']}</TableCell>
                        <TableCell >{item['createdAt']}</TableCell>

                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default CvTable;
