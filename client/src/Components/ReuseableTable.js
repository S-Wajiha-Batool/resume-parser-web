import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel } from '@material-ui/core';

const ReusableTable = (props) => {
    const { data } = props;
    const headers = Object.keys(data[0]);
    const [sortType, setSortType] = React.useState({column:null, order:'asc'});

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
                                {header}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {sortedData.map((item, index) => (
                    <TableRow key={index}>
                        {headers.map((header, index) => (
                            <TableCell key={index}>
                                {item[header]}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default ReusableTable;
