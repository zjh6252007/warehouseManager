import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getReturnLog } from '../redux/modules/returnLog';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const ReturnLog = () => {
    const { storeId } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getReturnLog(storeId));
    }, [dispatch, storeId]);

    const returnInfo = useSelector(state => state.returnLog.returnLog);

    // Creating a copy of returnInfo and sorting the data by returnTime descending
    const sortedReturnInfo = [...returnInfo].sort((a, b) => new Date(b.returnTime) - new Date(a.returnTime));

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell align="left">Sales Name</TableCell>
                        <TableCell align="left">Return Time</TableCell>
                        <TableCell align="left">Return Amount ($)</TableCell>
                        <TableCell align="left">Product Name</TableCell>
                        <TableCell align="left">Model</TableCell>
                        <TableCell align="left">SKU</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedReturnInfo.map((row) => (
                        <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell align="left">{row.salesName || 'N/A'}</TableCell>
                            <TableCell align="left">{row.returnTime}</TableCell>
                            <TableCell align="left">${row.returnAmount.toFixed(2)}</TableCell>
                            <TableCell align="left">{row.productName}</TableCell>
                            <TableCell align="left">{row.model}</TableCell>
                            <TableCell align="left">{row.sku || 'N/A'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default ReturnLog;
