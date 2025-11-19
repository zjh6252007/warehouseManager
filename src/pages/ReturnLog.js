import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getReturnLog, getOriginalReceipt } from '../redux/modules/returnLog';
import { fetchStoreDetail } from '../redux/modules/myStore';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, CircularProgress } from '@mui/material';
import { generateReceipt } from '../utils/generateReceipt';
import { message } from 'antd';

const ReturnLog = () => {
    const { storeId } = useParams();
    const dispatch = useDispatch();
    const [loadingReceipt, setLoadingReceipt] = useState({});

    useEffect(() => {
        if (storeId) {
            dispatch(getReturnLog(storeId)).catch(error => {
                console.error('Failed to load return log:', error);
            });
            dispatch(fetchStoreDetail(storeId)).catch(error => {
                console.error('Failed to load store detail:', error);
            });
        }
    }, [dispatch, storeId]);

    const returnInfo = useSelector(state => state.returnLog.returnLog);
    const storeInfo = useSelector(state => state.myStore.currentStore);

    // Debug: log return info to check data structure
    useEffect(() => {
        if (returnInfo && returnInfo.length > 0) {
            console.log('Return Info Sample:', returnInfo[0]);
            console.log('Return Reason in sample:', returnInfo[0].returnReason);
            console.log('Return Reason (snake_case):', returnInfo[0].return_reason);
            console.log('All keys in sample:', Object.keys(returnInfo[0]));
        }
    }, [returnInfo]);

    // Creating a copy of returnInfo and sorting the data by returnTime descending
    const sortedReturnInfo = [...returnInfo].sort((a, b) => new Date(b.returnTime) - new Date(a.returnTime));

    // Group by invoice number to show button only once per invoice
    const invoicesWithReturns = new Set();
    sortedReturnInfo.forEach(row => {
        if (row.invoiceNumber) {
            invoicesWithReturns.add(row.invoiceNumber);
        }
    });

    const handleCheckOriginalReceipt = async (invoiceNumber) => {
        if (!invoiceNumber) {
            message.error('Invoice number not found');
            return;
        }

        setLoadingReceipt(prev => ({ ...prev, [invoiceNumber]: true }));
        try {
            const originalReceiptData = await dispatch(getOriginalReceipt(invoiceNumber));
            
            if (originalReceiptData && storeInfo) {
                // Transform the data to match the format expected by generateReceipt
                const receiptData = {
                    invoiceNumber: originalReceiptData.invoiceNumber,
                    customer: originalReceiptData.customer,
                    contact: originalReceiptData.contact,
                    address: originalReceiptData.address,
                    salesperson: originalReceiptData.salesperson,
                    createdAt: originalReceiptData.createdAt,
                    paymentType: originalReceiptData.paymentType,
                    discount: originalReceiptData.discount,
                    note: originalReceiptData.note,
                    installationFee: originalReceiptData.installationFee,
                    total: originalReceiptData.total,
                    totalTax: originalReceiptData.totalTax,
                    subtotal: originalReceiptData.subtotal,
                    items: originalReceiptData.items || []
                };
                
                generateReceipt(receiptData, storeInfo);
            } else {
                message.error('Original receipt data not found');
            }
        } catch (error) {
            console.error('Error fetching original receipt:', error);
            message.error('Failed to load original receipt');
        } finally {
            setLoadingReceipt(prev => ({ ...prev, [invoiceNumber]: false }));
        }
    };

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
                        <TableCell align="left">Invoice Number</TableCell>
                        <TableCell align="left">Return Reason</TableCell>
                        <TableCell align="left">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedReturnInfo.map((row) => {
                        const isFirstForInvoice = row.invoiceNumber && 
                            sortedReturnInfo.findIndex(r => r.invoiceNumber === row.invoiceNumber) === 
                            sortedReturnInfo.indexOf(row);
                        
                        return (
                            <TableRow
                                key={row.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell align="left">{row.salesName || 'N/A'}</TableCell>
                                <TableCell align="left">{row.returnTime || 'N/A'}</TableCell>
                                <TableCell align="left">${row.returnAmount ? row.returnAmount.toFixed(2) : '0.00'}</TableCell>
                                <TableCell align="left">{row.productName || 'N/A'}</TableCell>
                                <TableCell align="left">{row.model || 'N/A'}</TableCell>
                                <TableCell align="left">{row.sku || 'N/A'}</TableCell>
                                <TableCell align="left">{row.invoiceNumber || 'N/A'}</TableCell>
                                <TableCell align="left" style={{ maxWidth: 200, wordBreak: 'break-word' }}>
                                    {(row.returnReason || row.return_reason) ? (row.returnReason || row.return_reason) : 'N/A'}
                                </TableCell>
                                <TableCell align="left">
                                    {isFirstForInvoice && row.invoiceNumber && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleCheckOriginalReceipt(row.invoiceNumber)}
                                            disabled={loadingReceipt[row.invoiceNumber]}
                                        >
                                            {loadingReceipt[row.invoiceNumber] ? (
                                                <CircularProgress size={16} />
                                            ) : (
                                                'Check Origin Receipt'
                                            )}
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default ReturnLog;
