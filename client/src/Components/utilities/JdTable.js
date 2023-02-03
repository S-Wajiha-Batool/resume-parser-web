import React,{useState} from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';

const JdTable = (props) => {
    const { data } = props;
    const navigate = useNavigate();
    //const headers = Object.keys(data[0]);
    const headers = ['_id', 'position', 'is_active', 'department', 'uploaded_by', 'skills', 'experience', 'qualification', 'universities', 'createdAt', 'updatedAt', '__v']
    console.log(headers)
    const labels = ['Title', 'Department', 'Skills', 'Experience', 'Qualification', 'Universities', 'Posted By', 'Posted On']
    //const headers_key = ['position', 'department', 'skills.skill_name','experience']
    const [sortType, setSortType] = React.useState({column:null, order:'asc'});


    const getSkills = (skills) => {
        var a = [];
        skills.map(s => {
            a.push(s.skill_name)
        })
        return a;
    }

    const handleSort = (column) => {
        if(column === sortType.column) {
            setSortType({column:column, order: sortType.order === 'asc' ? 'desc' : 'asc'});
        } else {
            setSortType({column:column, order: 'asc' });
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
                        navigate(`/jd/${item._id}`)
                    }}>
                            <TableCell >{item['position']}</TableCell>
                            <TableCell >{item['department']}</TableCell>
                            <TableCell >{getSkills(item['skills']).join(',\r\n')}</TableCell>
                            <TableCell >{item['experience']}</TableCell>
                            <TableCell >{item['qualification']}</TableCell>
                            <TableCell >{item['universities'].join(',\r\n')}</TableCell>
                            <TableCell >{item['uploaded_by']}</TableCell>
                            <TableCell >{item['createdAt']}</TableCell>

                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default JdTable;
