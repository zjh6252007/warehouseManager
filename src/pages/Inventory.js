// src/components/Inventory.jsx

import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllInventory,
  getInventory,
  getInventoryById,
  uploadInventoryFile,
  addInventory,
  deleteInventory
} from '../redux/modules/inventory';
import { getStore } from '../redux/modules/myStore';
import { useEffect, useState } from 'react';
import { Button, Box, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom';
import InventoryToolbar from '../components/InventoryToolBar';
import { generatePriceTag } from '../utils/generatePriceTag';
import InventoryForm from '../components/InventoryForm';
import Papa from 'papaparse';
import { message, Spin } from 'antd';

const Inventory = () => {
  const userInfo = useSelector(state => state.user.userInfo);
  const storeInfo = useSelector(state => state.myStore.storeList);
  const dispatch = useDispatch();
  const location = useLocation();
  const isStorePage = location.pathname.includes('/mystore');
  const { storeId } = useParams();

  const [selectedRows, setSelectedRows] = useState([]);
  const [inventoryFormVisible, setInventoryFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);

  // —— 移动端检测 —— 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isStorePage) {
          await dispatch(getInventoryById(storeId));
        } else if (userInfo.role === 'admin') {
          await dispatch(getAllInventory());
          await dispatch(getStore());
        } else {
          await dispatch(getInventory());
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch, userInfo.role, isStorePage, storeId]);

  const columns = [
    { field: 'itemDescription', headerName: 'Item Description', width: 250 },
    { 
      field: 'uploadDate', 
      headerName: 'Upload Date', 
      width: 200,
      renderCell: params => params.value ? params.value.split('T')[0] : ''
    },
    { field: 'brand', headerName: 'Brand', width: 120 },
    { field: 'model', headerName: 'Model', width: 130 },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: params => (
        <div style={{
          color: params.value === 'sold' ? 'red' :
                 params.value === 'inStock' ? 'green' :
                 'inherit',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          textAlign: 'center'
        }}>
          {params.value}
        </div>
      )
    },
    { field: 'soldDate', headerName: 'Sold Date', width: 150 },
    { field: 'sku', headerName: 'SKU', width: 100 },
    { field: 'category', headerName: 'Category', width: 160, hide: true },
    { field: 'subcategory', headerName: 'Subcategory', width: 220, hide: true },
    {
      field: 'unitRetail',
      headerName: 'Sale Price',
      width: 130,
      renderCell: params =>
        params.value != null && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
    },
    {
      field: 'extRetail',
      headerName: 'Unit Retail',
      width: 130,
      renderCell: params =>
        params.value != null && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
    },
    { field: 'product', headerName: 'Product', width: 150 },
    {
      field: 'location',
      headerName: 'Location',
      width: 300,
    },
  ];

  // Admin 额外两个列：Cost 和 Modify
  if (userInfo.role === 'admin') {
    columns.push({
      field: 'cost',
      headerName: 'Cost',
      width: 100,
      renderCell: params =>
        params.value != null && !isNaN(params.value)
          ? `$${params.value.toFixed(2)}`
          : '$0.00'
    });

    columns.push({
      field: 'modify',
      headerName: 'Modify',
      width: 150,
      renderCell: params =>
        params.row.status !== 'sold' && isStorePage ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleModify(params.row)}
          >
            Modify
          </Button>
        ) : null
    });
  }

  // 根据 isMobile 决定显示哪些列
  const displayedColumns = React.useMemo(() => {
    if (!isMobile) {
      return columns;
    }
    // 移动端只保留 model、status、product、cost
    return columns.filter(col =>
      ['model', 'status', 'product', 'cost'].includes(col.field)
    );
  }, [isMobile, columns]);

  const onCancel = () => {
    setInventoryFormVisible(false);
    setEditingInventory(null);
  };

  const onCreate = async values => {
    const isStoreChanged = editingInventory?.store?.id !== values.storeId;
    const inventoryData = { ...values, store: { id: values.storeId } };

    try {
      if (!isStoreChanged) {
        await dispatch(deleteInventory([editingInventory.id]));
        await dispatch(addInventory(inventoryData));
      } else {
        try {
          await dispatch(addInventory(inventoryData));
          await dispatch(deleteInventory([editingInventory.id]));
        } catch (error) {
          console.error('Failed to add inventory:', error);
          message.error('Failed to add inventory: SKU may already exist in the target store.');
          return;
        }
      }
      message.success('Inventory successfully modified!');
      onCancel();
    } catch (error) {
      console.error('Failed to modify inventory:', error);
      message.error('Failed to modify inventory.');
    }
  };

  const handleFileChange = async event => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const res = await dispatch(uploadInventoryFile(file, storeId));
    setLoading(false);

    if (res.code !== 0) {
      alert('File upload failed');
      console.error(res.message);
    }
  };

  const handleDelete = () => {
    dispatch(deleteInventory(selectedRows));
  };

  const handleModify = row => {
    setEditingInventory(row);
    setInventoryFormVisible(true);
  };

  const inventoryData = useSelector(state => state.inventory.inventoryList);
  const processedInventoryData = inventoryData.map(item => ({
    ...item,
    id: item.id,
    location: item.store?.address || 'N/A'
  }));

  const selectedData = inventoryData.filter(item => selectedRows.includes(item.id));

  const handleDownload = () => {
    const dataToExport = inventoryData.map(({ limitPercentage, qty, unitWeight, store, ...rest }) => ({
      ...rest,
      location: store?.address || 'N/A'
    }));
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 100,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.7)',
            zIndex: 9999
          }}
        >
          <Spin tip="Loading..." size="large" />
        </Box>
      )}

      {!loading && (
        <>
          {userInfo.role === 'admin' && (
            <InventoryToolbar numSelected={selectedRows.length} onDelete={handleDelete} />
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            {isStorePage && (
              <Button variant="contained" component="label" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Import Inventory'}
                <input type="file" hidden accept=".csv" onChange={handleFileChange} />
              </Button>
            )}

            {userInfo.role === 'admin' && (
              <Button variant="contained" onClick={handleDownload} sx={{ ml: 2 }}>
                Download Inventory
              </Button>
            )}

            {isStorePage && (
              <Button variant="contained" sx={{ ml: 2 }} onClick={() => setInventoryFormVisible(true)}>
                Add Inventory
              </Button>
            )}
          </Box>

          {selectedRows.length > 0 && userInfo.role === 'admin' && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
              <Button variant="contained" color="error" onClick={handleDelete}>
                Delete Selected
              </Button>
            </Box>
          )}

          {selectedRows.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
              <Button variant="contained" color="success" onClick={() => generatePriceTag(selectedData)}>
                Print price tag
              </Button>
            </Box>
          )}

          <DataGrid
            rows={processedInventoryData}
            columns={displayedColumns}
            initialState={{
              pagination: { paginationModel: { page: 0, pageSize: 18 } },
              sorting: { sortModel: [{ field: 'uploadDate', sort: 'desc' }] }
            }}
            pageSize={18}
            pageSizeOptions={[5, 10, 18, 25]}
            checkboxSelection
            onRowSelectionModelChange={newSelectionModel => {
              const selectedIDs = new Set(newSelectionModel);
              const filtered = inventoryData
                .filter(row => selectedIDs.has(row.id) && row.status !== 'sold')
                .map(row => row.id);
              setSelectedRows(filtered);
            }}
            isRowSelectable={params => params.row.status !== 'sold'}
          />

          <InventoryForm
            visible={inventoryFormVisible}
            onCreate={onCreate}
            onCancel={onCancel}
            initialValues={editingInventory}
            storeInfo={storeInfo}
          />
        </>
      )}
    </Box>
  );
};

export default Inventory;
